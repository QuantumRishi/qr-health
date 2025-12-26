# QR-Health Windows Native Start Script
# Starts both frontend and backend services

param(
    [switch]$FrontendOnly,
    [switch]$BackendOnly,
    [switch]$UsePM2
)

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting QR-Health Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# Check Redis
Write-Host "[CHECK] Redis Status..." -ForegroundColor Yellow
$redis = Get-Service -Name "memurai" -ErrorAction SilentlyContinue
if ($redis -and $redis.Status -eq "Running") {
    Write-Host "  Redis: Running" -ForegroundColor Green
} else {
    Write-Host "  Redis: Not running. Starting..." -ForegroundColor Yellow
    try {
        Start-Service memurai -ErrorAction SilentlyContinue
        Write-Host "  Redis: Started" -ForegroundColor Green
    } catch {
        Write-Host "  Redis: Could not start (ensure Memurai is installed)" -ForegroundColor Red
    }
}

if ($UsePM2) {
    # Use PM2 for process management
    Write-Host ""
    Write-Host "[PM2] Starting services with PM2..." -ForegroundColor Yellow
    
    $pm2 = Get-Command pm2 -ErrorAction SilentlyContinue
    if (-not $pm2) {
        Write-Host "Installing PM2..." -ForegroundColor Yellow
        npm install -g pm2
    }
    
    pm2 start "$rootPath\ecosystem.config.js"
    pm2 status
    
} else {
    # Start services in separate PowerShell windows
    
    if (-not $FrontendOnly) {
        Write-Host ""
        Write-Host "[BACKEND] Starting backend on port 3001..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\backend'; npm start"
        Write-Host "  Backend: Started in new window" -ForegroundColor Green
    }
    
    if (-not $BackendOnly) {
        Write-Host ""
        Write-Host "[FRONTEND] Starting frontend on port 3000..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\frontend'; npm run dev"
        Write-Host "  Frontend: Started in new window" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Services Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access:" -ForegroundColor White
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "  Redis:    localhost:6379" -ForegroundColor Cyan
