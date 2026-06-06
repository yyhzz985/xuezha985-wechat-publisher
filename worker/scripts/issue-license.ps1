param(
	[string]$Key = "",
	[int]$Count = 1,
	[int]$Days = 365,
	[string]$Note = ""
)

$ErrorActionPreference = "Stop"

if ($Key.Trim() -and $Count -ne 1) {
	throw "Use -Key only when -Count is 1."
}
if ($Count -lt 1) {
	throw "Count must be greater than 0."
}

function New-LicenseKey {
	$bytes = New-Object byte[] 12
	$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
	try {
		$rng.GetBytes($bytes)
	} finally {
		$rng.Dispose()
	}
	$token = [Convert]::ToBase64String($bytes).Replace("+", "").Replace("/", "").Replace("=", "").ToUpperInvariant()
	return "PRO-$token"
}

function New-LicenseRecord {
	param(
		[string]$LicenseKey,
		[string]$ExpiresAt,
		[string]$LicenseNote
	)

	return @{
		active = $true
		plan = "pro"
		features = @("wechat_upload")
		expiresAt = $ExpiresAt
		note = $LicenseNote
	} | ConvertTo-Json -Compress
}

function Write-Utf8NoBom {
	param(
		[string]$Path,
		[string]$Content
	)

	$utf8NoBom = New-Object -TypeName System.Text.UTF8Encoding -ArgumentList $false
	[System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

$batchId = (Get-Date).ToUniversalTime().ToString("yyyyMMdd-HHmmss", [System.Globalization.CultureInfo]::InvariantCulture)
$csvPath = Join-Path (Get-Location) "licenses-$batchId.csv"
$bulkPath = Join-Path ([System.IO.Path]::GetTempPath()) "wechat-publisher-licenses-$batchId.json"
$issued = @()
$bulkEntries = @()

Push-Location (Join-Path $PSScriptRoot "..")
try {
	for ($index = 1; $index -le $Count; $index += 1) {
		if ($Key.Trim()) {
			$licenseKey = $Key.Trim()
		} else {
			$licenseKey = New-LicenseKey
		}
		$expiresAt = (Get-Date).ToUniversalTime().AddDays($Days).ToString("yyyy-MM-ddTHH:mm:ss.fffZ", [System.Globalization.CultureInfo]::InvariantCulture)
		if ($Count -eq 1) {
			$licenseNote = $Note
		} else {
			$licenseNote = "$Note batch=$batchId item=$index".Trim()
		}
		$record = New-LicenseRecord -LicenseKey $licenseKey -ExpiresAt $expiresAt -LicenseNote $licenseNote

		$bulkEntries += [pscustomobject]@{
			key = "license:$licenseKey"
			value = $record
		}
		$issued += [pscustomobject]@{
			licenseKey = $licenseKey
			expiresAt = $expiresAt
			note = $licenseNote
		}
	}

	$bulkJson = @($bulkEntries) | ConvertTo-Json -Depth 6
	Write-Utf8NoBom -Path $bulkPath -Content $bulkJson
	try {
		npx wrangler kv bulk put $bulkPath --binding LICENSES --remote
		if ($LASTEXITCODE -ne 0) {
			exit $LASTEXITCODE
		}
	} finally {
		if (Test-Path -LiteralPath $bulkPath) {
			Remove-Item -LiteralPath $bulkPath -Force
		}
	}

	$issued | Export-Csv -LiteralPath $csvPath -NoTypeInformation -Encoding UTF8
} finally {
	Pop-Location
}

Write-Host ""
if ($Count -eq 1) {
	Write-Host "License Key: $($issued[0].licenseKey)"
	Write-Host "Expires At : $($issued[0].expiresAt)"
} else {
	Write-Host "Issued $Count license keys."
	Write-Host "CSV: $csvPath"
}
Write-Host "Send License Key values to users."
