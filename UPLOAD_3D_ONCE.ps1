$ErrorActionPreference = 'Stop'

Write-Host "ERNUR PORTFOLIO - FINAL 3D PUBLISH" -ForegroundColor Cyan
Write-Host "This helper uploads the four original GLB files to the final GitHub repository once." -ForegroundColor DarkGray

$repo = 'https://github.com/bolaternur/ernur-portfolio-v4.git'
$branch = 'main'
$homeDir = [Environment]::GetFolderPath('UserProfile')
$roots = @(
    (Join-Path $homeDir 'Downloads'),
    (Join-Path $homeDir 'Desktop'),
    (Join-Path $homeDir 'Documents')
) | Where-Object { Test-Path $_ }

function Find-ExactFile([string[]]$Names) {
    foreach ($root in $roots) {
        foreach ($name in $Names) {
            $direct = Join-Path $root $name
            if (Test-Path $direct) { return (Resolve-Path $direct).Path }
        }
    }
    foreach ($root in $roots) {
        foreach ($name in $Names) {
            $hit = Get-ChildItem -Path $root -File -Recurse -Filter $name -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($hit) { return $hit.FullName }
        }
    }
    return $null
}

$models = [ordered]@{
    '3209-0001-0007.glb' = Find-ExactFile @('3209-0001-0007.glb')
    'DECODE Simple Bot.glb' = Find-ExactFile @('DECODE Simple Bot(1).glb','DECODE Simple Bot.glb')
    'Main Assembly.glb' = Find-ExactFile @('Main Assembly.glb')
    'kicker_insert.glb' = Find-ExactFile @('kicker_insert.glb')
}

$missing = @($models.GetEnumerator() | Where-Object { -not $_.Value })
if ($missing.Count -gt 0) {
    Write-Host "`nMissing files:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host " - $($_.Key)" -ForegroundColor Red }
    Write-Host "Put the missing GLB files in Downloads, Desktop, or Documents and run this file again."
    exit 1
}

Write-Host "`nFound all four models:" -ForegroundColor Green
$models.GetEnumerator() | ForEach-Object { Write-Host " [OK] $($_.Key) -> $($_.Value)" }

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

$temp = Join-Path $env:TEMP 'ernur-portfolio-final-publish'
if (Test-Path $temp) { Remove-Item $temp -Recurse -Force }

Write-Host "`nCloning final repository..." -ForegroundColor Cyan
git clone --branch $branch --single-branch $repo $temp
if ($LASTEXITCODE -ne 0) { throw 'git clone failed' }

Push-Location $temp
try {
    git config user.name 'bolaternur'
    git config user.email 'bolaternur@users.noreply.github.com'
    git config http.postBuffer 524288000

    New-Item -ItemType Directory -Force -Path 'source-assets' | Out-Null
    Copy-Item $models['3209-0001-0007.glb'] 'source-assets/3209-0001-0007.glb' -Force
    Copy-Item $models['DECODE Simple Bot.glb'] 'source-assets/DECODE Simple Bot.glb' -Force
    Copy-Item $models['Main Assembly.glb'] 'source-assets/Main Assembly.glb' -Force
    Copy-Item $models['kicker_insert.glb'] 'source-assets/kicker_insert.glb' -Force

    # This helper is intentionally one-time only and removes itself from the public repo.
    if (Test-Path 'UPLOAD_3D_ONCE.ps1') { git rm -f 'UPLOAD_3D_ONCE.ps1' | Out-Null }

    git add 'source-assets/3209-0001-0007.glb' 'source-assets/DECODE Simple Bot.glb' 'source-assets/Main Assembly.glb' 'source-assets/kicker_insert.glb'
    git commit -m 'Add permanent final 3D source assets'
    if ($LASTEXITCODE -ne 0) { throw 'git commit failed' }

    Write-Host "`nUploading ~84 MB of original 3D data. This can take several minutes." -ForegroundColor Yellow
    Write-Host "GitHub may warn that 3209 is larger than 50 MB; it is still below GitHub's 100 MB per-file hard limit." -ForegroundColor DarkGray
    git push origin $branch
    if ($LASTEXITCODE -ne 0) { throw 'git push failed. If GitHub asks you to sign in, complete the browser login and run the helper again.' }

    $localSha = (git rev-parse HEAD).Trim()
    $remoteLine = (git ls-remote origin "refs/heads/$branch").Trim()
    if (-not $remoteLine.StartsWith($localSha)) { throw 'Remote verification failed.' }

    Write-Host "`nSUCCESS" -ForegroundColor Green
    Write-Host "All four original GLB files are now stored in GitHub." -ForegroundColor Green
    Write-Host "The GitHub Pages workflow will create compressed production copies automatically." -ForegroundColor Green
    Write-Host "You can now safely delete the local portfolio ZIPs, copied project folders, and these four GLB files from Downloads if you want." -ForegroundColor Green
    Write-Host "Repository: https://github.com/bolaternur/ernur-portfolio-v4" -ForegroundColor Cyan
    Write-Host "Portfolio URL after Pages finishes: https://bolaternur.github.io/ernur-portfolio-v4/" -ForegroundColor Cyan
}
finally {
    Pop-Location
}
