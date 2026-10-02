"""Gera os áudios da Forma C sem armazenar a chave da API no projeto.

Uso (PowerShell):
  $env:ELEVENLABS_API_KEY = "sua-chave"
  python generate_elevenlabs_form_c.py

Arquivos existentes são preservados. Use --overwrite para recriá-los.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
import urllib.error
import urllib.request


ROOT = Path(__file__).parent
HTML_PATH = ROOT / "P01_OPEN_STARTUP_SCHOOL_PLATAFORMA_GAMIFICADA.html"
AUDIO_DIR = ROOT / "audios open"
VOICE_ID = "HOfBIVLhom4mc9WvXfyH"
MODEL_ID = "eleven_multilingual_v2"

MODULE_COVERS = {
    "TC-BLOCO-0.mp3": "Vamos começar pela sua visão sobre o que significa empreender bem. Queremos conhecer as capacidades que você considera importantes e como percebe essas capacidades em sua própria experiência. Não existe uma lista pronta: responda com suas palavras.",
    "TC-BLOCO-1.mp3": "Agora você vai passar por situações curtas ligadas a decisões de negócio. Algumas perguntas têm respostas mais objetivas; em todas, explique brevemente como chegou à sua resposta. O app não informará acertos ou erros durante a aplicação.",
    "TC-BLOCO-2.mp3": "Nesta parte, queremos conhecer situações que você realmente viveu. Conte episódios concretos e deixe claro o que você fez pessoalmente. Se nunca passou por algo parecido, pode dizer isso.",
    "TC-BLOCO-3.mp3": "Agora você vai entrar em um problema de negócio. Pense em voz alta e compartilhe dúvidas, opções e mudanças de direção enquanto decide. O objetivo é acompanhar o caminho do seu raciocínio, não apenas a resposta final.",
    "TC-BLOCO-4.mp3": "Agora é hora de organizar o que você construiu. Você terá um momento de preparação e depois fará uma apresentação breve. Procure deixar clara a oportunidade, a primeira ação e o próximo compromisso que deseja obter.",
    "TC-FECHAMENTO.mp3": "Estamos chegando ao fim. Esta última pergunta convida você a olhar para o que mudou na sua percepção ao longo da experiência. Responda com tranquilidade e use suas próprias palavras.",
}


def extract_json(source: str, pattern: str):
    match = re.search(pattern, source, re.S)
    if not match:
        raise RuntimeError(f"Trecho não encontrado: {pattern}")
    return json.loads(match.group(1))


def question_jobs():
    source = HTML_PATH.read_text(encoding="utf-8")
    forms = extract_json(source, r"const FORMS=(.*);\nconst SPOKEN_FORM_C")
    spoken = extract_json(source, r"const SPOKEN_FORM_C=(\{.*?\});")
    leads = extract_json(source, r"const SPOKEN_LEADS_C=(\{.*?\});")
    jobs = {}
    for index, question in enumerate(forms["C"], start=1):
        text = spoken.get(question["id"], question["text"])
        text = leads.get(question["id"], "") + text
        jobs[f"TA-P{index}.mp3"] = text
    return jobs


def synthesize(api_key: str, filename: str, text: str):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    payload = json.dumps(
        {
            "text": text,
            "model_id": MODEL_ID,
            "voice_settings": {
                "stability": 0.55,
                "similarity_boost": 0.75,
                "style": 0.15,
                "use_speaker_boost": True,
            },
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=payload,
        method="POST",
        headers={
            "xi-api-key": api_key,
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            (AUDIO_DIR / filename).write_bytes(response.read())
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Falha ao gerar {filename}: HTTP {error.code} — {detail}") from error


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        raise SystemExit("Defina ELEVENLABS_API_KEY antes de executar.")

    AUDIO_DIR.mkdir(exist_ok=True)
    jobs = {**question_jobs(), **MODULE_COVERS}
    for filename, text in jobs.items():
        output = AUDIO_DIR / filename
        if output.exists() and not args.overwrite:
            print(f"preservado: {filename}")
            continue
        print(f"gerando: {filename}")
        synthesize(api_key, filename, text)
    print("Geração concluída.")


if __name__ == "__main__":
    main()
