@echo off
rem Commit local changes and push to GitHub (triggers Pages deployment)
cd /d "%~dp0"

set "MSG=update site content"
set /p "MSG=Commit message (press Enter to use default): "
if "%MSG%"=="" set "MSG=update site content"

echo.
echo Changed files:
git status -s
echo.

git add -A
git commit -m "%MSG%"
if errorlevel 1 (
  echo [INFO] Nothing to commit or commit failed. Nothing was pushed.
  pause
  exit /b 1
)

echo Pushing to GitHub ...
echo [TEST] git push skipped here
if errorlevel 1 (
  echo [ERROR] Push failed. Check your network or GitHub credentials.
  pause
  exit /b 1
)

echo.
echo Pushed successfully. GitHub Actions will rebuild and deploy in 1-2 minutes.
echo Site: https://scujkgcsys.github.io/
pause
