import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';
import { getPlaylists, addItemToPlaylist, createPlaylist } from '../../services/playlistService';
import './AddToPlaylistModal.css';

function AddToPlaylistModal({ cassette, item, onClose }) {
  const [playlists, setPlaylists] = useState([]);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = () => {
    const allPlaylists = getPlaylists();
    setPlaylists(allPlaylists);
  };

  const handleAddToPlaylist = (playlistId) => {
    const result = addItemToPlaylist(playlistId, cassette, item);
    if (result) {
      alert('✅ تم إضافة المقطع للقائمة');
      onClose();
    } else {
      alert('⚠️ المقطع موجود بالفعل في هذه القائمة');
    }
  };

  const handleCreateAndAdd = () => {
    if (!newPlaylistName.trim()) {
      alert('الرجاء إدخال اسم القائمة');
      return;
    }

    const newPlaylist = createPlaylist(newPlaylistName.trim());
    if (newPlaylist) {
      addItemToPlaylist(newPlaylist.id, cassette, item);
      alert('✅ تم إنشاء القائمة وإضافة المقطع');
      onClose();
    }
  };

  return (
    <div className="add-to-playlist-overlay" onClick={onClose}>
      <div className="add-to-playlist-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>إضافة إلى قائمة</h3>
          <button className="close-icon-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content">
          <div className="track-info">
            <strong>{item.title}</strong>
            <small>{cassette.title}</small>
          </div>

          {playlists.length === 0 ? (
            <p className="no-playlists">لا توجد قوائم. أنشئ قائمة جديدة أولاً</p>
          ) : (
            <div className="playlists-list">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  className="playlist-option"
                  onClick={() => handleAddToPlaylist(playlist.id)}
                >
                  <span>{playlist.name}</span>
                  <small>{playlist.items.length} مقطع</small>
                </button>
              ))}
            </div>
          )}

          <div className="create-new-section">
            {showCreateNew ? (
              <div className="create-new-form">
                <input
                  type="text"
                  placeholder="اسم القائمة الجديدة"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateAndAdd()}
                  autoFocus
                />
                <div className="create-actions">
                  <button className="create-btn" onClick={handleCreateAndAdd}>
                    إنشاء وإضافة
                  </button>
                  <button className="cancel-btn" onClick={() => setShowCreateNew(false)}>
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <button className="new-playlist-btn" onClick={() => setShowCreateNew(true)}>
                <FaPlus /> إنشاء قائمة جديدة
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddToPlaylistModal;
