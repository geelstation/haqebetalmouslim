import React, { useState, useEffect } from 'react';
import { FaTrash, FaFolder, FaPlay, FaDownload, FaHdd, FaPause, FaTimes, FaSpinner } from 'react-icons/fa';
import { 
  getDownloadedCassettes, 
  getActiveDownloads,
  deleteDownloadedCassette, 
  getTotalDownloadSize, 
  formatFileSize,
  pauseDownload,
  resumeDownload,
  cancelDownload
} from '../../services/downloadService';
import './MyDownloads.css';

function MyDownloads({ onClose, onPlayCassette }) {
  const [downloads, setDownloads] = useState([]);
  const [activeDownloads, setActiveDownloads] = useState([]);
  const [totalSize, setTotalSize] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDownloads();
    
    // تحديث كل ثانية للتحميلات النشطة
    const interval = setInterval(() => {
      setActiveDownloads(getActiveDownloads());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDownloads = () => {
    try {
      const downloadedCassettes = getDownloadedCassettes();
      const activeDls = getActiveDownloads();
      setDownloads(downloadedCassettes);
      setActiveDownloads(activeDls);
      setTotalSize(getTotalDownloadSize());
      setLoading(false);
    } catch (error) {
      console.error('خطأ في تحميل التحميلات:', error);
      setLoading(false);
    }
  };

  const handleDelete = (cassetteId) => {
    if (window.confirm('هل تريد حذف هذا الشريط المحمل؟')) {
      try {
        deleteDownloadedCassette(cassetteId);
        loadDownloads(); // تحديث القائمة
        alert('✅ تم حذف الشريط');
      } catch (error) {
        alert('❌ فشل الحذف: ' + error.message);
      }
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm('⚠️ هل تريد حذف جميع التحميلات؟\nلن تتمكن من التراجع!')) {
      try {
        downloads.forEach(download => {
          deleteDownloadedCassette(download.cassetteId);
        });
        loadDownloads();
        alert('✅ تم حذف جميع التحميلات');
      } catch (error) {
        alert('❌ فشل الحذف: ' + error.message);
      }
    }
  };

  const handleOpenFolder = () => {
    if (window.electronAPI && window.electronAPI.openDownloadsFolder) {
      window.electronAPI.openDownloadsFolder();
    } else {
      alert('⚠️ هذه الميزة تعمل في تطبيق Electron فقط');
    }
  };

  // فحص إذا كان التطبيق يعمل في Electron
  const isElectron = window.electronAPI && window.electronAPI.openDownloadsFolder;

  const handlePlay = (download) => {
    if (onPlayCassette) {
      // تحويل البيانات المحفوظة إلى cassette object
      const cassette = {
        id: download.cassetteId,
        title: download.title,
        items: download.items || []
      };
      onPlayCassette(cassette);
      onClose && onClose();
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'غير معروف';
    const date = new Date(timestamp);
    return date.toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="my-downloads-overlay">
      <div className="my-downloads-container">
        <div className="my-downloads-header">
          <h2>📥 تحميلاتي</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* إحصائيات */}
        <div className="downloads-stats">
          <div className="stat-card">
            <FaDownload className="stat-icon" />
            <div className="stat-info">
              <span className="stat-value">{downloads.length}</span>
              <span className="stat-label">شريط محمل</span>
            </div>
          </div>
          <div className="stat-card">
            <FaHdd className="stat-icon" />
            <div className="stat-info">
              <span className="stat-value">{formatFileSize(totalSize)}</span>
              <span className="stat-label">المساحة المستخدمة</span>
            </div>
          </div>
        </div>

        {/* أزرار عامة */}
        <div className="downloads-actions">
          <button 
            className={`action-btn open-folder-btn ${!isElectron ? 'disabled' : ''}`}
            onClick={handleOpenFolder}
            disabled={!isElectron}
            title={!isElectron ? '⚠️ هذه الميزة تعمل في تطبيق Electron فقط' : 'فتح مجلد التحميلات'}
          >
            <FaFolder /> فتح مجلد التحميلات
            {!isElectron && <span className="electron-only-badge">Electron</span>}
          </button>
          {downloads.length > 0 && (
            <button className="action-btn delete-all-btn" onClick={handleDeleteAll}>
              <FaTrash /> حذف الكل
            </button>
          )}
        </div>

        {/* قائمة التحميلات */}
        <div className="downloads-content">
          {loading ? (
            <div className="empty-state">
              <p>جاري التحميل...</p>
            </div>
          ) : (
            <>
              {/* التحميلات النشطة */}
              {activeDownloads.length > 0 && (
                <div className="active-downloads-section">
                  <h3 className="section-title">⏬ قيد التحميل</h3>
                  <div className="downloads-list">
                    {activeDownloads.map((download) => (
                      <div key={download.id} className="download-item active-download">
                        <div className="download-info">
                          <h3 className="download-title">{download.title}</h3>
                          <div className="download-progress-info">
                            <span className="progress-text">
                              {download.current} / {download.total} ملف
                            </span>
                            <span className="progress-percentage">
                              {download.progress}%
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ width: `${download.progress}%` }}
                            />
                          </div>
                          <div className="download-status">
                            {download.status === 'downloading' && (
                              <span className="status-downloading">
                                <FaSpinner className="spinner" /> جاري التحميل...
                              </span>
                            )}
                            {download.status === 'paused' && (
                              <span className="status-paused">⏸ متوقف مؤقتاً</span>
                            )}
                          </div>
                        </div>
                        <div className="download-actions">
                          {download.status === 'downloading' ? (
                            <button 
                              className="download-action-btn pause-btn"
                              onClick={() => pauseDownload(download.id)}
                              title="إيقاف مؤقت"
                            >
                              <FaPause />
                            </button>
                          ) : (
                            <button 
                              className="download-action-btn resume-btn"
                              onClick={() => resumeDownload(download.id)}
                              title="استئناف"
                            >
                              <FaPlay />
                            </button>
                          )}
                          <button 
                            className="download-action-btn cancel-btn"
                            onClick={() => {
                              if (window.confirm('هل تريد إلغاء التحميل؟')) {
                                cancelDownload(download.id);
                                loadDownloads();
                              }
                            }}
                            title="إلغاء"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* التحميلات المكتملة */}
              {downloads.length === 0 && activeDownloads.length === 0 ? (
                <div className="empty-state">
                  <FaDownload className="empty-icon" />
                  <p>لا توجد تحميلات حتى الآن</p>
                  <small>قم بتحميل الأشرطة للاستماع بدون إنترنت</small>
                </div>
              ) : downloads.length > 0 && (
                <div className="completed-downloads-section">
                  <h3 className="section-title">✅ مكتملة</h3>
                  <div className="downloads-list">
                    {downloads.map((download) => (
                <div key={download.cassetteId} className="download-item">
                  <div className="download-info">
                    <h3 className="download-title">{download.title}</h3>
                    <div className="download-meta">
                      <span className="download-files">
                        {download.fileCount || 0} ملف
                      </span>
                      <span className="download-size">
                        {formatFileSize(download.totalSize || 0)}
                      </span>
                      <span className="download-date">
                        {formatDate(download.downloadedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="download-actions">
                    <button 
                      className="download-action-btn play-btn"
                      onClick={() => handlePlay(download)}
                      title="تشغيل"
                    >
                      <FaPlay />
                    </button>
                    <button 
                      className="download-action-btn delete-btn"
                      onClick={() => handleDelete(download.cassetteId)}
                      title="حذف"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyDownloads;
