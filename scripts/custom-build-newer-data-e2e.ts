// custom/main fork (#3): checks that a packaged custom build never reaches the official updater when
// it starts over data that a newer OpenBot wrote. It drives the real packaged app on macOS.
//
//   bun run package
//   bun scripts/custom-build-newer-data-e2e.ts [path/to/OpenBot.app]
//
// It copies the app to a temporary folder and adds an `app-update.yml` with the upstream release feed,
// so the recovery path has everything it needs to update. It makes a temporary profile whose
// `openbot.db` has schema version 99999 and a sentinel row. It starts the copy with that profile, a
// temporary HOME and outbound network denied (`sandbox-exec`), so no request can leave even on a
// failure. It waits for the recovery log line, stops the process it started, and checks:
// - the custom recovery line is in the output, and no update check, download or install line is;
// - the database still has version 99999, the sentinel row, and passes `PRAGMA integrity_check`.
// It never touches /Applications, the real profile or the real keychain (`--use-mock-keychain`).
// Writes .openbot-build/custom-build-newer-data-e2e/report.json.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const OUT = resolve(import.meta.dirname, "../.openbot-build/custom-build-newer-data-e2e");
const RECOVERY_LINE = "An older custom OpenBot started over newer data. No update is attempted.";
const FORBIDDEN = [/Checking for update/i, /Update check:/, /update-downloaded|Downloading update/i, /quitAndInstall/];
const WAIT_MS = 60_000;
const SETTLE_MS = 5_000;

interface Report {
  app?: string;
  networkDenied?: boolean;
  recoveryLine?: boolean;
  forbiddenLines?: string[];
  database?: { version: number | null; sentinel: string | null; integrity: string | null };
  passed: boolean;
}

const report: Report = { passed: false };

function writeReport(): void {
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
}

function findApp(): string {
  const given = process.argv[2];
  const candidates = given ? [given] : ["dist/mac-arm64/OpenBot.app", "dist/mac/OpenBot.app"];
  const found = candidates.map((path) => resolve(path)).find((path) => existsSync(join(path, "Contents/Info.plist")));
  assert.ok(found, `No packaged OpenBot.app found (${candidates.join(", ")}). Run bun run package first.`);
  return found;
}

function makeNewerDatabase(userData: string): string {
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
  return path;
}

function readDatabase(path: string): NonNullable<Report["database"]> {
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

try {
  assert.equal(process.platform, "darwin", "This check drives the packaged macOS app.");
  const source = findApp();
  const root = mkdtempSync(join(tmpdir(), "openbot-custom-newer-data-"));
  const app = join(root, "OpenBot.app");
  cpSync(source, app, { recursive: true, verbatimSymlinks: true });
  // The release feed of an official package, so the recovery path could update if the guard failed.
  writeFileSync(
    join(app, "Contents/Resources/app-update.yml"),
    "provider: github\nowner: nightly-labs\nrepo: openbot\nupdaterCacheDirName: openbot-updater\n",
  );
  report.app = source;
  const userData = join(root, "profile");
  const databasePath = makeNewerDatabase(userData);
  const home = join(root, "home");
  mkdirSync(home, { recursive: true });

  const executable = join(app, "Contents/MacOS/OpenBot");
  const sandbox = spawnSync("/usr/bin/sandbox-exec", ["-n", "no-network", "/usr/bin/true"]).status === 0;
  report.networkDenied = sandbox;
  assert.ok(sandbox, "sandbox-exec is not available, so outbound network cannot be denied. Stopping.");
  const child = spawn(
    "/usr/bin/sandbox-exec",
    [
      "-p",
      "(version 1)(allow default)(deny network-outbound (remote ip))",
      executable,
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
  const collect = (chunk: Buffer) => {
    output += chunk.toString("utf8");
  };
  child.stdout.on("data", collect);
  child.stderr.on("data", collect);
  const exited = new Promise<void>((done) => child.once("exit", () => done()));

  try {
    const sawLine = await new Promise<boolean>((done) => {
      const timer = setTimeout(() => done(false), WAIT_MS);
      const check = () => {
        if (output.includes(RECOVERY_LINE)) {
          clearTimeout(timer);
          done(true);
        }
      };
      child.stdout.on("data", check);
      child.stderr.on("data", check);
      void exited.then(() => {
        clearTimeout(timer);
        done(output.includes(RECOVERY_LINE));
      });
    });
    report.recoveryLine = sawLine;
    // The dialog waits for Quit. Give a late update path time to log, then stop the process we started.
    await Promise.race([exited, new Promise((done) => setTimeout(done, SETTLE_MS))]);
  } finally {
    if (child.exitCode === null && child.signalCode === null) child.kill("SIGTERM");
    await Promise.race([exited, new Promise((done) => setTimeout(done, 10_000))]);
    if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
  }

  report.forbiddenLines = output.split("\n").filter((line) => FORBIDDEN.some((pattern) => pattern.test(line)));
  report.database = readDatabase(databasePath);

  assert.ok(report.recoveryLine, "The custom recovery line did not appear.");
  assert.deepEqual(report.forbiddenLines, [], "The custom build logged an update check, download or install.");
  assert.equal(report.database.version, 99999, "The schema version changed.");
  assert.equal(report.database.sentinel, "custom-build-newer-data-e2e", "The sentinel row changed.");
  assert.equal(report.database.integrity, "ok", "The database failed its integrity check.");
  report.passed = true;
} finally {
  writeReport();
}

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (!report.passed) process.exitCode = 1;
