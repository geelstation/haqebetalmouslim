const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    backgroundColor: '#1a1a1a',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'حقيبة المسلم'
  });

  // في وضع التطوير
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // في الإنتاج
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers للتواصل مع React
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// مجلد التحميلات
const downloadsPath = path.join(app.getPath('userData'), 'downloads');

// إنشاء مجلد التحميلات إذا لم يكن موجوداً
if (!fs.existsSync(downloadsPath)) {
  fs.mkdirSync(downloadsPath, { recursive: true });
}

// تحميل ملف
ipcMain.handle('download-file', async (event, { url, fileName }) => {
  try {
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9_\u0600-\u06FF\s.-]/g, '_');
    const filePath = path.join(downloadsPath, sanitizedFileName);
    
    // التحقق من وجود الملف
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return {
        success: true,
        localPath: filePath,
        size: stats.size,
        alreadyExists: true
      };
    }
    
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const file = fs.createWriteStream(filePath);
      
      const request = protocol.get(url, (response) => {
        if (response.statusCode !== 200) {
          fs.unlinkSync(filePath);
          reject(new Error(`فشل التحميل: ${response.statusCode}`));
          return;
        }
        
        const totalSize = parseInt(response.headers['content-length'], 10);
        let downloadedSize = 0;
        
        response.on('data', (chunk) => {
          downloadedSize += chunk.length;
          const progress = (downloadedSize / totalSize) * 100;
          
          // إرسال تحديث التقدم
          event.sender.send('download-progress', {
            fileName: sanitizedFileName,
            progress: Math.round(progress),
            downloadedSize,
            totalSize
          });
        });
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          const stats = fs.statSync(filePath);
          resolve({
            success: true,
            localPath: filePath,
            size: stats.size,
            alreadyExists: false
          });
        });
      });
      
      request.on('error', (err) => {
        fs.unlinkSync(filePath);
        reject(err);
      });
      
      file.on('error', (err) => {
        fs.unlinkSync(filePath);
        reject(err);
      });
    });
  } catch (error) {
    console.error('خطأ في التحميل:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// فتح مجلد التحميلات
ipcMain.handle('open-downloads-folder', async () => {
  const { shell } = require('electron');
  await shell.openPath(downloadsPath);
  return { success: true };
});

// حذف ملف محمل
ipcMain.handle('delete-downloaded-file', async (event, localPath) => {
  try {
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
      return { success: true };
    }
    return { success: false, error: 'الملف غير موجود' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
