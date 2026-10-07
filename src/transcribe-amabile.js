/**
 * transcribe-amabile-chunks.js
 *
 * Transcreve os áudios de testes-audios-amabile dividindo cada arquivo em
 * chunks menores que 24 MB (limite seguro da API Groq é 25 MB).
 * Usa ffmpeg via @ffmpeg-installer/ffmpeg para cortar sem re-encode.
 */

import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import Groq from "groq-sdk";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import ffmpegFluent from "fluent-ffmpeg";

// Configura os binarios do ffmpeg e ffprobe
ffmpegFluent.setFfmpegPath(ffmpegInstaller.path);
ffmpegFluent.setFfprobePath(ffprobeInstaller.path);

const scriptPath = fileURLToPath(import.meta.url);
const projectDirectory = path.resolve(path.dirname(scriptPath), "..");
const envPath = path.join(projectDirectory, ".env");
const audioDirectory = path.join(projectDirectory, "testes-audios-amabile");
const transcriptionDirectory = path.join(projectDirectory, "transcricoes-amabile");

const envResult = dotenv.config({ path: envPath, quiet: true });

const SUPPORTED_EXTENSIONS = new Set([".flac", ".mp3", ".mp4", ".mpeg", ".mpga", ".m4a", ".ogg", ".wav", ".webm"]);
const MAX_FILE_BYTES = 23 * 1024 * 1024; // 23 MB por segurança
const CHUNK_DURATION_SECONDS = 600; // começa em 10 min, ajusta se necessário
const MAX_RETRIES_PER_KEY = 2;
const BASE_RETRY_DELAY_MS = 1000;
const MAX_RETRY_AFTER_MS = 30_000;
const NETWORK_CODES = new Set(["ECONNABORTED","ECONNREFUSED","ECONNRESET","EHOSTUNREACH","ENETDOWN","ENETUNREACH","ENOTFOUND","ETIMEDOUT"]);

// ─── Helpers ────────────────────────────────────────────────────────────────

function loadApiKeys() {
  return Object.entries(envResult.parsed ?? {})
    .map(([name, value]) => {
      const m = /^GROQ_API_KEY_([1-9]\d*)$/.exec(name);
      if (!m || !value?.trim()) return null;
      const number = Number(m[1]);
      return { number, label: `KEY ${number}`, apiKey: value.trim() };
    })
    .filter(Boolean)
    .sort((a, b) => a.number - b.number);
}

function readableError(error, rawKeys) {
  const status = error.status ? ` (HTTP ${error.status})` : "";
  const msg = String(error.error?.message ?? error.message ?? "Erro desconhecido");
  const safe = rawKeys.reduce((s, k) => s.replaceAll(k, "[CHAVE OCULTA]"), msg);
  return `${safe}${status}`;
}

function isTemporary(error) {
  const s = Number(error.status);
  if (s === 408 || s === 429 || (s >= 500 && s <= 599)) return true;
  if (Number.isFinite(s) && s > 0) return false;
  const name = error.name ?? error.constructor?.name ?? "";
  const code = error.code ?? error.cause?.code;
  return name === "APIConnectionError" || name === "APIConnectionTimeoutError" || NETWORK_CODES.has(code);
}

function getHeader(error, h) {
  if (typeof error.headers?.get === "function") return error.headers.get(h);
  return error.headers?.[h] ?? error.headers?.[h.toLowerCase()];
}

function parseRetryAfter(error) {
  const ms = Number(getHeader(error, "retry-after-ms"));
  if (Number.isFinite(ms) && ms >= 0 && ms <= MAX_RETRY_AFTER_MS) return ms;
  const ra = getHeader(error, "retry-after");
  if (!ra) return null;
  const secs = Number(ra);
  const delay = Number.isFinite(secs) ? secs * 1000 : Date.parse(ra) - Date.now();
  if (Number.isFinite(delay) && delay >= 0 && delay <= MAX_RETRY_AFTER_MS) return delay;
  return null;
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── FFmpeg helpers ──────────────────────────────────────────────────────────

/**
 * Retorna a duração total em segundos usando ffprobe.
 */
function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpegFluent.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration ?? 0);
    });
  });
}

