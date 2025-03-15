@echo off
echo 云朵字体生成器 - 清理并重新构建
echo ==============================

echo 1. 清理之前的构建...
if exist "build" rmdir /s /q build
if exist "dist" rmdir /s /q dist
if exist "node_modules" rmdir /s /q node_modules

echo 2. 安装依赖...
call npm install
if %ERRORLEVEL% NEQ 0 (
  echo 安装依赖失败，请检查错误信息
  pause
  exit /b %ERRORLEVEL%
)

echo 3. 构建应用...
call npm run webpack-build
if %ERRORLEVEL% NEQ 0 (
  echo 构建应用失败，请检查错误信息
  pause
  exit /b %ERRORLEVEL%
)

echo 4. 打包Windows应用...
call npm run dist:win
if %ERRORLEVEL% NEQ 0 (
  echo 打包应用失败，请检查错误信息
  pause
  exit /b %ERRORLEVEL%
)

echo 5. 构建完成！
echo 打包后的应用位于 dist 目录
pause 