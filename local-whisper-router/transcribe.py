"""Transcreve, localmente, os arquivos da pasta de áudios com Whisper."""

from __future__ import annotations

import argparse
import os
import sys
import time
from pathlib import Path


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")


SUPPORTED_EXTENSIONS = {
    ".flac",
    ".m4a",
    ".mp3",
    ".mp4",
    ".mpeg",
    ".mpga",
    ".ogg",
    ".wav",
    ".webm",
}

ROUTER_DIRECTORY = Path(__file__).resolve().parent
PROJECT_DIRECTORY = ROUTER_DIRECTORY.parent


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Transcreve áudios localmente usando faster-whisper."
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=PROJECT_DIRECTORY / "audios",
        help="Pasta dos áudios (padrão: ../audios).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=PROJECT_DIRECTORY / "transcricoes",
        help="Pasta das transcrições (padrão: ../transcricoes).",
    )
    parser.add_argument(
        "--model",
        default=os.getenv("WHISPER_MODEL", "small"),
        help="Nome do modelo ou caminho local (padrão: small).",
    )
    parser.add_argument(
        "--model-dir",
        type=Path,
        default=Path(
            os.getenv(
                "WHISPER_MODEL_DIR",
                str(ROUTER_DIRECTORY / ".cache" / "models-local"),
            )
        ),
        help="Pasta de cache dos modelos (padrão: .cache/models-local).",
    )
    parser.add_argument(
        "--language",
        default=os.getenv("WHISPER_LANGUAGE", "pt"),
        help="Idioma do áudio; use 'auto' para detectar (padrão: pt).",
    )
    parser.add_argument(
        "--device",
        choices=("auto", "cpu", "cuda"),
        default=os.getenv("WHISPER_DEVICE", "auto"),
        help="Dispositivo de inferência (padrão: auto).",
    )
    parser.add_argument(
        "--compute-type",
        default=os.getenv("WHISPER_COMPUTE_TYPE", "default"),
        help="Precisão, por exemplo default, int8 ou float16.",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Refaz transcrições que já existem.",
    )
    parser.add_argument(
        "--local-files-only",
        action="store_true",
        help="Usa somente modelos já presentes no cache local.",
    )
    return parser.parse_args()


def discover_audio_files(input_directory: Path) -> list[Path]:
    if not input_directory.is_dir():
        raise FileNotFoundError(f"Pasta de áudios não encontrada: {input_directory}")

    return sorted(
        (
            path
            for path in input_directory.iterdir()
            if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
        ),
        key=lambda path: path.name.casefold(),
    )


def load_model(
    model_name: str,
    device: str,
    compute_type: str,
    model_directory: Path,
    local_files_only: bool,
):
    try:
        import av
        from faster_whisper import WhisperModel
    except ImportError as error:
        raise RuntimeError(
            "Dependências ausentes. Ative o ambiente virtual e execute "
            "'pip install -r requirements.txt'."
        ) from error

    # PyAV 19 removeu ``metadata_errors`` de ``av.open``, enquanto o
    # faster-whisper 1.2 ainda envia esse argumento. Mantém a instalação já
    # existente funcional; instalações novas usam o limite av<19 acima.
    if int(av.__version__.split(".", 1)[0]) >= 19:
        original_av_open = av.open

        def compatible_av_open(*args, **kwargs):
            kwargs.pop("metadata_errors", None)
            return original_av_open(*args, **kwargs)

        av.open = compatible_av_open

    return WhisperModel(
        model_name,
        device=device,
        compute_type=compute_type,
        download_root=str(model_directory),
        local_files_only=local_files_only,
    )


def transcribe_file(model, audio_path: Path, language: str | None) -> str:
    segments, info = model.transcribe(
        str(audio_path),
        language=language,
        vad_filter=True,
    )
    parts = []
    started_at = time.monotonic()
    last_reported_minute = -1

    for segment in segments:
        text = segment.text.strip()
        if text:
            parts.append(text)

        current_minute = int(segment.end // 60)
        if current_minute > last_reported_minute:
            last_reported_minute = current_minute
            elapsed = time.monotonic() - started_at
            total = getattr(info, "duration", 0) or 0
            progress = f"/{total / 60:.1f} min" if total else " min"
            print(
                f"  progresso: {segment.end / 60:.1f}{progress} "
                f"(processando há {elapsed / 60:.1f} min)",
                flush=True,
            )

    return " ".join(parts)


def main() -> int:
    args = parse_args()
    input_directory = args.input.resolve()
    output_directory = args.output.resolve()
    audio_files = discover_audio_files(input_directory)

    if not audio_files:
        print(f"Nenhum áudio compatível encontrado em {input_directory}.")
        return 0

    pending_files = [
        audio_path
        for audio_path in audio_files
        if args.overwrite
        or not (output_directory / f"{audio_path.stem}.txt").exists()
    ]

    if not pending_files:
        print("Todos os áudios já possuem transcrição. Use --overwrite para refazê-las.")
        return 0

    output_directory.mkdir(parents=True, exist_ok=True)
    language = None if args.language.lower() == "auto" else args.language
    model_directory = args.model_dir.resolve()
    model_directory.mkdir(parents=True, exist_ok=True)

    print(f"Carregando Whisper '{args.model}' em {args.device}...")
    model = load_model(
        args.model,
        args.device,
        args.compute_type,
        model_directory,
        args.local_files_only,
    )
    failures = 0

    for index, audio_path in enumerate(pending_files, start=1):
        output_path = output_directory / f"{audio_path.stem}.txt"
        print(f"[{index}/{len(pending_files)}] {audio_path.name} -> processando...")

        try:
            text = transcribe_file(model, audio_path, language)
            output_path.write_text(f"{text}\n", encoding="utf-8")
            print(f"[{index}/{len(pending_files)}] {audio_path.name} -> OK")
        except Exception as error:  # mantém o lote em execução se um áudio falhar
            failures += 1
            print(
                f"[{index}/{len(pending_files)}] {audio_path.name} -> FALHOU: {error}",
                file=sys.stderr,
            )

    successes = len(pending_files) - failures
    print(f"Concluído. Sucessos: {successes}; falhas: {failures}.")
    return 1 if failures else 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (FileNotFoundError, RuntimeError, ValueError) as error:
        print(f"Erro: {error}", file=sys.stderr)
        raise SystemExit(1) from error
