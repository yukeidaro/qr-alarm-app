<#
.SYNOPSIS
    QR Alarm App — Daily Heartbeat Orchestrator
    Runs at 06:00 JST daily via Task Scheduler.
    Checks project health, identifies remaining tasks, and syncs to Microsoft To Do.

.DESCRIPTION
    1. TypeScript compilation check
    2. Expo doctor check
    3. Remaining task inventory
    4. Sync blockers/actions to Microsoft To Do
    5. Log results

.NOTES
    Schedule: schtasks /create /tn "QRAlarm-Heartbeat" /tr "pwsh -File <this-script>" /sc daily /st 06:00
#>

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Continue"

# ─── Config ───
$ProjectRoot = "C:\Users\yuasano\OneDrive - Microsoft\Documents\02 Claude\12-qr-alarm-app"
$ClaudeRoot  = "C:\Users\yuasano\OneDrive - Microsoft\Documents\02 Claude"
$TodoScript  = Join-Path $ClaudeRoot "tasks\todo_api.ps1"
$LogDir      = Join-Path $ProjectRoot "scripts\logs"
$LogFile     = Join-Path $LogDir "heartbeat-$(Get-Date -Format 'yyyy-MM-dd').log"

if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$timestamp] [$Level] $Message"
    Add-Content -Path $LogFile -Value $line -Encoding UTF8
    Write-Host $line
}

function Add-TodoTask {
    param([string]$Title, [string]$Note = "", [string]$Due = "")
    try {
        $params = @{ Action = "add"; Title = $Title; Project = "ScanAlarm" }
        if ($Note) { $params.Note = $Note }
        if ($Due)  { $params.Due  = $Due  }
        & $TodoScript @params 2>&1 | Out-Null
        Write-Log "To Do added: $Title"
    } catch {
        Write-Log "To Do add failed: $Title — $_" "WARN"
    }
}

# ─── Start ───
Write-Log "========== Daily Heartbeat Start =========="
Write-Log "Project: $ProjectRoot"

$report = @{
    date       = Get-Date -Format "yyyy-MM-dd"
    tsErrors   = @()
    expoDoctor = "unknown"
    tasks      = @()
    blockers   = @()
    actions    = @()
}

# ─── 1. TypeScript Compilation Check ───
Write-Log "Step 1: TypeScript compilation check..."
try {
    Push-Location $ProjectRoot
    $tsOutput = npx tsc --noEmit 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0) {
        Write-Log "TypeScript: PASS (no errors)"
        $report.tsErrors = @()
    } else {
        $errors = ($tsOutput -split "`n") | Where-Object { $_ -match "error TS" }
        $report.tsErrors = $errors
        Write-Log "TypeScript: FAIL ($($errors.Count) errors)" "ERROR"
        foreach ($err in $errors) {
            Write-Log "  $err" "ERROR"
        }
        $report.actions += "Fix TypeScript errors ($($errors.Count) found)"
    }
} catch {
    Write-Log "TypeScript check failed: $_" "ERROR"
} finally {
    Pop-Location
}

# ─── 2. Expo Doctor Check ───
Write-Log "Step 2: Expo doctor check..."
try {
    Push-Location $ProjectRoot
    $expoOutput = npx expo-doctor 2>&1 | Out-String
    if ($expoOutput -match "No issues detected") {
        $report.expoDoctor = "PASS"
        Write-Log "Expo Doctor: PASS"
    } else {
        $report.expoDoctor = "ISSUES"
        Write-Log "Expo Doctor: Issues found" "WARN"
        Write-Log "  $expoOutput" "WARN"
        $report.actions += "Review Expo Doctor warnings"
    }
} catch {
    Write-Log "Expo doctor failed: $_" "ERROR"
} finally {
    Pop-Location
}

# ─── 3. Task Inventory ───
Write-Log "Step 3: Checking remaining tasks..."

# Day-to-task mapping for To Do notes
$dayGuide = @{
    "apple-dev-pay"      = "Day 1 (4/1)"
    "google-play-register" = "Day 2 (4/2)"
    "admob-account"      = "Day 3 (4/3)"
    "app-store-assets"   = "Day 4 (4/4)"
    "testflight-submit"  = "Day 5-6 (4/5-6)"
    "play-store-submit"  = "Day 5-6 (4/5-6)"
    "final-verification" = "Day 7 (4/8)"
}

