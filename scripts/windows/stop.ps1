# QR-Health Windows Native Stop Script
# Stops all services

param(
    [switch]$IncludeRedis,
    [switch]$UsePM2
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Stopping QR-Health Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($UsePM2) {
    Write-Host "[PM2] Stopping services..." -ForegroundColor Yellow
    pm2 stop all
    pm2 delete all
    Write-Host "  PM2 services stopped" -ForegroundColor Green
} else {
    Write-Host "[NODE] Stopping Node.js processes..." -ForegroundColor Yellow
    
    # Find and stop node processes on ports 3000 and 3001
    $ports = @(3000, 3001)
    foreach ($port in $ports) {
        $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connection) {
            $processId = $connection.OwningProcess
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "  Stopping process on port $port (PID: $processId)" -ForegroundColor Yellow
                Stop-Process -Id $processId -Force
                Write-Host "  Port $port: Stopped" -ForegroundColor Green
            }
        } else {
            Write-Host "  Port $port: Not in use" -ForegroundColor Gray
        }
    }
}

if ($IncludeRedis) {
    Write-Host ""
    Write-Host "[REDIS] Stopping Redis..." -ForegroundColor Yellow
    Stop-Service memurai -ErrorAction SilentlyContinue
    Write-Host "  Redis: Stopped" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  All Services Stopped" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
