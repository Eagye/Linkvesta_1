# Script to create default admin account
# Usage: .\create_default_admin.ps1

Write-Host "Creating default admin account..." -ForegroundColor Cyan

# Default database connection parameters
$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "linkvesta" }
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }
$DB_PASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "postgres" }

$env:PGPASSWORD = $DB_PASSWORD

Write-Host "Connecting to database: $DB_NAME on $DB_HOST:$DB_PORT as $DB_USER" -ForegroundColor Yellow

# Run the migration
$migrationFile = "backend\database\migrations\004_create_default_admin.sql"
$fullPath = Join-Path $PSScriptRoot $migrationFile

if (Test-Path $fullPath) {
    try {
        $sql = Get-Content $fullPath -Raw
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $sql
        Write-Host "`n✅ Default admin account created successfully!" -ForegroundColor Green
        Write-Host "`nDefault Admin Credentials:" -ForegroundColor Cyan
        Write-Host "  Email: admin@linkvesta.com" -ForegroundColor White
        Write-Host "  Password: admin123" -ForegroundColor White
        Write-Host "`n⚠️  IMPORTANT: Change the password after first login!" -ForegroundColor Yellow
    } catch {
        Write-Host "❌ Error running migration: $_" -ForegroundColor Red
        Write-Host "`nMake sure PostgreSQL is running and accessible." -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Migration file not found: $fullPath" -ForegroundColor Red
}
