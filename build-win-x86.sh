#!/bin/bash

echo "正在构建云朵字体生成器 Windows x86 版本..."

# 运行webpack构建
echo "第一步: 运行webpack构建"
npm run webpack-build
if [ $? -ne 0 ]; then
    echo "Webpack构建失败"
    exit 1
fi

# 使用electron-builder打包Windows x86应用
echo "第二步: 使用electron-builder打包Windows x86应用"
node_modules/.bin/electron-builder --win --ia32
if [ $? -ne 0 ]; then
    echo "打包失败"
    exit 1
fi

echo "构建完成! 请在dist目录查看生成的文件。"
echo "Windows x86版本已生成，适用于Win11和其他Windows系统。" 