/**
 * Corta um segmento do áudio sem re-encode.
 * Retorna o caminho do arquivo temporário criado.
 */
function cutSegment(inputPath, startSec, durationSec, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpegFluent(inputPath)
      .setStartTime(startSec)
      .setDuration(durationSec)
      .outputOptions(["-c copy", "-map 0:a:0"])
      .output(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .run();
  });
}

/**
 * Divide um arquivo de áudio em chunks com no máximo MAX_FILE_BYTES cada.
 * Usa segmentos de CHUNK_DURATION_SECONDS e reduz pela metade se necessário.
 * Retorna array de caminhos temporários.
 */
async function splitAudio(filePath) {
  const totalDuration = await getAudioDuration(filePath);
  console.log(`  Duracao total: ${(totalDuration / 60).toFixed(1)} min`);

  const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "groq-chunk-"));
  const baseName = path.parse(filePath).name;
  const ext = path.extname(filePath);

  const chunks = [];
  let start = 0;
  let segDuration = CHUNK_DURATION_SECONDS;
  let chunkIndex = 0;

  while (start < totalDuration) {
    const remaining = totalDuration - start;
    const duration = Math.min(segDuration, remaining);
    const chunkPath = path.join(tmpDir, `${baseName}_chunk${chunkIndex}${ext}`);

    await cutSegment(filePath, start, duration, chunkPath);

    const stat = await fs.promises.stat(chunkPath);

    // Se o chunk ficou grande demais, reduz a duracao e tenta de novo
    if (stat.size > MAX_FILE_BYTES && duration > 30) {
      await fs.promises.unlink(chunkPath);
      segDuration = Math.floor(segDuration * 0.6);
      console.log(`  Chunk muito grande (${(stat.size/1024/1024).toFixed(1)} MB), reduzindo segmento para ${segDuration}s`);
      continue;
    }

    console.log(`  Chunk ${chunkIndex + 1}: ${(start/60).toFixed(1)}-${((start+duration)/60).toFixed(1)} min | ${(stat.size/1024/1024).toFixed(1)} MB`);
    chunks.push(chunkPath);
    start += duration;
    chunkIndex += 1;
  }

  return { chunks, tmpDir };
}

// ─── Transcrição com retry ────────────────────────────────────────────────────

async function transcribeChunk(groq, chunkPath, rawKeys, label, position) {
  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES_PER_KEY; attempt++) {
    try {
      const result = await groq.audio.transcriptions.create({
        file: fs.createReadStream(chunkPath),
        model: "whisper-large-v3-turbo",
        language: "pt",
        response_format: "json",
      });
      return { success: true, text: result.text };
    } catch (error) {
      lastError = error;
      if (!isTemporary(error) || attempt === MAX_RETRIES_PER_KEY) break;
      const delay = parseRetryAfter(error) ?? BASE_RETRY_DELAY_MS * 2 ** attempt;
      console.error(`  ${position} ${label} -> retry ${attempt + 1}: ${readableError(error, rawKeys)}`);
      await wait(delay);
    }
  }
  console.error(`  ${position} ${label} -> falhou: ${readableError(lastError, rawKeys)}`);
  return { success: false };
}

/**
 * Tenta transcrever um chunk com round-robin de chaves e fallback.
 */
async function transcribeChunkWithFallback({ chunkPath, chunkIndex, totalChunks, routes, rawKeys, startKeyIndex }) {
  const position = `[chunk ${chunkIndex + 1}/${totalChunks}]`;

  for (let offset = 0; offset < routes.length; offset++) {
    const routeIndex = (startKeyIndex + offset) % routes.length;
    const route = routes[routeIndex];

    if (offset > 0) {
      console.log(`  ${position} fallback -> ${route.key.label}`);
    }

    const result = await transcribeChunk(route.groq, chunkPath, rawKeys, route.key.label, position);
    if (result.success) return result.text;
  }

  throw new Error(`Chunk ${chunkIndex + 1} falhou em todas as chaves`);
}

// ─── Pipeline principal ───────────────────────────────────────────────────────

