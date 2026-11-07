// custom/main fork (#3): checks that a packaged custom build never reaches the official updater when
// it starts over data that a newer OpenBot wrote. It drives the real packaged app on macOS.
//
//   bun run package
//   bun scripts/custom-build-newer-data-e2e.ts [path/to/OpenBot.app]
//   bun scripts/custom-build-newer-data-e2e.ts --self-test     # checks this script's own failure handling
//
// For each update preference case (absent, autoDownload on, autoDownload off) it:
// 1. copies the app to a temporary folder and adds an `app-update.yml` with the upstream release feed,
//    so the recovery path has everything it needs to update;
// 2. makes a temporary profile whose `openbot.db` has schema version 99999 and a sentinel row;
// 3. starts the copy under `sandbox-exec` with outbound IP denied, a temporary HOME and a mock keychain;
// 4. waits for the custom recovery log line, then stops the process it started and waits for it to close;
// 5. checks that the app was still running until the script stopped it, that no line logged an update
//    check, download or install, and that version 99999, the sentinel row and `integrity_check` are intact.
// `--self-test` runs the same steps against synthetic apps (one prints the line and crashes, one never
// prints it) and passes only if the script reports both as failures.
// It never touches /Applications, the real profile or the real keychain.
// Writes .openbot-build/custom-build-newer-data-e2e/report.json.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const OUT = resolve(import.meta.dirname, "../.openbot-build/custom-build-newer-data-e2e");
const RECOVERY_LINE = "An older custom OpenBot started over newer data. No update is attempted.";
const FORBIDDEN = [/Checking for update/i, /Update check:/, /update-downloaded|Downloading update/i, /quitAndInstall/];
/** One profile for the preflight and for the launch, so the preflight proves what the launch uses. */
const SANDBOX_PROFILE = "(version 1)(allow default)(deny network-outbound (remote ip))";
const WAIT_MS = 60_000;
const SETTLE_MS = 5_000;
const CLOSE_MS = 10_000;
const PREFERENCE_FILE = "openbot-update-preference-v1.json";

type PreferenceCase = "absent" | "autoDownload-on" | "autoDownload-off";

interface CaseResult {
  preference: PreferenceCase;
  stage: string;
  recoveryLine: boolean;
  exit: { code: number | null; signal: string | null; requested: boolean } | null;
  forbiddenLines: string[];
  database: { version: number | null; sentinel: string | null; integrity: string | null } | null;
  failure: string | null;
}

interface Report {
  mode: "app" | "self-test";
  app?: string;
  networkDenied?: boolean;
  cases: CaseResult[];
  selfTest?: { crashAfterLineFailed: boolean; noLineFailed: boolean };
  passed: boolean;
}

const report: Report = { mode: process.argv.includes("--self-test") ? "self-test" : "app", cases: [], passed: false };

function writeReport(): void {
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
}

function findApp(): string {
  const given = process.argv.slice(2).find((argument) => !argument.startsWith("--"));
  const candidates = given ? [given] : ["dist/mac-arm64/OpenBot.app", "dist/mac/OpenBot.app"];
  const found = candidates.map((path) => resolve(path)).find((path) => existsSync(join(path, "Contents/Info.plist")));
  assert.ok(found, `No packaged OpenBot.app found (${candidates.join(", ")}). Run bun run package first.`);
  return found;
}

/** A synthetic bundle for --self-test: a shell script in the place of the app executable. */
function syntheticApp(root: string, body: string): string {
  const app = join(root, "Synthetic.app");
  mkdirSync(join(app, "Contents/MacOS"), { recursive: true });
  mkdirSync(join(app, "Contents/Resources"), { recursive: true });
  writeFileSync(join(app, "Contents/Info.plist"), "<plist/>\n");
  const executable = join(app, "Contents/MacOS/OpenBot");
  writeFileSync(executable, `#!/bin/sh\n${body}\n`);
  chmodSync(executable, 0o755);
  return app;
}

function makeNewerDatabase(userData: string, preference: PreferenceCase): string {
  mkdirSync(userData, { recursive: true });
  const path = join(userData, "openbot.db");
  const db = new DatabaseSync(path);
  db.exec(`
    CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
    INSERT INTO schema_migrations(version, applied_at) VALUES (99999, '2099-01-01T00:00:00Z');
    CREATE TABLE e2e_sentinel (value TEXT NOT NULL);
    INSERT INTO e2e_sentinel(value) VALUES ('custom-build-newer-data-e2e');
  `);
  db.close();
  if (preference !== "absent") {
    const autoDownload = preference === "autoDownload-on";
    writeFileSync(join(userData, PREFERENCE_FILE), `${JSON.stringify({ version: 1, autoDownload })}\n`);
  }
  return path;
}

function readDatabase(path: string): NonNullable<CaseResult["database"]> {
  const db = new DatabaseSync(path, { readOnly: true });
  try {
    const version = db.prepare("SELECT max(version) AS version FROM schema_migrations").get();
    const sentinel = db.prepare("SELECT value FROM e2e_sentinel").get();
    const integrity = db.prepare("PRAGMA integrity_check").get();
    return {
      version: version?.version === null || version?.version === undefined ? null : Number(version.version),
      sentinel: sentinel?.value === undefined ? null : String(sentinel.value),
      integrity: integrity?.integrity_check === undefined ? null : String(integrity.integrity_check),
    };
  } finally {
    db.close();
  }
}

