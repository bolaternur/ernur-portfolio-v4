@echo off
setlocal
cd /d "%~dp0"
title ERNUR PORTFOLIO V5

echo.
echo ===============================================
echo   ERNUR PORTFOLIO V5
echo   Engineering in Motion
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
        echo Install Python, or open a terminal here and run: python -m http.server 8080
        pause
        exit /b 1
    )
)

timeout /t 2 /nobreak >nul
start "" "http://localhost:8080"

echo.
echo V5 opened at http://localhost:8080
echo Keep the server window open while viewing the site.
echo.
pause
