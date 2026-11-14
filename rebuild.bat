@echo off
echo ========================================================
echo Rebuilding UrbanResQ Database with Master SQL Schema...
echo ========================================================
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -pSm@13022006 -h localhost -e "source %~dp0database/urbanresq_master.sql"
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] UrbanResQ Database rebuilt successfully!
) else (
    echo [ERROR] Failed to rebuild database.
)
