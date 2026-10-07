# Roteador Whisper local

Este componente transcreve os arquivos de `../audios` com um modelo Whisper executado na própria máquina e grava os resultados em `../transcricoes`. Ele não usa a API da Groq nem precisa de chave.

Pré-requisito: Python 3.10 ou superior instalado e disponível no terminal como `python`.

## Preparação no Windows (PowerShell)

```powershell
cd local-whisper-router
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## Execução

Na raiz do projeto:

```powershell
npm run transcribe:local
```

Esse comando já está configurado para o modelo `small` em CPU com `int8`, uma combinação compatível com esta máquina sem depender da instalação adicional do CUDA.

Para transcrever o lote em `testes-audios-amabile` usando CPU com quantização
`int8` e salvar em `transcricoes-amabile`:

```powershell
npm run transcribe:amabile
```

Esse comando usa a cópia do modelo `small` que já está no cache local e não
depende de conexão com a internet.

Ou diretamente dentro desta pasta:

```powershell
python transcribe.py
```

O modelo padrão é `small`, em português, e o dispositivo é escolhido automaticamente. Transcrições existentes são preservadas. Para recriá-las:

```powershell
python transcribe.py --overwrite
```

Algumas opções úteis:

```powershell
# Mais rápido e leve em CPU
python transcribe.py --model base --device cpu --compute-type int8

# Mais preciso em uma GPU NVIDIA compatível
python transcribe.py --model large-v3 --device cuda --compute-type float16

# Detectar o idioma e escolher outras pastas
python transcribe.py --language auto --input C:\caminho\audios --output C:\caminho\textos
```

Também é possível definir `WHISPER_MODEL`, `WHISPER_LANGUAGE`, `WHISPER_DEVICE` e `WHISPER_COMPUTE_TYPE` como variáveis de ambiente.

Na primeira utilização de um nome de modelo, o `faster-whisper` baixa os arquivos necessários para `.cache/models-local`. Depois disso, a inferência é local. A pasta pode ser alterada com `--model-dir` ou `WHISPER_MODEL_DIR`. Para operar totalmente offline desde a primeira execução, baixe o modelo previamente e passe sua pasta em `--model`.
