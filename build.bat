@echo off
echo 云朵字体生成器打包工具
echo =====================

if "%1"=="" (
  echo 未指定平台，将构建所有平台版本
  node build.js --all %*
) else (
  node build.js %*
)

if %ERRORLEVEL% NEQ 0 (
  echo 构建失败，请检查错误信息
  exit /b %ERRORLEVEL%
)

echo 构建完成！
pause 