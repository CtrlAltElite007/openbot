// Checks the raised channel limits of this fork in this worktree's running dev app: 12 parallel
// assignments in one channel, 40 automatic assignments in one request, and 6 member replies in one
// request. Start the app with `bun run dev` (never `--shared`), then run
// `bun scripts/channel-limits-e2e.ts --allow-mutations`.
//
// The members are custom ACP agents that run `provider-fakes/agents/channel-limits.ts`. They call
// the real channel tools through the app's OpenBot MCP servers, as a model does, so no provider
// sign-in and no paid turn is needed. The script adds 13 such agents and 3 channels, and removes
// them at the end.
//
// It checks that:
// - 12 tasks run at the same time in one channel, the 13th waits, and it runs when one finishes;
// - stop pauses a running task and ends its turn, resume runs it again, and cancel ends it;
// - in one request, 40 channel_assign calls are accepted, the 41st is refused and pauses the
//   request, and resume sets the count back to 0;
// - in one request, 6 channel_reply calls are accepted and the 7th is refused, and a new request
//   gets its own 6.
// Writes .openbot-build/channel-limits-e2e/report.json.
import assert from "node:assert/strict";
import { copyFileSync, existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ChannelPage, ChannelTask, ClientAgentSummary } from "@openbot/contracts/ipc";
import { CHANNEL_ASSIGNMENT_LIMIT, CHANNEL_PARALLEL_LIMIT } from "@openbot/contracts/ipc";
import { CHANNEL_REPLY_LIMIT } from "../src/backend/channel-replies";
import { ChannelClient, connectChannelE2e, waitFor, writeReport } from "./channel-e2e-support";
import { installFakeAgent, readJsonl } from "./provider-fakes/host";

// The fork's contract. A change to a constant must change this script too.
assert.equal(CHANNEL_PARALLEL_LIMIT, 12);
assert.equal(CHANNEL_ASSIGNMENT_LIMIT, 40);
assert.equal(CHANNEL_REPLY_LIMIT, 6);

const MEMBERS = CHANNEL_PARALLEL_LIMIT + 1;
const RUN = Date.now().toString(36);

interface LogEntry {
  agent: string;
  event: string;
  tool?: string;
  tag?: string;
  index?: number;
  accepted?: boolean;
  text?: string;
}

interface Report {
  run: string;
  leftoversRemoved?: number;
  limits: { parallel: number; assignments: number; replies: number };
  parallel?: { runningAtLimit: number; waitingOwner: string | null; waitingState: string; ranAfterRelease: boolean };
  taskCommands?: { stopped: string; turnEnded: boolean; resumed: boolean; cancelled: string };
  assignments?: {
    accepted: number;
    refusedAt: number | null;
    refusal: string;
    rootState: string;
    rootError: string | null;
    assignmentCount: number;
    countAfterResume: number;
  };
  replies?: { accepted: number; refusedAt: number | null; refusal: string; newRequestAccepted: boolean };
  passed: boolean;
}

const report: Report = {
  run: RUN,
  limits: { parallel: CHANNEL_PARALLEL_LIMIT, assignments: CHANNEL_ASSIGNMENT_LIMIT, replies: CHANNEL_REPLY_LIMIT },
  passed: false,
};

const dir = mkdtempSync(join(tmpdir(), "channel-limits-e2e-"));
const logPath = join(dir, "fake.jsonl");
const executable = join(dir, "fake-channel-limits");
await installFakeAgent(executable, "channel-limits", { FAKE_DIR: dir, FAKE_LOG: logPath });

const session = await connectChannelE2e("channel-limits-e2e");
const { page } = session;
const client = new ChannelClient(page);
const customIds: string[] = [];
const agentIds: string[] = [];

/** A message id can hold ":", which separates directive fields. */
const field = (id: string) => id.replaceAll(":", "~");
const directive = (name: string, ...fields: (string | number)[]) => `[[e2e:${name}:${fields.join(":")}]]`;
const release = (tag: string) => writeFileSync(join(dir, `release-${tag}`), "");
const holding = (tag: string) => readdirSync(dir).filter((file) => file.startsWith(`running-${tag}-`)).length;
const log = () => readJsonl<LogEntry>(logPath);
const tools = async (tool: string, tag: string) =>
  (await log()).filter((entry) => entry.event === "tool" && entry.tool === tool && entry.tag === tag);
