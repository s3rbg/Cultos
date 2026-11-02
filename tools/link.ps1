# Enlaza (junction) este proyecto en la carpeta de sistemas de Foundry VTT.
$target = Split-Path -Parent $PSScriptRoot
$dataPath = (Get-Content "$env:LOCALAPPDATA\FoundryVTT\Config\options.json" | ConvertFrom-Json).dataPath
$link = Join-Path $dataPath "Data\systems\cultos-innombrables"

if (Test-Path $link) {
  Write-Host "Ya existe: $link"
} else {
  New-Item -ItemType Junction -Path $link -Target $target | Out-Null
  Write-Host "Enlazado $link -> $target"
}
