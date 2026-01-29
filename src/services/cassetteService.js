import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  getDocs, 
  query, 
  where,
  orderBy,
  increment,
  serverTimestamp 
} from 'firebase/firestore';

// إضافة شريط جديد
export const createCassette = async (cassetteData, userId, userEmail, userName) => {
  try {
    // إزالة autoApprove من البيانات قبل الحفظ
    const { autoApprove, ...dataWithoutAutoApprove } = cassetteData;
    
    const cassetteRef = await addDoc(collection(db, 'cassettes'), {
      ...dataWithoutAutoApprove,
      // إذا autoApprove = true (أدمن)، اعتماد مباشر. وإلا pending
      status: autoApprove ? 'approved' : 'pending',
      createdBy: userId,
      createdByEmail: userEmail,
      createdByName: userName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...(autoApprove && { approvedAt: serverTimestamp() }),
      views: 0,
      downloads: 0
    });
    
    return cassetteRef.id;
  } catch (error) {
    console.error('Error creating cassette:', error);
    throw error;
  }
};

// الحصول على جميع الشرايط المعتمدة (للمستخدمين العاديين)
export const getApprovedCassettes = async (sectionId = null) => {
  try {
    console.log('🔍 getApprovedCassettes: جلب الأشرطة المعتمدة للقسم:', sectionId);
    let q;
    if (sectionId) {
      // 🚀 تحميل أشرطة القسم المحدد فقط (بدون orderBy لتجنب Indexes)
      q = query(
        collection(db, 'cassettes'), 
        where('status', '==', 'approved'),
        where('sectionId', '==', sectionId)
      );
    } else {
      // تحميل جميع الأشرطة (استخدام نادر)
      q = query(
        collection(db, 'cassettes'), 
        where('status', '==', 'approved')
      );
    }
    
    const snapshot = await getDocs(q);
    const cassettes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    // ترتيب يدوي بعد الجلب (بدلاً من orderBy)
    cassettes.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || 0;
      const timeB = b.createdAt?.toMillis?.() || 0;
      return timeB - timeA; // الأحدث أولاً
    });
    console.log('📦 getApprovedCassettes: وجدت', cassettes.length, 'شريط معتمد');
    return cassettes;
  } catch (error) {
    console.error('❌ getApprovedCassettes: خطأ:', error);
    throw error;
  }
};

// الحصول على الشرايط المعلقة (للأدمن فقط)
export const getPendingCassettes = async () => {
  try {
    const q = query(
      collection(db, 'cassettes'), 
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    const cassettes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    // ترتيب يدوي
    cassettes.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || 0;
      const timeB = b.createdAt?.toMillis?.() || 0;
      return timeB - timeA;
    });
    return cassettes;
  } catch (error) {
    console.error('Error getting pending cassettes:', error);
    throw error;
  }
};

// 🆕 الحصول على جميع الأشرطة (للأدمن فقط - كل الحالات)
export const getAllCassettes = async () => {
  try {
    console.log('🔍 getAllCassettes: جلب جميع الأشرطة');
    const snapshot = await getDocs(collection(db, 'cassettes'));
    const cassettes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    // ترتيب يدوي
    cassettes.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || 0;
      const timeB = b.createdAt?.toMillis?.() || 0;
      return timeB - timeA;
    });
    console.log('📦 getAllCassettes: وجدت', cassettes.length, 'شريط');
    return cassettes;
  } catch (error) {
    console.error('❌ getAllCassettes: خطأ:', error);
    throw error;
  }
};

// الحصول على شرايط المستخدم (كل الحالات)
export const getUserCassettes = async (userIdOrEmail) => {
  try {
    console.log('🔍 getUserCassettes: جلب أشرطة المستخدم:', userIdOrEmail);
    
    // محاولة البحث بـ createdBy أولاً
    let q = query(
      collection(db, 'cassettes'), 
      where('createdBy', '==', userIdOrEmail)
    );
    let snapshot = await getDocs(q);
    
    // إذا لم توجد نتائج، جرب البحث بـ userEmail
    if (snapshot.empty) {
      console.log('🔄 لا توجد نتائج بـ createdBy، جاري البحث بـ userEmail...');
      q = query(
        collection(db, 'cassettes'),
        where('userEmail', '==', userIdOrEmail)
      );
      snapshot = await getDocs(q);
    }
    
    const cassettes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    // ترتيب يدوي
    cassettes.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || 0;
      const timeB = b.createdAt?.toMillis?.() || 0;
      return timeB - timeA;
    });
    console.log('📦 getUserCassettes: وجدت', cassettes.length, 'شريط للمستخدم');
    cassettes.forEach(c => {
      console.log('  - شريط:', c.title, '| حالة:', c.status, '| قسم:', c.sectionId);
    });
    return cassettes;
  } catch (error) {
    console.error('❌ getUserCassettes: خطأ:', error);
    throw error;
  }
};

