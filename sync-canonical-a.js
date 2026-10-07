import fs from "fs";

const targetCanonical = "C:/Users/100OS/Documents/oopenschool-testee/src/data/canonicalData.js";
const transcriptions = JSON.parse(fs.readFileSync("transcricoes-forma-a.json", "utf8"));

const canonicalContent = `// Dados canônicos da avaliação P01 da Open Startup School — FORMA A
// Transcrito integralmente com alta precisão via Groq Whisper API (whisper-large-v3)

export const OPENING_AUDIO = {
  id: "TA-intro",
  filename: "TA-intro.mp3",
  title: "Abertura Oficial",
  text: \`${transcriptions["TA-intro"].text}\`
};

export const FINAL_AUDIO = {
  id: "TTELA-FINAL",
  filename: "TTELA FINAL.mp3",
  title: "Avaliação Concluída",
  text: \`${transcriptions["TTELA-FINAL"].text}\`
};

export const MODULE_BLOCKS = [
  { index: 0, title: "Modelo Mental", eyebrow: "Bloco 0" },
  { index: 1, title: "Conhecimentos fundamentais", eyebrow: "Bloco 1" },
  { index: 2, title: "Experiências anteriores", eyebrow: "Bloco 2" },
  { index: 3, title: "Desafio de negócio", eyebrow: "Bloco 3" },
  { index: 4, title: "Síntese e apresentação", eyebrow: "Bloco 4" },
  { index: 5, title: "Fechamento", eyebrow: "Bloco 5" }
];

export const FORMA_A = [
  {
    id: "A-M1",
    audioId: "TA-M1",
    audioFile: "TA-M1.mp3",
    moduleIndex: 0,
    family: "M1",
    block: "Bloco 0 — Modelo Mental",
    seconds: 60,
    kind: "question",
    text: \`${transcriptions["A-M1"].text}\`
  },
  {
    id: "A-M2",
    audioId: "TA-M2",
    audioFile: "TA-M2.mp3",
    moduleIndex: 0,
    family: "M2",
    block: "Bloco 0 — Modelo Mental",
    seconds: 60,
    kind: "question",
    text: \`${transcriptions["A-M2"].text}\`
  },
  {
    id: "A-M3",
    audioId: "TA-M3",
    audioFile: "TA-M3.mp3",
    moduleIndex: 0,
    family: "M3",
    block: "Bloco 0 — Modelo Mental",
    seconds: 60,
    kind: "question",
    text: \`${transcriptions["A-M3"].text}\`
  },
  {
    id: "A-K01",
    audioId: "TA-K01",
    audioFile: "TA-K01.mp3",
    moduleIndex: 1,
    family: "K1",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: \`${transcriptions["A-K01"].text}\`
  },
  {
    id: "A-K02",
    audioId: "TA-K02",
    audioFile: "TA-K02.mp3",
    moduleIndex: 1,
    family: "K2",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: \`${transcriptions["A-K02"].text}\`
  },
  {
    id: "A-K03",
    audioId: "TA-K03",
    audioFile: "TA-K03.mp3",
    moduleIndex: 1,
    family: "K3",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: \`${transcriptions["A-K03"].text}\`
  },
  {
    id: "A-K04",
    audioId: "TA-K04",
    audioFile: "TA-K04.mp3",
    moduleIndex: 1,
    family: "K4",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: \`${transcriptions["A-K04"].text}\`
  },
  {
    id: "A-K05",
    audioId: "TA-K05",
    audioFile: "TA-K05.mp3",
    moduleIndex: 1,
    family: "K5",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: \`${transcriptions["A-K05"].text}\`
  },
  {
    id: "A-K06",
    audioId: "TA-K06",
    audioFile: "TA-K06.mp3",
    moduleIndex: 1,
    family: "K6",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: \`${transcriptions["A-K06"].text}\`
  },
  {
    id: "A-K07",
    audioId: "TA-K07",
    audioFile: "TA-K07.mp3",
    moduleIndex: 1,
    family: "K7",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: \`${transcriptions["A-K07"].text}\`
  },
  {
    id: "A-K08",
    audioId: "TA-K08",
    audioFile: "TA-K08.mp3",
    moduleIndex: 1,
    family: "K8",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: \`${transcriptions["A-K08"].text}\`
  },
  {
    id: "A-K09",
    audioId: "TA-K09",
    audioFile: "TA-K09.mp3",
    moduleIndex: 1,
    family: "K9",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: \`${transcriptions["A-K09"].text}\`
  },
  {
    id: "A-K10",
    audioId: "TA-K10",
    audioFile: "TA-K10.mp3",
    moduleIndex: 1,
    family: "K10",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: \`${transcriptions["A-K10"].text}\`
  },
  {
    id: "A-PB01",
    audioId: "TA-PB01",
    audioFile: "TA-PB01.mp3",
    moduleIndex: 2,
    family: "PB1",
    block: "Bloco 2 — Experiências anteriores",
    seconds: 45,
    kind: "question",
    text: \`${transcriptions["A-PB01"].text}\`
  },
  {
    id: "A-PB02",
    audioId: "TA-PB02",
    audioFile: "TA-PB02.mp3",
    moduleIndex: 2,
    family: "PB2",
    block: "Bloco 2 — Experiências anteriores",
    seconds: 45,
    kind: "question",
    text: \`${transcriptions["A-PB02"].text}\`
  },
  {
    id: "A-PB03",
    audioId: "TA-PB03",
    audioFile: "TA-PB03.mp3",
    moduleIndex: 2,
    family: "PB3",
    block: "Bloco 2 — Experiências anteriores",
    seconds: 45,
    kind: "question",
    text: \`${transcriptions["A-PB03"].text}\`
  },
  {
    id: "A-PB04",
    audioId: "TA-PB04",
    audioFile: "TA-PB04.mp3",
    moduleIndex: 2,
    family: "PB4",
    block: "Bloco 2 — Experiências anteriores",
    seconds: 45,
    kind: "question",
    text: \`${transcriptions["A-PB04"].text}\`
  },
  {
    id: "A-PB05",
    audioId: "TA-PB05",
    audioFile: "TA-PB05.mp3",
    moduleIndex: 2,
    family: "PB5",
    block: "Bloco 2 — Experiências anteriores",
    seconds: 45,
    kind: "question",
    text: \`${transcriptions["A-PB05"].text}\`
  },
  {
    id: "A-PB06",
    audioId: "TA-PB06",
    audioFile: "TA-PB06.mp3",
    moduleIndex: 2,
    family: "PB6",
    block: "Bloco 2 — Experiências anteriores",
    seconds: 45,
    kind: "question",
    text: \`${transcriptions["A-PB06"].text}\`
  },
  {
    id: "A-CASE-INTRO",
    audioId: "TA-CASE-INTRO",
    audioFile: "TA-CASE-INTRO.mp3",
    moduleIndex: 3,
    family: "CASE-INTRO",
    block: "Bloco 3 — Desafio de negócio",
    seconds: 0,
    kind: "intro",
    text: \`${transcriptions["A-CASE-INTRO"].text}\`
  },
  {
    id: "A-CASE-INITIAL",
    audioId: "TA-CASE-INITIAL",
    audioFile: "TA-CASE-INITIAL.mp3",
    moduleIndex: 3,
    family: "CASE-INITIAL",
    block: "Bloco 3 — Desafio de negócio",
    seconds: 180,
    kind: "thinkaloud",
    text: \`${transcriptions["A-CASE-INITIAL"].text}\`,
    silencePrompt: "O que você está considerando neste momento?",
    silenceAfter: 15
  },
  {
    id: "A-CASE-C1",
    audioId: "TA-CASE-C1",
    audioFile: "TA-CASE-C1.mp3",
    moduleIndex: 3,
    family: "CASE-C1",
    block: "Bloco 3 — Desafio de negócio",
    seconds: 60,
    kind: "question",
    text: \`${transcriptions["A-CASE-C1"].text}\`
  },
  {
    id: "A-CASE-C2",
    audioId: "TA-CASE-C2",
    audioFile: "TA-CASE-C2.mp3",
    moduleIndex: 3,
    family: "CASE-C2",
    block: "Bloco 3 — Desafio de negócio",
    seconds: 60,
    kind: "question",
    text: \`${transcriptions["A-CASE-C2"].text}\`
  },
  {
    id: "A-PITCH-PREP",
    audioId: "TA-PITCH-PREP",
    audioFile: "TA-PITCH-PREP.mp3",
    moduleIndex: 4,
    family: "PITCH-PREP",
    block: "Bloco 4 — Síntese e apresentação",
    seconds: 90,
    kind: "prep",
    text: \`${transcriptions["A-PITCH-PREP"].text}\`
  },
  {
    id: "A-PITCH",
    audioId: "TA-PITCH",
    audioFile: "TA-PITCH.mp3",
    moduleIndex: 4,
    family: "PITCH",
    block: "Bloco 4 — Síntese e apresentação",
    seconds: 90,
    kind: "pitch",
    text: \`${transcriptions["A-PITCH"].text}\`
  },
  {
    id: "A-PITCH-REFLECT",
    audioId: "TA-PITCH-REFLECT",
    audioFile: "TA-PITCH-REFLECT.mp3",
    moduleIndex: 4,
    family: "PITCH-REFLECT",
    block: "Bloco 4 — Síntese e apresentação",
    seconds: 45,
    kind: "question",
    text: \`${transcriptions["A-PITCH-REFLECT"].text}\`
  },
  {
    id: "A-CLOSE",
    audioId: "TA-CLOSE",
    audioFile: "TA-CLOSE.mp3",
    moduleIndex: 5,
    family: "CLOSE",
    block: "Bloco 5 — Fechamento",
    seconds: 45,
    kind: "question",
    text: \`${transcriptions["A-CLOSE"].text}\`
  }
];

export const FORMS = {
  A: FORMA_A
};
`;

fs.writeFileSync(targetCanonical, canonicalContent, "utf8");
console.log("canonicalData.js updated with 100% exact transcribed texts for Forma A.");
