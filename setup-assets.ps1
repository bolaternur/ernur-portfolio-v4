$ErrorActionPreference = 'SilentlyContinue'

$Repo = Split-Path -Parent $MyInvocation.MyCommand.Path
$ModelRoot = Join-Path $Repo 'assets\models'
$RobotDir = Join-Path $ModelRoot 'robot'
$StudyDir = Join-Path $ModelRoot 'study'
$FusionDir = Join-Path $ModelRoot 'fusion'

New-Item -ItemType Directory -Force -Path $RobotDir | Out-Null
New-Item -ItemType Directory -Force -Path $StudyDir | Out-Null
New-Item -ItemType Directory -Force -Path $FusionDir | Out-Null

$HomeDir = [Environment]::GetFolderPath('UserProfile')
$SearchRoots = @(
  (Join-Path $HomeDir 'Downloads'),
  (Join-Path $HomeDir 'Desktop'),
  (Join-Path $HomeDir 'Documents'),
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

function Install-Asset {
  param(
    [string]$Label,
    [string[]]$Names,
    [string]$Target
  )
  if (Test-Path $Target) {
    Write-Host ('[OK] ' + $Label + ' already installed.') -ForegroundColor Green
    return $true
  }

  $source = Find-FirstFile $Names
  if ($source) {
    Copy-Item $source.FullName $Target -Force
    Write-Host ('[OK] ' + $Label + ': ' + $source.FullName) -ForegroundColor Green
    return $true
  }

  Write-Host ('[!] ' + $Label + ' not found automatically.') -ForegroundColor Yellow
  return $false
}

Write-Host ''
Write-Host 'ERNUR PORTFOLIO V5 / ASSET SETUP' -ForegroundColor White
Write-Host 'Searching Downloads, Desktop and Documents for portfolio GLB files...' -ForegroundColor DarkGray
Write-Host ''

$robotTarget = Join-Path $RobotDir 'DECODE Simple Bot.glb'
$studyTarget = Join-Path $StudyDir '3209-0001-0007.glb'
$assemblyTarget = Join-Path $FusionDir 'Main Assembly.glb'
$kickerTarget = Join-Path $FusionDir 'kicker_insert.glb'

$robotOK = Install-Asset 'DECODE Simple Bot' @('DECODE Simple Bot(1).glb','DECODE Simple Bot.glb','ernur-simple-bot.glb') $robotTarget
$studyOK = Install-Asset '3209 mechanical study' @('3209-0001-0007.glb') $studyTarget
$assemblyOK = Install-Asset 'Fusion 360 Main Assembly' @('Main Assembly.glb') $assemblyTarget
$kickerOK = Install-Asset 'Fusion 360 kicker insert' @('kicker_insert.glb') $kickerTarget

Write-Host ''
if ($robotOK -and $studyOK -and $assemblyOK -and $kickerOK) {
  Write-Host 'All four V5 GLB assets are ready.' -ForegroundColor Green
} else {
  Write-Host 'One or more GLB files are missing. The site will still load, but the missing scene uses a fallback.' -ForegroundColor Yellow
  Write-Host ''
  Write-Host 'Manual destinations:' -ForegroundColor Yellow
  Write-Host ('  DECODE       -> ' + $robotTarget)
  Write-Host ('  3209         -> ' + $studyTarget)
  Write-Host ('  Main Assembly-> ' + $assemblyTarget)
  Write-Host ('  Kicker Insert-> ' + $kickerTarget)
}
Write-Host ''
