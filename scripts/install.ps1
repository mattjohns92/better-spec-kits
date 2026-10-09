# Run the root installer to keep one canonical implementation.
& (Join-Path (Split-Path $PSScriptRoot -Parent) 'install.ps1') @args
if ($LASTEXITCODE -ne 0 -and $null -ne $LASTEXITCODE) { exit $LASTEXITCODE }
