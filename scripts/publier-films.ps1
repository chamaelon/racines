<#
.SYNOPSIS
  Envoie public/films dans la branche gh-pages. Le site, lui, se publie tout seul à chaque push (deploy.yml garde ce dossier).

.DESCRIPTION
  Les vidéos ne vont pas dans la branche de travail : chaque nouveau rendu y resterait à jamais et alourdirait le dépôt.
  Limites gratuites de GitHub Pages : 1 Go de site, 100 Mo par fichier. Le script s'arrête avant de les dépasser.

.EXAMPLE
  npm run films
  ./scripts/publier-films.ps1
#>
$ErrorActionPreference = 'Stop'
$racine = Split-Path $PSScriptRoot -Parent
$source = Join-Path $racine 'public\films'
$depot = Join-Path $racine 'dist-depot-films'
if (-not (Test-Path $source)) { throw 'public/films est vide : lancer npm run films.' }

$trop = Get-ChildItem $source -Recurse -File | Where-Object Length -gt 100MB
if ($trop) { throw "Fichiers de plus de 100 Mo, refusés par GitHub : $($trop.Name -join ', ')" }

$origine = git -C $racine remote get-url origin
if (Test-Path (Join-Path $depot '.git')) {
  git -C $depot fetch -q --depth 1 origin gh-pages
  git -C $depot reset -q --hard FETCH_HEAD
} else {
  git clone -q --depth 1 --branch gh-pages --single-branch $origine $depot
  git -C $depot config user.name (git -C $racine config user.name)
  git -C $depot config user.email (git -C $racine config user.email)
  git -C $depot config http.postBuffer 524288000
}

$cible = Join-Path $depot 'films'
if (Test-Path $cible) { Remove-Item $cible -Recurse -Force }
Copy-Item $source $cible -Recurse
Get-ChildItem $cible -Recurse -File -Filter '*.tmp.*' | Remove-Item -Force

$taille = (Get-ChildItem $depot -Recurse -File -Force | Where-Object FullName -notmatch '\\\.git\\' | Measure-Object Length -Sum).Sum
if ($taille -gt 1GB) { throw ("Le site pèserait {0:N2} Go, au-delà de la limite de GitHub Pages (1 Go)." -f ($taille / 1GB)) }
Write-Host ("Le site pèsera {0:N0} Mo." -f ($taille / 1MB))

git -C $depot add -A films
git -C $depot diff --cached --quiet
if ($LASTEXITCODE -eq 0) { Write-Host 'Rien de nouveau à publier.'; return }
git -C $depot commit -q -m 'Publication des films'
git -C $depot push origin HEAD:gh-pages
if ($LASTEXITCODE -ne 0) { throw "L'envoi a échoué : le commit attend dans $depot. Relancer : git -C dist-depot-films push origin HEAD:gh-pages" }
Write-Host "Films publiés. Pensez à pousser public/data/films.json dans la branche de travail."
