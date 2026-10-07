import { performance } from "node:perf_hooks";

import { runWorkerPool } from "../src/transcribe.js";

const DEFAULT_JOBS = 120;
const DEFAULT_KEYS = 3;
const DEFAULT_CONCURRENCIES = [1, 4, 8];
const DEFAULT_LATENCY_MS = 8;

function positiveInteger(value, fallback, name) {
  if (value === undefined || value === "") {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} deve ser um número inteiro maior que zero.`);
  }

  return parsed;
}

function loadConcurrencies() {
  const configured = process.env.BENCHMARK_CONCURRENCIES;

  if (!configured) {
    return DEFAULT_CONCURRENCIES;
  }

  const values = configured
    .split(",")
    .map((value) => positiveInteger(value.trim(), null, "BENCHMARK_CONCURRENCIES"));

  return [...new Set(values)];
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function httpError(status, message, headers = {}) {
  return Object.assign(new Error(message), {
    status,
    headers: new Headers(headers),
  });
}

function timeoutError() {
  const error = new Error("Timeout simulado");
  error.name = "APIConnectionTimeoutError";
  return error;
}

const scenarios = [
  {
    name: "normal",
    getError: () => null,
  },
  {
    name: "retry-429",
    getError: ({ jobIndex, attemptForKey }) =>
      jobIndex % 4 === 0 && attemptForKey === 1
        ? httpError(429, "Rate limit simulado", { "retry-after-ms": "1" })
        : null,
  },
  {
    name: "fallback-auth",
    getError: ({ keyNumber }) =>
      keyNumber === 1 ? httpError(401, "Autenticação simulada") : null,
  },
  {
    name: "misto",
    getError: ({ jobIndex, keyNumber, attemptForKey, keyCount }) => {
      if (jobIndex % 23 === 0) {
        return httpError(401, "Falha permanente simulada");
      }

      const initialKey = (jobIndex % keyCount) + 1;

      if (jobIndex % 11 === 0 && keyNumber === initialKey) {
        return httpError(503, "Serviço indisponível simulado");
      }

      if (jobIndex % 7 === 0 && attemptForKey === 1) {
        return timeoutError();
      }

      return null;
    },
  },
];

async function runScenario({
  scenario,
  jobs,
  keyCount,
  concurrency,
  latencyMs,
}) {
  const audioFiles = Array.from(
    { length: jobs },
    (_, index) => `audio-${String(index + 1).padStart(4, "0")}.mp3`,
  );
  const routes = Array.from({ length: keyCount }, (_, index) => ({
    key: {
      label: `KEY ${index + 1}`,
      apiKey: `benchmark-secret-${index + 1}`,
    },
    groq: { keyNumber: index + 1 },
  }));
  const apiKeys = routes.map((route) => route.key.apiKey);
  const attemptsByAudioAndKey = new Map();
  const keysByAudio = new Map();
  const firstKeyByAudio = new Map();
  const activeAudios = new Set();
  let activeRequests = 0;
  let peakConcurrency = 0;
  let overlappingAttempt = false;
  let requestedBackoffMs = 0;

  async function requestHandler(groq, audioFile) {
    const jobIndex = Number(/audio-(\d+)/.exec(audioFile)[1]) - 1;
    const attemptKey = `${audioFile}:${groq.keyNumber}`;
    const attemptForKey = (attemptsByAudioAndKey.get(attemptKey) ?? 0) + 1;

    attemptsByAudioAndKey.set(attemptKey, attemptForKey);

    if (!keysByAudio.has(audioFile)) {
      keysByAudio.set(audioFile, new Set());
      firstKeyByAudio.set(audioFile, groq.keyNumber);
    }

    keysByAudio.get(audioFile).add(groq.keyNumber);

    if (activeAudios.has(audioFile)) {
      overlappingAttempt = true;
    }

    activeAudios.add(audioFile);
    activeRequests += 1;
    peakConcurrency = Math.max(peakConcurrency, activeRequests);

    try {
      await sleep(latencyMs + (jobIndex % 3));

      const error = scenario.getError({
        jobIndex,
        keyNumber: groq.keyNumber,
        attemptForKey,
        keyCount,
      });

      if (error) {
        throw error;
      }

      return `Transcrição simulada de ${audioFile}`;
    } finally {
      activeRequests -= 1;
      activeAudios.delete(audioFile);
    }
  }

  async function waitHandler(milliseconds) {
    requestedBackoffMs += milliseconds;
    await sleep(Math.min(milliseconds, 2));
  }

  const originalLog = console.log;
  const originalError = console.error;
  const startedAt = performance.now();
  let results;

  console.log = () => {};
  console.error = () => {};

  try {
    results = await runWorkerPool({
      audioFiles,
      concurrency,
      routes,
      apiKeys,
      requestHandler,
      saveHandler: async () => {},
      waitHandler,
    });
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }

  const durationMs = performance.now() - startedAt;
  const successes = results.filter(Boolean).length;
  const attempts = [...attemptsByAudioAndKey.values()].reduce(
    (total, count) => total + count,
    0,
  );
  const retries = [...attemptsByAudioAndKey.values()].reduce(
    (total, count) => total + Math.max(0, count - 1),
    0,
  );
  const fallbacks = [...keysByAudio.values()].reduce(
    (total, keys) => total + Math.max(0, keys.size - 1),
    0,
  );
  const roundRobinValid = audioFiles.every(
    (audioFile, index) =>
      firstKeyByAudio.get(audioFile) === (index % keyCount) + 1,
  );

  if (peakConcurrency > concurrency) {
    throw new Error(
      `Concorrência excedida: pico ${peakConcurrency}, limite ${concurrency}.`,
    );
  }

  if (overlappingAttempt) {
    throw new Error("Foram detectadas tentativas simultâneas do mesmo áudio.");
  }

  if (!roundRobinValid) {
    throw new Error("A distribuição round-robin inicial foi violada.");
  }

  return {
    cenário: scenario.name,
    jobs,
    concorrência: concurrency,
    "pico real": peakConcurrency,
    sucessos: successes,
    falhas: results.length - successes,
    tentativas: attempts,
    retries,
    fallbacks,
    "tempo (ms)": Math.round(durationMs),
    "jobs/s": Number((jobs / (durationMs / 1_000)).toFixed(1)),
    "backoff pedido (ms)": requestedBackoffMs,
  };
}

async function main() {
  const jobs = positiveInteger(
    process.env.BENCHMARK_JOBS,
    DEFAULT_JOBS,
    "BENCHMARK_JOBS",
  );
  const keyCount = positiveInteger(
    process.env.BENCHMARK_KEYS,
    DEFAULT_KEYS,
    "BENCHMARK_KEYS",
  );
  const latencyMs = positiveInteger(
    process.env.BENCHMARK_LATENCY_MS,
    DEFAULT_LATENCY_MS,
    "BENCHMARK_LATENCY_MS",
  );
  const concurrencies = loadConcurrencies();
  const rows = [];

  console.log("Benchmark local do roteador (API Groq simulada)");
  console.log(`Áudios por cenário: ${jobs}`);
  console.log(`Chaves simuladas: ${keyCount}`);
  console.log(`Concorrências: ${concurrencies.join(", ")}`);
  console.log(`Latência base simulada: ${latencyMs} ms\n`);

  for (const scenario of scenarios) {
    for (const concurrency of concurrencies) {
      rows.push(
        await runScenario({
          scenario,
          jobs,
          keyCount,
          concurrency,
          latencyMs,
        }),
      );
    }
  }

  console.table(rows);
  console.log(
    "\nValidações aprovadas: limite de concorrência, round-robin e ausência de tentativas simultâneas para o mesmo áudio.",
  );
}

main().catch((error) => {
  console.error(`Benchmark falhou: ${error.message}`);
  process.exitCode = 1;
});
