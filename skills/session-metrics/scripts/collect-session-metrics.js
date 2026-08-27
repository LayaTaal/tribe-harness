#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

function fail(message) {
  console.error(`session-metrics: ${message}`);
  process.exitCode = 1;
}

function parseArgs(argv) {
  if (argv[0] === "compare") return { compare: true };
  const [variant, ticket = "unknown", lane = "unknown", validity = "valid"] = argv;
  if (!variant) throw new Error("usage: collect-session-metrics.js <variant> [ticket-id] [lane]");
  if (!["valid", "invalid"].includes(validity)) {
    throw new Error("validity must be valid or invalid");
  }
  return { variant, ticket, lane, protocolValid: validity === "valid" };
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

  // Scan the head of the file for the first record carrying a cwd, rather than only line 0.
  // Current transcripts open with a header record (type/mode/sessionId, or type/leafUuid/sessionId
  // on a resumed session) that has no cwd at all — it first appears two to four lines in. Reading
  // only the first line matched nothing, so every run failed with "no transcript found for cwd".
  const HEAD_LINES = 25;
  const transcriptCwd = (file) => {
    const head = fs.readFileSync(file, "utf8").split("\n", HEAD_LINES);
    for (const line of head) {
      if (!line) continue;
      try {
        const { cwd: value } = JSON.parse(line);
        if (value) return value;
      } catch {
        continue;
      }
    }
    return null;
  };

  const matches = candidates.filter((file) => transcriptCwd(file) === cwd);
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
  const modelUsage = {};

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
    const messageModel = message.model || "unknown";
    (modelUsage[messageModel] ||= { ...totals });
    for (const key of Object.keys(totals)) {
      const value = Number(message.usage[key] || 0);
      totals[key] += value;
      modelUsage[messageModel][key] += value;
    }
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
    model_usage: modelUsage,
    tool_calls: toolCalls,
    subagent_calls: subagentCalls,
    duration_seconds: durationSeconds,
  };
}

function loadPricing(outputDir) {
  const file = path.join(outputDir, "pricing.json");
  if (!fs.existsSync(file)) {
    throw new Error(`pricing file not found; copy skills/session-metrics/pricing.json.example to ${file} and update rates`);
  }
  const config = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!config.models || typeof config.models !== "object") {
    throw new Error(`pricing file must contain a models object: ${file}`);
  }
  return {
    models: config.models,
    hash: crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex").slice(0, 16),
  };
}

function priceUsage(modelUsage, pricing) {
  let cost = 0;
  for (const [model, usage] of Object.entries(modelUsage)) {
    const key = Object.keys(pricing.models).find((candidate) =>
      model.toLowerCase().includes(candidate.toLowerCase())
    );
    if (!key) throw new Error(`no pricing entry matches model ${model}`);
    const rates = pricing.models[key];
    for (const [usageKey, rateKey] of [
      ["input_tokens", "input"],
      ["output_tokens", "output"],
      ["cache_read_input_tokens", "cache_read"],
      ["cache_creation_input_tokens", "cache_write"],
    ]) {
      if (!Number.isFinite(Number(rates[rateKey]))) {
        throw new Error(`pricing entry ${key} is missing numeric rate ${rateKey}`);
      }
      cost += usage[usageKey] * Number(rates[rateKey]) / 1_000_000;
    }
  }
  return Number(cost.toFixed(6));
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
  for (const [variant, allRuns] of Object.entries(groups)) {
    const runs = allRuns.filter((run) => run.protocol_valid !== false);
    const median = (key) => {
      const values = runs.map((run) => run[key]).filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
      return values.length ? values[Math.floor(values.length / 2)] : "n/a";
    };
    const completed = runs.filter((run) => run.completed).length;
    const retries = runs.reduce((sum, run) => sum + (run.retries || 0), 0);
    console.log(`${variant}: n=${runs.length}/${allRuns.length} valid, median total=${median("total_tokens")}, ` +
      `input=${median("input_tokens")}, output=${median("output_tokens")}, ` +
      `billable-proxy=${median("billable_token_proxy")}, cost_usd=${median("cost_usd")}, ` +
      `duration_s=${median("duration_seconds")}, ` +
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
    const pricing = loadPricing(outputDir);
    const record = {
      recorded_at: new Date().toISOString(),
      variant: args.variant,
      ticket: args.ticket,
      lane: args.lane,
      harness_commit: git(["rev-parse", "HEAD"], repo),
      ...usage,
      cost_usd: priceUsage(usage.model_usage, pricing),
      pricing_config: pricing.hash,
      protocol_valid: args.protocolValid,
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