async function transcribeFile(audioFile, fileIndex, total, routes, rawKeys) {
  const filePath = path.join(audioDirectory, audioFile);
  const outputName = `${path.parse(audioFile).name}.txt`;
  const outputPath = path.join(transcriptionDirectory, outputName);
  const position = `[${fileIndex + 1}/${total}]`;

  console.log(`\n${position} ${audioFile}`);

  const fileSize = (await fs.promises.stat(filePath)).size;
  console.log(`  Tamanho: ${(fileSize / 1024 / 1024).toFixed(1)} MB`);

  let tmpDir = null;
  let chunkPaths = [];

  try {
    if (fileSize <= MAX_FILE_BYTES) {
      // Arquivo pequeno o suficiente — envia direto
      chunkPaths = [filePath];
    } else {
      // Precisa dividir
      console.log(`  Dividindo em chunks...`);
      const split = await splitAudio(filePath);
      chunkPaths = split.chunks;
      tmpDir = split.tmpDir;
      console.log(`  Total de chunks: ${chunkPaths.length}`);
    }

    const texts = [];
    const startKeyIndex = fileIndex % routes.length;

    for (let i = 0; i < chunkPaths.length; i++) {
      console.log(`  [chunk ${i + 1}/${chunkPaths.length}] ${routes[(startKeyIndex + i) % routes.length].key.label} -> transcrevendo...`);
      const text = await transcribeChunkWithFallback({
        chunkPath: chunkPaths[i],
        chunkIndex: i,
        totalChunks: chunkPaths.length,
        routes,
        rawKeys,
        startKeyIndex: (startKeyIndex + i) % routes.length,
      });
      texts.push(text);
    }

    const fullText = texts.join("\n\n").trim();
    await fs.promises.mkdir(transcriptionDirectory, { recursive: true });
    await fs.promises.writeFile(outputPath, `${fullText}\n`, "utf8");
    console.log(`  ${position} -> OK (${texts.length} chunk(s))`);
    return true;

  } catch (err) {
    console.error(`  ${position} -> ERRO: ${readableError(err, rawKeys)}`);
    return false;
  } finally {
    // Remove arquivos temporários
    if (tmpDir) {
      for (const p of chunkPaths) {
        await fs.promises.unlink(p).catch(() => {});
      }
      await fs.promises.rmdir(tmpDir).catch(() => {});
    }
  }
}

async function main() {
  if (envResult.error) throw new Error(`Nao foi possivel carregar ${envPath}`);

  const keys = loadApiKeys();
  if (keys.length === 0) throw new Error("Nenhuma chave valida encontrada no .env");

  const rawKeys = keys.map(k => k.apiKey);
  const routes = keys.map(key => ({
    key,
    groq: new Groq({ apiKey: key.apiKey, maxRetries: 0 }),
  }));

  const entries = await fs.promises.readdir(audioDirectory, { withFileTypes: true });
  const audioFiles = entries
    .filter(e => e.isFile() && SUPPORTED_EXTENSIONS.has(path.extname(e.name).toLowerCase()))
    .map(e => e.name)
    .sort((a, b) => a.localeCompare(b, "pt-BR"));

  if (audioFiles.length === 0) {
    console.log("Nenhum audio encontrado em testes-audios-amabile.");
    return;
  }

  console.log(`\nGroq Transcription Router - Amabile (com chunking)`);
  console.log(`Chaves: ${keys.length} | ffmpeg: ${ffmpegInstaller.path}`);
  console.log(`Audios encontrados: ${audioFiles.length}`);
  audioFiles.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));

  const startTime = Date.now();
  let successes = 0;
  let failures = 0;

  // Processa sequencialmente (cada áudio pode usar chunks em paralelo por chave diferente)
  for (let i = 0; i < audioFiles.length; i++) {
    const ok = await transcribeFile(audioFiles[i], i, audioFiles.length, routes, rawKeys);
    if (ok) successes++; else failures++;
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n${"─".repeat(50)}`);
  console.log(`Concluido em ${elapsed}s`);
  console.log(`Sucessos: ${successes} | Falhas: ${failures}`);
  if (successes > 0) console.log(`Transcricoes em: transcricoes-amabile/`);
}

const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  main().catch(err => {
    const keys = loadApiKeys().map(k => k.apiKey);
    console.error(`\nErro fatal: ${readableError(err, keys)}`);
    process.exitCode = 1;
  });
}
