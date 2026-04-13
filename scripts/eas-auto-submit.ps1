<#
  EAS Build Monitor & Auto-Submit
  Polls build status and auto-submits to App Store Connect / Google Play when done.
#>
param(
  [string]$iOSBuildId = "838a4de2-8211-49bf-8e21-b962cd7e9ec3",
  [string]$androidBuildId = "061965c6-2afd-4c9e-9b59-98db36494997",
  [int]$pollIntervalSec = 120
)

Set-Location "C:\Users\yuasano\OneDrive - Microsoft\Documents\02 Claude\12-qr-alarm-app"
$logFile = "C:\Users\yuasano\OneDrive - Microsoft\Documents\02 Claude\12-qr-alarm-app\eas-submit-log.txt"

function Write-Log($msg) {
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $line = "[$ts] $msg"
  Write-Host $line
  Add-Content -Path $logFile -Value $line
}

function Get-BuildStatus($buildId) {
  $output = npx eas-cli build:list --limit 10 --non-interactive 2>&1 | Out-String
  if ($output -match "(?s)$buildId.*?Status\s+(\S+)") {
    return $Matches[1]
  }
  return "unknown"
}

Write-Log "=== EAS Build Monitor Started ==="
Write-Log "iOS Build: $iOSBuildId"
Write-Log "Android Build: $androidBuildId"

$iosSubmitted = $false
$androidSubmitted = $false

while (-not ($iosSubmitted -and $androidSubmitted)) {
  $iosStatus = Get-BuildStatus $iOSBuildId
  $androidStatus = Get-BuildStatus $androidBuildId
  Write-Log "iOS: $iosStatus | Android: $androidStatus"

  # Check for failures
  if ($iosStatus -eq "errored" -or $iosStatus -eq "canceled") {
    Write-Log "ERROR: iOS build failed ($iosStatus). Check dashboard."
    $iosSubmitted = $true
  }
  if ($androidStatus -eq "errored" -or $androidStatus -eq "canceled") {
    Write-Log "ERROR: Android build failed ($androidStatus). Check dashboard."
    $androidSubmitted = $true
  }

  # Submit iOS when finished
  if ($iosStatus -eq "finished" -and -not $iosSubmitted) {
    Write-Log "iOS build finished! Submitting to App Store Connect..."
    $result = npx eas-cli submit --platform ios --id $iOSBuildId --non-interactive 2>&1 | Out-String
    Write-Log "iOS submit result: $result"
    $iosSubmitted = $true
  }

  # Submit Android when finished
  if ($androidStatus -eq "finished" -and -not $androidSubmitted) {
    Write-Log "Android build finished! Submitting to Google Play (internal track)..."
    $result = npx eas-cli submit --platform android --id $androidBuildId --non-interactive 2>&1 | Out-String
    Write-Log "Android submit result: $result"
    $androidSubmitted = $true
  }

  if (-not ($iosSubmitted -and $androidSubmitted)) {
    Write-Log "Waiting ${pollIntervalSec}s before next check..."
    Start-Sleep -Seconds $pollIntervalSec
  }
}

Write-Log "=== Monitor Complete ==="
