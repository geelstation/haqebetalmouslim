import React, { useState } from 'react';
import { FaTimes, FaPlay, FaTrash, FaEdit, FaSave } from 'react-icons/fa';
import { updatePlaylist, removeItemFromPlaylist } from '../../services/playlistService';
import './PlaylistDetailsModal.css';

function PlaylistDetailsModal({ playlist, onClose, onPlay }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(playlist.name);
  const [editDescription, setEditDescription] = useState(playlist.description || '');
  const [items, setItems] = useState(playlist.items || []);

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      alert('الرجاء إدخال اسم القائمة');
      return;
    }

    const updated = updatePlaylist(playlist.id, {
      name: editName.trim(),
      description: editDescription.trim()
    });

    if (updated) {
      setIsEditing(false);
      alert('✅ تم تحديث القائمة');
      playlist.name = updated.name;
      playlist.description = updated.description;
    }
  };

  const handleRemoveItem = (itemId) => {
    if (window.confirm('هل تريد إزالة هذا المقطع من القائمة؟')) {
      if (removeItemFromPlaylist(playlist.id, itemId)) {
        const newItems = items.filter(i => i.itemId !== itemId);
        setItems(newItems);
        alert('✅ تم إزالة المقطع');
      }
    }
  };

  const handlePlayAll = () => {
    if (items.length === 0) {
      alert('⚠️ القائمة فارغة');
      return;
    }
    if (onPlay) {
      onPlay(playlist);
      onClose();
    }
  };

  const handlePlayItem = (item) => {
    // تشغيل مقطع واحد
    if (onPlay) {
      const singleItemPlaylist = {
        ...playlist,
        items: [item]
      };
      onPlay(singleItemPlaylist);
      onClose();
    }
  };

  return (
    <div className="playlist-details-overlay" onClick={onClose}>
      <div className="playlist-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="playlist-details-header">
          {isEditing ? (
            <div className="edit-form">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="اسم القائمة"
                className="edit-name-input"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="الوصف"
                className="edit-description-input"
                rows={2}
              />
              <div className="edit-actions">
                <button className="save-edit-btn" onClick={handleSaveEdit}>
                  <FaSave /> حفظ
                </button>
                <button className="cancel-edit-btn" onClick={() => setIsEditing(false)}>
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="playlist-header-info">
                <h2>{playlist.name}</h2>
                {playlist.description && <p>{playlist.description}</p>}
                <span className="playlist-items-count">{items.length} مقطع</span>
              </div>
              <div className="playlist-header-actions">
                <button className="header-action-btn edit-btn" onClick={() => setIsEditing(true)}>
                  <FaEdit /> تعديل
                </button>
                <button className="header-action-btn play-all-btn" onClick={handlePlayAll}>
                  <FaPlay /> تشغيل الكل
                </button>
              </div>
            </>
          )}
          <button className="close-icon-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="playlist-items-content">
          {items.length === 0 ? (
            <div className="empty-playlist">
              <p>القائمة فارغة</p>
              <small>أضف مقاطع من صفحة الأشرطة</small>
            </div>
          ) : (
            <div className="playlist-items-list">
              {items.map((item, index) => (
                <div key={item.itemId} className="playlist-item-row">
                  <span className="item-index">{index + 1}</span>
                  <div className="item-info">
                    <h4 className="item-title">{item.itemTitle}</h4>
                    <span className="item-cassette">{item.cassetteTitle}</span>
                  </div>
                  <div className="item-actions">
                    <button 
                      className="item-action-btn play-item-btn"
                      onClick={() => handlePlayItem(item)}
                      title="تشغيل"
                    >
                      <FaPlay />
                    </button>
                    <button 
                      className="item-action-btn remove-item-btn"
                      onClick={() => handleRemoveItem(item.itemId)}
                      title="إزالة"
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
    </div>
  );
}

export default PlaylistDetailsModal;
