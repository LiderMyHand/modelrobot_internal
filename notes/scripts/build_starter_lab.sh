#!/usr/bin/env bash
set -euo pipefail
repo_dir="$(cd "$(dirname "$0")/../.." && pwd)"
doc_dir="$repo_dir/notes/artifacts/starter_lab_pl"
cd "$doc_dir"
pdflatex -interaction=nonstopmode -halt-on-error -jobname=mymodelrobot_cwiczenia main.tex > build_console.log
pdflatex -interaction=nonstopmode -halt-on-error -jobname=mymodelrobot_cwiczenia main.tex >> build_console.log
pdfinfo mymodelrobot_cwiczenia.pdf
