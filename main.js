const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// handle security warnings
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

// 设置应用名称，这会影响任务栏悬停提示
app.name = '云朵';

let mainWindow;

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
    icon: path.join(__dirname, 'yunduo_m.png'), // 使用根目录下的yunduo_m.png作为图标
    title: '云朵字体生成器 - 蔡老师定制版' // 设置窗口标题
  });

  // load the index.html of the app
  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, 'public/index.html')}`;
  mainWindow.loadURL(startUrl);

  // open devtools if in dev mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  // emitted when the window is closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// this method will be called when electron has finished initialization
app.whenReady().then(createWindow);

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
    
    // sanitize filename
    const sanitizedFilename = path.basename(filename).replace(/[^a-z0-9_\-\.]/gi, '_');
    
    // handle different export formats
    switch (format) {
      case 'svg':
        fs.writeFileSync(sanitizedFilename, data);
        break;
      case 'png':
        // For PNG we'd need to convert the data URL to a buffer
        const pngData = Buffer.from(data.replace(/^data:image\/png;base64,/, ''), 'base64');
        fs.writeFileSync(sanitizedFilename, pngData);
        break;
      case 'css':
        fs.writeFileSync(sanitizedFilename, data);
        break;
      case 'json':
        fs.writeFileSync(sanitizedFilename, JSON.stringify(data, null, 2));
        break;
      default:
        throw new Error('Unsupported export format');
    }
    
    event.reply('export-complete', { success: true, path: sanitizedFilename });
  } catch (error) {
    console.error('Export error:', error);
    event.reply('export-complete', { success: false, error: error.message });
  }
}); 