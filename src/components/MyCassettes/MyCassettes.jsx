import React, { useState, useEffect } from 'react';
import { FaEye, FaDownload, FaEdit, FaTrash, FaClock, FaCheckCircle, FaTimesCircle, FaShare } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { getUserCassettes, deleteCassette } from '../../services/cassetteService';
import { shareUserCassettes, showShareFeedback } from '../../services/shareService';
import EditCassetteModal from '../EditCassetteModal/EditCassetteModal';
import './MyCassettes.css';

function MyCassettes({ refreshTrigger }) {
  const { currentUser } = useAuth();
  const [cassettes, setCassettes] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCassette, setSelectedCassette] = useState(null);

  useEffect(() => {
    if (currentUser) {
      loadMyCassettes();
    }
  }, [currentUser, refreshTrigger]);

  const loadMyCassettes = async () => {
    console.log('🔄 MyCassettes: بدء تحميل أشرطتي للمستخدم:', currentUser.uid);
    // ✅ عرض قائمة فارغة فوراً
    setCassettes([]);
    
    // 🚀 تحميل البيانات في الخلفية
    try {
      const userCassettes = await getUserCassettes(currentUser.uid);
      console.log('✅ MyCassettes: تم تحميل', userCassettes.length, 'شريط');
      console.log('📋 الأشرطة:', userCassettes);
      setCassettes(userCassettes);
    } catch (error) {
      console.error('❌ MyCassettes: خطأ في التحميل:', error);
      console.warn('⚠️ Firestore غير متاح، عرض قائمة فارغة:', error);
      setCassettes([]);
    }
  };

  const handleEdit = (cassette) => {
    setSelectedCassette(cassette);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCassette(null);
  };

  const handleCassetteUpdated = () => {
    loadMyCassettes();
  };

  const handleDelete = async (cassetteId) => {
    if (window.confirm('هل تريد حذف هذا الشريط؟ لا يمكن التراجع عن هذا الإجراء.')) {
      try {
        await deleteCassette(cassetteId);
        alert('🗑️ تم الحذف');
        loadMyCassettes();
      } catch (error) {
        alert('❌ فشل في الحذف');
      }
    }
  };

  const handleShareMyCassettes = async () => {
    const result = await shareUserCassettes(currentUser.uid, currentUser.displayName);
    showShareFeedback(result);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="status-badge approved"><FaCheckCircle /> معتمد</span>;
      case 'pending':
        return <span className="status-badge pending"><FaClock /> قيد المراجعة</span>;
      case 'rejected':
        return <span className="status-badge rejected"><FaTimesCircle /> مرفوض</span>;
      default:
        return null;
    }
  };

  if (!currentUser) {
    return (
      <div className="my-cassettes">
        <div className="access-denied">
          <h2>🔒 يجب تسجيل الدخول</h2>
          <p>سجل دخول لعرض شرائطك</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-cassettes">
      <div className="my-cassettes-header">
        <div className="header-content">
          <h1>📚 شرائطي</h1>
          <p className="subtitle">إجمالي الشرايط: {cassettes.length}</p>
        </div>
        {cassettes.length > 0 && (
          <button 
            className="share-my-cassettes-btn"
            onClick={handleShareMyCassettes}
            title="مشاركة شرائطي"
          >
            <FaShare />
            <span>مشاركة شرائطي</span>
          </button>
        )}
      </div>

      {cassettes.length === 0 ? (
        <div className="empty-state">
          <p>لم ترفع أي شريط بعد</p>
          <p className="hint">اضغط "إضافة شريط" في الأعلى للبدء</p>
        </div>
      ) : (
        <div className="cassettes-grid">
          {cassettes.map(cassette => (
            <div key={cassette.id} className="my-cassette-card">
              {/* Status Badge */}
              <div className="cassette-status-badge">
                {getStatusBadge(cassette.status)}
              </div>

              {/* Cassette Body - تصميم الكاسيت الحقيقي */}
              <div className="cassette-body">
                <div className="screw screw-top-left"></div>
                <div className="screw screw-top-right"></div>
                <div className="screw screw-bottom-left"></div>
                <div className="screw screw-bottom-right"></div>
                <div className="screw screw-center"></div>

                <div className="cassette-window">
                  <div className="reel reel-left">
                    <div className="reel-hub"></div>
                    <div className="reel-teeth"></div>
                  </div>
                  <div className="tape-line"></div>
                  <div className="reel reel-right">
                    <div className="reel-hub"></div>
                    <div className="reel-teeth"></div>
                  </div>
                </div>

                <div className="cassette-label">
                  <h4 className="label-title">{cassette.title}</h4>
                  <p className="label-subtitle">{cassette.items?.length || 0} ملف</p>
                </div>

                <div className="cassette-bottom-slot"></div>
              </div>

              {/* معلومات إضافية */}
              <div className="cassette-metadata">
                {cassette.status === 'approved' && (
                  <div className="analytics-row">
                    <span className="stat">
                      <FaEye /> {cassette.views || 0}
                    </span>
                  </div>
                )}
                {cassette.status === 'rejected' && cassette.rejectionReason && (
                  <div className="rejection-reason">
                    <strong>سبب الرفض:</strong> {cassette.rejectionReason}
                  </div>
                )}
              </div>

              {/* أزرار التحكم */}
              <div className="cassette-actions">
                <button 
                  className="edit-btn"
                  onClick={() => handleEdit(cassette)}
                  title="تعديل"
                >
                  <FaEdit />
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(cassette.id)}
                  title="حذف"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal التعديل */}
      <EditCassetteModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        cassette={selectedCassette}
        onCassetteUpdated={handleCassetteUpdated}
      />
    </div>
  );
}

export default MyCassettes;
