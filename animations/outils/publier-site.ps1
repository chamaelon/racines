<#
.SYNOPSIS
  Assemble le site Racines en dossiers prêts à publier (dist/).

.DESCRIPTION
  Produit des dossiers autonomes, à copier tels quels sur un hébergement statique ou une clé USB :
    dist/racines-complet/     carte, animations, vidéos, pistes audio, doublage (le site complet)
    dist/racines-animations/  sans les vidéos
    dist/racines-videos/      sans le moteur d'animation
  Par défaut, les vidéos publiées sont celles de videos-web/ (légères, avec pistes audio : voir
  doublage.py videos-web) quand elles existent, sinon celles de videos/.

.EXAMPLE
  ./publier-site.ps1
  ./publier-site.ps1 -Seul complet -Sortie D:\publication
#>
param(
  [string]$Sortie,
  [ValidateSet('tous', 'complet', 'animations', 'videos')][string]$Seul = 'tous',
  [switch]$SansVideos   # publication rapide : les vidéos pourront s'ajouter ensuite
)
$ErrorActionPreference = 'Stop'
$animations = Split-Path $PSScriptRoot -Parent
if (-not $Sortie) { $Sortie = Join-Path $animations 'dist' }

function Redirection([string]$fichier, [string]$cible, [string]$titre) {
  @"
<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><title>$titre</title>
<meta http-equiv="refresh" content="0; url=$cible"></head>
<body><p><a href="$cible">$titre</a></p></body></html>
"@ | Set-Content $fichier -Encoding utf8
}

$histoires = Get-ChildItem (Join-Path $animations 'histoires') -Directory | Where-Object { Test-Path (Join-Path $_.FullName 'scenes.js') }
$manquantes = $histoires.Name | Where-Object { -not (Test-Path (Join-Path $animations "videos\$_.mp4")) }
if ($manquantes) { Write-Warning "Vidéos manquantes : $($manquantes -join ', ') (lancer exporter-tout.ps1)" }

$versions = if ($Seul -eq 'tous') { 'complet', 'animations', 'videos' } else { @($Seul) }
foreach ($v in $versions) {
  $d = Join-Path $Sortie "racines-$v"
  if (Test-Path $d) { Remove-Item $d -Recurse -Force }
  New-Item -ItemType Directory -Force $d | Out-Null
  Copy-Item (Join-Path $animations 'site') (Join-Path $d 'site') -Recurse
  Remove-Item (Join-Path $d 'site\commun\durees.txt') -ErrorAction SilentlyContinue

  # Pistes audio et fichiers de doublage (sans les sources)
  Copy-Item (Join-Path $animations 'audio') (Join-Path $d 'audio') -Recurse
  New-Item -ItemType Directory -Force (Join-Path $d 'doublage') | Out-Null
  foreach ($h in $histoires) { Copy-Item (Join-Path $animations "doublage\$($h.Name)") (Join-Path $d "doublage\$($h.Name)") -Recurse }
  Copy-Item (Join-Path $animations 'doublage\GUIDE-DOUBLAGE.md') (Join-Path $d 'doublage\GUIDE-DOUBLAGE.md') -ErrorAction SilentlyContinue

  if ($v -ne 'videos') {
    foreach ($x in 'lib', 'bible') { Copy-Item (Join-Path $animations $x) (Join-Path $d $x) -Recurse }
    New-Item -ItemType Directory -Force (Join-Path $d 'histoires') | Out-Null
    foreach ($h in $histoires) { Copy-Item $h.FullName (Join-Path $d "histoires\$($h.Name)") -Recurse }
  }
  if ($v -ne 'animations' -and -not $SansVideos) {
    New-Item -ItemType Directory -Force (Join-Path $d 'videos') | Out-Null
    foreach ($h in $histoires) {
      $web = Join-Path $animations "videos-web\$($h.Name).mp4"
      $src = if (Test-Path $web) { $web } else { Join-Path $animations "videos\$($h.Name).mp4" }
      # Un MP4 en cours d'export n'est pas encore lisible : son journal n'indique pas la fin.
      $log = Join-Path $animations "videos\journaux\$($h.Name).log"
      $fini = (Test-Path $web) -or -not (Test-Path $log) -or (Select-String -Path $log -Pattern 'Termin' -Quiet)
      if ((Test-Path $src) -and $fini) { Copy-Item $src (Join-Path $d "videos\$($h.Name).mp4") }
    }
  }
  $mode = switch ($v) { 'animations' { "'anim'" } 'videos' { "'video'" } default { 'null' } }
  "window.MODE_SEUL = $mode;`nwindow.RACINE_VIDEOS = '../videos';" | Set-Content (Join-Path $d 'site\commun\config.js') -Encoding utf8
  Redirection (Join-Path $d 'index.html') 'site/index.html' 'Racines'
  New-Item -ItemType File -Force (Join-Path $d '.nojekyll') | Out-Null   # GitHub Pages : servir les fichiers tels quels
  $taille = (Get-ChildItem $d -Recurse -File | Measure-Object Length -Sum).Sum / 1MB
  Write-Host ("racines-{0} : {1:N0} Mo → {2}" -f $v, $taille, $d)
}
