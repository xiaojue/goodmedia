@echo off
pushd "%~dp0"
set ANT="D:\Program Files\ant\bin\ant.bat"
call %ANT% -buildfile uploadcss.xml
pause
exit