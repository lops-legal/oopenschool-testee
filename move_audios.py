import os
import shutil
import re
from pathlib import Path

root = Path(r"C:\Users\100OS\plataforma-open\oopenschool-testee")
target_dir = root / "audios open"
target_dir.mkdir(exist_ok=True)

mappings = {
    "Bloco 0 — Modelo Mental.mp3": "TC-BLOCO-0.mp3",
    "## Bloco 1 — Conhecimentos fundamentais.mp3": "TC-BLOCO-1.mp3",
    "## Bloco 2 — Experiências anteriores.mp3": "TC-BLOCO-2.mp3",
    "## Bloco 3 — Desafio de negócio.mp3": "TC-BLOCO-3.mp3",
    "## Bloco 4 — Síntese e apresentação.mp3": "TC-BLOCO-4.mp3",
    "## Fechamento.mp3": "TC-FECHAMENTO.mp3",
    "TELA FINA.mp3": "TC-FINAL.mp3",
    "C-CASE-C2  4800–5200.mp3": "TA-P23.mp3",
    "C-PITCH-PREP  5200–5400.mp3": "TA-P24.mp3",
    "C-PITCH  5400–5530.mp3": "TA-P25.mp3",
    "C-PITCH-REFLECT  5530–5800.mp3": "TA-P26.mp3",
    "C-CLOSE.mp3": "TA-P27.mp3",
}

moved = []
for p in root.glob("*.mp3"):
    filename = p.name
    new_name = None
    if filename in mappings:
        new_name = mappings[filename]
    else:
        m = re.search(r"(TA-P\d+)", filename)
        if m:
            new_name = f"{m.group(1)}.mp3"
        elif filename.startswith("TA-"):
            new_name = filename
        else:
            new_name = filename

    dest = target_dir / new_name
    print(f"Moving: '{filename}' -> '{new_name}'")
    shutil.move(str(p), str(dest))
    moved.append(new_name)

print(f"\nTotal files moved: {len(moved)}")
