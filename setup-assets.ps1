$ErrorActionPreference = 'SilentlyContinue'

$Repo = Split-Path -Parent $MyInvocation.MyCommand.Path
$ModelRoot = Join-Path $Repo 'assets\models'
$RobotDir = Join-Path $ModelRoot 'robot'
$StudyDir = Join-Path $ModelRoot 'study'
New-Item -ItemType Directory -Force -Path $RobotDir | Out-Null
New-Item -ItemType Directory -Force -Path $StudyDir | Out-Null

$HomeDir = [Environment]::GetFolderPath('UserProfile')
$SearchRoots = @(
  (Join-Path $HomeDir 'Downloads'),
  (Join-Path $HomeDir 'Desktop'),
  (Split-Path -Parent $Repo),
  $Repo
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
Write-Host 'ERNUR PORTFOLIO V5 / ASSET SETUP' -ForegroundColor White
Write-Host 'Searching Downloads/Desktop for both GLB models...' -ForegroundColor DarkGray
Write-Host ''

$robotTarget = Join-Path $RobotDir 'DECODE Simple Bot.glb'
if (-not (Test-Path $robotTarget)) {
  $robot = Find-FirstFile @('DECODE Simple Bot(1).glb','DECODE Simple Bot.glb','ernur-simple-bot.glb')
  if ($robot) {
    Copy-Item $robot.FullName $robotTarget -Force
    Write-Host ('[OK] DECODE robot: ' + $robot.FullName) -ForegroundColor Green
  } else {
    Write-Host '[!] DECODE Simple Bot GLB not found automatically.' -ForegroundColor Yellow
  }
} else {
  Write-Host '[OK] DECODE robot already installed.' -ForegroundColor Green
}

$studyTarget = Join-Path $StudyDir '3209-0001-0007.glb'
if (-not (Test-Path $studyTarget)) {
  $study = Find-FirstFile @('3209-0001-0007.glb')
  if ($study) {
    Copy-Item $study.FullName $studyTarget -Force
    Write-Host ('[OK] 3209 study model: ' + $study.FullName) -ForegroundColor Green
  } else {
    Write-Host '[!] 3209-0001-0007.glb not found automatically.' -ForegroundColor Yellow
  }
} else {
  Write-Host '[OK] 3209 study model already installed.' -ForegroundColor Green
}

Write-Host ''
if ((Test-Path $robotTarget) -and (Test-Path $studyTarget)) {
  Write-Host 'Both V5 GLB assets are ready.' -ForegroundColor Green
} else {
  Write-Host 'Missing files can also be copied manually:' -ForegroundColor Yellow
  Write-Host ('  Robot -> ' + $RobotDir)
  Write-Host ('  Study -> ' + $StudyDir)
}
Write-Host ''
