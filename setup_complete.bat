@echo off
echo ========================================
echo MetaBuilder Complete Setup Script
echo ========================================
echo.

echo [Step 1/7] Environment Check...
python -c "import sys; assert sys.version_info >= (3,11), 'Need Python 3.11+'; print('Python: OK')"
if errorlevel 1 (
    echo ERROR: Python 3.11+ required
    pause
    exit /b 1
)

node -v
if errorlevel 1 (
    echo ERROR: Node.js not found
    pause
    exit /b 1
)

echo.
echo [Step 2/7] Enabling pnpm via corepack...
call corepack enable
call corepack prepare pnpm@9.12.0 --activate

echo.
echo [Step 3/7] Installing Node dependencies...
call pnpm install
if errorlevel 1 (
    echo WARNING: pnpm install had issues, continuing...
)

echo.
echo [Step 4/7] Building packages...
call pnpm -r build
if errorlevel 1 (
    echo WARNING: Some packages failed to build, continuing...
)

echo.
echo [Step 5/7] Setting up Python virtual environment...
cd apps\api
if not exist .venv (
    python -m venv .venv
)
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip --quiet
python -m pip install -r requirements.txt --quiet
cd ..\..

echo.
echo [Step 6/7] Generating code from PSIR samples...
node labs\app-factory\cli.js --file docs\samples\checkout.psir
if errorlevel 1 (
    echo WARNING: Code generation had issues, continuing...
)

echo.
echo [Step 7/7] Running tests...
echo Running Node.js tests...
call pnpm -r test
echo.
echo Running Python tests...
call apps\api\.venv\Scripts\python.exe -m pytest apps\api\app\tests -q

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Start API:  cd apps\api ^&^& .venv\Scripts\activate ^&^& uvicorn app.main:app --reload
echo   2. Start Web:  cd apps\web ^&^& pnpm dev
echo   3. Or use Docker: docker compose up --build
echo.
pause

