import React, { useState } from 'react';
import { createPlaylist } from '../../services/playlistService';
import { FaTimes } from 'react-icons/fa';
import './CreatePlaylistModal.css';

function CreatePlaylistModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('الرجاء إدخال اسم القائمة');
      return;
    }

    const newPlaylist = createPlaylist(name.trim(), description.trim());
    
    if (newPlaylist) {
      onCreated && onCreated(newPlaylist);
      alert('✅ تم إنشاء القائمة بنجاح');
    } else {
      setError('فشل إنشاء القائمة');
    }
  };

  return (
    <div className="create-playlist-modal-overlay" onClick={onClose}>
      <div className="create-playlist-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>إنشاء قائمة تشغيل جديدة</h3>
          <button className="close-icon-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="playlist-name">اسم القائمة *</label>
            <input
              id="playlist-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="مثال: قائمة الصباح"
              maxLength={50}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="playlist-description">الوصف (اختياري)</label>
            <textarea
              id="playlist-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر للقائمة..."
              maxLength={200}
              rows={3}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              إلغاء
            </button>
            <button type="submit" className="submit-btn">
              إنشاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePlaylistModal;
