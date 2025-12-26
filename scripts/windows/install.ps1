# QR-Health Windows Native Installation Script
# Run as Administrator

param(
    [switch]$SkipDependencies,
    [switch]$DevMode
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  QR-Health Native Windows Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin -and -not $SkipDependencies) {
    Write-Host "WARNING: Some installations may require Administrator privileges" -ForegroundColor Yellow
}

if (-not $SkipDependencies) {
    Write-Host "[1/4] Installing Dependencies..." -ForegroundColor Yellow
    
    # Check Node.js
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Host "  Installing Node.js LTS..." -ForegroundColor White
        winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
    } else {
        Write-Host "  Node.js: $(node --version)" -ForegroundColor Green
    }
    
    # Check Redis (Memurai for Windows)
    $memuraiPath = "C:\Program Files\Memurai\memurai.exe"
    if (-not (Test-Path $memuraiPath)) {
        Write-Host "  Redis not found. Please install Memurai from https://www.memurai.com/" -ForegroundColor Yellow
        Write-Host "  Or use: winget install Memurai.MemuraiDeveloper" -ForegroundColor Cyan
    } else {
        Write-Host "  Redis (Memurai): Installed" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "[2/4] Installing Frontend Dependencies..." -ForegroundColor Yellow
Set-Location "$rootPath\frontend"
if (Test-Path "package.json") {
    npm install
    Write-Host "  Frontend dependencies installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "[3/4] Installing Backend Dependencies..." -ForegroundColor Yellow
Set-Location "$rootPath\backend"
if (Test-Path "package.json") {
    npm install
    Write-Host "  Backend dependencies installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "[4/4] Creating Environment Files..." -ForegroundColor Yellow

# Create .env template if not exists
$envFrontend = "$rootPath\frontend\.env.local"
if (-not (Test-Path $envFrontend)) {
    @"
# QR-Health Frontend Environment
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001
"@ | Out-File -FilePath $envFrontend -Encoding UTF8
    Write-Host "  Created frontend/.env.local (update with your values)" -ForegroundColor Yellow
}

$envBackend = "$rootPath\backend\.env"
if (-not (Test-Path $envBackend)) {
    @"
# QR-Health Backend Environment
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_here
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
REDIS_URL=redis://localhost:6379
"@ | Out-File -FilePath $envBackend -Encoding UTF8
    Write-Host "  Created backend/.env (update with your values)" -ForegroundColor Yellow
}

Set-Location $rootPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Update environment files with your credentials" -ForegroundColor Cyan
Write-Host "  2. Start Redis: Start-Service memurai" -ForegroundColor Cyan
Write-Host "  3. Run: .\scripts\windows\start.ps1" -ForegroundColor Cyan
