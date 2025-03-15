const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');

// handle security warnings
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

// 设置应用名称，这会影响任务栏悬停提示
app.name = '云朵';

let mainWindow;

// 判断是否是开发环境
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

function createWindow() {
  // create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'public', 'yunduo_m.png'), // 修正图标路径
    title: '云朵字体生成器 - 蔡老师定制版' // 设置窗口标题
  });

  // 根据环境加载不同的URL
  let startUrl;
  if (isDev) {
    // 开发环境
    startUrl = process.env.ELECTRON_START_URL || 'http://localhost:8080';
    console.log('开发环境启动，加载URL:', startUrl);
  } else {
    // 生产环境
    startUrl = url.format({
      pathname: path.join(__dirname, 'build', 'index.html'),
      protocol: 'file:',
      slashes: true
    });
    console.log('生产环境启动，加载文件:', startUrl);
  }

  // 加载应用
  mainWindow.loadURL(startUrl).catch(err => {
    console.error('加载应用失败:', err);
    
    // 尝试备用路径
    const backupPaths = [
      path.join(__dirname, 'public', 'index.html'),
      path.join(__dirname, 'build', 'index.html'),
      path.join(__dirname, 'dist', 'index.html'),
      path.join(__dirname, 'index.html')
    ];
    
    // 尝试所有可能的路径
    let loaded = false;
    for (const backupPath of backupPaths) {
      if (fs.existsSync(backupPath)) {
        console.log('尝试加载备用路径:', backupPath);
        mainWindow.loadFile(backupPath).catch(e => console.error('加载备用路径失败:', e));
        loaded = true;
        break;
      }
    }
    
    if (!loaded) {
      console.error('无法找到任何可用的HTML文件');
      dialog.showErrorBox('启动错误', '无法加载应用界面，请联系开发者。');
    }
  });

  // open devtools if in dev mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
    console.log('已打开开发者工具');
  }

  // emitted when the window is closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// this method will be called when electron has finished initialization
app.whenReady().then(() => {
  createWindow();
  console.log('应用已启动');
});

// quit when all windows are closed
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

// handle file export
ipcMain.on('export-file', (event, { data, format, filename }) => {
  try {
    // validate inputs to prevent security issues
    if (!filename || typeof filename !== 'string') {
      throw new Error('Invalid filename');
    }
    
    if (!data) {
      throw new Error('No data to export');
    }
    
    // 使用对话框让用户选择保存位置
    dialog.showSaveDialog(mainWindow, {
      title: '保存文件',
      defaultPath: filename,
      filters: getFileFilters(format)
    }).then(result => {
      if (result.canceled) {
        event.reply('export-complete', { success: false, error: '用户取消了保存' });
        return;
      }
      
      const filePath = result.filePath;
      
      // 根据不同格式处理数据
      try {
        switch (format) {
          case 'svg':
            fs.writeFileSync(filePath, data);
            break;
          case 'png':
            // For PNG we'd need to convert the data URL to a buffer
            const pngData = Buffer.from(data.replace(/^data:image\/png;base64,/, ''), 'base64');
            fs.writeFileSync(filePath, pngData);
            break;
          case 'css':
            fs.writeFileSync(filePath, data);
            break;
          case 'json':
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            break;
          default:
            throw new Error('Unsupported export format');
        }
        
        event.reply('export-complete', { success: true, path: filePath });
      } catch (error) {
        console.error('保存文件失败:', error);
        event.reply('export-complete', { success: false, error: `保存文件失败: ${error.message}` });
      }
    }).catch(err => {
      console.error('显示保存对话框失败:', err);
      event.reply('export-complete', { success: false, error: `显示保存对话框失败: ${err.message}` });
    });
  } catch (error) {
    console.error('Export error:', error);
    event.reply('export-complete', { success: false, error: error.message });
  }
});

// 获取文件过滤器
function getFileFilters(format) {
  switch (format) {
    case 'png':
      return [{ name: 'PNG图片', extensions: ['png'] }];
    case 'svg':
      return [{ name: 'SVG矢量图', extensions: ['svg'] }];
    case 'css':
      return [{ name: 'CSS样式表', extensions: ['css'] }];
    case 'json':
      return [{ name: 'JSON文件', extensions: ['json'] }];
    default:
      return [{ name: '所有文件', extensions: ['*'] }];
  }
} 