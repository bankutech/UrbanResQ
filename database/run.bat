@echo off
echo ========================================================
echo Loading UrbanResQ Master SQL Schema into MySQL 8.4...
echo ========================================================
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -pSm@13022006 -h localhost < "%~dp0urbanresq_master.sql"
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] UrbanResQ Database initialized successfully!
) else (
    echo [ERROR] Failed to execute urbanresq_master.sql. Check credentials or MySQL status.
)
pause
