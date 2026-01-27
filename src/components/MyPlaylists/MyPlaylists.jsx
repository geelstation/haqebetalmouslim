import React, { useState, useEffect } from 'react';
import { FaPlus, FaPlay, FaTrash, FaEdit, FaShare, FaDownload, FaUpload, FaMusic } from 'react-icons/fa';
import { getPlaylists, deletePlaylist, exportPlaylist, importPlaylist } from '../../services/playlistService';
import CreatePlaylistModal from './CreatePlaylistModal';
import PlaylistDetailsModal from './PlaylistDetailsModal';
import './MyPlaylists.css';

function MyPlaylists({ onClose, onPlayPlaylist }) {
  const [playlists, setPlaylists] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = () => {
    const allPlaylists = getPlaylists();
    setPlaylists(allPlaylists);
  };

  const handleCreatePlaylist = () => {
    setShowCreateModal(true);
  };

  const handlePlaylistCreated = () => {
    loadPlaylists();
    setShowCreateModal(false);
  };

  const handleDelete = (playlistId, e) => {
    e.stopPropagation();
    if (window.confirm('هل تريد حذف هذه القائمة؟')) {
      if (deletePlaylist(playlistId)) {
        loadPlaylists();
        alert('✅ تم حذف القائمة');
      }
    }
  };

  const handleExport = (playlist, e) => {
    e.stopPropagation();
    if (exportPlaylist(playlist.id)) {
      alert('✅ تم تصدير القائمة');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      try {
        const file = e.target.files[0];
        if (file) {
          await importPlaylist(file);
          loadPlaylists();
          alert('✅ تم استيراد القائمة');
        }
      } catch (error) {
        alert('❌ فشل الاستيراد: ' + error.message);
      }
    };
    input.click();
  };

  const handlePlaylistClick = (playlist) => {
    setSelectedPlaylist(playlist);
    setShowDetailsModal(true);
  };

  const handlePlay = (playlist, e) => {
    e.stopPropagation();
    if (playlist.items.length === 0) {
      alert('⚠️ القائمة فارغة');
      return;
    }
    
    if (onPlayPlaylist) {
      onPlayPlaylist(playlist);
      onClose && onClose();
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="my-playlists-overlay">
      <div className="my-playlists-container">
        <div className="my-playlists-header">
          <h2>📋 قوائم التشغيل</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* أزرار الإجراءات */}
        <div className="playlists-actions">
          <button className="action-btn create-btn" onClick={handleCreatePlaylist}>
            <FaPlus /> إنشاء قائمة جديدة
          </button>
          <button className="action-btn import-btn" onClick={handleImport}>
            <FaUpload /> استيراد قائمة
          </button>
        </div>

        {/* قائمة القوائم */}
        <div className="playlists-content">
          {playlists.length === 0 ? (
            <div className="empty-state">
              <FaMusic className="empty-icon" />
              <p>لا توجد قوائم تشغيل حتى الآن</p>
              <small>أنشئ قائمتك الأولى واضف إليها مقاطعك المفضلة</small>
              <button className="create-first-btn" onClick={handleCreatePlaylist}>
                <FaPlus /> إنشاء قائمة
              </button>
            </div>
          ) : (
            <div className="playlists-grid">
              {playlists.map((playlist) => (
                <div 
                  key={playlist.id} 
                  className="playlist-card"
                  onClick={() => handlePlaylistClick(playlist)}
                >
                  <div className="playlist-icon">
                    <FaMusic />
                  </div>
                  <div className="playlist-info">
                    <h3 className="playlist-name">{playlist.name}</h3>
                    {playlist.description && (
                      <p className="playlist-description">{playlist.description}</p>
                    )}
                    <div className="playlist-meta">
                      <span className="playlist-count">
                        {playlist.items.length} مقطع
                      </span>
                      <span className="playlist-date">
                        {formatDate(playlist.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="playlist-actions">
                    <button 
                      className="playlist-action-btn play-btn"
                      onClick={(e) => handlePlay(playlist, e)}
                      title="تشغيل"
                    >
                      <FaPlay />
                    </button>
                    <button 
                      className="playlist-action-btn export-btn"
                      onClick={(e) => handleExport(playlist, e)}
                      title="تصدير"
                    >
                      <FaDownload />
                    </button>
                    <button 
                      className="playlist-action-btn delete-btn"
                      onClick={(e) => handleDelete(playlist.id, e)}
                      title="حذف"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal إنشاء قائمة */}
      {showCreateModal && (
        <CreatePlaylistModal 
          onClose={() => setShowCreateModal(false)}
          onCreated={handlePlaylistCreated}
        />
      )}

      {/* Modal تفاصيل القائمة */}
      {showDetailsModal && selectedPlaylist && (
        <PlaylistDetailsModal 
          playlist={selectedPlaylist}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedPlaylist(null);
            loadPlaylists(); // تحديث القوائم
          }}
          onPlay={onPlayPlaylist}
        />
      )}
    </div>
  );
}

export default MyPlaylists;
