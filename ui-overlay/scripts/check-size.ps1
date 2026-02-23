param(
  [string]$Css1 = "..\tokens.css",
  [string]$Css2 = "..\overlay.css",
  [string]$Js = "..\overlay.js"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-GzipKB([string]$Path) {
  $resolved = Resolve-Path $Path
  $bytes = [System.IO.File]::ReadAllBytes($resolved)
  $memory = New-Object System.IO.MemoryStream
  $gzip = New-Object System.IO.Compression.GZipStream($memory, [System.IO.Compression.CompressionLevel]::Optimal, $true)
  $gzip.Write($bytes, 0, $bytes.Length)
  $gzip.Dispose()
  [math]::Round(($memory.Length / 1KB), 2)
}

$cssKb = Get-GzipKB $Css1
$cssKb2 = Get-GzipKB $Css2
$jsKb = Get-GzipKB $Js
$cssTotal = [math]::Round(($cssKb + $cssKb2), 2)

Write-Host "tokens.css (gz): $cssKb KB"
Write-Host "overlay.css (gz): $cssKb2 KB"
Write-Host "CSS total (gz): $cssTotal KB (target < 50 KB)"
Write-Host "overlay.js (gz): $jsKb KB (target < 30 KB)"

if ($cssTotal -gt 50 -or $jsKb -gt 30) {
  Write-Error "Overlay size budget exceeded."
}

