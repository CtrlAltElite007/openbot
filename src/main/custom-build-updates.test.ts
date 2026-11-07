// custom/main fork (#3): the custom build must never reach the official release feed. This covers the
// two paths that can start electron-updater: the normal updater load and the recovery that runs when
// this copy starts over data that a newer OpenBot wrote.
import { translateFor } from "@openbot/i18n";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface MessageBox {
  message?: string;
  buttons?: string[];
}

interface Calls {
  updaterModuleLoads: number;
  checks: number;
  downloads: number;
  installs: number;
  quit: number;
  externalUrls: string[];
  boxes: MessageBox[];
}

function isMessageBox(value: unknown): value is MessageBox {
  return typeof value === "object" && value !== null && "message" in value;
}

const calls = vi.hoisted(
  (): Calls => ({
    updaterModuleLoads: 0,
    checks: 0,
    downloads: 0,
    installs: 0,
    quit: 0,
    externalUrls: [],
    boxes: [],
  }),
);

vi.mock("electron-updater", () => {
  calls.updaterModuleLoads += 1;
  const autoUpdater = {
    on: () => autoUpdater,
    off: () => autoUpdater,
    checkForUpdates: async () => {
      calls.checks += 1;
      return { isUpdateAvailable: true, updateInfo: { version: "99.0.0" } };
    },
    downloadUpdate: async () => {
      calls.downloads += 1;
      return [];
    },
    quitAndInstall: () => {
      calls.installs += 1;
    },
  };
  return { autoUpdater, default: { autoUpdater } };
});

vi.mock("electron", () => ({
  app: {
    isPackaged: true,
    getVersion: () => "0.64.0",
    getPath: () => "/nonexistent/openbot-custom-build-test",
    quit: () => {
      calls.quit += 1;
    },
  },
  dialog: {
    showMessageBox: async (first: unknown, second?: unknown) => {
      const box = second ?? first;
      if (isMessageBox(box)) calls.boxes.push(box);
      return { response: 0 };
    },
  },
  shell: {
    openExternal: async (url: string) => {
      calls.externalUrls.push(url);
    },
  },
}));

beforeEach(() => {
  calls.updaterModuleLoads = 0;
  calls.checks = 0;
  calls.downloads = 0;
  calls.installs = 0;
  calls.quit = 0;
  calls.externalUrls = [];
  calls.boxes = [];
});

describe("custom build updater policy", () => {
  it("is a custom build", async () => {
    const { CUSTOM_BUILD } = await import("./custom-build");
    expect(CUSTOM_BUILD).toBe(true);
  });

  it("never loads electron-updater for a normal start", async () => {
    const { loadElectronUpdater } = await import("./update-service");
    await expect(loadElectronUpdater()).resolves.toBeNull();
    expect(calls.updaterModuleLoads).toBe(0);
  });

  it("makes no check, download or install when it starts over newer data", async () => {
    const { recoverFromNewerDatabase } = await import("./newer-database-recovery");
    const beforeInstall = vi.fn(async () => {});
    await recoverFromNewerDatabase({
      window: null,
      translate: translateFor("en"),
      beforeInstall,
    });

    expect(calls.updaterModuleLoads).toBe(0);
    expect(calls.checks).toBe(0);
    expect(calls.downloads).toBe(0);
    expect(calls.installs).toBe(0);
    expect(beforeInstall).not.toHaveBeenCalled();
    // It tells the user to rebuild, offers no official download, and quits.
    expect(calls.boxes).toHaveLength(1);
    expect(calls.boxes[0]?.message).toBe("This custom OpenBot is older than your data");
    expect(calls.boxes[0]?.buttons).toEqual(["Quit"]);
    expect(calls.externalUrls).toEqual([]);
    expect(calls.quit).toBe(1);
  });
});
