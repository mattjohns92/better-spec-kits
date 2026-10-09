[CmdletBinding()]
param(
  [Parameter(Position = 0)][string]$TargetPath = (Get-Location).Path,
  [string]$Ref = 'main',
  [switch]$Force,
  [switch]$InstallConstitution
)
$ErrorActionPreference = 'Stop'
$archive = Join-Path ([IO.Path]::GetTempPath()) ('better-spec-kit-' + [guid]::NewGuid().ToString('N') + '.zip')
$work = Join-Path ([IO.Path]::GetTempPath()) ('better-spec-kit-' + [guid]::NewGuid().ToString('N'))
try {
  # Ref is deliberately limited to branch/tag characters, not arbitrary URLs.
  if ($Ref -notmatch '^[a-zA-Z0-9._/-]+$' -or $Ref.Contains('..')) { throw 'Invalid Git ref.' }
  $uri = "https://github.com/mattjohns92/better-spec-kits/archive/refs/heads/$Ref.zip"
  if ($Ref -match '^v[0-9]+\.[0-9]+\.[0-9]+$') { $uri = "https://github.com/mattjohns92/better-spec-kits/archive/refs/tags/$Ref.zip" }
  Invoke-WebRequest -Uri $uri -OutFile $archive -ErrorAction Stop
  Expand-Archive -LiteralPath $archive -DestinationPath $work
  $installer = @(Get-ChildItem -LiteralPath $work -Filter 'install.ps1' -File -Recurse | Where-Object { $_.Directory.Parent.FullName -eq $work })
  if ($installer.Count -ne 1) { throw 'Expected exactly one Better Spec Kit installer in downloaded archive.' }
  & $installer[0].FullName -TargetPath $TargetPath -Force:$Force -InstallConstitution:$InstallConstitution
  if (-not $?) { throw 'Better Spec Kit installation failed.' }
} finally {
  Remove-Item -LiteralPath $archive -Force -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath $work -Recurse -Force -ErrorAction SilentlyContinue
}
