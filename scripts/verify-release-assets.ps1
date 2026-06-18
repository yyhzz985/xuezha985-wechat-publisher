param(
	[string]$PackagePath
)

$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$manifestPath = Join-Path $root 'manifest.json'
$versionsPath = Join-Path $root 'versions.json'
$mainPath = Join-Path $root 'main.js'
$stylesPath = Join-Path $root 'styles.css'
$requiredAssets = @($manifestPath, $mainPath, $stylesPath)

foreach ($path in @($requiredAssets + $versionsPath)) {
	if (!(Test-Path -LiteralPath $path)) {
		throw "Missing required release file: $path"
	}
}

$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
$versions = Get-Content -LiteralPath $versionsPath -Raw -Encoding UTF8 | ConvertFrom-Json

if ($manifest.name -notmatch '^[\x20-\x7E]+$') {
	throw 'manifest.name must use Basic Latin characters for the official community directory.'
}
if ($manifest.name -match '(?i)\b(obsidian|plugin)\b') {
	throw 'manifest.name must not contain Obsidian or Plugin.'
}
if ($manifest.id -notmatch '^[a-z-]+$' -or $manifest.id.EndsWith('plugin') -or $manifest.id.Contains('obsidian')) {
	throw 'manifest.id must contain only lowercase letters and hyphens, and must not end with plugin or contain obsidian.'
}
if ($manifest.isDesktopOnly -isnot [bool]) {
	throw 'manifest.isDesktopOnly must be a boolean.'
}

$versionEntry = $versions.PSObject.Properties[$manifest.version]
if (!$versionEntry) {
	throw "versions.json is missing manifest version $($manifest.version)."
}
if ($versionEntry.Value -ne $manifest.minAppVersion) {
	throw "versions.json maps $($manifest.version) to $($versionEntry.Value), but manifest.minAppVersion is $($manifest.minAppVersion)."
}

if ($PackagePath) {
	$resolvedPackagePath = Resolve-Path -LiteralPath $PackagePath
	Add-Type -AssemblyName System.IO.Compression.FileSystem
	$zip = [System.IO.Compression.ZipFile]::OpenRead($resolvedPackagePath)
	try {
		$entryNames = @($zip.Entries | ForEach-Object { $_.FullName } | Sort-Object)
		$expectedEntryNames = @('main.js', 'manifest.json', 'styles.css')
		$unexpectedEntries = @($entryNames | Where-Object { $expectedEntryNames -notcontains $_ })
		$missingEntries = @($expectedEntryNames | Where-Object { $entryNames -notcontains $_ })
		if ($unexpectedEntries.Count -gt 0 -or $missingEntries.Count -gt 0) {
			throw "Package zip must contain exactly manifest.json, main.js, and styles.css at the root. Entries: $($entryNames -join ', ')"
		}
	} finally {
		$zip.Dispose()
	}
	Write-Host "Package verified: $resolvedPackagePath"
}

Write-Host 'Release asset checklist: attach manifest.json, main.js, styles.css, and the package zip as separate GitHub Release assets.'
Write-Host 'The package zip is for manual installation and must not replace the separate manifest.json, main.js, and styles.css assets.'