const rootOf = (channel: ChannelPage, ownerAgentId: string): ChannelTask | undefined =>
  channel.tasks.find((task) => task.parentTaskId === null && task.ownerAgentId === ownerAgentId);

const customIdOf = (name: string) => `e2e-limits-${RUN}-${name.toLowerCase()}`.slice(0, 40);

/** Saves one custom ACP agent. Each save restarts the provider, so the script saves all of them first. */
async function saveCustomAgent(name: string): Promise<void> {
  const customId = customIdOf(name);
  await page.evaluate((input) => window.openbot.customAgents.save(input), {
    id: customId,
    name: `E2E ${name}`,
    command: executable,
    args: [],
    env: [{ name: "FAKE_NAME", value: name }],
    usagePrompt: null,
  });
  customIds.push(customId);
}

/** Adds one OpenBot agent on a saved custom agent. */
async function addMember(name: string): Promise<ClientAgentSummary> {
  const customId = customIdOf(name);
  // Until the restarted provider lists the custom agent's models, the host refuses the model.
  const deadline = Date.now() + 180_000;
  for (;;) {
    try {
      const agent = await page.evaluate(
        (input) =>
          window.openbot.agent.createAgent({
            name: input.name,
            description: "Channel limits E2E member.",
            avatarSeed: input.seed,
            avatarHue: null,
            initialMessage: "Say ready.",
            provider: "acp",
            model: `${input.customId}/default`,
          }),
        { name: `E2E ${name} ${RUN}`, seed: `e2e-${RUN}-${name.toLowerCase()}`, customId },
      );
      agentIds.push(agent.id);
      return agent;
    } catch (error) {
      if (!(error instanceof Error && error.message.includes("listed no models")) || Date.now() > deadline) throw error;
      await page.waitForTimeout(500);
    }
  }
}

/**
 * Removes what an earlier run that stopped before its cleanup left: its channels, agents and custom
 * agents. The app saves at most 16 custom agents, so a leftover run blocks the next one. Only names
 * that this script makes match.
 */
async function removeLeftovers(): Promise<number> {
  const channels = (await client.list()).filter((channel) =>
    /^E2E limits (parallel|assignments|replies) [a-z0-9]+$/.test(channel.name),
  );
  for (const channel of channels) client.created.push(channel.id);
  await client.cleanup();
  client.created.length = 0;
  const agents = (await client.agents()).filter((agent) => /^E2E L\d+ [a-z0-9]+$/.test(agent.name));
  for (const agent of agents) await page.evaluate((id) => window.openbot.agent.deleteAgent(id), agent.id);
  const saved = await page.evaluate(() => window.openbot.customAgents.list());
  const custom = saved.filter((agent) => agent.id.startsWith("e2e-limits-"));
  for (const agent of custom) await page.evaluate((id) => window.openbot.customAgents.delete({ id }), agent.id);
  return channels.length + agents.length + custom.length;
}

