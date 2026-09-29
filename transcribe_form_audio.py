from pathlib import Path
import sys

TOOLS = Path(__file__).parent / ".tools" / "faster-whisper"
sys.path.insert(0, str(TOOLS))

from faster_whisper import WhisperModel


ROOT = Path(__file__).parent
AUDIO_DIR = ROOT / "audios open"
OUTPUT = AUDIO_DIR / "transcricoes-whisper.txt"

model = WhisperModel("small", device="cpu", compute_type="int8")
files = ["TA-intro.mp3", "TA-P1.mp3", "TA-P2.mp3", "TA-P3.mp3"]
sections = []

for name in files:
    segments, info = model.transcribe(
        str(AUDIO_DIR / name),
        language="pt",
        beam_size=5,
        vad_filter=True,
        condition_on_previous_text=True,
    )
    text = " ".join(segment.text.strip() for segment in segments).strip()
    sections.append(f"## {name}\n\n{text}\n")
    print(f"{name}: {text}", flush=True)

OUTPUT.write_text("\n".join(sections), encoding="utf-8")
print(f"\nSaved: {OUTPUT}")
