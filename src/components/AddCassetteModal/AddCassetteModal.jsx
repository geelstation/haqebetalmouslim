import React, { useState } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { SECTIONS_DATA } from '../../data/sectionsData';
import { createCassette } from '../../services/cassetteService';
import { ADMIN_EMAIL } from '../../firebase/config';
import './AddCassetteModal.css';

function AddCassetteModal({ isOpen, onClose, onCassetteAdded }) {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.email === ADMIN_EMAIL;
  
  // بيانات الشريط
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [cassetteTitle, setCassetteTitle] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // رابط صورة الشريط/الشيخ
  const [audioItems, setAudioItems] = useState([
    { name: '', url: '' }
  ]);
  const [error, setError] = useState('');
  
  // AI Mode للقرآن (للأدمن فقط)
  const [aiMode, setAiMode] = useState(false);
  const [firstSurahName, setFirstSurahName] = useState('الفاتحة');
  const [firstSurahUrl, setFirstSurahUrl] = useState('');
  
  // أسماء السور
  const surahNames = [
    'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 'التوبة', 'يونس',
    'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه',
    'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم',
    'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر', 'يس', 'الصافات', 'ص', 'الزمر', 'غافر',
    'فصلت', 'الشورى', 'الزخرف', 'الدّخان', 'الجاثية', 'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق',
    'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة',
    'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج',
    'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس',
    'التكوير', 'الإنفطار', 'المطففين', 'الإنشقاق', 'البروج', 'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد',
    'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات',
    'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر',
    'المسد', 'الإخلاص', 'الفلق', 'الناس'
  ];

  // إضافة صف جديد لرابط صوتي
  const addAudioItem = () => {
    setAudioItems([...audioItems, { name: '', url: '' }]);
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
  
  // توليد القرآن كاملاً (AI Mode)
  const generateQuran = () => {
    if (!firstSurahUrl.trim()) {
      setError('الرجاء إدخال رابط السورة الأولى');
      return;
    }
    
    // استخراج النمط من الرابط
    // مثال: https://server12.mp3quran.net/kyat/001.mp3
    const urlPattern = firstSurahUrl.trim();
    
    // التحقق من أن الرابط يحتوي على 001
    if (!urlPattern.includes('001')) {
      setError('الرابط يجب أن يحتوي على 001 للسورة الأولى');
      return;
    }
    
    // توليد 114 سورة
    const generatedItems = surahNames.map((surahName, index) => {
      const surahNumber = String(index + 1).padStart(3, '0'); // 001, 002, 003...
      const url = urlPattern.replace('001', surahNumber);
      return {
        name: surahName,
        url: url
      };
    });
    
    setAudioItems(generatedItems);
    setError('');
    alert('✅ تم توليد 114 سورة تلقائياً!');
  };

  // إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // التحقق من البيانات
    if (!selectedSectionId) {
      setError('الرجاء اختيار القسم');
      return;
    }

    if (!cassetteTitle.trim()) {
      setError('الرجاء إدخال اسم الشريط');
      return;
    }

    // التحقق من الروابط
    const validItems = audioItems.filter(item => 
      item.name.trim() && item.url.trim()
    );

    if (validItems.length === 0) {
      setError('الرجاء إضافة رابط صوتي واحد على الأقل');
      return;
    }
    
    // حفظ في Firestore
    const cassetteData = {
      sectionId: selectedSectionId,
      title: cassetteTitle.trim(),
      imageUrl: imageUrl.trim() || null, // إضافة رابط الصورة
      items: validItems.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        title: item.name.trim(),
        audioUrl: item.url.trim(),
        ayah: null
      })),
      isCustom: true,
      // إذا كان أدمن، اعتماد مباشر. وإلا pending
      autoApprove: isAdmin
    };

    console.log('📤 إرسال شريط جديد:', {
      sectionId: selectedSectionId,
      title: cassetteTitle.trim(),
      itemsCount: validItems.length,
      isAdmin,
      autoApprove: isAdmin
    });

    // إرسال في الخلفية بدون انتظار
    createCassette(
      cassetteData,
      currentUser.uid,
      currentUser.email,
      currentUser.displayName
    ).then(() => {
      console.log('✅ تم حفظ الشريط بنجاح في Firestore');
      // استدعاء callback للتحديث
      if (onCassetteAdded) {
        console.log('🔄 استدعاء onCassetteAdded لتحديث القوائم');
        onCassetteAdded(cassetteData);
      } else {
        console.warn('⚠️ onCassetteAdded غير موجود!');
      }
    }).catch((error) => {
      console.error('❌ خطأ في حفظ الشريط:', error);
      alert('❌ فشل في حفظ الشريط. تحقق من الاتصال بـ Firestore.');
    });
    
    // إغلاق فوري
    if (isAdmin) {
      alert('✅ تم رفع الشريط وإعتماده مباشرة!');
    } else {
      alert('✅ جاري الرفع... سيتم عرض الشريط بعد موافقة الأدمن.');
    }
    resetForm();
    onClose();
  };

  // إعادة تعيين النموذج
  const resetForm = () => {
    setSelectedSectionId('');
    setCassetteTitle('');
    setImageUrl('');
    setAudioItems([{ name: '', url: '' }]);
    setError('');
    setAiMode(false);
    setFirstSurahName('الفاتحة');
    setFirstSurahUrl('');
  };

  // إغلاق النافذة
  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* رأس النافذة */}
        <div className="modal-header">
          <h2>إضافة شريط جديد</h2>
          <button className="close-btn" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        {/* المحتوى */}
        <div className="modal-body">
          {!currentUser ? (
            // رسالة تطلب تسجيل الدخول أولاً
            <div className="auth-container">
              <div className="auth-message">
                <h3>🔒 تسجيل الدخول مطلوب</h3>
                <p>الرجاء تسجيل الدخول أولاً من الشريط العلوي لإضافة شريط جديد</p>
                <button 
                  className="close-modal-btn"
                  onClick={handleClose}
                >
                  إغلاق
                </button>
              </div>
            </div>
          ) : (
            // نموذج إضافة الشريط
            <form onSubmit={handleSubmit} className="cassette-form">
              {/* معلومات المستخدم */}
              <div className="user-info">
                <img src={currentUser.photoURL} alt={currentUser.displayName} />
                <span>{currentUser.displayName}</span>
              </div>

              {/* اختيار القسم */}
              <div className="form-group">
                <label htmlFor="section">القسم:</label>
                <select
                  id="section"
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  required
                >
                  <option value="">-- اختر القسم --</option>
                  {SECTIONS_DATA.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* اسم الشريط */}
              <div className="form-group">
                <label htmlFor="title">اسم الشريط:</label>
                <input
                  type="text"
                  id="title"
                  value={cassetteTitle}
                  onChange={(e) => setCassetteTitle(e.target.value)}
                  placeholder="أدخل اسم الشريط"
                  required
                />
              </div>

              {/* رابط صورة الشريط/الشيخ */}
              <div className="form-group">
                <label htmlFor="imageUrl">صورة الشريط (اختياري):</label>
                <input
                  type="url"
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {imageUrl && (
                  <div className="image-preview">
                    <img src={imageUrl} alt="معاينة" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>

              {/* AI Mode للقرآن (أدمن فقط) */}
              {isAdmin && selectedSectionId === 'quran' && (
                <div className="form-group ai-mode-section">
                  <div className="ai-mode-header">
                    <label>
                      <input
                        type="checkbox"
                        checked={aiMode}
                        onChange={(e) => {
                          setAiMode(e.target.checked);
                          if (e.target.checked) {
                            setAudioItems([{ name: '', url: '' }]);
                          }
                        }}
                      />
                      🤖 تفعيل التوليد التلقائي للقرآن (AI)
                    </label>
                  </div>
                  
                  {aiMode && (
                    <div className="ai-mode-inputs">
                      <p className="ai-mode-desc">
                        أدخل رابط السورة الأولى فقط وسيتم توليد 114 سورة تلقائياً
                      </p>
                      
                      <div className="ai-input-row">
                        <input
                          type="text"
                          value={firstSurahName}
                          disabled
                          placeholder="السورة الأولى"
                          className="ai-surah-name"
                        />
                        
                        <input
                          type="url"
                          value={firstSurahUrl}
                          onChange={(e) => setFirstSurahUrl(e.target.value)}
                          placeholder="https://server12.mp3quran.net/kyat/001.mp3"
                          className="ai-surah-url"
                        />
                      </div>
                      
                      <button
                        type="button"
                        className="generate-quran-btn"
                        onClick={generateQuran}
                      >
                        🚀 توليد القرآن كاملاً (114 سورة)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* الروابط الصوتية */}
              {!aiMode && (
                <div className="form-group audio-items-section">
                <label>الروابط الصوتية:</label>
                
                <div className="audio-items-list">
                  {audioItems.map((item, index) => (
                    <div key={index} className="audio-item-row">
                      <span className="item-number">{index + 1}</span>
                      
                      <input
                        type="text"
                        placeholder="اسم الملف الصوتي"
                        value={item.name}
                        onChange={(e) => updateAudioItem(index, 'name', e.target.value)}
                        className="audio-name-input"
                      />
                      
                      <input
                        type="url"
                        placeholder="https://example.com/audio.mp3"
                        value={item.url}
                        onChange={(e) => updateAudioItem(index, 'url', e.target.value)}
                        className="audio-url-input"
                      />
                      
                      {audioItems.length > 1 && (
                        <button
                          type="button"
                          className="remove-item-btn"
                          onClick={() => removeAudioItem(index)}
                          title="حذف"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="add-item-btn"
                  onClick={addAudioItem}
                >
                  <FaPlus />
                  <span>إضافة رابط صوتي</span>
                </button>
              </div>
              )}
              
              {/* عرض السور المولدة في AI Mode */}
              {aiMode && audioItems.length > 1 && (
                <div className="form-group generated-items-section">
                  <label>السور المولدة ({audioItems.length}):</label>
                  <div className="generated-items-preview">
                    <p>✅ تم توليد {audioItems.length} سورة تلقائياً</p>
                    <div className="preview-scroll">
                      {audioItems.slice(0, 5).map((item, index) => (
                        <div key={index} className="preview-item">
                          {index + 1}. {item.name}
                        </div>
                      ))}
                      {audioItems.length > 5 && (
                        <div className="preview-more">
                          ... و {audioItems.length - 5} سورة أخرى
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* رسالة خطأ */}
              {error && <div className="error-message">{error}</div>}

              {/* أزرار الإجراءات */}
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleClose}
                >
                  إلغاء
                </button>
                
                <button
                  type="submit"
                  className="submit-btn"
                >
                  رفع الشريط
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddCassetteModal;
