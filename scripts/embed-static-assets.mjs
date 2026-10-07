import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const htmlPath = path.join(root, "index.html");
const audioDirectory = path.join(root, "public", "audios");
const supabaseBundlePath = path.join(
  root,
  "node_modules",
  "@supabase",
  "supabase-js",
  "dist",
  "umd",
  "supabase.js"
);

let html = await readFile(htmlPath, "utf8");
const supabaseBundle = await readFile(supabaseBundlePath, "utf8");
const audioNames = (await readdir(audioDirectory))
  .filter((name) => name.toLowerCase().endsWith(".mp3"))
  .sort((a, b) => a.localeCompare(b));

const audioEntries = {};
for (const audioName of audioNames) {
  const bytes = await readFile(path.join(audioDirectory, audioName));
  audioEntries[audioName] = `data:audio/mpeg;base64,${bytes.toString("base64")}`;
}

html = html.replace(
  '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>',
  `<script>\n${supabaseBundle}\n</script>`
);

if (!html.includes("window.__P01_AUDIO__={")) {
  html = html.replace(
    /<script>\r?\n\(function\(\)\{/,
    `<script>window.__P01_AUDIO__=${JSON.stringify(audioEntries)};</script>\n<script>\n(function(){`
  );
}

await writeFile(htmlPath, html, "utf8");
console.log(`index.html gerado com Supabase e ${audioNames.length} audios incorporados.`);
