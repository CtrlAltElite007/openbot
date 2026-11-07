// The custom agent of `channel-limits-e2e.ts`. It runs in the real dev app as an ACP agent, and it
// calls the real channel tools through the OpenBot MCP servers that `session/new` gives it, as a
// model does. It acts on a directive `[[e2e:<FAKE_NAME>:<action>:...]]` in its prompt. Each directive
// runs once (a file in `FAKE_DIR` marks it done), so a later turn that sees the same history ends.
// Without a directive for this agent, the turn answers one line and ends.
//
// Actions:
//   hold:<tag>                      runs until `FAKE_DIR/release-<tag>` exists. A cancel ends the turn
//                                   and leaves the directive open, so a resumed task holds again.
//   say:<tag>                       answers one line.
//   result:<tag>                    calls channel_result.
//   assign:<id>:<name>:<n>:<tag>    calls channel_assign <n> times, each a `result` task for <name>.
//   reply:<tag>:<messageId>,...     calls channel_reply once for each message id (":" sent as "~").
//
// `FAKE_LOG` gets one JSON line for each turn event and tool call.
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { DynamicRecord } from "@openbot/contracts/runtime-values";
import { getArray, getString, isRecord } from "../../../src/backend/protocol";
import { type AcpPeer, type AcpRequest, type LogValue, logEntry, serveFakeAcpAgent } from "../acp-agent";

const NAME = process.env.FAKE_NAME ?? "fake";
const DIR = process.env.FAKE_DIR ?? "";
const log = (entry: Readonly<Record<string, LogValue>>) => logEntry({ agent: NAME, ...entry });

interface HttpServer {
  type?: string;
  name: string;
  url?: string;
  headers?: { name: string; value: string }[];
}

const servers = new Map<string, HttpServer[]>();
const cancelled = new Set<string>();
let sessions = 0;

const marker = (kind: string, tag: string) => join(DIR, `${kind}-${tag}`);
const isDone = (tag: string) => existsSync(marker("done", tag));
const markDone = (tag: string) => writeFileSync(marker("done", tag), "");

/** The qualified names that tool_search gave, by tool name. */
const qualified = new Map<string, string>();

/**
 * Calls one OpenBot tool as a model does. A tool that a server lists is called directly. A deferred
 * tool, such as the channel tools, is found with tool_search and run with tool_call.
 */
async function callTool(sessionId: string, tool: string, args: DynamicRecord): Promise<string> {
  const seen: string[] = [];
  for (const server of servers.get(sessionId) ?? []) {
    if (server.type !== "http" || !server.url) continue;
    const headers = Object.fromEntries((server.headers ?? []).map((header) => [header.name, header.value]));
    const client = new Client({ name: `fake-${NAME}`, version: "1.0.0" });
    await client.connect(new StreamableHTTPClientTransport(new URL(server.url), { requestInit: { headers } }));
    const call = async (name: string, input: DynamicRecord) => {
      const result = await client.callTool({ name, arguments: input });
      const content = Array.isArray(result.content) ? result.content : [];
      const text = content.map((part) => (part.type === "text" ? part.text : "")).join("");
      return result.isError ? `ERROR ${text}` : text;
    };
    try {
      const { tools } = await client.listTools();
      const direct = tools.find((item) => item.name === tool);
      if (direct) return await call(direct.name, args);
      if (!tools.some((item) => item.name === "tool_call")) {
        seen.push(`${server.name}: ${tools.map((item) => item.name).join(", ")}`);
        continue;
      }
      let name = qualified.get(tool);
      if (!name) {
        const found = await call("tool_search", { query: tool });
        name = found.match(new RegExp(`[A-Za-z0-9_.:-]*\\b${tool}\\b`))?.[0];
        if (!name) {
          seen.push(`${server.name} tool_search: ${found.slice(0, 300)}`);
          continue;
        }
        qualified.set(tool, name);
        log({ event: "qualified", tool, name });
      }
      return await call("tool_call", { name, arguments: args });
    } finally {
      await client.close().catch(() => undefined);
    }
  }
  return `ERROR no server has ${tool}. Seen: ${seen.join("; ") || "no HTTP server"}`;
}

/** Whether a tool answer accepted the call: `{ "accepted": true, ... }`, or a plain answer that is not an error. */
function accepted(text: string): boolean {
  if (text.startsWith("ERROR")) return false;
  try {
    const value = JSON.parse(text);
    if (isRecord(value) && "accepted" in value) return value.accepted === true;
  } catch {
    // Not JSON: a plain text answer.
  }
  return true;
}

/** The id of the channel message that holds this text, from channel_history. */
async function sourceMessageId(sessionId: string, text: string): Promise<string | null> {
  const page = await callTool(sessionId, "channel_history", {});
  if (page.startsWith("ERROR")) return null;
  // The deepest object with an id that holds the text. The channel message is the outermost such
  // object, so prefer the first one that has the text, from the top.
  const find = (value: unknown): string | null => {
    if (!value || typeof value !== "object" || !JSON.stringify(value).includes(text)) return null;
    if (Array.isArray(value)) {
      for (const item of value) {
        const id = find(item);
        if (id) return id;
      }
      return null;
    }
    if (!isRecord(value)) return null;
    const id = getString(value, "id");
    if (id) return id;
    for (const child of Object.values(value)) {
      const id = find(child);
      if (id) return id;
    }
    return null;
  };
  return find(JSON.parse(page));
}

