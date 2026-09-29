@echo off
rem Health Engineering Lab - local content admin launcher
cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel%==0 (
  node scripts\cms-server.mjs
) else (
  if exist "C:\Users\11876\.workbuddy\binaries\node\versions\22.22.2-3\node.exe" (
    "C:\Users\11876\.workbuddy\binaries\node\versions\22.22.2-3\node.exe" scripts\cms-server.mjs
  ) else (
    echo [ERROR] Node.js not found. Please install Node.js LTS from https://nodejs.org
    pause
    exit /b 1
  )
)

echo.
echo Server stopped.
pause