# Define all Phase 8 tasks with verification logic
$taskChecks = @(
    @{
        Id          = "git-init"
        Title       = "Git repo initialization"
        Check       = { Test-Path (Join-Path $ProjectRoot ".git") }
        ManualOnly  = $false
    },
    @{
        Id          = "fix-ts-error"
        Title       = "Fix TypeScript FileSystem error"
        Check       = {
            Push-Location $ProjectRoot
            $result = npx tsc --noEmit 2>&1 | Out-String
            Pop-Location
            return $LASTEXITCODE -eq 0
        }
        ManualOnly  = $false
    },
    @{
        Id          = "apple-dev-pay"
        Title       = "Apple Developer Program 支払い"
        Check       = { $false } # Manual — check via heartbeat confirmation
        ManualOnly  = $true
    },
    @{
        Id          = "admob-account"
        Title       = "AdMob account + real Ad Unit IDs"
        Check       = {
            $content = Get-Content (Join-Path $ProjectRoot "services\adService.ts") -Raw
            return $content -notmatch "ca-app-pub-REPLACE"
        }
        ManualOnly  = $true
    },
    @{
        Id          = "privacy-policy"
        Title       = "Create privacy policy"
        Check       = {
            # Check if privacy policy file exists or URL is configured
            $hasFile = (Test-Path (Join-Path $ProjectRoot "privacy-policy.html")) -or
                       (Test-Path (Join-Path $ProjectRoot "privacy-policy.md"))
            return $hasFile
        }
        ManualOnly  = $false
    },
    @{
        Id          = "app-store-assets"
        Title       = "App Store screenshots & metadata"
        Check       = {
            Test-Path (Join-Path $ProjectRoot "assets\screenshots")
        }
        ManualOnly  = $true
    },
    @{
        Id          = "eas-build-ios"
        Title       = "EAS Build for iOS production"
        Check       = {
            # Check if a production iOS build exists
            Push-Location $ProjectRoot
            $builds = eas build:list --platform ios --status finished 2>&1 | Out-String
            Pop-Location
            return $builds -match "production"
        }
        ManualOnly  = $false
    },
    @{
        Id          = "testflight-submit"
        Title       = "Submit to TestFlight"
        Check       = { $false } # Manual verification needed
        ManualOnly  = $true
    },
    @{
        Id          = "google-play-register"
        Title       = "Google Play Console registration"
        Check       = { $false } # Manual verification needed
        ManualOnly  = $true
    },
    @{
        Id          = "eas-build-android"
        Title       = "EAS Build for Android production"
        Check       = {
            Push-Location $ProjectRoot
            $builds = eas build:list --platform android --status finished 2>&1 | Out-String
            Pop-Location
            return $builds -match "production"
        }
        ManualOnly  = $false
    },
    @{
        Id          = "play-store-submit"
        Title       = "Submit to Google Play Internal Testing"
        Check       = { $false } # Manual verification needed
        ManualOnly  = $true
    },
    @{
        Id          = "eas-update-setup"
        Title       = "Configure EAS Update for OTA"
        Check       = {
            $appJson = Get-Content (Join-Path $ProjectRoot "app.json") -Raw | ConvertFrom-Json
            return $null -ne $appJson.expo.updates
        }
        ManualOnly  = $false
    },
    @{
        Id          = "final-verification"
        Title       = "End-to-end verification on devices"
        Check       = { $false } # Manual
        ManualOnly  = $true
    }
)

$completedTasks = @()
$remainingTasks = @()
$blockerTasks   = @()

foreach ($task in $taskChecks) {
    try {
        $isDone = & $task.Check
    } catch {
        $isDone = $false
    }

    if ($isDone) {
        $completedTasks += $task.Title
        Write-Log "  [DONE] $($task.Title)"
    } else {
        $remainingTasks += $task
        Write-Log "  [TODO] $($task.Title)"
        if ($task.ManualOnly) {
            $blockerTasks += $task.Title
        }
    }
}

$report.tasks = $remainingTasks | ForEach-Object { $_.Title }
$report.blockers = $blockerTasks

