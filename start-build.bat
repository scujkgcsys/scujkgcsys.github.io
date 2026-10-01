@echo off
rem Build the static site into dist\index.html (single file, no npm required)
cd /d "%~dp0"

set "NODEEXE=node"
where node >nul 2>nul || set "NODEEXE=C:\Users\11876\.workbuddy\binaries\node\versions\22.22.2-3\node.exe"

if "%NODEEXE%"=="node" goto RUN
if not exist "%NODEEXE%" (
  echo [ERROR] Node.js not found. Install Node.js LTS from https://nodejs.org
  pause
  exit /b 1
)

:RUN
echo [1/2] Building with Vite ...
"%NODEEXE%" node_modules\vite\bin\vite.js build
if errorlevel 1 (
  echo [ERROR] Build failed. See messages above.
  pause
  exit /b 1
)

echo [2/2] Inlining assets into a single file ...
"%NODEEXE%" scripts\inline-dist.mjs
if errorlevel 1 (
  echo [ERROR] Inline step failed.
  pause
  exit /b 1
)

echo.
echo Done. Output: dist\index.html
echo You can double-click dist\index.html to preview it offline.
pause
