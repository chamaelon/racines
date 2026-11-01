<#
.SYNOPSIS
  Exporte en MP4 toutes les histoires dont la vidéo manque ou n'est plus à jour.

.DESCRIPTION
  Une vidéo est à refaire si elle n'existe pas ou si un fichier de l'histoire (scenes.js, textes,
  index.html) ou du moteur commun (lib/, bible/) est plus récent qu'elle. Plusieurs exports
  tournent en parallèle (un Edge sans fenêtre par export). Journaux : videos/journaux/.

.EXAMPLE
  ./exporter-tout.ps1                 # 3 exports en parallèle
  ./exporter-tout.ps1 -Paralleles 4 -Seulement 01-wuro-masque,03-wuro-pilon
  ./exporter-tout.ps1 -Refaire        # tout réexporter
#>
param(
  [int]$Paralleles = 3,
  [string[]]$Seulement,
  [switch]$Refaire,
  [switch]$IgnorerMoteur   # ne pas réexporter quand seuls lib/ ou bible/ ont changé
)
$ErrorActionPreference = 'Stop'
$animations = Split-Path $PSScriptRoot -Parent
$videos = Join-Path $animations 'videos'
$journaux = Join-Path $videos 'journaux'
New-Item -ItemType Directory -Force $journaux | Out-Null

$moteur = Get-ChildItem (Join-Path $animations 'lib'), (Join-Path $animations 'bible') -Recurse -File -Include *.js |
  Sort-Object LastWriteTime -Descending | Select-Object -First 1

$file = foreach ($d in Get-ChildItem (Join-Path $animations 'histoires') -Directory | Sort-Object Name) {
  if ($Seulement -and $d.Name -notin $Seulement) { continue }
  if (-not (Test-Path (Join-Path $d.FullName 'scenes.js'))) { continue }
  $mp4 = Join-Path $videos "$($d.Name).mp4"
  if (-not $Refaire -and (Test-Path $mp4)) {
    $date = (Get-Item $mp4).LastWriteTime
    $recent = Get-ChildItem $d.FullName -Recurse -File -Include *.js, *.html | Where-Object LastWriteTime -gt $date
    if (-not $recent -and ($IgnorerMoteur -or $moteur.LastWriteTime -lt $date)) { continue }
  }
  $d.Name
}
if (-not $file) { Write-Host 'Toutes les vidéos sont à jour.'; return }
Write-Host "À exporter ($($file.Count)) : $($file -join ', ')"

$pwsh = (Get-Process -Id $PID).Path
$enCours = @{}
$port = 9400
$queue = [Collections.Queue]::new([object[]]$file)
while ($queue.Count -or $enCours.Count) {
  while ($queue.Count -and $enCours.Count -lt $Paralleles) {
    $h = $queue.Dequeue(); $port++
    $log = Join-Path $journaux "$h.log"
    $p = Start-Process $pwsh -PassThru -WindowStyle Hidden -RedirectStandardOutput $log -RedirectStandardError "$log.err" -ArgumentList @(
      '-NoProfile', '-File', ('"' + (Join-Path $PSScriptRoot 'exporter.ps1') + '"'), '-Histoire', $h, '-Port', $port)
    $enCours[$h] = $p
    Write-Host ("[{0:HH:mm}] début  {1}" -f (Get-Date), $h)
  }
  Start-Sleep -Seconds 5
  foreach ($h in @($enCours.Keys)) {
    $p = $enCours[$h]
    if ($p.HasExited) {
      $ok = Test-Path (Join-Path $videos "$h.mp4")
      Write-Host ("[{0:HH:mm}] {1} {2}" -f (Get-Date), ($(if ($p.ExitCode -eq 0 -and $ok) { 'fini  ' } else { 'ÉCHEC ' })), $h)
      $enCours.Remove($h)
    }
  }
}
Write-Host 'Exports terminés.'
