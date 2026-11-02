<#
.SYNOPSIS
  Publie dist/racines-complet sur GitHub Pages (branche gh-pages du dépôt d'origine).

.DESCRIPTION
  Un dépôt séparé (dist/depot-pages) garde l'historique de la branche : seuls les fichiers modifiés
  sont renvoyés à chaque publication. Le site reste en ligne à l'adresse
  https://<compte>.github.io/<depot>/

  Limites gratuites de GitHub Pages : 1 Go de site, 100 Go par mois, 100 Mo par fichier.
  Lancer d'abord publier-site.ps1 -Seul complet.

.EXAMPLE
  ./deployer-github-pages.ps1
#>
$ErrorActionPreference = 'Stop'
$animations = Split-Path $PSScriptRoot -Parent
$source = Join-Path $animations 'dist\racines-complet'
$depot = Join-Path $animations 'dist\depot-pages'
if (-not (Test-Path $source)) { throw 'dist/racines-complet absent : lancer publier-site.ps1 -Seul complet.' }
$taille = (Get-ChildItem $source -Recurse -File | Measure-Object Length -Sum).Sum / 1GB
if ($taille -gt 1) { throw ("Le site pèse {0:N2} Go, au-delà de la limite de GitHub Pages (1 Go)." -f $taille) }
$origine = git -C $animations remote get-url origin

if (-not (Test-Path (Join-Path $depot '.git'))) {
  New-Item -ItemType Directory -Force $depot | Out-Null
  git -C $depot init -q -b gh-pages
  git -C $depot remote add origin $origine
  git -C $depot config user.name (git -C $animations config user.name)
  git -C $depot config user.email (git -C $animations config user.email)
  git -C $depot config core.autocrlf false
  git -C $depot config http.postBuffer 524288000
  # Reprend l'historique si la branche existe déjà
  git -C $depot fetch -q origin gh-pages 2>$null
  if ($LASTEXITCODE -eq 0) { git -C $depot reset -q --mixed FETCH_HEAD }
}

# Miroir du dossier publié, sans toucher à .git
Get-ChildItem $depot -Force | Where-Object Name -ne '.git' | Remove-Item -Recurse -Force
Get-ChildItem $source -Force | Copy-Item -Destination $depot -Recurse -Force

git -C $depot add -A
git -C $depot diff --cached --quiet
if ($LASTEXITCODE -eq 0) { Write-Host 'Rien de nouveau à publier.'; return }
git -C $depot commit -q -m "Publication du site Racines"
git -C $depot push -u origin gh-pages
$m = [regex]::Match($origine, 'github\.com[:/]([^/]+)/([^/.]+)')
Write-Host ("En ligne dans quelques minutes : https://{0}.github.io/{1}/" -f $m.Groups[1].Value.ToLower(), $m.Groups[2].Value)
