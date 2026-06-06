param(
	[string]$Key = "",
	[int]$Days = 365,
	[string]$Note = ""
)

$ErrorActionPreference = "Stop"

if (-not $Key.Trim()) {
	$bytes = New-Object byte[] 12
	$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
	try {
		$rng.GetBytes($bytes)
	} finally {
		$rng.Dispose()
	}
	$token = [Convert]::ToBase64String($bytes).Replace("+", "").Replace("/", "").Replace("=", "").ToUpperInvariant()
	$Key = "PRO-$token"
}

$expiresAt = (Get-Date).ToUniversalTime().AddDays($Days).ToString("yyyy-MM-ddTHH:mm:ss.fffZ", [System.Globalization.CultureInfo]::InvariantCulture)
$record = @{
	active = $true
	plan = "pro"
	features = @("wechat_upload")
	expiresAt = $expiresAt
	note = $Note
} | ConvertTo-Json -Compress

$tempFile = $null
Push-Location (Join-Path $PSScriptRoot "..")
try {
	$tempFile = Join-Path ([System.IO.Path]::GetTempPath()) "wechat-publisher-license-$Key.json"
	$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
	[System.IO.File]::WriteAllText($tempFile, $record, $utf8NoBom)
	npx wrangler kv key put --binding LICENSES --remote "license:$Key" --path $tempFile
	if ($LASTEXITCODE -ne 0) {
		exit $LASTEXITCODE
	}
} finally {
	if ($tempFile -and (Test-Path -LiteralPath $tempFile)) {
		Remove-Item -LiteralPath $tempFile -Force
	}
	Pop-Location
}

Write-Host ""
Write-Host "License Key: $Key"
Write-Host "Expires At : $expiresAt"
Write-Host "Send the License Key to the user."
