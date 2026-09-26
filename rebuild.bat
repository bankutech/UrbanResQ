"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -pSm@13022006 -e "DROP DATABASE IF EXISTS urbanresq;"
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -pSm@13022006 < database\schema.sql
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -pSm@13022006 urbanresq < database\functions.sql
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -pSm@13022006 urbanresq < database\procedures.sql
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -pSm@13022006 urbanresq < database\triggers.sql
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -pSm@13022006 urbanresq < database\views.sql
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -pSm@13022006 urbanresq < database\seed.sql
