param(
	[ValidateSet("issue", "reset-device", "disable", "extend")]
	[string]$Action = "issue",
	[int]$Count = 1,
	[int]$Days = 365,
	[string]$Note = "",
	[string]$LicenseKey = "",
	[string]$ServerUrl = "https://wechat-publisher-license.237219265.workers.dev",
	[string]$AdminToken = ""
)

$ErrorActionPreference = "Stop"

if ($Count -lt 1) {
	throw "Count must be greater than 0."
}
if ($Action -ne "issue" -and -not $LicenseKey.Trim()) {
	throw "LicenseKey is required for $Action."
}

function Get-AdminToken {
	param([string]$ExplicitToken)

	if ($ExplicitToken.Trim()) {
		return $ExplicitToken.Trim()
	}
	if ($env:ADMIN_TOKEN) {
		return $env:ADMIN_TOKEN.Trim()
	}

	$tokenPath = Join-Path $PSScriptRoot "..\.admin-token.local"
	if (Test-Path -LiteralPath $tokenPath) {
		return (Get-Content -LiteralPath $tokenPath -Raw).Trim()
	}

	throw "ADMIN_TOKEN is required. Pass -AdminToken, set env:ADMIN_TOKEN, or create worker/.admin-token.local."
}

function Invoke-AdminApi {
	param(
		[string]$Path,
		[hashtable]$Body,
		[string]$Token
	)

	$baseUrl = $ServerUrl.TrimEnd("/")
	return Invoke-RestMethod `
		-Method Post `
		-Uri "$baseUrl$Path" `
		-Headers @{ Authorization = "Bearer $Token" } `
		-ContentType "application/json" `
		-Body ($Body | ConvertTo-Json -Depth 6)
}

$token = Get-AdminToken -ExplicitToken $AdminToken

if ($Action -eq "issue") {
	$batchId = (Get-Date).ToUniversalTime().ToString("yyyyMMdd-HHmmss", [System.Globalization.CultureInfo]::InvariantCulture)
	$csvPath = Join-Path (Get-Location) "licenses-$batchId.csv"
	$issued = @()

	for ($index = 1; $index -le $Count; $index += 1) {
		if ($Count -eq 1) {
			$licenseNote = $Note
		} else {
			$licenseNote = "$Note batch=$batchId item=$index".Trim()
		}
		$result = Invoke-AdminApi `
			-Path "/v1/admin/licenses/issue" `
			-Token $token `
			-Body @{
				days = $Days
				note = $licenseNote
			}

		$issued += [pscustomobject]@{
			licenseKey = $result.licenseKey
			expiresAt = $result.expiresAt
			maxDevices = $result.maxDevices
			note = $licenseNote
		}
	}

	$issued | Export-Csv -LiteralPath $csvPath -NoTypeInformation -Encoding UTF8
	Write-Host ""
	if ($Count -eq 1) {
		Write-Host "License Key: $($issued[0].licenseKey)"
		Write-Host "Expires At : $($issued[0].expiresAt)"
	} else {
		Write-Host "Issued $Count license keys."
		Write-Host "CSV: $csvPath"
	}
	Write-Host "Send License Key values to users."
	return
}

$actionPath = "/v1/admin/licenses/$Action"
$body = @{
	licenseKey = $LicenseKey.Trim()
}
if ($Action -eq "extend") {
	$body.days = $Days
}

$response = Invoke-AdminApi -Path $actionPath -Token $token -Body $body
$response | ConvertTo-Json -Depth 6
