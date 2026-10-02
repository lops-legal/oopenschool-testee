import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_AUDIO_SIZE = 100 * 1024 * 1024;

const sanitizePathPart = (value, fallback) => {
  const sanitized = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return sanitized || fallback;
};

const extensionFor = (mimeType) => {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4")) return "m4a";
  if (mimeType.includes("mpeg")) return "mp3";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audio = formData.get("audio");
    const participantId = String(formData.get("participantId") || "").trim();
    const participantName = String(formData.get("participantName") || "").trim();
    const questionId = String(formData.get("questionId") || "").trim();

    if (!audio || typeof audio.arrayBuffer !== "function") {
      return NextResponse.json({ error: "Arquivo de áudio não enviado." }, { status: 400 });
    }
    if (!participantId || !participantName || !questionId) {
      return NextResponse.json({ error: "Participante e questão são obrigatórios." }, { status: 400 });
    }
    if (audio.size === 0 || audio.size > MAX_AUDIO_SIZE) {
      return NextResponse.json({ error: "O áudio está vazio ou excede o limite de 100 MB." }, { status: 400 });
    }

    const participantFolder = `${sanitizePathPart(participantName, "participante")}__${sanitizePathPart(participantId, "sem-id")}`;
    const questionFolder = sanitizePathPart(questionId, "questao");
    const destination = path.join(process.cwd(), "recordings", participantFolder, questionFolder);
    await mkdir(destination, { recursive: true });

    const receivedAt = new Date();
    const timestamp = receivedAt.toISOString().replace(/[:.]/g, "-");
    const uniqueId = randomUUID().slice(0, 8);
    const baseName = `${questionFolder}__${timestamp}__${uniqueId}`;
    const extension = extensionFor(audio.type || "audio/webm");
    const audioFileName = `${baseName}.${extension}`;
    const metadataFileName = `${baseName}.json`;
    const audioPath = path.join(destination, audioFileName);
    const metadataPath = path.join(destination, metadataFileName);
    const relativeAudioPath = path.relative(process.cwd(), audioPath).replaceAll(path.sep, "/");

    await writeFile(audioPath, Buffer.from(await audio.arrayBuffer()));
    await writeFile(metadataPath, JSON.stringify({
      participantId,
      participantName,
      questionId,
      receivedAt: receivedAt.toISOString(),
      mimeType: audio.type || "audio/webm",
      sizeBytes: audio.size,
      audioPath: relativeAudioPath
    }, null, 2), "utf8");

    return NextResponse.json({
      saved: true,
      participantId,
      questionId,
      sizeBytes: audio.size,
      audioPath: relativeAudioPath
    });
  } catch (error) {
    console.error("Failed to save recording:", error);
    return NextResponse.json({ error: "Erro interno ao salvar o áudio." }, { status: 500 });
  }
}
