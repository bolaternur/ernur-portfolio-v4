@echo off
setlocal
cd /d "%~dp0"
title ERNUR PORTFOLIO V4

echo.
echo ===============================================
echo   ERNUR PORTFOLIO V4
echo   Keyboard ^> Code ^> Robot ^> Motion
echo ===============================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-assets.ps1"

echo.
echo Starting local server on http://localhost:8080
echo.

where py >nul 2>nul
if %errorlevel%==0 (
    start "ERNUR SERVER" /min py -m http.server 8080
) else (
    where python >nul 2>nul
    if %errorlevel%==0 (
        start "ERNUR SERVER" /min python -m http.server 8080
    ) else (
        echo Python was not found.
        echo Install Python and run this file again.
        pause
        exit /b 1
    )
)

timeout /t 2 /nobreak >nul
start "" "http://localhost:8080"

echo.
echo Site opened in your browser.
echo You can keep this window open while using localhost.
echo.
pause
