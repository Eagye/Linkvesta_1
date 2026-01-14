# Restart frontend with updated environment variables
$root = Split-Path -Parent $PSScriptRoot
$frontendPath = Join-Path $root "frontend"

Write-Host "Restarting frontend..." -ForegroundColor Cyan

# Load .env variables
$envPath = Join-Path $root ".env"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^([^#][^=]*)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

# Change to frontend directory and start
Set-Location $frontendPath
Write-Host "Starting frontend on port 3000..." -ForegroundColor Green
npm run dev
