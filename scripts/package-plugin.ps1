$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$manifestPath = Join-Path $root 'manifest.json'
$mainPath = Join-Path $root 'main.js'
$stylesPath = Join-Path $root 'styles.css'

foreach ($path in @($manifestPath, $mainPath, $stylesPath)) {
	if (!(Test-Path -LiteralPath $path)) {
		throw "Missing required plugin file: $path"
	}
}

$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
$distDir = Join-Path $root 'dist'
if (!(Test-Path -LiteralPath $distDir)) {
	New-Item -ItemType Directory -Path $distDir | Out-Null
}

$packagePath = Join-Path $distDir "$($manifest.id)-$($manifest.version).zip"
if (Test-Path -LiteralPath $packagePath) {
	$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
	$packagePath = Join-Path $distDir "$($manifest.id)-$($manifest.version)-$timestamp.zip"
}

Compress-Archive `
	-LiteralPath @($manifestPath, $mainPath, $stylesPath) `
	-DestinationPath $packagePath `
	-CompressionLevel Optimal

Write-Host "Package created: $packagePath"
