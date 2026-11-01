<#
.SYNOPSIS
  Assemble le site Racines en dossiers prêts à publier (dist/).

.DESCRIPTION
  Produit trois dossiers autonomes, à copier tels quels sur un hébergement statique ou une clé USB :
    dist/racines-complet/     accueil + version animée + version vidéo (le site complet)
    dist/racines-animations/  version animée seule (lib, bible, histoires)
    dist/racines-videos/      version vidéo seule (MP4)
  Dans les versions seules, les liens vers l'autre version sont retirés (commun/config.js).
  Un index.html à la racine de chaque dossier ouvre la bonne page.

.EXAMPLE
  ./publier-site.ps1
  ./publier-site.ps1 -Sortie D:\publication
#>
param([string]$Sortie)
$ErrorActionPreference = 'Stop'
$animations = Split-Path $PSScriptRoot -Parent
if (-not $Sortie) { $Sortie = Join-Path $animations 'dist' }

function Copier([string]$de, [string]$vers) {
  New-Item -ItemType Directory -Force (Split-Path $vers -Parent) | Out-Null
  Copy-Item $de $vers -Recurse -Force
}
function Redirection([string]$fichier, [string]$cible, [string]$titre) {
  @"
<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><title>$titre</title>
<meta http-equiv="refresh" content="0; url=$cible"></head>
<body><p><a href="$cible">$titre</a></p></body></html>
"@ | Set-Content $fichier -Encoding utf8
}

$videos = Get-ChildItem (Join-Path $animations 'videos') -Filter *.mp4 -ErrorAction SilentlyContinue
$histoires = Get-ChildItem (Join-Path $animations 'histoires') -Directory | Where-Object { Test-Path (Join-Path $_.FullName 'scenes.js') }
Write-Host "$($histoires.Count) histoires animées, $($videos.Count) vidéos."
$manquantes = $histoires.Name | Where-Object { -not (Test-Path (Join-Path $animations "videos\$_.mp4")) }
if ($manquantes) { Write-Warning "Vidéos manquantes : $($manquantes -join ', ') (lancer exporter-tout.ps1)" }

foreach ($v in 'complet', 'animations', 'videos') {
  $d = Join-Path $Sortie "racines-$v"
  if (Test-Path $d) { Remove-Item $d -Recurse -Force }
  New-Item -ItemType Directory -Force (Join-Path $d 'site') | Out-Null
  Copier (Join-Path $animations 'site\commun') (Join-Path $d 'site\commun')
  Remove-Item (Join-Path $d 'site\commun\durees.txt') -ErrorAction SilentlyContinue
  if ($v -ne 'videos') {
    Copier (Join-Path $animations 'site\animations') (Join-Path $d 'site\animations')
    foreach ($x in 'lib', 'bible') { Copier (Join-Path $animations $x) (Join-Path $d $x) }
    foreach ($h in $histoires) { Copier $h.FullName (Join-Path $d "histoires\$($h.Name)") }
  }
  if ($v -ne 'animations') {
    Copier (Join-Path $animations 'site\videos') (Join-Path $d 'site\videos')
    New-Item -ItemType Directory -Force (Join-Path $d 'videos') | Out-Null
    foreach ($f in $videos) { Copy-Item $f.FullName (Join-Path $d "videos\$($f.Name)") }
  }
  if ($v -eq 'complet') {
    Copy-Item (Join-Path $animations 'site\index.html') (Join-Path $d 'site\index.html')
    Redirection (Join-Path $d 'index.html') 'site/index.html' 'Racines'
  } else {
    'window.SITE_SEUL = true;' | Set-Content (Join-Path $d 'site\commun\config.js') -Encoding utf8
    Redirection (Join-Path $d 'site\index.html') "$v/index.html" 'Racines'
    Redirection (Join-Path $d 'index.html') "site/$v/index.html" 'Racines'
  }
  $taille = (Get-ChildItem $d -Recurse -File | Measure-Object Length -Sum).Sum / 1MB
  Write-Host ("racines-{0} : {1:N0} Mo → {2}" -f $v, $taille, $d)
}
