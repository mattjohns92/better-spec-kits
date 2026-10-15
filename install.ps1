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


function Get-SpecKitFileClassification([string]$Destination, [string]$Source) {
    if (-not (Test-Path -LiteralPath $Destination -PathType Leaf)) { return 'new' }

    $sourceHash = (Get-FileHash -LiteralPath $Source -Algorithm SHA256).Hash
    $destinationHash = (Get-FileHash -LiteralPath $Destination -Algorithm SHA256).Hash
    if ($sourceHash -eq $destinationHash) { return 'current' }

    $normalized = $Destination.Replace('\','/')
    if ($normalized -match '/\.github/skills/speckit-analyze/SKILL\.md$') { return 'custom' }

    $text = Get-Content -LiteralPath $Destination -Raw -ErrorAction SilentlyContinue
    if ([string]::IsNullOrWhiteSpace($text)) { return 'custom' }

    # Better Spec Kit-owned files identify themselves through their workflow language.
    if (
        $text -match '(?i)Better Spec Kit' -or
        $text -match '(?i)UI UX Pro Max' -or
        $text -match '(?i)Ponytail'
    ) { return 'better-spec-kit' }

    # Existing upstream Spec Kit skills use the expected speckit skill location/name
    # and do not contain Better Spec Kit integration markers. Treat these as the
    # normal upgrade path, while still showing the exact files that will be replaced.
    if ($normalized -match '/\.github/skills/speckit-(plan|tasks|implement)/SKILL\.md$') {
        return 'spec-kit'
    }

    return 'custom'
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
    @{ Source='skills/speckit-analyze/SKILL.md'; Destination='.github/skills/speckit-analyze/SKILL.md' },
    @{ Source='skills/speckit-remediate/SKILL.md'; Destination='.github/skills/speckit-remediate/SKILL.md' },
    @{ Source='skills/speckit-implement/SKILL.md'; Destination='.github/skills/speckit-implement/SKILL.md' },
    @{ Source='skills/speckit-review/SKILL.md'; Destination='.github/skills/speckit-review/SKILL.md' },
    @{ Source='skills/speckit-summary/SKILL.md'; Destination='.github/skills/speckit-summary/SKILL.md' },
    @{ Source='skills/speckit-scope/SKILL.md'; Destination='.github/skills/speckit-scope/SKILL.md' },
    @{ Source='skills/speckit-quick/SKILL.md'; Destination='.github/skills/speckit-quick/SKILL.md' },
    @{ Source='instructions/scope-handoffs.instructions.md'; Destination='.github/instructions/scope-handoffs.instructions.md' }
)
if ($InstallConstitution) { $files += @{ Source='constitution/constitution.md'; Destination='.specify/memory/constitution.md' } }
foreach ($item in $files) {
    if (-not (Test-Path (Join-Path $RepoRoot $item.Source) -PathType Leaf)) { throw "Missing package file: $($item.Source)" }
}
$fileStates = @()
foreach ($item in $files) {
    $src = Join-Path $RepoRoot $item.Source
    $dst = Join-Path $TargetRoot $item.Destination
    $classification = Get-SpecKitFileClassification $dst $src
    $fileStates += [pscustomobject]@{
        Item = $item
        Source = $src
        Destination = $dst
        Classification = $classification
    }
}

$changedStates = @($fileStates | Where-Object { $_.Classification -ne 'current' })
$changed = @($changedStates | ForEach-Object { $_.Item })
$standardUpgrades = @($changedStates | Where-Object { $_.Classification -eq 'spec-kit' })
$betterUpdates = @($changedStates | Where-Object { $_.Classification -eq 'better-spec-kit' })
$customConflicts = @($changedStates | Where-Object { $_.Classification -eq 'custom' })
$replaceStates = @($changedStates | Where-Object { Test-Path -LiteralPath $_.Destination -PathType Leaf })

$markerPath = Join-Path $TargetRoot '.specify/better-spec-kit.json'
$betterInstalled = Test-Path -LiteralPath $markerPath -PathType Leaf

Write-Host "Better Spec Kit: $(if ($betterInstalled) {'detected'} else {'not installed'})"

Write-Host "`nPlanned changes:"
foreach ($state in $changedStates) {
    $action = switch ($state.Classification) {
        'new' { 'ADD' }
        'spec-kit' { 'UPGRADE' }
        'better-spec-kit' { 'UPDATE' }
        'custom' { 'REVIEW' }
        default { 'CHANGE' }
    }
    Write-Host ("  {0,-8} {1}" -f $action, $state.Item.Destination)
}

if ($standardUpgrades.Count -gt 0) {
    Write-Host "`nExisting Spec Kit detected." -ForegroundColor Green
    Write-Host "Better Spec Kit will enhance $($standardUpgrades.Count) standard Spec Kit skill(s)."
    Write-Host 'Original files will be backed up automatically outside the repository.'
}

if ($betterUpdates.Count -gt 0) {
    Write-Host "`nExisting Better Spec Kit files will be updated." -ForegroundColor Cyan
}

if ($customConflicts.Count -gt 0 -and -not $Force) {
    Write-Host "`n$($customConflicts.Count) file(s) could not be safely classified as standard Spec Kit or Better Spec Kit." -ForegroundColor Yellow
    $customConflicts | ForEach-Object { Write-Host "  $($_.Item.Destination)" -ForegroundColor Yellow }
    if (-not $interactive) {
        throw 'Customised/unknown files would change. Re-run with -Force only after reviewing them.'
    }
    $Force = Ask-Yes 'Replace these customised/unknown files after backing them up?'
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
if ($replaceStates.Count -gt 0 -and -not $NoBackup) {
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
    [ordered]@{ name='better-spec-kit'; version=$Version; constitutionInstalled=[bool]$InstallConstitution; upgradedExistingSpecKit=[bool]($standardUpgrades.Count -gt 0); installedAt=(Get-Date).ToString('o') } |
        ConvertTo-Json | Set-Content -LiteralPath $marker -Encoding UTF8
}
if (-not $WhatIfPreference -and $specKit) {
    if (-not (Get-Command specify -ErrorAction SilentlyContinue)) {
        Write-Warning 'Bug provisioning partial-success: specify is not available; install GitHub Spec Kit, then run Better Spec Kit update.'
    } elseif (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Warning 'Bug provisioning partial-success: Node.js is not available to verify the upstream extension; Better Spec Kit remains installed.'
    } else {
        $yamlPackage = Join-Path $RepoRoot 'node_modules/yaml/package.json'
        if (-not (Test-Path -LiteralPath $yamlPackage -PathType Leaf)) {
            if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
                Write-Warning 'Bug provisioning partial-success: npm is not available to load the manifest parser; Better Spec Kit remains installed.'
            } else {
                try {
                    Invoke-Checked 'npm' @('install','--prefix',$RepoRoot,'--no-save','--package-lock=false','--ignore-scripts','--no-audit','--no-fund') $RepoRoot
                } catch {
                    Write-Warning "Bug provisioning partial-success: could not prepare the manifest parser: $_"
                }
            }
        }
        if (Test-Path -LiteralPath $yamlPackage -PathType Leaf) {
            try {
                Invoke-Checked 'node' @((Join-Path $RepoRoot 'bin/provision-bug.js'),$TargetRoot) $RepoRoot
            } catch {
                Write-Warning "Bug provisioning partial-success: $_; Better Spec Kit remains installed."
            }
        }
    }
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
