import { db } from '../firebase/config';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, increment, deleteDoc } from 'firebase/firestore';

// ===================================================
// خدمة التقييمات (Ratings Service)
// ===================================================

/**
 * إضافة أو تحديث تقييم شريط
 * @param {string} cassetteId - معرف الشريط
 * @param {string} userId - معرف المستخدم
 * @param {number} rating - التقييم (1-5)
 * @param {string} userName - اسم المستخدم
 */
export const rateCassette = async (cassetteId, userId, rating, userName) => {
  try {
    if (rating < 1 || rating > 5) {
      throw new Error('التقييم يجب أن يكون بين 1 و 5');
    }

    const ratingId = `${cassetteId}_${userId}`;
    const ratingRef = doc(db, 'ratings', ratingId);

    // حفظ التقييم
    await setDoc(ratingRef, {
      cassetteId,
      userId,
      userName,
      rating,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { merge: true });

    // تحديث متوسط التقييم في الشريط
    await updateCassetteRating(cassetteId);

    console.log('✅ تم إضافة التقييم بنجاح');
    return true;
  } catch (error) {
    console.error('❌ خطأ في إضافة التقييم:', error);
    throw error;
  }
};

/**
 * جلب تقييم مستخدم لشريط معين
 * @param {string} cassetteId - معرف الشريط
 * @param {string} userId - معرف المستخدم
 * @returns {Object|null} - التقييم أو null
 */
export const getUserRating = async (cassetteId, userId) => {
  try {
    const ratingId = `${cassetteId}_${userId}`;
    const ratingRef = doc(db, 'ratings', ratingId);
    const ratingSnap = await getDoc(ratingRef);

    if (ratingSnap.exists()) {
      return {
        id: ratingSnap.id,
        ...ratingSnap.data()
      };
    }

    return null;
  } catch (error) {
    console.error('❌ خطأ في جلب التقييم:', error);
    return null;
  }
};

/**
 * جلب جميع تقييمات شريط
 * @param {string} cassetteId - معرف الشريط
 * @returns {Array} - قائمة التقييمات
 */
export const getCassetteRatings = async (cassetteId) => {
  try {
    const q = query(
      collection(db, 'ratings'),
      where('cassetteId', '==', cassetteId)
    );

    const snapshot = await getDocs(q);
    const ratings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return ratings;
  } catch (error) {
    console.error('❌ خطأ في جلب التقييمات:', error);
    return [];
  }
};

/**
 * تحديث متوسط التقييم في الشريط
 * @param {string} cassetteId - معرف الشريط
 */
export const updateCassetteRating = async (cassetteId) => {
  try {
    const ratings = await getCassetteRatings(cassetteId);

    if (ratings.length === 0) {
      // لا توجد تقييمات - تصفير
      const cassetteRef = doc(db, 'cassettes', cassetteId);
      await updateDoc(cassetteRef, {
        averageRating: 0,
        ratingsCount: 0
      });
      return;
    }

    // حساب المتوسط
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / ratings.length;

    // تحديث الشريط
    const cassetteRef = doc(db, 'cassettes', cassetteId);
    await updateDoc(cassetteRef, {
      averageRating: parseFloat(average.toFixed(2)),
      ratingsCount: ratings.length
    });

    console.log(`✅ تم تحديث متوسط التقييم: ${average.toFixed(2)} (${ratings.length} تقييم)`);
  } catch (error) {
    console.error('❌ خطأ في تحديث متوسط التقييم:', error);
  }
};

/**
 * حذف تقييم
 * @param {string} cassetteId - معرف الشريط
 * @param {string} userId - معرف المستخدم
 */
export const deleteRating = async (cassetteId, userId) => {
  try {
    const ratingId = `${cassetteId}_${userId}`;
    const ratingRef = doc(db, 'ratings', ratingId);
    
    await deleteDoc(ratingRef);
    
    // تحديث متوسط التقييم
    await updateCassetteRating(cassetteId);

    console.log('✅ تم حذف التقييم بنجاح');
    return true;
  } catch (error) {
    console.error('❌ خطأ في حذف التقييم:', error);
    throw error;
  }
};

/**
 * حساب توزيع التقييمات (كم عدد التقييمات لكل نجمة)
 * @param {Array} ratings - قائمة التقييمات
 * @returns {Object} - توزيع التقييمات
 */
export const getRatingDistribution = (ratings) => {
  const distribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  };

  ratings.forEach(rating => {
    distribution[rating.rating] = (distribution[rating.rating] || 0) + 1;
  });

  return distribution;
};
