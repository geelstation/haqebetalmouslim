const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // تحميل ملف صوتي
  downloadFile: (url, fileName, onProgress) => {
    return ipcRenderer.invoke('download-file', { url, fileName });
  },
  
  // الاستماع لتحديثات التحميل
  onDownloadProgress: (callback) => {
    ipcRenderer.on('download-progress', (event, data) => callback(data));
  },
  
  // إلغاء تحديثات التحميل
  removeDownloadProgressListener: () => {
    ipcRenderer.removeAllListeners('download-progress');
  },
  
  // فتح مجلد التحميلات
  openDownloadsFolder: () => {
    return ipcRenderer.invoke('open-downloads-folder');
  },
  
  // حذف ملف محمل
  deleteDownloadedFile: (localPath) => {
    return ipcRenderer.invoke('delete-downloaded-file', localPath);
  }
});
