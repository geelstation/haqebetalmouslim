import { db } from '../firebase/config';
import { collection, addDoc, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, increment } from 'firebase/firestore';

// ===================================================
// خدمة التعليقات (Comments Service)
// ===================================================

/**
 * إضافة تعليق على شريط
 * @param {string} cassetteId - معرف الشريط
 * @param {string} userId - معرف المستخدم
 * @param {string} userName - اسم المستخدم
 * @param {string} text - نص التعليق
 * @returns {string} - معرف التعليق
 */
export const addComment = async (cassetteId, userId, userName, text) => {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('التعليق لا يمكن أن يكون فارغاً');
    }

    if (text.length > 1000) {
      throw new Error('التعليق طويل جداً (الحد الأقصى 1000 حرف)');
    }

    const commentRef = await addDoc(collection(db, 'comments'), {
      cassetteId,
      userId,
      userName,
      text: text.trim(),
      likes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // زيادة عداد التعليقات في الشريط
    const cassetteRef = doc(db, 'cassettes', cassetteId);
    await updateDoc(cassetteRef, {
      commentsCount: increment(1)
    });

    console.log('✅ تم إضافة التعليق بنجاح');
    return commentRef.id;
  } catch (error) {
    console.error('❌ خطأ في إضافة التعليق:', error);
    throw error;
  }
};

/**
 * جلب تعليقات شريط
 * @param {string} cassetteId - معرف الشريط
 * @param {number} limit - عدد التعليقات (اختياري)
 * @returns {Array} - قائمة التعليقات
 */
export const getComments = async (cassetteId, limit = 50) => {
  try {
    const q = query(
      collection(db, 'comments'),
      where('cassetteId', '==', cassetteId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }));

    return comments.slice(0, limit);
  } catch (error) {
    console.error('❌ خطأ في جلب التعليقات:', error);
    return [];
  }
};

/**
 * تعديل تعليق
 * @param {string} commentId - معرف التعليق
 * @param {string} userId - معرف المستخدم
 * @param {string} newText - النص الجديد
 */
export const editComment = async (commentId, userId, newText) => {
  try {
    if (!newText || newText.trim().length === 0) {
      throw new Error('التعليق لا يمكن أن يكون فارغاً');
    }

    if (newText.length > 1000) {
      throw new Error('التعليق طويل جداً (الحد الأقصى 1000 حرف)');
    }

    const commentRef = doc(db, 'comments', commentId);
    await updateDoc(commentRef, {
      text: newText.trim(),
      updatedAt: serverTimestamp(),
      edited: true
    });

    console.log('✅ تم تعديل التعليق بنجاح');
    return true;
  } catch (error) {
    console.error('❌ خطأ في تعديل التعليق:', error);
    throw error;
  }
};

/**
 * حذف تعليق
 * @param {string} commentId - معرف التعليق
 * @param {string} cassetteId - معرف الشريط
 */
export const deleteComment = async (commentId, cassetteId) => {
  try {
    const commentRef = doc(db, 'comments', commentId);
    await deleteDoc(commentRef);

    // تقليل عداد التعليقات في الشريط
    const cassetteRef = doc(db, 'cassettes', cassetteId);
    await updateDoc(cassetteRef, {
      commentsCount: increment(-1)
    });

    console.log('✅ تم حذف التعليق بنجاح');
    return true;
  } catch (error) {
    console.error('❌ خطأ في حذف التعليق:', error);
    throw error;
  }
};

/**
 * إعجاب/إلغاء إعجاب بتعليق
 * @param {string} commentId - معرف التعليق
 * @param {boolean} isLike - true للإعجاب، false لإلغاء الإعجاب
 */
export const likeComment = async (commentId, isLike = true) => {
  try {
    const commentRef = doc(db, 'comments', commentId);
    await updateDoc(commentRef, {
      likes: increment(isLike ? 1 : -1)
    });

    console.log(isLike ? '👍 تم الإعجاب' : '👎 تم إلغاء الإعجاب');
    return true;
  } catch (error) {
    console.error('❌ خطأ في الإعجاب:', error);
    throw error;
  }
};

/**
 * جلب تعليقات مستخدم معين
 * @param {string} userId - معرف المستخدم
 * @returns {Array} - قائمة تعليقات المستخدم
 */
export const getUserComments = async (userId) => {
  try {
    const q = query(
      collection(db, 'comments'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }));

    return comments;
  } catch (error) {
    console.error('❌ خطأ في جلب تعليقات المستخدم:', error);
    return [];
  }
};

/**
 * تنسيق تاريخ التعليق
 * @param {Date} date - التاريخ
 * @returns {string} - نص منسق
 */
export const formatCommentDate = (date) => {
  if (!date) return 'الآن';

  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'منذ لحظات';
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  if (days < 30) return `منذ ${days} يوم`;
  
  return date.toLocaleDateString('ar');
};
