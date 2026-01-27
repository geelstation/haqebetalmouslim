import { db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// الحصول على بروفايل المستخدم
export const getUserProfile = async (userId) => {
  try {
    const profileRef = doc(db, 'userProfiles', userId);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      return profileSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// تحديث بروفايل المستخدم
export const updateUserProfile = async (userId, profileData) => {
  try {
    const profileRef = doc(db, 'userProfiles', userId);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      await updateDoc(profileRef, {
        ...profileData,
        updatedAt: new Date()
      });
    } else {
      await setDoc(profileRef, {
        ...profileData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
