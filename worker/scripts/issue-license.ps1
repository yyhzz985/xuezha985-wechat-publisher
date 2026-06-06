param(
	[string]$Key = "",
	[int]$Days = 365,
	[string]$Note = ""
)

$ErrorActionPreference = "Stop"

if (-not $Key.Trim()) {
	$bytes = New-Object byte[] 12
	[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
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

Push-Location (Join-Path $PSScriptRoot "..")
try {
	npx wrangler kv key put --binding LICENSES --remote "license:$Key" $record
	if ($LASTEXITCODE -ne 0) {
		exit $LASTEXITCODE
	}
} finally {
	Pop-Location
}

Write-Host ""
Write-Host "License Key: $Key"
Write-Host "Expires At : $expiresAt"
Write-Host "Send the License Key to the user."
