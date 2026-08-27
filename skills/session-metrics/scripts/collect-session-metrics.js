#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

function fail(message) {
  console.error(`session-metrics: ${message}`);
  process.exitCode = 1;
}

function parseArgs(argv) {
  if (argv[0] === "compare") return { compare: true };
  const [variant, ticket = "unknown", lane = "unknown"] = argv;
  if (!variant) throw new Error("usage: collect-session-metrics.js <variant> [ticket-id] [lane]");
  return { variant, ticket, lane };
}

function findTranscript(cwd) {
  const root = path.join(process.env.HOME || "", ".claude", "projects");
  if (!fs.existsSync(root)) throw new Error(`Claude project directory not found: ${root}`);
  const candidates = [];
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.name.endsWith(".jsonl") && !file.includes(`${path.sep}subagents${path.sep}`)) {
        candidates.push(file);
      }
    }
  }
  visit(root);

  const matches = candidates.filter((file) => {
    const firstLine = fs.readFileSync(file, "utf8").split("\n", 1)[0];
    try {
      return JSON.parse(firstLine).cwd === cwd;
    } catch {
      return false;
    }
  });
  if (!matches.length) throw new Error(`no transcript found for cwd ${cwd}`);
  const rootTranscript = matches.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
  const subagentsDir = path.join(path.dirname(rootTranscript), path.basename(rootTranscript, ".jsonl"), "subagents");
  const subagents = fs.existsSync(subagentsDir)
    ? fs.readdirSync(subagentsDir)
      .filter((file) => file.endsWith(".jsonl"))
      .map((file) => path.join(subagentsDir, file))
    : [];
  return [rootTranscript, ...subagents];
}

function readUsage(transcripts) {
  const totals = {
    input_tokens: 0,
    output_tokens: 0,
    cache_read_input_tokens: 0,
    cache_creation_input_tokens: 0,
  };
  let messages = 0;
  let toolCalls = 0;
  let subagentCalls = 0;
  let firstTimestamp;
  let lastTimestamp;
  let model = "unknown";
  let sessionId = "unknown";
  let branch = "unknown";
  let cwd = "unknown";

  for (const transcript of transcripts) for (const line of fs.readFileSync(transcript, "utf8").split("\n")) {
    if (!line) continue;
    let event;
    try {
      event = JSON.parse(line);
    } catch {
      continue;
    }
    cwd = event.cwd || cwd;
    sessionId = event.sessionId || event.session_id || sessionId;
    branch = event.gitBranch || branch;
    if (event.timestamp) {
      firstTimestamp ||= event.timestamp;
      lastTimestamp = event.timestamp;
    }
    const message = event.message;
    if (!message?.usage) continue;
    messages += 1;
    model = message.model || model;
    for (const key of Object.keys(totals)) totals[key] += Number(message.usage[key] || 0);
    const content = Array.isArray(message.content) ? message.content : [];
    toolCalls += content.filter((item) => item?.type === "tool_use").length;
    subagentCalls += content.filter((item) =>
      item?.name === "Agent" || item?.name === "Task"
    ).length;
  }
  if (!messages) throw new Error(`no usage records found in ${transcripts[0]}`);
  const durationSeconds = firstTimestamp && lastTimestamp
    ? Math.max(0, (Date.parse(lastTimestamp) - Date.parse(firstTimestamp)) / 1000)
    : null;
  return {
    session_id: sessionId,
    cwd,
    branch,
    model,
    usage_messages: messages,
    input_tokens: totals.input_tokens,
    output_tokens: totals.output_tokens,
    cache_read_input_tokens: totals.cache_read_input_tokens,
    cache_creation_input_tokens: totals.cache_creation_input_tokens,
    total_tokens: totals.input_tokens + totals.output_tokens +
      totals.cache_read_input_tokens + totals.cache_creation_input_tokens,
    billable_token_proxy: totals.input_tokens + totals.output_tokens +
      totals.cache_creation_input_tokens,
    tool_calls: toolCalls,
    subagent_calls: subagentCalls,
    duration_seconds: durationSeconds,
  };
}

function git(args, cwd) {
  try {
    return execFileSync("git", ["-C", cwd, ...args], { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function compare(outputDir) {
  const file = path.join(outputDir, "runs.jsonl");
  if (!fs.existsSync(file)) throw new Error(`no records found at ${file}`);
  const groups = {};
  for (const line of fs.readFileSync(file, "utf8").split("\n").filter(Boolean)) {
    const run = JSON.parse(line);
    (groups[run.variant] ||= []).push(run);
  }
  for (const [variant, runs] of Object.entries(groups)) {
    const median = (key) => {
      const values = runs.map((run) => run[key]).filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
      return values.length ? values[Math.floor(values.length / 2)] : "n/a";
    };
    const completed = runs.filter((run) => run.completed).length;
    const retries = runs.reduce((sum, run) => sum + (run.retries || 0), 0);
    console.log(`${variant}: n=${runs.length}, median total=${median("total_tokens")}, ` +
      `input=${median("input_tokens")}, output=${median("output_tokens")}, ` +
      `billable-proxy=${median("billable_token_proxy")}, duration_s=${median("duration_seconds")}, ` +
      `completed=${completed}/${runs.length}, retries=${retries}`);
  }
}

try {
  const args = parseArgs(process.argv.slice(2));
  const repo = process.cwd();
  const outputDir = path.join(repo, ".scratch", "session-metrics");
  fs.mkdirSync(outputDir, { recursive: true });
  if (args.compare) {
    compare(outputDir);
  } else {
    const usage = readUsage(findTranscript(repo));
    const record = {
      recorded_at: new Date().toISOString(),
      variant: args.variant,
      ticket: args.ticket,
      lane: args.lane,
      harness_commit: git(["rev-parse", "HEAD"], repo),
      ...usage,
      completed: true,
      retries: 0,
    };
    fs.appendFileSync(path.join(outputDir, "runs.jsonl"), `${JSON.stringify(record)}\n`);
    const csv = path.join(outputDir, "runs.csv");
    if (!fs.existsSync(csv)) fs.writeFileSync(csv, `${Object.keys(record).join(",")}\n`);
    fs.appendFileSync(csv, `${Object.values(record).map((value) => JSON.stringify(value)).join(",")}\n`);
    console.log(`recorded ${args.variant} metrics in ${path.relative(repo, outputDir)}`);
  }
} catch (error) {
  fail(error.message);
}
