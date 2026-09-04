$ErrorActionPreference = 'SilentlyContinue'

$Repo = Split-Path -Parent $MyInvocation.MyCommand.Path
$ModelRoot = Join-Path $Repo 'assets\models'
$RobotDir = Join-Path $ModelRoot 'robot'
$KeyboardDir = Join-Path $ModelRoot 'keyboard'

New-Item -ItemType Directory -Force -Path $RobotDir | Out-Null
New-Item -ItemType Directory -Force -Path $KeyboardDir | Out-Null

$HomeDir = [Environment]::GetFolderPath('UserProfile')
$SearchRoots = @(
  (Join-Path $HomeDir 'Downloads'),
  (Join-Path $HomeDir 'Desktop'),
  (Split-Path -Parent $Repo)
) | Where-Object { Test-Path $_ } | Select-Object -Unique

function Find-FirstFile {
  param([string[]]$Names)
  foreach ($root in $SearchRoots) {
    foreach ($name in $Names) {
      $direct = Join-Path $root $name
      if (Test-Path $direct) { return Get-Item $direct }
    }
    foreach ($name in $Names) {
      $match = Get-ChildItem -Path $root -Filter $name -File -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
      if ($match) { return $match }
    }
  }
  return $null
}

Write-Host ''
Write-Host 'ERNUR V4 / ASSET SETUP' -ForegroundColor White
Write-Host 'Searching Downloads/Desktop for your uploaded 3D files...' -ForegroundColor DarkGray
Write-Host ''

$robotTarget = Join-Path $RobotDir 'DECODE Simple Bot.glb'
if (-not (Test-Path $robotTarget)) {
  $robot = Find-FirstFile @('DECODE Simple Bot.glb','ernur-simple-bot.glb')
  if ($robot) {
    Copy-Item $robot.FullName $robotTarget -Force
    Write-Host ('[OK] Robot: ' + $robot.FullName) -ForegroundColor Green
  } else {
    Write-Host '[!] Robot GLB not found automatically.' -ForegroundColor Yellow
  }
} else {
  Write-Host '[OK] Robot already installed.' -ForegroundColor Green
}

$objTarget = Join-Path $KeyboardDir 'lowprofilemechanicalkeyboard.obj'
$mtlTarget = Join-Path $KeyboardDir 'lowprofilemechanicalkeyboard.mtl'

if (-not (Test-Path $objTarget)) {
  $obj = Find-FirstFile @('lowprofilemechanicalkeyboard.obj')
  if ($obj) {
    Copy-Item $obj.FullName $objTarget -Force
    Write-Host ('[OK] Keyboard OBJ: ' + $obj.FullName) -ForegroundColor Green
  } else {
    Write-Host '[!] Keyboard OBJ not found automatically.' -ForegroundColor Yellow
  }
} else {
  Write-Host '[OK] Keyboard OBJ already installed.' -ForegroundColor Green
}

if (-not (Test-Path $mtlTarget)) {
  $mtl = Find-FirstFile @('lowprofilemechanicalkeyboard.mtl')
  if ($mtl) {
    Copy-Item $mtl.FullName $mtlTarget -Force
    Write-Host ('[OK] Keyboard MTL: ' + $mtl.FullName) -ForegroundColor Green
  } else {
    Write-Host '[!] Keyboard MTL not found automatically.' -ForegroundColor Yellow
  }
} else {
  Write-Host '[OK] Keyboard MTL already installed.' -ForegroundColor Green
}

Write-Host ''
if ((Test-Path $robotTarget) -and (Test-Path $objTarget) -and (Test-Path $mtlTarget)) {
  Write-Host 'All primary 3D assets are ready.' -ForegroundColor Green
} else {
  Write-Host 'The site still runs with its keyboard/robot fallbacks.' -ForegroundColor Yellow
  Write-Host 'For the authentic models, copy the missing files to:' -ForegroundColor Yellow
  Write-Host ('  ' + $RobotDir)
  Write-Host ('  ' + $KeyboardDir)
}
Write-Host ''