Write-Log "Completed: $($completedTasks.Count) / $($taskChecks.Count)"
Write-Log "Remaining: $($remainingTasks.Count)"
Write-Log "Manual blockers: $($blockerTasks.Count)"

# ─── 4. Sync to Microsoft To Do ───
Write-Log "Step 4: Syncing to Microsoft To Do..."

# Get existing tasks to avoid duplicates
$existingTasks = @()
try {
    $listOutput = & $TodoScript -Action list -Project "ScanAlarm" 2>&1 | Out-String
    $existingTasks = ($listOutput -split "`n") | Where-Object { $_ -match "\[ScanAlarm\]" }
} catch {
    Write-Log "Could not fetch existing To Do tasks: $_" "WARN"
}

function Test-TaskExists {
    param([string]$Title)
    foreach ($t in $existingTasks) {
        if ($t -match [regex]::Escape($Title)) { return $true }
    }
    return $false
}

# Calculate sprint day and deadline
$sprintStart = [datetime]"2026-04-01"
$sprintEnd   = [datetime]"2026-04-08"
$today       = Get-Date
$sprintDay   = [math]::Max(1, [math]::Ceiling(($today - $sprintStart).TotalDays))
$daysLeft    = [math]::Max(0, [math]::Ceiling(($sprintEnd - $today).TotalDays))

# Add daily summary task (always new — includes date context)
$summaryTitle = "[ScanAlarm] Day $sprintDay/$daysLeft days left - $($remainingTasks.Count) tasks remaining"
$summaryNote  = @"
== QR Alarm Sprint Heartbeat ==
Date: $(Get-Date -Format 'yyyy-MM-dd (ddd)')
Sprint Day: $sprintDay / 7
Days Left: $daysLeft

-- Completed ($($completedTasks.Count)) --
$($completedTasks | ForEach-Object { "  * $_" } | Out-String)

-- Remaining ($($remainingTasks.Count)) --
$($remainingTasks | ForEach-Object { "  * $($_.Title)" + $(if ($_.ManualOnly) { " [Yu action required]" } else { " [auto-fixable]" }) } | Out-String)

-- TypeScript --
$(if ($report.tsErrors.Count -eq 0) { "PASS" } else { "FAIL: $($report.tsErrors.Count) errors" })

-- Expo Doctor --
$($report.expoDoctor)
"@

Add-TodoTask -Title $summaryTitle -Note $summaryNote -Due (Get-Date -Format "yyyy-MM-dd")

# Add individual action items for manual tasks that aren't done (skip if already exists)
foreach ($task in $remainingTasks) {
    if ($task.ManualOnly) {
        $taskTitle = "[ScanAlarm] $($task.Title)"
        if (Test-TaskExists -Title $task.Title) {
            Write-Log "  Skipped (already exists): $taskTitle"
            continue
        }
        $dueDate = switch ($task.Id) {
            "apple-dev-pay"       { "2026-04-01" }
            "google-play-register"{ "2026-04-02" }
            "admob-account"       { "2026-04-03" }
            "app-store-assets"    { "2026-04-04" }
            "testflight-submit"   { "2026-04-06" }
            "play-store-submit"   { "2026-04-07" }
            "final-verification"  { "2026-04-08" }
            default               { "" }
        }
        # Add guide reference in note
        $guideDay = $dayGuide[$task.Id]
        $taskNote = ""
        if ($guideDay) {
            $taskNote = "詳細手順: output\yu-action-guide.md の $guideDay を参照"
        }
        Add-TodoTask -Title $taskTitle -Note $taskNote -Due $dueDate
    }
}

# ─── 5. Summary ───
Write-Log "========== Heartbeat Summary =========="
Write-Log "Sprint Day: $sprintDay / 7 ($daysLeft days left)"
Write-Log "Tasks: $($completedTasks.Count) done, $($remainingTasks.Count) remaining"
Write-Log "Manual blockers: $($blockerTasks.Count)"
if ($report.tsErrors.Count -gt 0) {
    Write-Log "ACTION NEEDED: Fix $($report.tsErrors.Count) TypeScript errors" "WARN"
}
Write-Log "========== Heartbeat End =========="

# Clean up old logs (keep 14 days)
Get-ChildItem $LogDir -Filter "heartbeat-*.log" |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-14) } |
    Remove-Item -Force
