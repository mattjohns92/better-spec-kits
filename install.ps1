[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [Parameter(Position = 0)]
    [string]$TargetPath = (Get-Location).Path,
    [switch]$Force,
    [switch]$InstallConstitution,
    [switch]$NoBackup
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$RepoRoot = $PSScriptRoot
$TargetRoot = [IO.Path]::GetFullPath($TargetPath)
$Version = (Get-Content (Join-Path $RepoRoot 'VERSION') -Raw).Trim()
if (-not (Test-Path $TargetRoot)) { throw "Target project does not exist: $TargetRoot" }

$files = @(
    @{ Source='skills/speckit-design/SKILL.md'; Destination='.github/skills/speckit-design/SKILL.md' },
    @{ Source='skills/speckit-plan/SKILL.md'; Destination='.github/skills/speckit-plan/SKILL.md' },
    @{ Source='skills/speckit-tasks/SKILL.md'; Destination='.github/skills/speckit-tasks/SKILL.md' },
    @{ Source='skills/speckit-implement/SKILL.md'; Destination='.github/skills/speckit-implement/SKILL.md' }
)
if ($InstallConstitution) {
    $files += @{ Source='constitution/constitution.md'; Destination='.specify/memory/constitution.md' }
}

$existing = @($files | Where-Object { Test-Path (Join-Path $TargetRoot $_.Destination) })
if ($existing.Count -gt 0 -and -not $Force) {
    Write-Host "Existing files would be replaced:" -ForegroundColor Yellow
    $existing | ForEach-Object { Write-Host "  $($_.Destination)" }
    throw 'Nothing changed. Re-run with -Force to replace them; backups are created by default.'
}

$backupRoot = $null
if ($existing.Count -gt 0 -and -not $NoBackup) {
    $backupRoot = Join-Path $TargetRoot ('.better-spec-kit-backup/' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
}

foreach ($item in $files) {
    $src = Join-Path $RepoRoot $item.Source
    $dst = Join-Path $TargetRoot $item.Destination
    if (-not (Test-Path $src)) { throw "Missing Better Spec Kit source: $src" }
    if ((Test-Path $dst) -and $backupRoot) {
        $backup = Join-Path $backupRoot $item.Destination
        New-Item -ItemType Directory -Path (Split-Path $backup -Parent) -Force | Out-Null
        Copy-Item $dst $backup -Force
    }
    if ($PSCmdlet.ShouldProcess($dst, "Install Better Spec Kit v$Version")) {
        New-Item -ItemType Directory -Path (Split-Path $dst -Parent) -Force | Out-Null
        Copy-Item $src $dst -Force
    }
}

$marker = Join-Path $TargetRoot '.specify/better-spec-kit.json'
if ($PSCmdlet.ShouldProcess($marker, 'Write Better Spec Kit installation metadata')) {
    New-Item -ItemType Directory -Path (Split-Path $marker -Parent) -Force | Out-Null
    [ordered]@{ name='better-spec-kit'; version=$Version; constitutionInstalled=[bool]$InstallConstitution; installedAt=(Get-Date).ToString('o') } |
        ConvertTo-Json | Set-Content $marker -Encoding UTF8
}
Write-Host "`nBetter Spec Kit v$Version installed." -ForegroundColor Green
Write-Host "Target: $TargetRoot"
if ($backupRoot) { Write-Host "Backup: $backupRoot" }
if (-not $InstallConstitution) { Write-Host 'Constitution: unchanged (use -InstallConstitution to adopt the neutral baseline).' }
Write-Host 'Optional integrations are discovered by the skills at runtime; no technology stack is assumed.'
