import React from 'react';
import { FaPlay, FaPause, FaDownload } from 'react-icons/fa';
import { downloadEntireCassette } from '../../services/downloadService';
import './BottomBar.css';

function BottomBar({ 
  selectedAyah,
  selectedCassette,
  isPlaying, 
  setIsPlaying, 
  autoPlay, 
  setAutoPlay, 
  sequentialPlay, 
  setSequentialPlay,
  setShowMyDownloads
}) {
  const handlePlay = () => {
    if (selectedAyah) {
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = async () => {
    if (!selectedCassette) {
      alert('⚠️ اختر شريطاً أولاً');
      return;
    }
    
    // فتح صفحة التحميلات مباشرة
    if (setShowMyDownloads) {
      setShowMyDownloads(true);
    }
    
    try {
      await downloadEntireCassette(
        selectedCassette,
        (progress) => {
          console.log(`تحميل: ${progress.current}/${progress.total}`);
        }
      );
    } catch (error) {
      console.error('خطأ في التحميل:', error);
    }
  };

  return (
    <div className="bottom-bar">
      
      <div className="bottom-actions">
        <button 
          className="action-btn play-action"
          onClick={handlePlay}
          disabled={!selectedAyah}
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
          <span>{isPlaying ? 'إيقاف' : 'تشغيل'}</span>
        </button>
        
        <button 
          className="action-btn download-action"
          onClick={handleDownload}
          disabled={!selectedCassette}
          title="تحميل الشريط بالكامل"
        >
          <FaDownload />
          <span>تحميل</span>
        </button>
      </div>

      <div className="bottom-options">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={autoPlay}
            onChange={(e) => setAutoPlay(e.target.checked)}
            className="checkbox-input"
          />
          <span className="checkbox-text">تشغيل تلقائي</span>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={sequentialPlay}
            onChange={(e) => setSequentialPlay(e.target.checked)}
            className="checkbox-input"
          />
          <span className="checkbox-text">تشغيل متسلسل</span>
        </label>
      </div>

      <div className="bottom-status">
        <div className="status-indicator">
          <span className="status-dot" style={{
            backgroundColor: isPlaying ? '#4caf50' : '#808080'
          }}></span>
          <span className="status-text">
            {isPlaying ? 'جاري التشغيل' : 'متوقف'}
          </span>
        </div>
        
        {selectedAyah && (
          <div className="current-item">
            <span className="current-label">العنصر الحالي:</span>
            <span className="current-value">
              {selectedAyah.title}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default BottomBar;
