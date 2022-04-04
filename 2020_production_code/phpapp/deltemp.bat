REM Remove folders older than 30 days
forfiles /p "D:\Webservers\re.tard.is\temp" /c "cmd /c rd @path /w /q" /d -30
