#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
pdflatex -interaction=nonstopmode -halt-on-error -jobname=mymodelrobot_cwiczenia main.tex
pdflatex -interaction=nonstopmode -halt-on-error -jobname=mymodelrobot_cwiczenia main.tex
