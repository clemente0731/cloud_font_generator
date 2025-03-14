#!/bin/bash

echo "云朵字体生成器打包工具"
echo "====================="

# 确保脚本可执行
chmod +x build.js

# 检查是否提供了参数
if [ $# -eq 0 ]; then
  echo "未指定平台，将构建所有平台版本"
  ./build.js --all
else
  ./build.js "$@"
fi

# 检查构建结果
if [ $? -ne 0 ]; then
  echo "构建失败，请检查错误信息"
  exit 1
fi

echo "构建完成！" 