@echo off
echo 云朵字体生成器启动脚本
echo =====================

echo 1. 检查Node.js安装...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo [错误] 未找到Node.js! 请先安装Node.js: https://nodejs.org/
  pause
  exit /b 1
)

echo 2. 检查是否已编译...
if not exist "dist\bundle.js" (
  echo [警告] 应用尚未编译，正在编译...
  call build.bat
  if %ERRORLEVEL% neq 0 (
    echo [错误] 编译失败!
    pause
    exit /b 1
  )
)

echo 3. 启动应用...
call npm start
if %ERRORLEVEL% neq 0 (
  echo [错误] 启动应用失败!
  pause
  exit /b 1
)

pause 