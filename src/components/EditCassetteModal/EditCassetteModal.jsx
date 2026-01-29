import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { updateCassette } from '../../services/cassetteService';
import { isValidAudioUrl, prepareAudioUrl } from '../../services/audioUrlService';
import './EditCassetteModal.css';

function EditCassetteModal({ isOpen, onClose, cassette, onCassetteUpdated }) {
  const [cassetteTitle, setCassetteTitle] = useState('');
  const [audioItems, setAudioItems] = useState([
    { name: '', url: '' }
  ]);
  const [error, setError] = useState('');

  // تحميل بيانات الشريط عند الفتح
  useEffect(() => {
    if (cassette) {
      setCassetteTitle(cassette.title || '');
      setAudioItems(
        cassette.items && cassette.items.length > 0
          ? cassette.items.map(item => ({
              name: item.title || '',
              url: item.audioUrl || ''
            }))
          : [{ name: '', url: '' }]
      );
    }
  }, [cassette]);

  // إضافة صف جديد لرابط صوتي
  const addAudioItem = () => {
    console.log('➕ إضافة ملف جديد - العدد الحالي:', audioItems.length);
    const newItems = [...audioItems, { name: '', url: '' }];
    setAudioItems(newItems);
    console.log('✅ تم الإضافة - العدد الجديد:', newItems.length);
  };

  // حذف صف رابط صوتي
  const removeAudioItem = (index) => {
    if (audioItems.length > 1) {
      const newItems = audioItems.filter((_, i) => i !== index);
      setAudioItems(newItems);
    }
  };

  // تحديث بيانات رابط صوتي
  const updateAudioItem = (index, field, value) => {
    const newItems = [...audioItems];
    newItems[index][field] = value;
    setAudioItems(newItems);
  };

  // إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // التحقق من البيانات
    if (!cassetteTitle.trim()) {
      setError('⚠️ الرجاء إدخال اسم الشريط');
      return;
    }

    // التحقق من الروابط
    const validItems = audioItems.filter(item => {
      const hasName = item.name.trim();
      const hasUrl = item.url.trim();
      const isValid = hasUrl ? isValidAudioUrl(item.url.trim()) : false;
      
      if (hasUrl && !isValid) {
        console.warn('⚠️ رابط غير صالح:', item.url);
      }
      
      return hasName && isValid;
    });

    if (validItems.length === 0) {
      setError('⚠️ الرجاء إضافة ملف صوتي صحيح واحد على الأقل (يدعم archive.org وmp3quran.net وغيرها)');
      return;
    }

    try {
      // تحديث البيانات في Firestore
      await updateCassette(cassette.id, {
        title: cassetteTitle.trim(),
        items: validItems.map((item, index) => ({
          id: `item-${Date.now()}-${index}`,
          title: item.name.trim(),
          audioUrl: prepareAudioUrl(item.url.trim()),
          ayah: null
        }))
      });

      // رسالة نجاح مفصلة
      alert(`✅ تم حفظ التعديلات بنجاح!

📼 الشريط: ${cassetteTitle.trim()}
🎵 عدد الملفات: ${validItems.length}

يمكنك الآن مشاهدة الشريط المحدث في قائمة "أشرطتي"`);

      // إعادة تحميل البيانات
      if (onCassetteUpdated) {
        onCassetteUpdated();
      }

      // إغلاق النافذة
      handleClose();
    } catch (error) {
      console.error('خطأ في التعديل:', error);
      setError('❌ فشل في حفظ التعديلات. الرجاء المحاولة مرة أخرى.');
    }
  };

  // إغلاق النافذة
  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!isOpen || !cassette) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* رأس النافذة */}
        <div className="modal-header">
          <h2>✏️ تعديل الشريط</h2>
          <button className="close-btn" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        {/* المحتوى */}
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="cassette-form">
            {/* اسم الشريط */}
            <div className="form-group">
              <label htmlFor="title">اسم الشريط:</label>
              <input
                type="text"
                id="title"
                value={cassetteTitle}
                onChange={(e) => setCassetteTitle(e.target.value)}
                placeholder="مثال: سورة البقرة - عبد الباسط"
                className="form-input"
              />
            </div>

            {/* الملفات الصوتية */}
            <div className="form-group">
              <label>الملفات الصوتية:</label>
              <div className="supported-sources-hint">
                <span>✅ يدعم:</span>
                <span className="source-tag">archive.org</span>
                <span className="source-tag">mp3quran.net</span>
                <span className="source-tag">everyayah.com</span>
                <span className="source-tag">وغيرها</span>
              </div>
              <div className="audio-items">
                {audioItems.map((item, index) => (
                  <div key={index} className="audio-item">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateAudioItem(index, 'name', e.target.value)}
                      placeholder="اسم الملف (مثال: الآية 1-10)"
                      className="audio-input"
                    />
                    <input
                      type="url"
                      value={item.url}
                      onChange={(e) => updateAudioItem(index, 'url', e.target.value)}
                      placeholder="https://archive.org/download/collection/file.mp3"
                      className="audio-input"
                    />
                    <button
                      type="button"
                      onClick={() => removeAudioItem(index)}
                      className="remove-btn"
                      disabled={audioItems.length === 1}
                      title="حذف"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>

              {/* زر إضافة ملف جديد */}
              <div className="add-item-section">
                <p className="add-item-hint">💡 لإضافة روابط إضافية، اضغط على الزر أدناه:</p>
                <button
                  type="button"
                  onClick={addAudioItem}
                  className="add-item-btn"
                >
                  <FaPlus /> ➕ إضافة رابط جديد ➕
                </button>
              </div>
            </div>

            {/* رسالة الخطأ */}
            {error && <div className="error-message">{error}</div>}

            {/* الأزرار */}
            <div className="form-actions">
              <button type="submit" className="submit-btn">
                💾 حفظ التعديلات
              </button>
              <button type="button" onClick={handleClose} className="cancel-btn">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditCassetteModal;
