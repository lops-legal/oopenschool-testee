import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import Groq from "groq-sdk";

const SUPPORTED_AUDIO_EXTENSIONS = new Set([
  ".flac",
  ".mp3",
  ".mp4",
  ".mpeg",
  ".mpga",
  ".m4a",
  ".ogg",
  ".wav",
  ".webm",
]);

const scriptPath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(scriptPath);
const projectDirectory = path.resolve(currentDirectory, "..");
const envPath = path.join(projectDirectory, ".env");
const audioDirectory = path.join(projectDirectory, "audios");
const transcriptionDirectory = path.join(projectDirectory, "transcricoes");

const envResult = dotenv.config({ path: envPath, quiet: true });
const MAX_RETRIES_PER_KEY = 2;
const BASE_RETRY_DELAY_MS = 500;
const MAX_REASONABLE_RETRY_AFTER_MS = 30_000;
const NETWORK_ERROR_CODES = new Set([
  "ECONNABORTED",
  "ECONNREFUSED",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENETDOWN",
  "ENETUNREACH",
  "ENOTFOUND",
  "ETIMEDOUT",
]);

async function listAudioFiles() {
  const entries = await fs.promises.readdir(audioDirectory, {
    withFileTypes: true,
  });

  return entries
    .filter(
      (entry) =>
        entry.isFile() &&
        SUPPORTED_AUDIO_EXTENSIONS.has(path.extname(entry.name).toLowerCase()),
    )
    .map((entry) => entry.name)
    .sort((first, second) => first.localeCompare(second, "pt-BR"));
}

async function requestTranscription(groq, audioFile) {
  const audioPath = path.join(audioDirectory, audioFile);

  const transcription = await groq.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: "whisper-large-v3-turbo",
    language: "pt",
    response_format: "json",
  });

  return transcription.text;
}

async function saveTranscription(audioFile, text) {
  const outputName = `${path.parse(audioFile).name}.txt`;
  const outputPath = path.join(transcriptionDirectory, outputName);

  await fs.promises.writeFile(outputPath, `${text}\n`, "utf8");
}

function loadApiKeys() {
  return Object.entries(envResult.parsed ?? {})
    .map(([name, value]) => {
      const match = /^GROQ_API_KEY_([1-9]\d*)$/.exec(name);

      if (!match || !value?.trim()) {
        return null;
      }

      const number = Number(match[1]);

      return {
        number,
        label: `KEY ${number}`,
        apiKey: value.trim(),
      };
    })
    .filter(Boolean)
    .sort((first, second) => first.number - second.number);
}

function loadConcurrency() {
  const configuredValue = envResult.parsed?.TRANSCRIPTION_CONCURRENCY;

  if (configuredValue === undefined || configuredValue.trim() === "") {
    return 4;
  }

  const concurrency = Number(configuredValue);

  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new Error(
      "TRANSCRIPTION_CONCURRENCY deve ser um número inteiro maior que zero.",
    );
  }

  return concurrency;
}

function readableError(error, apiKeys) {
  const status = error.status ? ` (HTTP ${error.status})` : "";
  const message = error.error?.message ?? error.message ?? "Erro desconhecido";
  const safeMessage = apiKeys.reduce(
    (currentMessage, apiKey) =>
      currentMessage.replaceAll(apiKey, "[CHAVE OCULTA]"),
    String(message),
  );

  return `${safeMessage}${status}`;
}

function isTemporaryError(error) {
  const status = Number(error.status);

  if (status === 408 || status === 429 || (status >= 500 && status <= 599)) {
    return true;
  }

  if (Number.isFinite(status) && status > 0) {
    return false;
  }

  const errorName = error.name ?? error.constructor?.name ?? "";
  const errorCode = error.code ?? error.cause?.code;

  return (
    errorName === "APIConnectionError" ||
    errorName === "APIConnectionTimeoutError" ||
    NETWORK_ERROR_CODES.has(errorCode)
  );
}

function getHeader(error, headerName) {
  if (typeof error.headers?.get === "function") {
    return error.headers.get(headerName);
  }

  return error.headers?.[headerName] ?? error.headers?.[headerName.toLowerCase()];
}

