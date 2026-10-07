import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const apiKey = process.env.GROQ_API_KEY_1 || process.env.GROQ_API_KEY_2;
const groq = new Groq({ apiKey });

const audioDir = "C:/Users/100OS/Documents/oopenschool-testee/audios open/TA";

const items = [
  { id: "TA-intro", file: "TA-intro.mp3", block: "Abertura" },
  { id: "A-M1", file: "TA-M1.mp3", block: "Bloco 0 — Modelo Mental" },
  { id: "A-M2", file: "TA-M2.mp3", block: "Bloco 0 — Modelo Mental" },
  { id: "A-M3", file: "TA-M3.mp3", block: "Bloco 0 — Modelo Mental" },
  { id: "A-K01", file: "TA-K01.mp3", block: "Bloco 1 — Conhecimentos fundamentais" },
  { id: "A-K02", file: "TA-K02.mp3", block: "Bloco 1 — Conhecimentos fundamentais" },
  { id: "A-K03", file: "TA-K03.mp3", block: "Bloco 1 — Conhecimentos fundamentais" },
  { id: "A-K04", file: "TA-K04.mp3", block: "Bloco 1 — Conhecimentos fundamentais" },
  { id: "A-K05", file: "TA-K05.mp3", block: "Bloco 1 — Conhecimentos fundamentais" },
  { id: "A-K06", file: "TA-K06.mp3", block: "Bloco 1 — Conhecimentos fundamentais" },
  { id: "A-K07", file: "TA-K07.mp3", block: "Bloco 1 — Conhecimentos fundamentais" },
  { id: "A-K08", file: "TA-K08.mp3", block: "Bloco 1 — Conhecimentos fundamentais" },
  { id: "A-K09", file: "TA-K09.mp3", block: "Bloco 1 — Conhecimentos fundamentais" },
  { id: "A-K10", file: "TA-K10.mp3", block: "Bloco 1 — Conhecimentos fundamentais" },
  { id: "A-PB01", file: "TA-PB01.mp3", block: "Bloco 2 — Experiências anteriores" },
  { id: "A-PB02", file: "TA-PB02.mp3", block: "Bloco 2 — Experiências anteriores" },
  { id: "A-PB03", file: "TA-PB03.mp3", block: "Bloco 2 — Experiências anteriores" },
  { id: "A-PB04", file: "TA-PB04.mp3", block: "Bloco 2 — Experiências anteriores" },
  { id: "A-PB05", file: "TA-PB05.mp3", block: "Bloco 2 — Experiências anteriores" },
  { id: "A-PB06", file: "TA-PB06.mp3", block: "Bloco 2 — Experiências anteriores" },
  { id: "A-CASE-INTRO", file: "TA-CASE-INTRO.mp3", block: "Bloco 3 — Desafio de negócio" },
  { id: "A-CASE-INITIAL", file: "TA-CASE-INITIAL.mp3", block: "Bloco 3 — Desafio de negócio" },
  { id: "A-CASE-C1", file: "TA-CASE-C1.mp3", block: "Bloco 3 — Desafio de negócio" },
  { id: "A-CASE-C2", file: "TA-CASE-C2.mp3", block: "Bloco 3 — Desafio de negócio" },
  { id: "A-PITCH-PREP", file: "TA-PITCH-PREP.mp3", block: "Bloco 4 — Síntese e apresentação" },
  { id: "A-PITCH", file: "TA-PITCH.mp3", block: "Bloco 4 — Síntese e apresentação" },
  { id: "A-PITCH-REFLECT", file: "TA-PITCH-REFLECT.mp3", block: "Bloco 4 — Síntese e apresentação" },
  { id: "A-CLOSE", file: "TA-CLOSE.mp3", block: "Bloco 5 — Fechamento" },
  { id: "TTELA-FINAL", file: "TTELA FINAL.mp3", block: "Tela Final" }
];

async function transcribeAll() {
  console.log("Iniciando transcrição de todos os áudios da Forma A com a API Groq...");
  const results = {};

  for (const item of items) {
    let filePath = path.join(audioDir, item.file);
    if (!fs.existsSync(filePath)) {
      filePath = path.join("C:/Users/100OS/Documents/oopenschool-testee/public/audios", item.file);
    }

    if (!fs.existsSync(filePath)) {
      console.error("Arquivo não encontrado: " + item.file);
      results[item.id] = { ...item, text: "" };
      continue;
    }

    try {
      console.log("Transcrevendo " + item.file + " (" + item.id + ")...");
      const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-large-v3",
        language: "pt",
        temperature: 0.0
      });

      console.log("✅ " + item.id + ": " + transcription.text.substring(0, 70) + "...");
      results[item.id] = {
        ...item,
        text: transcription.text.trim()
      };
    } catch (err) {
      console.error("Erro ao transcrever " + item.file + ":", err.message);
      results[item.id] = { ...item, text: "", error: err.message };
    }
  }

  fs.writeFileSync(
    "transcricoes-forma-a.json",
    JSON.stringify(results, null, 2),
    "utf8"
  );
  console.log("\n🎉 Todas as transcrições da Forma A foram salvas em transcricoes-forma-a.json!");
}

transcribeAll();