async function waitFor(condition: () => boolean): Promise<void> {
  while (!condition()) await new Promise((resolve) => setTimeout(resolve, 100));
}

async function run(request: AcpRequest, peer: AcpPeer): Promise<void> {
  const sessionId = request.params.sessionId ?? "";
  cancelled.delete(sessionId);
  const prompt = (request.params.prompt ?? [])
    .filter((block) => block.type === "text")
    .map((block) => block.text ?? "")
    .join("\n");
  const directives = [...prompt.matchAll(/\[\[e2e:([^\]]+)\]\]/g)]
    .map((match) => match[1]?.split(":") ?? [])
    .filter((parts) => parts[0] === NAME);
  // The tag is the last field of each action except `reply`, where it is the second.
  const tagOf = (parts: string[]) => (parts[1] === "reply" ? parts[2] : parts.at(-1)) ?? "";
  const directive = directives.find((parts) => !isDone(tagOf(parts)));
  const end = (stopReason: "end_turn" | "cancelled", text: string) => {
    if (stopReason === "end_turn") peer.say(sessionId, text);
    peer.reply(request, { stopReason });
  };
  if (!directive) return end("end_turn", `${NAME}: nothing to do.`);
  const [, action = "", ...rest] = directive;
  const tag = tagOf(directive);
  log({ event: "turn", action, tag, sessionId });

  if (action === "hold") {
    writeFileSync(marker("running", `${tag}-${Date.now()}`), "");
    log({ event: "holding", tag });
    await waitFor(() => existsSync(marker("release", tag)) || cancelled.has(sessionId));
    if (cancelled.has(sessionId)) {
      log({ event: "cancelled", tag });
      return end("cancelled", "");
    }
    markDone(tag);
    log({ event: "released", tag });
    return end("end_turn", `${NAME}: released ${tag}.`);
  }
  if (action === "say") {
    markDone(tag);
    return end("end_turn", `${NAME}: message ${tag}.`);
  }
  if (action === "result") {
    markDone(tag);
    const answer = await callTool(sessionId, "channel_result", { text: `${NAME}: result ${tag}.` });
    log({ event: "tool", tool: "channel_result", tag, accepted: accepted(answer), text: answer.slice(0, 2000) });
    return end("end_turn", "");
  }
  if (action === "assign") {
    const [recipientId = "", recipientName = "", count = "0"] = rest;
    markDone(tag);
    const source = await sourceMessageId(sessionId, `[[e2e:${NAME}:assign:`);
    log({ event: "source", tag, source });
    for (let index = 1; index <= Number(count); index++) {
      const answer = await callTool(sessionId, "channel_assign", {
        recipientAgentId: recipientId,
        task: `[[e2e:${recipientName}:result:${tag}-${index}]]`,
        expectedResult: "One line.",
        sourceMessageIds: source ? [source] : [],
      });
      log({
        event: "tool",
        tool: "channel_assign",
        tag,
        index,
        accepted: accepted(answer),
        text: answer.slice(0, 2000),
      });
      if (cancelled.has(sessionId)) break;
    }
    return end(cancelled.has(sessionId) ? "cancelled" : "end_turn", `${NAME}: assigned ${tag}.`);
  }
  if (action === "reply") {
    markDone(tag);
    // A message id can hold ":", which separates directive fields, so the script sends it as "~".
    const ids = (rest[1] ?? "")
      .split(",")
      .filter(Boolean)
      .map((id) => id.replaceAll("~", ":"));
    for (const [position, messageId] of ids.entries()) {
      const answer = await callTool(sessionId, "channel_reply", {
        messageId,
        text: `${NAME}: reply ${tag} ${position + 1}.`,
      });
      log({
        event: "tool",
        tool: "channel_reply",
        tag,
        index: position + 1,
        accepted: accepted(answer),
        text: answer.slice(0, 2000),
      });
    }
    return end("end_turn", `${NAME}: replied ${tag}.`);
  }
  return end("end_turn", `${NAME}: unknown action ${action}.`);
}

serveFakeAcpAgent(
  {
    initialize: (request, peer) =>
      peer.reply(request, {
        protocolVersion: 1,
        agentInfo: { name: "fake-channel-limits", title: NAME, version: "1.0.0" },
        agentCapabilities: { loadSession: false },
      }),
    "session/new": (request, peer) => {
      sessions += 1;
      const sessionId = `s-${process.pid}-${sessions}`;
      // The fake host's type keeps only the names; the app sends the full HTTP servers.
      const list = getArray(request.params, "mcpServers")
        .filter(isRecord)
        .map(
          (server): HttpServer => ({
            type: getString(server, "type") ?? undefined,
            name: getString(server, "name") ?? "",
            url: getString(server, "url") ?? undefined,
            headers: getArray(server, "headers")
              .filter(isRecord)
              .map((header) => ({ name: getString(header, "name") ?? "", value: getString(header, "value") ?? "" })),
          }),
        );
      servers.set(sessionId, list);
      log({ event: "session", sessionId, servers: list.map((server) => server.name) });
      peer.reply(request, { sessionId });
    },
    "session/prompt": (request, peer) => {
      run(request, peer).catch((error: unknown) => {
        log({ event: "error", message: error instanceof Error ? error.message : String(error) });
        peer.reply(request, { stopReason: "end_turn" });
      });
    },
  },
  {
    onNotification: (method, params) => {
      if (method === "session/cancel" && params.sessionId) cancelled.add(params.sessionId);
    },
  },
);
