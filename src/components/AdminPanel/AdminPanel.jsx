import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaEdit, FaEye, FaTrash, FaBullhorn, FaUsers } from 'react-icons/fa';
import { 
  getPendingCassettes, 
  getAllCassettes,
  getUserCassettes,
  approveCassette, 
  rejectCassette,
  updateCassette,
  deleteCassette 
} from '../../services/cassetteService';
import { getAppSettings, updateTopBarMessage } from '../../services/settingsService';
import './AdminPanel.css';
import { getStats } from '../../services/analyticsService';
import OnlineUsers from '../OnlineUsers/OnlineUsers';

function AdminPanel({ isAdmin, currentUser }) {
  const [pendingCassettes, setPendingCassettes] = useState([]);
  const [allCassettes, setAllCassettes] = useState([]);
  const [myCassettes, setMyCassettes] = useState([]);
  const [viewMode, setViewMode] = useState('pending'); // 'pending' | 'all' | 'mine'
  const [selectedCassette, setSelectedCassette] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [topBarMessages, setTopBarMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [separatorIcon, setSeparatorIcon] = useState('☪');
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [stats, setStats] = useState({ totalVisits: 0, uniqueVisitors: 0, onlineNow: 0 });

  // قائمة الأيقونات الإسلامية المتاحة
  const iconOptions = [
    { icon: '☪', name: 'هلال ونجمة' },
    { icon: '✦', name: 'نجمة' },
    { icon: '❈', name: 'زهرة' },
    { icon: '✿', name: 'وردة' },
    { icon: '❣', name: 'قلب مزخرف' },
    { icon: '✹', name: 'نجمة ثمانية' },
    { icon: '✱', name: 'نجمة ثقيلة' },
    { icon: '◆', name: 'معين' },
    { icon: '•', name: 'نقطة' },
    { icon: '|', name: 'خط عمودي' }
  ];

  useEffect(() => {
    if (isAdmin) {
      loadPendingCassettes();
      loadAllCassettes();
      loadTopBarMessage();
      loadStats();
      const interval = setInterval(loadStats, 30000);
      return () => clearInterval(interval);
    }
    if (currentUser) {
      loadMyCassettes();
    }
  }, [isAdmin, currentUser]);

  const loadTopBarMessage = async () => {
    try {
      const settings = await getAppSettings();
      if (settings.topBarMessages && settings.topBarMessages.length > 0) {
        setTopBarMessages(settings.topBarMessages);
      } else if (settings.topBarMessage) {
        setTopBarMessages([settings.topBarMessage]);
      } else {
        setTopBarMessages(['بسم الله الرحمن الرحيم']);
      }
      
      // تحميل الأيقونة المحفوظة
      if (settings.separatorIcon) {
        setSeparatorIcon(settings.separatorIcon);
      }
    } catch (error) {
      console.error('خطأ في تحميل الرسالة:', error);
    }
  };

  const loadStats = async () => {
    try {
      const s = await getStats();
      setStats(s);
    } catch (e) {
      console.warn('⚠️ خطأ في تحميل الإحصائيات:', e);
      setStats({ totalVisits: 0, uniqueVisitors: 0, onlineNow: 0 });
    }
  };

  const loadPendingCassettes = async () => {
    // ✅ عرض قائمة فارغة فوراً
    setPendingCassettes([]);
    
    // 🚀 تحميل البيانات في الخلفية
    try {
      const cassettes = await getPendingCassettes();
      setPendingCassettes(cassettes);
    } catch (error) {
      console.warn('⚠️ Firestore غير متاح، عرض قائمة فارغة:', error);
      setPendingCassettes([]);
    }
  };

  const loadAllCassettes = async () => {
    setAllCassettes([]);
    try {
      const cassettes = await getAllCassettes();
      setAllCassettes(cassettes);
    } catch (error) {
      console.warn('⚠️ خطأ في تحميل جميع الأشرطة:', error);
      setAllCassettes([]);
    }
  };

  const loadMyCassettes = async () => {
    if (!currentUser?.uid) return;
    setMyCassettes([]);
    try {
      const cassettes = await getUserCassettes(currentUser.uid);
      setMyCassettes(cassettes);
    } catch (error) {
      console.warn('⚠️ خطأ في تحميل أشرطتي:', error);
      setMyCassettes([]);
    }
  };

  const handleApprove = async (cassetteId) => {
    if (window.confirm('هل تريد الموافقة على هذا الشريط؟')) {
      try {
        await approveCassette(cassetteId);
        alert('✅ تم الموافقة على الشريط');
        loadPendingCassettes();
        loadAllCassettes();
        loadMyCassettes();
      } catch (error) {
        alert('❌ فشل في الموافقة');
      }
    }
  };

  const handleReject = async (cassetteId) => {
    const reason = prompt('اذكر سبب الرفض (اختياري):');
    if (reason !== null) {
      try {
        await rejectCassette(cassetteId, reason);
        alert('❌ تم رفض الشريط');
        loadPendingCassettes();
        loadAllCassettes();
        loadMyCassettes();
      } catch (error) {
        alert('❌ فشل في الرفض');
      }
    }
  };

  const handleEdit = (cassette) => {
    setSelectedCassette(cassette);
    setEditData({
      title: cassette.title,
      imageUrl: cassette.imageUrl || '',
      items: cassette.items
    });
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateCassette(selectedCassette.id, editData);
      alert('✅ تم التعديل بنجاح');
      setEditMode(false);
      setSelectedCassette(null);
      loadPendingCassettes();
      loadAllCassettes();
      loadMyCassettes();
    } catch (error) {
      alert('❌ فشل في التعديل');
    }
  };

  const handleDelete = async (cassetteId) => {
    if (window.confirm('هل تريد حذف هذا الشريط نهائياً؟')) {
      try {
        await deleteCassette(cassetteId);
        alert('🗑️ تم الحذف');
        loadPendingCassettes();
        loadAllCassettes();
        loadMyCassettes();
      } catch (error) {
        alert('❌ فشل في الحذف');
      }
    }
  };

  const handleSaveMessage = async () => {
    try {
      console.log('🔄 محاولة تحديث الرسائل:', topBarMessages);
      await updateTopBarMessage(topBarMessages, separatorIcon);
      console.log('✅ تم التحديث بنجاح');
      alert('✅ تم تحديث الرسائل بنجاح');
      setIsEditingMessage(false);
      setCurrentMessage('');
      await loadTopBarMessage();
    } catch (error) {
      console.error('❌ خطأ في تحديث الرسائل:', error);
      console.error('تفاصيل الخطأ:', error.message);
      alert(`❌ فشل في تحديث الرسائل: ${error.message}`);
    }
  };

  const handleAddMessage = () => {
    if (currentMessage.trim()) {
      setTopBarMessages([...topBarMessages, currentMessage.trim()]);
      setCurrentMessage('');
    }
  };

  const handleRemoveMessage = (index) => {
    setTopBarMessages(topBarMessages.filter((_, i) => i !== index));
  };

  if (!isAdmin) {
    return (
      <div className="admin-panel">
        <div className="access-denied">
          <h2>⛔ غير مصرح لك بالدخول</h2>
          <p>هذه الصفحة مخصصة للأدمن فقط</p>
        </div>
      </div>
    );
  }

  // تحديد القائمة المعروضة
  const currentCassettes = viewMode === 'pending' ? pendingCassettes :
                          viewMode === 'all' ? allCassettes :
                          myCassettes;

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🎛️ لوحة تحكم الأدمن</h1>
        
        {/* إحصائيات عامة */}
        <div className="admin-stats">
          <div className="stat-item"><strong>📊 إجمالي الزيارات:</strong> {stats.totalVisits || 0}</div>
          <div className="stat-item"><strong>👥 الزوار الفريدين:</strong> {stats.uniqueVisitors}</div>
          <div className="stat-item"><strong>🟢 المتواجدون الآن:</strong> {stats.onlineNow}</div>
          <div className="stat-item"><strong>🎧 يستمعون الآن:</strong> {stats.activeListeners || 0}</div>
        </div>

        {/* شبكة الإحصائيات التفصيلية */}
        <div className="stats-grid">
        {/* إحصائيات الدول */}
        {stats.topCountries && stats.topCountries.length > 0 && (
          <div className="countries-stats">
            <h3>🌍 الزوار حسب الدولة</h3>
            <div className="country-list">
              {stats.topCountries.map((item, idx) => (
                <div key={idx} className="country-item">
                  <span className="country-name">{item.country}</span>
                  <span className="country-count">{item.count} زائر</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* إحصائيات المدن */}
        {stats.topCities && stats.topCities.length > 0 && (
          <div className="cities-stats">
            <h3>🏙️ الزوار حسب المدينة</h3>
            <div className="city-list">
              {stats.topCities.map((item, idx) => (
                <div key={idx} className="city-item">
                  <span className="city-name">{item.location}</span>
                  <span className="city-count">{item.count} زائر</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* إحصائيات المناطق */}
        {stats.topRegions && stats.topRegions.length > 0 && (
          <div className="regions-stats">
            <h3>📍 الزوار حسب المنطقة</h3>
            <div className="region-list">
              {stats.topRegions.map((item, idx) => (
                <div key={idx} className="region-item">
                  <span className="region-name">{item.region}</span>
                  <span className="region-count">{item.count} زائر</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* إحصائيات الأجهزة */}
        {stats.topDevices && stats.topDevices.length > 0 && (
          <div className="devices-stats">
            <h3>📱 الزوار حسب الجهاز</h3>
            <div className="device-list">
              {stats.topDevices.map((item, idx) => (
                <div key={idx} className="device-item">
                  <span className="device-name">{item.device}</span>
                  <span className="device-count">{item.count} زائر</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* إحصائيات أنظمة التشغيل */}
        {stats.topOS && stats.topOS.length > 0 && (
          <div className="os-stats">
            <h3>💻 الزوار حسب نظام التشغيل</h3>
            <div className="os-list">
              {stats.topOS.map((item, idx) => (
                <div key={idx} className="os-item">
                  <span className="os-name">{item.os}</span>
                  <span className="os-count">{item.count} زائر</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* إحصائيات المتصفحات */}
        {stats.topBrowsers && stats.topBrowsers.length > 0 && (
          <div className="browsers-stats">
            <h3>🌐 الزوار حسب المتصفح</h3>
            <div className="browser-list">
              {stats.topBrowsers.map((item, idx) => (
                <div key={idx} className="browser-item">
                  <span className="browser-name">{item.browser}</span>
                  <span className="browser-count">{item.count} زائر</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* إحصائيات المناطق الزمنية */}
        {stats.topTimezones && stats.topTimezones.length > 0 && (
          <div className="timezones-stats">
            <h3>🕐 الزوار حسب المنطقة الزمنية</h3>
            <div className="timezone-list">
              {stats.topTimezones.map((item, idx) => (
                <div key={idx} className="timezone-item">
                  <span className="timezone-name">{item.timezone}</span>
                  <span className="timezone-count">{item.count} زائر</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* إحصائيات العملات */}
        {stats.topCurrencies && stats.topCurrencies.length > 0 && (
          <div className="currencies-stats">
            <h3>💰 الزوار حسب العملة</h3>
            <div className="currency-list">
              {stats.topCurrencies.map((item, idx) => (
                <div key={idx} className="currency-item">
                  <span className="currency-name">{item.currency}</span>
                  <span className="currency-count">{item.count} زائر</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* الأشرطة المشغلة حالياً */}
        {stats.topPlaying && stats.topPlaying.length > 0 && (
          <div className="playing-stats">
            <h3>🎵 الأشرطة المشغلة الآن</h3>
            <div className="playing-list">
              {stats.topPlaying.map((item, idx) => (
                <div key={idx} className="playing-item">
                  <span className="cassette-title">{item.title}</span>
                  <span className="listener-count">{item.count} مستمع</span>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>{/* نهاية stats-grid */}

        <div className="view-mode-tabs">
          <button 
            className={`tab-btn ${viewMode === 'pending' ? 'active' : ''}`}
            onClick={() => setViewMode('pending')}
          >
            المعلقة ({pendingCassettes.length})
          </button>
          <button 
            className={`tab-btn ${viewMode === 'all' ? 'active' : ''}`}
            onClick={() => setViewMode('all')}
          >
            كل الأشرطة ({allCassettes.length})
          </button>
          <button 
            className={`tab-btn ${viewMode === 'mine' ? 'active' : ''}`}
            onClick={() => setViewMode('mine')}
          >
            أشرطتي ({myCassettes.length})
          </button>
          <button 
            className={`tab-btn ${viewMode === 'mine' ? 'active' : ''}`}
            onClick={() => setViewMode('mine')}
          >
            أشرطتي ({myCassettes.length})
          </button>
          <button 
            className={`tab-btn ${viewMode === 'online' ? 'active' : ''}`}
            onClick={() => setViewMode('online')}
          >
            <FaUsers /> المتواجدون الآن
          </button>
        </div>
      </div>

      {/* قسم تعديل رسالة الشريط العلوي */}
      <div className="message-editor-section">
        <div className="section-header">
          <h2><FaBullhorn /> رسالة الشريط العلوي</h2>
          <button 
            className="edit-message-btn"
            onClick={() => setIsEditingMessage(!isEditingMessage)}
          >
            {isEditingMessage ? <FaTimes /> : <FaEdit />}
            {isEditingMessage ? 'إلغاء' : 'تعديل'}
          </button>
        </div>

        {isEditingMessage ? (
          <div className="message-editor">
            <div className="messages-list">
              {topBarMessages.map((msg, index) => (
                <div key={index} className="message-item">
                  <span>{msg}</span>
                  <button 
                    className="remove-btn"
                    onClick={() => handleRemoveMessage(index)}
                    title="حذف"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
            
            {/* اختيار الأيقونة الفاصلة */}
            <div className="icon-selector">
              <label>الأيقونة الفاصلة:</label>
              <div className="icon-options">
                {iconOptions.map((option) => (
                  <button
                    key={option.icon}
                    className={`icon-option ${separatorIcon === option.icon ? 'selected' : ''}`}
                    onClick={() => setSeparatorIcon(option.icon)}
                    title={option.name}
                  >
                    {option.icon}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="add-message-form">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddMessage()}
                placeholder="اكتب رسالة جديدة..."
                className="message-input"
              />
              <button className="add-btn" onClick={handleAddMessage}>
                <FaCheck /> إضافة
              </button>
            </div>
            <div className="message-actions">
              <button className="save-btn" onClick={handleSaveMessage}>
                <FaCheck /> حفظ جميع الرسائل
              </button>
              <button className="cancel-btn" onClick={() => {
                loadTopBarMessage();
                setIsEditingMessage(false);
                setCurrentMessage('');
              }}>
                <FaTimes /> إلغاء
              </button>
            </div>
          </div>
        ) : (
          <div className="current-message">
            {topBarMessages.map((msg, index) => (
              <span key={index} style={{ fontWeight: 700, fontSize: '16px' }}>
                {msg}
                {index < topBarMessages.length - 1 && (
                  <span style={{ margin: '0 12px', color: 'var(--accent-color)', fontSize: '18px' }}> {separatorIcon} </span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="divider"></div>

      {viewMode === 'online' ? (
        <OnlineUsers />
      ) : currentCassettes.length === 0 ? (
        <div className="no-cassettes">
          <p>✅ لا توجد شرايط</p>
        </div>
      ) : (
        <div className="cassettes-grid">
          {currentCassettes.map(cassette => (
            <div key={cassette.id} className="cassette-card">
              <div className="cassette-header">
                <h3>{cassette.title}</h3>
                <span className={`status-badge ${cassette.status}`}>
                  {cassette.status === 'approved' ? 'معتمد' : 
                   cassette.status === 'pending' ? 'معلق' : 'مرفوض'}
                </span>
              </div>
              
              <div className="cassette-info">
                <p><strong>القسم:</strong> {cassette.sectionId}</p>
                <p><strong>رفع بواسطة:</strong> {cassette.createdByName}</p>
                <p><strong>الإيميل:</strong> {cassette.createdByEmail}</p>
                <p><strong>عدد الملفات:</strong> {cassette.items?.length || 0}</p>
              </div>

              <div className="cassette-actions">
                {cassette.status !== 'approved' && (
                  <button 
                    className="approve-btn"
                    onClick={() => handleApprove(cassette.id)}
                    title="موافقة"
                  >
                    <FaCheck /> موافقة
                  </button>
                )}
                
                <button 
                  className="edit-btn"
                  onClick={() => handleEdit(cassette)}
                  title="تعديل"
                >
                  <FaEdit /> تعديل
                </button>
                
                {cassette.status !== 'rejected' && (
                  <button 
                    className="reject-btn"
                    onClick={() => handleReject(cassette.id)}
                    title="رفض"
                  >
                    <FaTimes /> رفض
                  </button>
                )}
                
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(cassette.id)}
                  title="حذف"
                >
                  <FaTrash /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editMode && selectedCassette && editData && (
        <div className="edit-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>تعديل: {selectedCassette.title}</h2>
              <button onClick={() => setEditMode(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>اسم الشريط:</label>
                <input 
                  type="text"
                  value={editData.title || ''}
                  onChange={(e) => setEditData({...editData, title: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>صورة الشريط (اختياري):</label>
                <input 
                  type="url"
                  value={editData.imageUrl || ''}
                  onChange={(e) => setEditData({...editData, imageUrl: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
                {editData.imageUrl && (
                  <div className="image-preview">
                    <img src={editData.imageUrl} alt="معاينة" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>الملفات الصوتية:</label>
                {editData.items.map((item, index) => (
                  <div key={index} className="audio-item">
                    <input 
                      type="text"
                      placeholder="العنوان"
                      value={item.title}
                      onChange={(e) => {
                        const newItems = [...editData.items];
                        newItems[index].title = e.target.value;
                        setEditData({...editData, items: newItems});
                      }}
                    />
                    <input 
                      type="text"
                      placeholder="الرابط"
                      value={item.audioUrl}
                      onChange={(e) => {
                        const newItems = [...editData.items];
                        newItems[index].audioUrl = e.target.value;
                        setEditData({...editData, items: newItems});
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="save-btn" onClick={handleSaveEdit}>
                حفظ التعديلات
              </button>
              <button className="cancel-btn" onClick={() => setEditMode(false)}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
