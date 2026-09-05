@echo off
setlocal
cd /d "%~dp0"
title ERNUR V5 - PUSH 3D ASSETS

echo.
echo ==========================================================
echo   ERNUR PORTFOLIO V5 - PUSH 3D ASSETS TO GITHUB
echo ==========================================================
echo.

echo Step 1: finding/copying all four GLB files...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-assets.ps1"

echo.
echo Step 2: checking required files...
set "MISSING=0"
if not exist "assets\models\robot\DECODE Simple Bot.glb" set "MISSING=1"
if not exist "assets\models\study\3209-0001-0007.glb" set "MISSING=1"
if not exist "assets\models\fusion\Main Assembly.glb" set "MISSING=1"
if not exist "assets\models\fusion\kicker_insert.glb" set "MISSING=1"

if "%MISSING%"=="1" (
  echo.
  echo One or more GLB files are missing. Nothing was pushed.
  echo Run setup-assets.ps1 and check the paths shown there.
  pause
  exit /b 1
)

where git >nul 2>nul
if errorlevel 1 (
  echo Git was not found on this computer.
  pause
  exit /b 1
)

echo.
echo Step 3: adding GLB files...
git add "assets/models/robot/DECODE Simple Bot.glb" "assets/models/study/3209-0001-0007.glb" "assets/models/fusion/Main Assembly.glb" "assets/models/fusion/kicker_insert.glb"

git diff --cached --quiet
if not errorlevel 1 (
  echo No new 3D asset changes to commit.
  pause
  exit /b 0
)

echo.
echo Step 4: committing...
git commit -m "Add V5 portfolio GLB assets"
if errorlevel 1 (
  echo Commit failed. Check your Git configuration.
  pause
  exit /b 1
)

echo.
echo Step 5: pushing current branch...
git push
if errorlevel 1 (
  echo Push failed. Sign in to GitHub or check the remote/branch.
  pause
  exit /b 1
)

echo.
echo Done. All four 3D assets are in GitHub.
pause
