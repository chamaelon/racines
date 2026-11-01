<#
.SYNOPSIS
  Exporte une histoire animée (SVG + GSAP) en vidéo MP4 1920×1080, image par image.

.DESCRIPTION
  Ouvre la page de l'histoire dans Edge sans fenêtre (mode ?capture=1), pilote la timeline par
  le protocole DevTools (window.__aller(t)), capture chaque image et l'envoie directement à
  ffmpeg. Le rendu est déterministe : la vidéo est identique à l'animation.
  La vidéo est muette (le doublage sera ajouté plus tard).

.EXAMPLE
  ./exporter.ps1 -Histoire 01-wuro-masque
  ./exporter.ps1 -Histoire 03-wuro-pilon -Fps 30 -Langue mos
  ./exporter.ps1 -Histoire 01-wuro-masque -Debut 30 -Fin 40 -Sortie essai.mp4
#>
param(
  [Parameter(Mandatory)] [string]$Histoire,
  [int]$Fps = 25,
  [int]$Port = 9301,
  [double]$Debut = 0,
  [double]$Fin = -1,
  [string]$Langue = 'fr',
  [int]$Crf = 20,
  [string]$Sortie
)
$ErrorActionPreference = 'Stop'
$animations = Split-Path $PSScriptRoot -Parent

# ------------------------------------------------------------------ Outils
$ffmpeg = @($env:FFMPEG, "$env:USERPROFILE\outils\ffmpeg\bin\ffmpeg.exe", (Get-Command ffmpeg -ErrorAction SilentlyContinue).Source) |
  Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if (-not $ffmpeg) { throw 'ffmpeg introuvable (variable FFMPEG, %USERPROFILE%\outils\ffmpeg ou PATH).' }
$edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") |
  Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw 'Microsoft Edge introuvable.' }

$page = Join-Path $animations "histoires\$Histoire\index.html"
if (-not (Test-Path $page)) { throw "Histoire introuvable : $page" }
if (-not $Sortie) {
  $dossier = Join-Path $animations 'videos'
  New-Item -ItemType Directory -Force $dossier | Out-Null
  $suffixe = if ($Langue -ne 'fr') { "-$Langue" } else { '' }
  $Sortie = Join-Path $dossier "$Histoire$suffixe.mp4"
}
$url = ([Uri]$page).AbsoluteUri + "?capture=1&t=0&lang=$Langue"

# ------------------------------------------------------------------ Edge sans fenêtre
$profil = Join-Path $env:TEMP "racines-edge-$Port"
$edgeProc = Start-Process $edge -PassThru -WindowStyle Hidden -ArgumentList @(
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--mute-audio', '--no-first-run',
  '--disable-extensions', "--remote-debugging-port=$Port", "--user-data-dir=$profil",
  '--window-size=1920,1080', '--allow-file-access-from-files', $url)

