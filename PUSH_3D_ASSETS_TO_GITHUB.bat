@echo off
setlocal
cd /d "%~dp0"
title ERNUR V4 / PUSH 3D ASSETS

echo.
echo ===============================================
echo   ERNUR V4 / INSTALL + PUSH 3D ASSETS
 echo ===============================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-assets.ps1"

where git >nul 2>nul
if not %errorlevel%==0 (
  echo Git is not installed or not available in PATH.
  echo The assets were still copied locally if found.
  pause
  exit /b 1
)

if not exist ".git" (
  echo This folder is not a Git clone.
  echo Clone the repository first, then run this file from the cloned folder.
  pause
  exit /b 1
)

git add "assets/models/robot/DECODE Simple Bot.glb" 2>nul
git add "assets/models/keyboard/lowprofilemechanicalkeyboard.obj" 2>nul
git add "assets/models/keyboard/lowprofilemechanicalkeyboard.mtl" 2>nul

git diff --cached --quiet
if %errorlevel%==0 (
  echo.
  echo No new 3D assets to commit.
  pause
  exit /b 0
)

git commit -m "Add authentic robot and keyboard 3D assets"
if not %errorlevel%==0 (
  echo Commit failed. Check your Git configuration.
  pause
  exit /b 1
)

git push origin main
if not %errorlevel%==0 (
  echo Push failed. You may need to sign in to GitHub in Git Credential Manager.
  pause
  exit /b 1
)

echo.
echo 3D assets are now in GitHub.
echo.
pause
