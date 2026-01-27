import React, { useState } from 'react';
import { FaPlay, FaPause, FaUser, FaDownload, FaSpinner, FaCheckCircle, FaPlus } from 'react-icons/fa';
import { downloadEntireCassette, isCassetteDownloaded } from '../../services/downloadService';
import AudioPlayer from '../AudioPlayer/AudioPlayer';
import AddToPlaylistModal from '../AddToPlaylistModal/AddToPlaylistModal';
import './CenterPanel.css';

function CenterPanel({ 
  selectedCassette, 
  selectedItem, 
  setSelectedItem,
  isPlaying,
  setIsPlaying,
  onOpenUserProfile,
  isPlayerExpanded,
  onToggleExpand,
  onNext,
  onPrevious,
  autoPlay,
  sequentialPlay
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [selectedItemForPlaylist, setSelectedItemForPlaylist] = useState(null);

  // فحص حالة التحميل عند تغيير الشريط
  React.useEffect(() => {
    if (selectedCassette?.id) {
      setIsDownloaded(isCassetteDownloaded(selectedCassette.id));
    }
  }, [selectedCassette]);

  const handleItemClick = (item) => {
    if (selectedItem?.id === item.id) {
      // نفس الملف - toggle play/pause
      setIsPlaying(!isPlaying);
    } else {
      // ملف جديد - اختر وشغل
      setSelectedItem(item);
      setIsPlaying(true);
    }
  };

  const handleAddToPlaylist = (item, e) => {
    e.stopPropagation();
    setSelectedItemForPlaylist(item);
    setShowAddToPlaylist(true);
  };

  // تحميل الشريط كاملاً
  const handleDownloadCassette = async () => {
    if (!selectedCassette || isDownloading) return;
    
    // إظهار رسالة فورية
    alert('✅ تم إضافة الشريط لقائمة التحميلات\n\n📥 تابع التقدم من صفحة "تحميلاتي" في الشريط الجانبي');
    
    setIsDownloading(true);
    setDownloadProgress({ current: 0, total: selectedCassette.items.length });
    
    try {
      const result = await downloadEntireCassette(
        selectedCassette,
        (progress) => {
          setDownloadProgress(progress);
        }
      );
      
      if (result.success) {
        setIsDownloaded(true);
        // لا حاجة لـ alert هنا - سيرى التقدم في صفحة التحميلات
      } else if (result.cancelled) {
        // تم الإلغاء
        console.log('تم إلغاء التحميل');
      } else {
        alert(`⚠️ تم التحميل مع أخطاء:\nنجح: ${result.successCount}\nفشل: ${result.failCount}`);
      }
    } catch (error) {
      alert('❌ فشل التحميل: ' + error.message);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  };

  return (
    <div className="center-panel">
      {/* عرض موسع للمشغل */}
      {isPlayerExpanded && selectedCassette && selectedItem ? (
        <div className="expanded-player-container">
          <AudioPlayer
            selectedAyah={selectedItem}
            selectedSection={null}
            selectedCassette={selectedCassette}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            onNext={onNext}
            onPrevious={onPrevious}
            autoPlay={autoPlay}
            sequentialPlay={sequentialPlay}
            isExpanded={true}
            onToggleExpand={onToggleExpand}
          />
        </div>
      ) : (
        <>
          <div className="cassette-header">
        <h3 className="cassette-title">
          {selectedCassette ? selectedCassette.title : 'اختر شريطاً'}
        </h3>
        {selectedCassette && (
          <div className="cassette-meta">
            <span className="cassette-items-count">
              {selectedCassette.items.length} ملف
            </span>
            
            {/* مؤشر التحميل الكامل */}
            {isDownloaded && (
              <span className="downloaded-badge" title="محمل بالكامل">
                <FaCheckCircle />
              </span>
            )}
            
            {selectedCassette.createdByName && (
              <button 
                className="user-profile-link"
                onClick={() => onOpenUserProfile && onOpenUserProfile({
                  userId: selectedCassette.createdBy,
                  userName: selectedCassette.createdByName
                })}
              >
                <FaUser /> {selectedCassette.createdByName}
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="cassette-content">
        {!selectedCassette ? (
          <div className="empty-state">
            <p>اختر شريطاً من القائمة لعرض محتواه</p>
          </div>
        ) : (
          <div className="items-list">
            {selectedCassette.items.map((item, index) => (
              <div
                key={item.id}
                className={`item-row ${
                  selectedItem?.id === item.id ? 'active' : ''
                } ${
                  selectedItem?.id === item.id && isPlaying ? 'playing' : ''
                }`}
                onClick={() => handleItemClick(item)}
              >
                <span className="item-number">{index + 1}</span>
                <span className="item-title">{item.title}</span>
                <button 
                  className="add-to-playlist-btn"
                  onClick={(e) => handleAddToPlaylist(item, e)}
                  title="إضافة لقائمة"
                >
                  <FaPlus />
                </button>
                {selectedItem?.id === item.id && (
                  <span className="item-play-icon">
                    {isPlaying ? <FaPause /> : <FaPlay />}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
        </>
      )}

      {/* Modal إضافة لقائمة */}
      {showAddToPlaylist && selectedItemForPlaylist && selectedCassette && (
        <AddToPlaylistModal 
          cassette={selectedCassette}
          item={selectedItemForPlaylist}
          onClose={() => {
            setShowAddToPlaylist(false);
            setSelectedItemForPlaylist(null);
          }}
        />
      )}
    </div>
  );
}

export default CenterPanel;