$ws = $null; $ff = $null
try {
  $cible = $null
  for ($i = 0; $i -lt 100 -and -not $cible; $i++) {
    try {
      $liste = Invoke-RestMethod "http://127.0.0.1:$Port/json"   # tableau JSON : énuméré via la variable
      $cible = $liste | Where-Object { $_.type -eq 'page' -and $_.url -like '*index.html*' } | Select-Object -First 1
    } catch { }
    if (-not $cible) { Start-Sleep -Milliseconds 200 }
  }
  if (-not $cible) { throw "Edge ne répond pas sur le port $Port." }

  $ws = [System.Net.WebSockets.ClientWebSocket]::new()
  $ws.ConnectAsync([Uri]$cible.webSocketDebuggerUrl, [Threading.CancellationToken]::None).Wait()
  $script:num = 0
  $tampon = [byte[]]::new(4MB)

  # Envoie une commande DevTools et renvoie son résultat.
  function Cdp([string]$methode, [hashtable]$params = @{}) {
    $script:num++
    $msg = @{ id = $script:num; method = $methode; params = $params } | ConvertTo-Json -Depth 8 -Compress
    $octets = [Text.Encoding]::UTF8.GetBytes($msg)
    $ws.SendAsync([ArraySegment[byte]]::new($octets), 'Text', $true, [Threading.CancellationToken]::None).Wait()
    while ($true) {
      $flux = [IO.MemoryStream]::new()
      do {
        $r = $ws.ReceiveAsync([ArraySegment[byte]]::new($tampon), [Threading.CancellationToken]::None).Result
        $flux.Write($tampon, 0, $r.Count)
      } until ($r.EndOfMessage)
      $rep = [Text.Encoding]::UTF8.GetString($flux.ToArray()) | ConvertFrom-Json
      if ($rep.id -eq $script:num) {
        if ($rep.error) { throw "DevTools $methode : $($rep.error.message)" }
        return $rep.result
      }
    }
  }  function Js([string]$expr) {
    $r = Cdp 'Runtime.evaluate' @{ expression = $expr; returnByValue = $true }
    if ($r.exceptionDetails) { throw "Erreur JS : $($r.exceptionDetails | ConvertTo-Json -Depth 5 -Compress)" }
    return $r.result.value
  }
  Cdp 'Emulation.setDeviceMetricsOverride' @{ width = 1920; height = 1080; deviceScaleFactor = 1; mobile = $false } | Out-Null
  for ($i = 0; $i -lt 150; $i++) {
    if (Js 'window.__pret === true') { break }
    Start-Sleep -Milliseconds 200
  }
  $duree = [double](Js 'window.__duree')
  if ($Fin -lt 0 -or $Fin -gt $duree) { $Fin = $duree }
  $n = [int][math]::Floor(($Fin - $Debut) * $Fps)
  Write-Host ("{0} : {1:N1} s → {2} images à {3} i/s → {4}" -f $Histoire, ($Fin - $Debut), $n, $Fps, $Sortie)

  # ffmpeg lit les images JPEG sur son entrée standard
  $psi = [Diagnostics.ProcessStartInfo]::new($ffmpeg)
  foreach ($a in @('-y', '-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', "$Fps", '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', "$Crf", '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-r', "$Fps", $Sortie)) { $psi.ArgumentList.Add($a) }
  $psi.UseShellExecute = $false
  $psi.RedirectStandardInput = $true
  $ff = [Diagnostics.Process]::Start($psi)
  $entree = $ff.StandardInput.BaseStream

  $chrono = [Diagnostics.Stopwatch]::StartNew()
  $inv = [Globalization.CultureInfo]::InvariantCulture
  for ($k = 0; $k -lt $n; $k++) {
    $t = $Debut + $k / $Fps
    Js ('window.__aller(' + $t.ToString('R', $inv) + ')') | Out-Null
    $img = Cdp 'Page.captureScreenshot' @{ format = 'jpeg'; quality = 92 }
    $octets = [Convert]::FromBase64String($img.data)
    $entree.Write($octets, 0, $octets.Length)
    if ($k % 250 -eq 0 -and $k) {
      $reste = $chrono.Elapsed.TotalSeconds / $k * ($n - $k)
      Write-Host ("  {0}/{1} images ({2:P0}) — reste ≈ {3:N0} min" -f $k, $n, ($k / $n), ($reste / 60))
    }
  }
  $entree.Close()
  $ff.WaitForExit()
  if ($ff.ExitCode -ne 0) { throw "ffmpeg a échoué (code $($ff.ExitCode))." }
  Write-Host ("Terminé en {0:N1} min : {1}" -f $chrono.Elapsed.TotalMinutes, $Sortie)
}
finally {
  if ($ws) { try { $ws.Dispose() } catch { } }
  if ($ff -and -not $ff.HasExited) { try { $ff.Kill() } catch { } }
  & taskkill /PID $edgeProc.Id /T /F 2>$null | Out-Null
  Start-Sleep -Milliseconds 500
  Remove-Item $profil -Recurse -Force -ErrorAction SilentlyContinue
}
