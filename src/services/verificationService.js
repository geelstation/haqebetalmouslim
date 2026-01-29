import { db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';

const VERIFIED_USERS_COLLECTION = 'verifiedUsers';

// الحصول على بيانات المستخدم الموثق
export async function getVerifiedUserProfile(userId) {
  try {
    const userRef = doc(db, VERIFIED_USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting verified user:', error);
    throw error;
  }
}

// تحديث بيانات المستخدم الموثق
export async function updateVerifiedUserProfile(userId, data) {
  try {
    const userRef = doc(db, VERIFIED_USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date()
      });
    } else {
      await setDoc(userRef, {
        userId,
        isVerified: true,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error updating verified user:', error);
    throw error;
  }
}

// توثيق مستخدم
export async function verifyUser(userEmail, adminId, verificationData) {
  try {
    // استخدام البريد الإلكتروني كـ userId
    const userId = userEmail.replace(/[@.]/g, '_');
    const userRef = doc(db, VERIFIED_USERS_COLLECTION, userId);
    
    await setDoc(userRef, {
      userId,
      email: userEmail,
      isVerified: true,
      verifiedBy: adminId,
      verifiedAt: new Date(),
      ...verificationData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error verifying user:', error);
    throw error;
  }
}

// إلغاء توثيق مستخدم
export async function unverifyUser(userId) {
  try {
    const userRef = doc(db, VERIFIED_USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      isVerified: false,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error unverifying user:', error);
    throw error;
  }
}

// الحصول على جميع المستخدمين الموثقين
export async function getAllVerifiedUsers() {
  try {
    const usersRef = collection(db, VERIFIED_USERS_COLLECTION);
    const q = query(usersRef, where('isVerified', '==', true));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      userId: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting verified users:', error);
    return [];
  }
}

// التحقق من حالة التوثيق بالبريد الإلكتروني
export async function checkVerificationStatus(email) {
  try {
    const userId = email.replace(/[@.]/g, '_');
    const userRef = doc(db, VERIFIED_USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists() && userSnap.data().isVerified) {
      return { isVerified: true, ...userSnap.data() };
    }
    return { isVerified: false };
  } catch (error) {
    console.error('Error checking verification:', error);
    return { isVerified: false };
  }
}

// البحث عن مستخدم للتوثيق (بالبريد الإلكتروني)
export async function searchUserForVerification(email) {
  try {
    const userId = email.replace(/[@.]/g, '_');
    const userRef = doc(db, VERIFIED_USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error searching user:', error);
    throw error;
  }
}
