# MetaBuilder Complete Setup Script (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MetaBuilder Complete Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Environment Check
Write-Host "[Step 1/7] Environment Check..." -ForegroundColor Yellow
try {
    $pythonVersion = python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}')"
    Write-Host "  Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Python not found or version too old" -ForegroundColor Red
    exit 1
}

try {
    $nodeVersion = node -v
    Write-Host "  Node: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Node.js not found" -ForegroundColor Red
    exit 1
}

# Step 2: Enable pnpm
Write-Host ""
Write-Host "[Step 2/7] Enabling pnpm via corepack..." -ForegroundColor Yellow
try {
    corepack enable 2>&1 | Out-Null
    corepack prepare pnpm@9.12.0 --activate 2>&1 | Out-Null
    $pnpmVersion = pnpm --version
    Write-Host "  pnpm: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "  WARNING: pnpm setup had issues" -ForegroundColor Red
}

# Step 3: Install Node dependencies
Write-Host ""
Write-Host "[Step 3/7] Installing Node dependencies (this may take a few minutes)..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "  WARNING: Some dependencies may have failed" -ForegroundColor Red
}

# Step 4: Build packages
Write-Host ""
Write-Host "[Step 4/7] Building packages..." -ForegroundColor Yellow
pnpm -r build
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Packages built successfully" -ForegroundColor Green
} else {
    Write-Host "  WARNING: Some packages may have failed to build" -ForegroundColor Red
}

# Step 5: Python virtual environment
Write-Host ""
Write-Host "[Step 5/7] Setting up Python virtual environment..." -ForegroundColor Yellow
Push-Location apps\api
if (-not (Test-Path .venv)) {
    python -m venv .venv
}
& .venv\Scripts\python.exe -m pip install --upgrade pip --quiet
& .venv\Scripts\python.exe -m pip install -r requirements.txt --quiet
Write-Host "  Python dependencies installed" -ForegroundColor Green
Pop-Location

# Step 6: Generate code
Write-Host ""
Write-Host "[Step 6/7] Generating code from PSIR samples..." -ForegroundColor Yellow
node labs\app-factory\cli.js --file docs\samples\checkout.psir
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Code generated successfully" -ForegroundColor Green
} else {
    Write-Host "  WARNING: Code generation may have issues" -ForegroundColor Red
}

# Step 7: Run tests
Write-Host ""
Write-Host "[Step 7/7] Running tests..." -ForegroundColor Yellow
Write-Host "  Running Node.js tests..." -ForegroundColor Cyan
pnpm -r test
Write-Host ""
Write-Host "  Running Python tests..." -ForegroundColor Cyan
& apps\api\.venv\Scripts\python.exe -m pytest apps\api\app\tests -v

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start API:  cd apps\api; .\.venv\Scripts\activate; uvicorn app.main:app --reload"
Write-Host "  2. Start Web:  cd apps\web; pnpm dev"
Write-Host "  3. Or use Docker: docker compose up --build"
Write-Host ""