// الحصول على شريط محدد بواسطة ID
export const getCassetteById = async (cassetteId) => {
  try {
    const cassetteRef = doc(db, 'cassettes', cassetteId);
    const cassetteSnap = await getDoc(cassetteRef);
    
    if (cassetteSnap.exists()) {
      return {
        id: cassetteSnap.id,
        ...cassetteSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('❌ getCassetteById: خطأ:', error);
    throw error;
  }
};

// الموافقة على شريط (أدمن فقط)
export const approveCassette = async (cassetteId) => {
  try {
    const cassetteRef = doc(db, 'cassettes', cassetteId);
    await updateDoc(cassetteRef, {
      status: 'approved',
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error approving cassette:', error);
    throw error;
  }
};

// رفض شريط (أدمن فقط)
export const rejectCassette = async (cassetteId, reason = '') => {
  try {
    const cassetteRef = doc(db, 'cassettes', cassetteId);
    await updateDoc(cassetteRef, {
      status: 'rejected',
      rejectionReason: reason,
      rejectedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error rejecting cassette:', error);
    throw error;
  }
};

// تعديل شريط
export const updateCassette = async (cassetteId, updates) => {
  try {
    const cassetteRef = doc(db, 'cassettes', cassetteId);
    await updateDoc(cassetteRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating cassette:', error);
    throw error;
  }
};

// حذف شريط
export const deleteCassette = async (cassetteId) => {
  try {
    await deleteDoc(doc(db, 'cassettes', cassetteId));
    
    // حذف الشريط من المفضلة في localStorage
    try {
      const favorites = localStorage.getItem('favorites');
      if (favorites) {
        const favArray = JSON.parse(favorites);
        const updatedFavorites = favArray.filter(id => id !== cassetteId);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      }
    } catch (localStorageError) {
      console.warn('⚠️ تعذر تحديث المفضلة في localStorage:', localStorageError);
    }
    
    // حذف حالة التشغيل إذا كانت للشريط المحذوف
    try {
      const playbackState = localStorage.getItem('lastPlaybackState');
      if (playbackState) {
        const state = JSON.parse(playbackState);
        if (state.cassetteId === cassetteId) {
          localStorage.removeItem('lastPlaybackState');
        }
      }
    } catch (playbackError) {
      console.warn('⚠️ تعذر تحديث حالة التشغيل:', playbackError);
    }
    
  } catch (error) {
    console.error('Error deleting cassette:', error);
    throw error;
  }
};

// زيادة عدد المشاهدات
export const incrementViews = async (cassetteId) => {
  try {
    const cassetteRef = doc(db, 'cassettes', cassetteId);
    await updateDoc(cassetteRef, {
      views: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing views:', error);
  }
};

// زيادة عدد التحميلات
export const incrementDownloads = async (cassetteId) => {
  try {
    const cassetteRef = doc(db, 'cassettes', cassetteId);
    await updateDoc(cassetteRef, {
      downloads: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing downloads:', error);
  }
};

// 🆕 الحصول على أحدث الأشرطة (حسب التاريخ والتحديثات)
export const getLatestCassettes = async (limit = 20) => {
  try {
    console.log('🔍 getLatestCassettes: جلب أحدث', limit, 'شريط');
    const q = query(
      collection(db, 'cassettes'), 
      where('status', '==', 'approved')
    );
    
    const snapshot = await getDocs(q);
    const cassettes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // ترتيب حسب updatedAt (آخر تحديث) ثم createdAt
    cassettes.sort((a, b) => {
      const timeA = a.updatedAt?.toMillis?.() || a.createdAt?.toMillis?.() || 0;
      const timeB = b.updatedAt?.toMillis?.() || b.createdAt?.toMillis?.() || 0;
      return timeB - timeA; // الأحدث أولاً
    });
    
    const latest = cassettes.slice(0, limit);
    console.log('📦 getLatestCassettes: وجدت', latest.length, 'شريط');
    return latest;
  } catch (error) {
    console.error('❌ getLatestCassettes: خطأ:', error);
    throw error;
  }
};

// 🔥 الحصول على الأشرطة الأكثر مشاهدة
export const getTrendingCassettes = async (limit = 20) => {
  try {
    console.log('🔍 getTrendingCassettes: جلب أكثر', limit, 'شريط مشاهدة');
    const q = query(
      collection(db, 'cassettes'), 
      where('status', '==', 'approved')
    );
    
    const snapshot = await getDocs(q);
    const cassettes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // ترتيب حسب المشاهدات (الأكثر أولاً)
    cassettes.sort((a, b) => {
      const viewsA = a.views || 0;
      const viewsB = b.views || 0;
      return viewsB - viewsA; // الأكثر مشاهدة أولاً
    });
    
    const trending = cassettes.slice(0, limit);
    console.log('📦 getTrendingCassettes: وجدت', trending.length, 'شريط');
    return trending;
  } catch (error) {
    console.error('❌ getTrendingCassettes: خطأ:', error);
    throw error;
  }
};