try {
  report.leftoversRemoved = await removeLeftovers();
  const names = Array.from({ length: MEMBERS }, (_, index) => `L${index + 1}`);
  const members: ClientAgentSummary[] = [];
  for (const name of names) await saveCustomAgent(name);
  for (const name of names) members.push(await addMember(name));
  const member = (index: number) => {
    const found = members[index];
    assert.ok(found);
    return found;
  };

  // 1. Parallel: 13 direct requests, each to a different member, that each hold their turn.
  const parallel = await client.create(
    `E2E limits parallel ${RUN}`,
    members.map((agent) => agent.id),
    null,
  );
  for (const [index, agent] of members.entries())
    await client.send(parallel.id, directive(names[index] ?? "", "hold", `p${index + 1}`), agent.id);
  const atLimit = await waitFor(
    page,
    "12 tasks run and the 13th waits",
    () => client.read(parallel.id),
    (channel) =>
      channel.tasks.filter((task) => task.state === "running").length === CHANNEL_PARALLEL_LIMIT &&
      channel.tasks.length === MEMBERS &&
      Array.from({ length: CHANNEL_PARALLEL_LIMIT }, (_, index) => holding(`p${index + 1}`)).every(Boolean),
  );
  const last = member(MEMBERS - 1);
  const waiting = rootOf(atLimit, last.id);
  assert.ok(waiting, "The 13th request has no task.");
  assert.equal(waiting.state, "queued", "The 13th task does not wait while 12 run.");
  assert.equal(holding(`p${MEMBERS}`), 0, "The 13th member started a turn while 12 ran.");
  release("p1");
  await waitFor(page, "the 13th task runs after one finishes", async () => holding(`p${MEMBERS}`), Boolean);
  report.parallel = {
    runningAtLimit: CHANNEL_PARALLEL_LIMIT,
    waitingOwner: waiting.ownerAgentId,
    waitingState: waiting.state,
    ranAfterRelease: true,
  };

  // 2. Stop, resume and cancel on held tasks.
  const second = rootOf(await client.read(parallel.id), member(1).id);
  assert.ok(second);
  await client.taskCommand("stop", parallel.id, second.id);
  const stopped = await waitFor(
    page,
    "stop pauses the task",
    () => client.read(parallel.id),
    (channel) => rootOf(channel, member(1).id)?.state === "paused",
  );
  await waitFor(page, "stop ends the member's turn", log, (entries) =>
    entries.some((entry) => entry.event === "cancelled" && entry.tag === "p2"),
  );
  await client.taskCommand("resume", parallel.id, second.id);
  await waitFor(
    page,
    "resume runs the task again",
    async () => holding("p2"),
    (count) => count >= 2,
  );
  const third = rootOf(await client.read(parallel.id), member(2).id);
  assert.ok(third);
  // Only a stopped or failed task can be cancelled.
  await assert.rejects(client.taskCommand("cancel", parallel.id, third.id), /stopped or failed/);
  await client.taskCommand("stop", parallel.id, third.id);
  await waitFor(
    page,
    "stop pauses the task before cancel",
    () => client.read(parallel.id),
    (channel) => rootOf(channel, member(2).id)?.state === "paused",
  );
  await client.taskCommand("cancel", parallel.id, third.id);
  const cancelled = await waitFor(
    page,
    "cancel ends the task",
    () => client.read(parallel.id),
    (channel) => rootOf(channel, member(2).id)?.state === "cancelled",
  );
  report.taskCommands = {
    stopped: rootOf(stopped, member(1).id)?.state ?? "missing",
    turnEnded: true,
    resumed: true,
    cancelled: rootOf(cancelled, member(2).id)?.state ?? "missing",
  };
  for (let index = 1; index <= MEMBERS; index++) release(`p${index}`);
  await waitFor(
    page,
    "the parallel channel settles",
    () => client.read(parallel.id),
    (channel) => channel.tasks.every((task) => !["queued", "running", "waiting"].includes(task.state)),
  );

  // 3. Assignments: one request makes 41 channel_assign calls.
  const assigns = await client.create(`E2E limits assignments ${RUN}`, [member(0).id, member(1).id], null);
  const extra = CHANNEL_ASSIGNMENT_LIMIT + 1;
  await client.send(assigns.id, directive("L1", "assign", member(1).id, "L2", extra, "a"), member(0).id);
  const calls = await waitFor(
    page,
    `${extra} channel_assign calls`,
    () => tools("channel_assign", "a"),
    (entries) => entries.length === extra,
  );
  const paused = await waitFor(
    page,
    "the 41st assignment pauses the request",
    () => client.read(assigns.id),
    (channel) => rootOf(channel, member(0).id)?.state === "paused",
  );
  const root = rootOf(paused, member(0).id);
  assert.ok(root);
  const acceptedAssigns = calls.filter((entry) => entry.accepted).length;
  const refusedAssign = calls.find((entry) => !entry.accepted);
  assert.equal(acceptedAssigns, CHANNEL_ASSIGNMENT_LIMIT, "Not exactly 40 assignments were accepted.");
  assert.equal(refusedAssign?.index, extra, "The first refused assignment is not the 41st.");
  assert.equal(root.assignmentCount, CHANNEL_ASSIGNMENT_LIMIT);
  assert.match(root.error ?? "", /assignment limit/i);
  await client.taskCommand("resume", assigns.id, root.id);
  const resumed = await waitFor(
    page,
    "resume sets the assignment count back to 0",
    () => client.read(assigns.id),
    (channel) => {
      const task = rootOf(channel, member(0).id);
      return task !== undefined && task.state !== "paused" && task.assignmentCount === 0;
    },
  );
  report.assignments = {
    accepted: acceptedAssigns,
    refusedAt: refusedAssign?.index ?? null,
    refusal: refusedAssign?.text ?? "",
    rootState: root.state,
    rootError: root.error,
    assignmentCount: root.assignmentCount,
    countAfterResume: rootOf(resumed, member(0).id)?.assignmentCount ?? -1,
  };

  // 4. Replies: 7 other members each post a message, then one request replies to all 7.
  const replyNames = names.slice(1, CHANNEL_REPLY_LIMIT + 2);
  const repliers = members.slice(1, CHANNEL_REPLY_LIMIT + 2);
  const replies = await client.create(`E2E limits replies ${RUN}`, [member(0).id, ...repliers.map((a) => a.id)], null);
  for (const [index, agent] of repliers.entries())
    await client.send(replies.id, directive(replyNames[index] ?? "", "say", `m${index + 1}`), agent.id);
  const said = await waitFor(
    page,
    "7 members post a message",
    () => client.read(replies.id),
    (channel) =>
      repliers.every((agent) =>
        channel.messages.some(
          (message) =>
            message.author.kind === "agent" && message.author.id === agent.id && message.message.status !== "streaming",
        ),
      ),
  );
  const messageIds = repliers.map((agent) => {
    const found = said.messages.find((message) => message.author.kind === "agent" && message.author.id === agent.id);
    assert.ok(found, `${agent.name} posted no message.`);
    return found.id;
  });
  await client.send(replies.id, directive("L1", "reply", "r", messageIds.map(field).join(",")), member(0).id);
  const replyCalls = await waitFor(
    page,
    "7 channel_reply calls",
    () => tools("channel_reply", "r"),
    (entries) => entries.length === messageIds.length,
  );
  const acceptedReplies = replyCalls.filter((entry) => entry.accepted).length;
  const refusedReply = replyCalls.find((entry) => !entry.accepted);
  assert.equal(acceptedReplies, CHANNEL_REPLY_LIMIT, "Not exactly 6 replies were accepted.");
  assert.equal(refusedReply?.index, CHANNEL_REPLY_LIMIT + 1, "The first refused reply is not the 7th.");
  assert.match(refusedReply?.text ?? "", new RegExp(`${CHANNEL_REPLY_LIMIT} member replies`));
  // A new request has its own replies.
  await waitFor(
    page,
    "the first reply request settles",
    () => client.read(replies.id),
    (channel) => channel.tasks.every((task) => !["queued", "running", "waiting"].includes(task.state)),
  );
  await client.send(replies.id, directive("L1", "reply", "r2", field(messageIds[0] ?? "")), member(0).id);
  const second2 = await waitFor(
    page,
    "a reply in a new request",
    () => tools("channel_reply", "r2"),
    (e) => e.length === 1,
  );
  assert.equal(second2[0]?.accepted, true, "A new request did not get its own replies.");
  report.replies = {
    accepted: acceptedReplies,
    refusedAt: refusedReply?.index ?? null,
    refusal: refusedReply?.text ?? "",
    newRequestAccepted: true,
  };

  report.passed = true;
} finally {
  for (let index = 1; index <= MEMBERS; index++) release(`p${index}`);
  await client.cleanup().catch(() => undefined);
  for (const agentId of agentIds)
    await page.evaluate((id) => window.openbot.agent.deleteAgent(id), agentId).catch(() => undefined);
  for (const id of customIds)
    await page.evaluate((input) => window.openbot.customAgents.delete(input), { id }).catch(() => undefined);
  const path = writeReport("channel-limits-e2e", report);
  process.stdout.write(`${report.passed ? "PASS" : "FAIL"}: ${path}\n`);
  await session.close().catch(() => undefined);
  // The fake's log goes next to the report, so a failed run can be read.
  if (existsSync(logPath)) copyFileSync(logPath, join(path, "..", "fake.jsonl"));
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
}