/** Runs one case. Never throws: a failure is recorded with the stage it happened in. */
async function runCase(source: string, preference: PreferenceCase): Promise<CaseResult> {
  const result: CaseResult = {
    preference,
    stage: "setup",
    recoveryLine: false,
    exit: null,
    forbiddenLines: [],
    database: null,
    failure: null,
  };
  const root = mkdtempSync(join(tmpdir(), "openbot-custom-newer-data-"));
  try {
    const app = join(root, "OpenBot.app");
    cpSync(source, app, { recursive: true, verbatimSymlinks: true });
    // The release feed of an official package, so the recovery path could update if the guard failed.
    writeFileSync(
      join(app, "Contents/Resources/app-update.yml"),
      "provider: github\nowner: nightly-labs\nrepo: openbot\nupdaterCacheDirName: openbot-updater\n",
    );
    const userData = join(root, "profile");
    const databasePath = makeNewerDatabase(userData, preference);
    const home = join(root, "home");
    mkdirSync(home, { recursive: true });

    result.stage = "launch";
    const child = spawn(
      "/usr/bin/sandbox-exec",
      [
        "-p",
        SANDBOX_PROFILE,
        join(app, "Contents/MacOS/OpenBot"),
        `--user-data-dir=${userData}`,
        "--use-mock-keychain",
      ],
      {
        env: {
          ...process.env,
          HOME: home,
          OPENBOT_LOG_LEVEL: "info",
          CODEX_HOME: join(home, "codex-home"),
          CLAUDE_CONFIG_DIR: join(home, "claude-home"),
          OPENBOT_CODEX_PATH: join(home, "missing-codex"),
          OPENBOT_CLAUDE_PATH: join(home, "missing-claude"),
          OPENBOT_GROK_PATH: join(home, "missing-grok"),
        },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    let output = "";
    let requested = false;
    const closed = new Promise<{ code: number | null; signal: string | null }>((done) =>
      child.once("close", (code, signal) => done({ code, signal })),
    );
    let isClosed = false;
    void closed.then(() => {
      isClosed = true;
    });
    const sawLine = new Promise<boolean>((done) => {
      const timer = setTimeout(() => done(false), WAIT_MS);
      const collect = (chunk: Buffer) => {
        output += chunk.toString("utf8");
        if (output.includes(RECOVERY_LINE)) {
          clearTimeout(timer);
          done(true);
        }
      };
      child.stdout.on("data", collect);
      child.stderr.on("data", collect);
      void closed.then(() => {
        clearTimeout(timer);
        done(output.includes(RECOVERY_LINE));
      });
    });

    result.stage = "wait for the recovery line";
    result.recoveryLine = await sawLine;
    if (result.recoveryLine) {
      result.stage = "settle";
      // The dialog waits for Quit, so the app must still run here. A late update path would log now.
      await Promise.race([closed, new Promise((done) => setTimeout(done, SETTLE_MS))]);
    }

    result.stage = "stop";
    if (!isClosed) {
      requested = true;
      child.kill("SIGTERM");
      const stopped = await Promise.race([
        closed.then(() => true),
        new Promise((done) => setTimeout(() => done(false), CLOSE_MS)),
      ]);
      if (!stopped) child.kill("SIGKILL");
    }
    const exit = await Promise.race([closed, new Promise<null>((done) => setTimeout(() => done(null), CLOSE_MS))]);
    assert.ok(exit, "The app did not close after SIGKILL; the database was not read.");
    result.exit = { ...exit, requested };

    result.stage = "check";
    result.forbiddenLines = output.split("\n").filter((line) => FORBIDDEN.some((pattern) => pattern.test(line)));
    result.database = readDatabase(databasePath);
    assert.ok(result.recoveryLine, "The custom recovery line did not appear.");
    assert.ok(
      requested,
      `The app exited by itself before the check ended (code ${String(exit.code)}, signal ${String(exit.signal)}).`,
    );
    assert.deepEqual(result.forbiddenLines, [], "The custom build logged an update check, download or install.");
    assert.equal(result.database.version, 99999, "The schema version changed.");
    assert.equal(result.database.sentinel, "custom-build-newer-data-e2e", "The sentinel row changed.");
    assert.equal(result.database.integrity, "ok", "The database failed its integrity check.");
    result.stage = "done";
  } catch (error) {
    result.failure = error instanceof Error ? error.message : String(error);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
  return result;
}

try {
  assert.equal(process.platform, "darwin", "This check drives the packaged macOS app.");
  const preflight = spawnSync("/usr/bin/sandbox-exec", ["-p", SANDBOX_PROFILE, "/usr/bin/true"]);
  report.networkDenied = preflight.status === 0;
  assert.ok(
    report.networkDenied,
    `sandbox-exec with the network-deny profile did not run (status ${String(preflight.status)}, signal ${String(preflight.signal)}). Stopping before any launch.`,
  );

  if (report.mode === "self-test") {
    const root = mkdtempSync(join(tmpdir(), "openbot-newer-data-self-test-"));
    try {
      const crash = await runCase(
        syntheticApp(join(root, "crash"), `echo "INFO [update] ${RECOVERY_LINE}"\nexit 73`),
        "absent",
      );
      const silent = await runCase(syntheticApp(join(root, "silent"), "sleep 2\nexit 0"), "absent");
      report.cases.push(crash, silent);
      report.selfTest = { crashAfterLineFailed: crash.failure !== null, noLineFailed: silent.failure !== null };
      report.passed = report.selfTest.crashAfterLineFailed && report.selfTest.noLineFailed;
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  } else {
    const source = findApp();
    report.app = source;
    for (const preference of ["absent", "autoDownload-on", "autoDownload-off"] as const) {
      report.cases.push(await runCase(source, preference));
    }
    report.passed = report.cases.every((item) => item.failure === null);
  }
} catch (error) {
  report.cases.push({
    preference: "absent",
    stage: "preflight",
    recoveryLine: false,
    exit: null,
    forbiddenLines: [],
    database: null,
    failure: error instanceof Error ? error.message : String(error),
  });
} finally {
  writeReport();
}

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (!report.passed) process.exitCode = 1;
