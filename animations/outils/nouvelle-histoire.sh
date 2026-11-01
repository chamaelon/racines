#!/bin/bash
# Crée le squelette d'une histoire : ./nouvelle-histoire.sh 21-crocodile "Le crocodile qui sauva l'ancêtre"
set -e
ICI="$(cd "$(dirname "$0")" && pwd)"
H="$ICI/../histoires/$1"
mkdir -p "$H/00-ecriture" "$H/textes"
titre=$(printf '%s' "$2" | sed -e 's/[&#\]/\&/g')
sed -e "s#__TITRE__#$titre#" "$ICI/modele/index.html" > "$H/index.html"
echo "créé : histoires/$1"
