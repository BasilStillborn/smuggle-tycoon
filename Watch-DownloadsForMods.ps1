# BeamNG Downloads Folder Watcher
# Automatically moves NEW ZIP files from Downloads to BeamNG mods folder
# Only processes files downloaded AFTER the watcher starts

param([int]$interval = 30)

$beamngModsPath = "$env:LOCALAPPDATA\BeamNG\BeamNG.drive\current\mods"
$downloadsPath = "$env:USERPROFILE\Downloads"
$logFile = "$PSScriptRoot\mod-watcher.log"
$startupTime = Get-Date

function Write-Log {
    param([string]$message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $message"
    Add-Content -Path $logFile -Value $logEntry -ErrorAction SilentlyContinue
    Write-Host $logEntry
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BeamNG Mod Auto-Install Watcher" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Watching: $downloadsPath" -ForegroundColor DarkGray
Write-Host "Moving to: $beamngModsPath" -ForegroundColor DarkGray
Write-Host "Check interval: $interval seconds" -ForegroundColor DarkGray
Write-Host ""
Write-Host "IMPORTANT: Only files downloaded AFTER this watcher started will be processed." -ForegroundColor Yellow
Write-Host "Old files already in Downloads will be IGNORED." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

Write-Log "Watcher started. Only monitoring for NEW downloads after: $startupTime"

$processedFiles = @()

$initialFiles = Get-ChildItem -Path $downloadsPath -Filter "*.zip" -ErrorAction SilentlyContinue | 
    Where-Object { $_.Length -gt 100KB }

foreach ($file in $initialFiles) {
    $fileHash = "$($file.Name)_$($file.Length)_$($file.LastWriteTime.Ticks)"
    $processedFiles += $fileHash
}

Write-Log "Found $($initialFiles.Count) existing ZIP files in Downloads - these will be ignored"
Write-Host ""

while ($true) {
    try {
        $zipFiles = Get-ChildItem -Path $downloadsPath -Filter "*.zip" -ErrorAction SilentlyContinue | 
            Where-Object { $_.Length -gt 100KB }

        foreach ($file in $zipFiles) {
            $fileHash = "$($file.Name)_$($file.Length)_$($file.LastWriteTime.Ticks)"
            
            if ($processedFiles -notcontains $fileHash) {
                $fileAge = (Get-Date) - $file.LastWriteTime
                
                if ($file.LastWriteTime -gt $startupTime) {
                    if ($fileAge.TotalSeconds -gt 10) {
                        $destPath = Join-Path $beamngModsPath $file.Name
                        $counter = 1
                        while (Test-Path $destPath) {
                            $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
                            $destPath = Join-Path $beamngModsPath "$baseName`_$counter.zip"
                            $counter++
                        }
                        
                        $fileLocked = $false
                        try {
                            [System.IO.File]::OpenWrite($file.FullName).Close()
                        }
                        catch {
                            $fileLocked = $true
                        }
                        
                        if (-not $fileLocked) {
                            try {
                                Move-Item -Path $file.FullName -Destination $destPath -Force
                                Write-Log "MOVED: $($file.Name) -> $([System.IO.Path]::GetFileName($destPath))"
                                Write-Host ""
                                Write-Host "NEXT STEPS:" -ForegroundColor Green
                                Write-Host "  1. Launch BeamNG.drive" -ForegroundColor White
                                Write-Host "  2. Open Mod Manager" -ForegroundColor White
                                Write-Host "  3. Enable $($file.Name)" -ForegroundColor White
                                Write-Host ""
                                $processedFiles += $fileHash
                            }
                            catch {
                                try {
                                    Copy-Item -Path $file.FullName -Destination $destPath -Force
                                    Write-Log "COPIED: $($file.Name) (copy remains in Downloads)"
                                    $processedFiles += $fileHash
                                }
                                catch {
                                    Write-Log "FAILED: $($file.Name) - $($_.Exception.Message)"
                                }
                            }
                        }
                    }
                }
                else {
                    $processedFiles += $fileHash
                }
            }
        }
    }
    catch {
        Write-Log "ERROR: $($_.Exception.Message)"
    }
    
    Start-Sleep -Seconds $interval
}
