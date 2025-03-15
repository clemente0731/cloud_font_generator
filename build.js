#!/usr/bin/env node

/**
 * 云朵字体生成器跨平台打包脚本
 * 用法:
 *   node build.js [platform] [options]
 * 
 * 平台:
 *   --mac      打包 macOS 应用
 *   --win      打包 Windows 应用
 *   --linux    打包 Linux 应用
 *   --all      打包所有平台应用 (默认)
 * 
 * 选项:
 *   --clean    清理之前的构建
 *   --x64      仅构建64位版本
 *   --ia32     仅构建32位版本 (仅Windows)
 *   --arm64    仅构建ARM64版本 (macOS/Linux)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 解析命令行参数
const args = process.argv.slice(2);
const platforms = [];
const options = {
  clean: false,
  arch: null
};

// 处理参数
args.forEach(arg => {
  if (arg === '--mac' || arg === '-m') {
    platforms.push('mac');
  } else if (arg === '--win' || arg === '-w') {
    platforms.push('win');
  } else if (arg === '--linux' || arg === '-l') {
    platforms.push('linux');
  } else if (arg === '--all' || arg === '-a') {
    platforms.push('mac', 'win', 'linux');
  } else if (arg === '--clean') {
    options.clean = true;
  } else if (arg === '--x64') {
    options.arch = 'x64';
  } else if (arg === '--ia32') {
    options.arch = 'ia32';
  } else if (arg === '--arm64') {
    options.arch = 'arm64';
  }
});

// 如果没有指定平台，默认构建所有平台
if (platforms.length === 0) {
  platforms.push('mac', 'win', 'linux');
}

// 移除重复项
const uniquePlatforms = [...new Set(platforms)];

// 清理之前的构建
if (options.clean) {
  console.log('🧹 清理之前的构建...');
  try {
    if (fs.existsSync(path.join(__dirname, 'dist'))) {
      execSync('rm -rf dist', { stdio: 'inherit' });
    }
  } catch (error) {
    console.error('❌ 清理失败:', error.message);
    process.exit(1);
  }
}

// 首先构建 webpack
console.log('🔨 构建 webpack...');
try {
  execSync('npm run webpack-build', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ webpack 构建失败:', error.message);
  process.exit(1);
}

// 为每个平台构建
console.log(`🚀 开始为以下平台构建: ${uniquePlatforms.join(', ')}`);

// 构建命令
let buildCommand = 'electron-builder';

// 添加平台参数
if (uniquePlatforms.length === 3) {
  buildCommand += ' -mwl'; // 所有平台的简写
} else {
  uniquePlatforms.forEach(platform => {
    buildCommand += ` --${platform}`;
  });
}

// 添加架构参数
if (options.arch) {
  buildCommand += ` --${options.arch}`;
}

// 执行构建
try {
  console.log(`📦 执行命令: ${buildCommand}`);
  execSync(buildCommand, { stdio: 'inherit' });
  console.log('✅ 构建成功!');
  
  // 显示输出目录
  console.log('📂 构建输出位于: ' + path.join(__dirname, 'dist'));
  
  // 列出生成的文件
  const distFiles = fs.readdirSync(path.join(__dirname, 'dist'));
  console.log('📄 生成的文件:');
  distFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
  
} catch (error) {
  console.error('❌ 构建失败:', error.message);
  process.exit(1);
}

// 构建完成
console.log('🎉 打包完成!'); 