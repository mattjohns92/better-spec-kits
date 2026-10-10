[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [Parameter(Position = 0)][string]$TargetPath = (Get-Location).Path,
    [switch]$Force,
    [switch]$InstallConstitution,
    [switch]$NoBackup,
    [switch]$NonInteractive
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$RepoRoot = $PSScriptRoot
$TargetRoot = [IO.Path]::GetFullPath($TargetPath)
$Version = (Get-Content (Join-Path $RepoRoot 'VERSION') -Raw).Trim()
if (-not (Test-Path -LiteralPath $TargetRoot -PathType Container)) { throw "Target project does not exist: $TargetRoot" }

function Ask-Choice([string]$Question, [string[]]$Options, [int]$Default = 0) {
    while ($true) {
        Write-Host "`n$Question" -ForegroundColor Cyan
        for ($i=0; $i -lt $Options.Count; $i++) { Write-Host "  $($i+1). $($Options[$i])" }
        $answer = Read-Host "Choose [default $($Default+1)]"
        if ([string]::IsNullOrWhiteSpace($answer)) { return $Default }
        $number = 0
        if ([int]::TryParse($answer, [ref]$number) -and $number -ge 1 -and $number -le $Options.Count) { return ($number - 1) }
        Write-Host 'Invalid selection.' -ForegroundColor Yellow
    }
}
function Ask-Yes([string]$Question, [bool]$Default = $false) {
    $options = if ($Default) { @('Yes','No') } else { @('No','Yes') }
    return ((Ask-Choice $Question $options 0) -eq $(if ($Default) { 0 } else { 1 }))
}
function Invoke-Checked([string]$Executable, [string[]]$Arguments, [string]$WorkingDirectory) {
    Push-Location $WorkingDirectory
    try {
        & $Executable @Arguments
        if ($LASTEXITCODE -ne 0) { throw "$Executable exited with code $LASTEXITCODE" }
    } finally { Pop-Location }
}

$interactive = -not $NonInteractive -and -not $WhatIfPreference -and [Environment]::UserInteractive
Write-Host "`nBetter Spec Kit v$Version" -ForegroundColor Green
Write-Host "Project: $TargetRoot"
$specKit = Test-Path (Join-Path $TargetRoot '.specify')
Write-Host "Spec Kit: $(if ($specKit) {'detected'} else {'not detected'})"
if (-not $specKit) { Write-Warning 'Spec Kit not detected. Initialise GitHub Spec Kit before using these workflow skills.' }

$constitutionPath = Join-Path $TargetRoot '.specify/memory/constitution.md'
if ($interactive -and -not $InstallConstitution) {
    $label = if (Test-Path $constitutionPath) { 'Replace existing constitution with neutral template? (backup will be created)' } else { 'Install neutral constitution template?' }
    $InstallConstitution = Ask-Yes $label
}
$files = @(
    @{ Source='skills/speckit-design/SKILL.md'; Destination='.github/skills/speckit-design/SKILL.md' },
    @{ Source='skills/speckit-plan/SKILL.md'; Destination='.github/skills/speckit-plan/SKILL.md' },
    @{ Source='skills/speckit-tasks/SKILL.md'; Destination='.github/skills/speckit-tasks/SKILL.md' },
    @{ Source='skills/speckit-implement/SKILL.md'; Destination='.github/skills/speckit-implement/SKILL.md' }
)
if ($InstallConstitution) { $files += @{ Source='constitution/constitution.md'; Destination='.specify/memory/constitution.md' } }
foreach ($item in $files) {
    if (-not (Test-Path (Join-Path $RepoRoot $item.Source) -PathType Leaf)) { throw "Missing package file: $($item.Source)" }
}
$existing = @($files | Where-Object { Test-Path (Join-Path $TargetRoot $_.Destination) })
$changed = @($files | Where-Object {
    $destination = Join-Path $TargetRoot $_.Destination
    -not (Test-Path $destination) -or (Get-FileHash (Join-Path $RepoRoot $_.Source) -Algorithm SHA256).Hash -ne (Get-FileHash $destination -Algorithm SHA256).Hash
})
$conflicts = @($changed | Where-Object { Test-Path (Join-Path $TargetRoot $_.Destination) })
Write-Host "`nFiles to add/change: $($changed.Count)"
$changed | ForEach-Object { Write-Host "  $($_.Destination)" }
if ($conflicts.Count -gt 0 -and -not $Force) {
    if (-not $interactive) { throw 'Existing customised files would change. Re-run with -Force to back up and replace them.' }
    Write-Host "`n$($conflicts.Count) existing file(s) differ from this release." -ForegroundColor Yellow
    $Force = Ask-Yes 'Replace differing files after backing them up?'
    if (-not $Force) { Write-Host 'Installation cancelled. No files changed.'; return }
}
$integrationChoice = 0
if ($interactive) {
    $integrationChoice = Ask-Choice 'Optional integrations (installed separately; never bundled)' @('Skip','Install Ponytail for Copilot CLI','Install UI UX Pro Max globally for Copilot','Install both') 0
    if ($integrationChoice -in @(1,3) -and -not (Get-Command copilot -ErrorAction SilentlyContinue)) {
        Write-Warning 'Copilot CLI not on PATH. Ponytail setup will be skipped.'
    }
    if ($integrationChoice -in @(2,3) -and -not (Get-Command npx -ErrorAction SilentlyContinue)) {
        Write-Warning 'npx not on PATH. UI UX Pro Max setup will be skipped.'
    }
    if (-not (Ask-Yes 'Proceed with installation?' $true)) { Write-Host 'Installation cancelled.'; return }
}
$backupRoot = $null
if ($conflicts.Count -gt 0 -and -not $NoBackup) {
    $backupBase = if ($env:LOCALAPPDATA) { Join-Path $env:LOCALAPPDATA 'BetterSpecKit/backups' } else { Join-Path ([IO.Path]::GetTempPath()) 'BetterSpecKit/backups' }
    $projectName = Split-Path $TargetRoot -Leaf
    if ([string]::IsNullOrWhiteSpace($projectName)) { $projectName = 'project' }
    $projectKey = ($projectName -replace '[^a-zA-Z0-9._-]', '_')
    $backupRoot = Join-Path $backupBase ($projectKey + '/' + (Get-Date -Format 'yyyyMMdd-HHmmss-fff'))
}
foreach ($item in $changed) {
    $src = Join-Path $RepoRoot $item.Source
    $dst = Join-Path $TargetRoot $item.Destination
    if ($PSCmdlet.ShouldProcess($dst, "Install Better Spec Kit v$Version")) {
        if ((Test-Path $dst) -and $backupRoot) {
            $backup = Join-Path $backupRoot $item.Destination
            New-Item -ItemType Directory -Path (Split-Path $backup -Parent) -Force | Out-Null
            Copy-Item -LiteralPath $dst -Destination $backup -Force
        }
        New-Item -ItemType Directory -Path (Split-Path $dst -Parent) -Force | Out-Null
        Copy-Item -LiteralPath $src -Destination $dst -Force
    }
}
$marker = Join-Path $TargetRoot '.specify/better-spec-kit.json'
if ($PSCmdlet.ShouldProcess($marker, 'Write Better Spec Kit installation metadata')) {
    New-Item -ItemType Directory -Path (Split-Path $marker -Parent) -Force | Out-Null
    [ordered]@{ name='better-spec-kit'; version=$Version; constitutionInstalled=[bool]$InstallConstitution; installedAt=(Get-Date).ToString('o') } |
        ConvertTo-Json | Set-Content -LiteralPath $marker -Encoding UTF8
}
Write-Host "`nBetter Spec Kit v$Version installed." -ForegroundColor Green
if ($backupRoot) { Write-Host "Backups: $backupRoot" }
if ($interactive -and -not $WhatIfPreference) {
    if ($integrationChoice -in @(1,3) -and (Get-Command copilot -ErrorAction SilentlyContinue)) {
        if (Ask-Yes 'Run official Ponytail Copilot plugin install commands now?') {
            try {
                Invoke-Checked 'copilot' @('plugin','marketplace','add','DietrichGebert/ponytail') $TargetRoot
                Invoke-Checked 'copilot' @('plugin','install','ponytail@ponytail') $TargetRoot
                Write-Host 'Ponytail setup completed.' -ForegroundColor Green
            } catch { Write-Warning "Ponytail setup failed: $_" }
        }
    }
    if ($integrationChoice -in @(2,3) -and (Get-Command npx -ErrorAction SilentlyContinue)) {
        if (Ask-Yes 'Run official UI UX Pro Max CLI setup globally for Copilot now?') {
            try {
                Invoke-Checked 'npx' @('--yes','ui-ux-pro-max-cli','init','--ai','copilot','--global') $TargetRoot
                Write-Host 'UI UX Pro Max setup completed.' -ForegroundColor Green
            } catch { Write-Warning "UI UX Pro Max setup failed: $_" }
        }
    }
}
Write-Host 'Done. Optional integrations can also be configured later.'