function parseRetryAfter(error) {
  const retryAfterMillisecondsHeader = getHeader(error, "retry-after-ms");
  const retryAfterMilliseconds = Number(retryAfterMillisecondsHeader);

  if (
    retryAfterMillisecondsHeader !== null &&
    retryAfterMillisecondsHeader !== undefined &&
    retryAfterMillisecondsHeader !== "" &&
    Number.isFinite(retryAfterMilliseconds) &&
    retryAfterMilliseconds >= 0 &&
    retryAfterMilliseconds <= MAX_REASONABLE_RETRY_AFTER_MS
  ) {
    return retryAfterMilliseconds;
  }

  const retryAfter = getHeader(error, "retry-after");

  if (!retryAfter) {
    return null;
  }

  const seconds = Number(retryAfter);
  const delay = Number.isFinite(seconds)
    ? seconds * 1_000
    : Date.parse(retryAfter) - Date.now();

  if (
    Number.isFinite(delay) &&
    delay >= 0 &&
    delay <= MAX_REASONABLE_RETRY_AFTER_MS
  ) {
    return delay;
  }

  return null;
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function tryWithKey({
  groq,
  key,
  audioFile,
  position,
  apiKeys,
  requestHandler = requestTranscription,
  waitHandler = wait,
}) {
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES_PER_KEY; attempt += 1) {
    try {
      const text = await requestHandler(groq, audioFile);
      return { success: true, text };
    } catch (error) {
      lastError = error;

      if (!isTemporaryError(error) || attempt === MAX_RETRIES_PER_KEY) {
        break;
      }

      const retryNumber = attempt + 1;
      const retryAfter = parseRetryAfter(error);
      const delay = retryAfter ?? BASE_RETRY_DELAY_MS * 2 ** attempt;

      console.error(
        `${position} ${key.label} -> erro temporário: ${readableError(error, apiKeys)}`,
      );
      console.log(
        `${position} ${key.label} -> retry ${retryNumber}/${MAX_RETRIES_PER_KEY}`,
      );

      await waitHandler(delay);
    }
  }

  console.error(
    `${position} ${key.label} -> falhou: ${readableError(lastError, apiKeys)}`,
  );

  return { success: false };
}

async function processAudio({
  audioFile,
  index,
  total,
  routes,
  apiKeys,
  requestHandler = requestTranscription,
  saveHandler = saveTranscription,
  waitHandler = wait,
}) {
  const position = `[${index + 1}/${total}]`;
  const progress = `${position} ${audioFile}`;

  for (let offset = 0; offset < routes.length; offset += 1) {
    const routeIndex = (index + offset) % routes.length;
    const route = routes[routeIndex];

    if (offset > 0) {
      console.log(`${position} fallback -> ${route.key.label}`);
    }

    console.log(`${progress} -> ${route.key.label} -> processando...`);

    const result = await tryWithKey({
      groq: route.groq,
      key: route.key,
      audioFile,
      position,
      apiKeys,
      requestHandler,
      waitHandler,
    });

    if (!result.success) {
      continue;
    }

    try {
      await saveHandler(audioFile, result.text);
      console.log(`${progress} -> ${route.key.label} -> OK`);
      return true;
    } catch (error) {
      console.error(
        `${progress} -> erro ao salvar: ${readableError(error, apiKeys)}`,
      );
      return false;
    }
  }

  console.error(`${progress} -> FALHOU em todas as chaves`);
  return false;
}

async function runWorkerPool({
  audioFiles,
  concurrency,
  routes,
  apiKeys,
  requestHandler,
  saveHandler,
  waitHandler,
}) {
  const results = new Array(audioFiles.length);
  const workerCount = Math.min(concurrency, audioFiles.length);
  let nextAudioIndex = 0;

  async function worker() {
    while (true) {
      const index = nextAudioIndex;
      nextAudioIndex += 1;

      if (index >= audioFiles.length) {
        return;
      }

      try {
        results[index] = await processAudio({
          audioFile: audioFiles[index],
          index,
          total: audioFiles.length,
          routes,
          apiKeys,
          requestHandler,
          saveHandler,
          waitHandler,
        });
      } catch (error) {
        const position = `[${index + 1}/${audioFiles.length}]`;

        console.error(
          `${position} ${audioFiles[index]} -> erro inesperado: ${readableError(error, apiKeys)}`,
        );
        results[index] = false;
      }
    }
  }

  const workers = Array.from({ length: workerCount }, () => worker());
  await Promise.all(workers);

  return results;
}

async function transcribeAll() {
  if (envResult.error) {
    throw new Error(`Não foi possível carregar o arquivo ${envPath}.`);
  }

  const keys = loadApiKeys();

  if (keys.length === 0) {
    throw new Error(
      "Nenhuma chave válida foi encontrada. Use GROQ_API_KEY_1, GROQ_API_KEY_2, etc. no arquivo .env.",
    );
  }

  const concurrency = loadConcurrency();

  const audioFiles = await listAudioFiles();

  if (audioFiles.length === 0) {
    console.log(
      "Nenhum arquivo de áudio compatível foi encontrado na pasta audios.",
    );
    return;
  }

  const apiKeys = keys.map((key) => key.apiKey);
  const routes = keys.map((key) => ({
    key,
    groq: new Groq({ apiKey: key.apiKey, maxRetries: 0 }),
  }));

  const audioLabel = audioFiles.length === 1 ? "áudio" : "áudios";

  console.log(`Encontrados ${audioFiles.length} ${audioLabel}.`);
  console.log(`Chaves disponíveis: ${keys.length}`);
  console.log(`Concorrência: ${concurrency}\n`);

  const results = await runWorkerPool({
    audioFiles,
    concurrency,
    routes,
    apiKeys,
  });
  const successes = results.filter((success) => success).length;
  const failures = results.length - successes;

  console.log("\nConcluído.");
  console.log(`Sucessos: ${successes}`);
  console.log(`Falhas: ${failures}`);
}

const isMainModule =
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isMainModule) {
  transcribeAll().catch((error) => {
    const apiKeys = loadApiKeys().map((key) => key.apiKey);

    console.error(`Erro: ${readableError(error, apiKeys)}`);
    process.exitCode = 1;
  });
}

export { processAudio, runWorkerPool };
