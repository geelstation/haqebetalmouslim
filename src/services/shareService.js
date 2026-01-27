// ===================================================
// خدمة المشاركة (Share Service)
// ===================================================

/**
 * مشاركة شريط عبر Web Share API
 */
export const shareCassette = async (cassette) => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: cassette.title,
        text: `استمع إلى: ${cassette.title}`,
        url: window.location.href
      });
      return true;
    } else {
      // Fallback: نسخ الرابط
      await navigator.clipboard.writeText(window.location.href);
      alert('✅ تم نسخ الرابط');
      return true;
    }
  } catch (error) {
    console.error('خطأ في المشاركة:', error);
    return false;
  }
};

/**
 * مشاركة مقطع معين
 */
export const shareItem = async (cassette, item) => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: item.title,
        text: `استمع إلى: ${item.title} - ${cassette.title}`,
        url: window.location.href
      });
      return true;
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('✅ تم نسخ الرابط');
      return true;
    }
  } catch (error) {
    console.error('خطأ في المشاركة:', error);
    return false;
  }
};

/**
 * نسخ رابط
 */
export const copyLink = async (url = window.location.href) => {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('خطأ في النسخ:', error);
    return false;
  }
};

/**
 * مشاركة الموقع
 */
export const shareSite = async () => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: 'حقيبة المسلم',
        text: 'استمع للقرآن الكريم والدروس الإسلامية',
        url: window.location.origin + window.location.pathname
      });
      return true;
    } else {
      await navigator.clipboard.writeText(window.location.origin + window.location.pathname);
      return true;
    }
  } catch (error) {
    console.error('خطأ في المشاركة:', error);
    return false;
  }
};

/**
 * عرض رسالة المشاركة
 */
export const showShareFeedback = (message = 'تم نسخ الرابط') => {
  // يمكن استخدام toast notification هنا
  return message;
};

/**
 * مشاركة أشرطة المستخدم
 */
export const shareUserCassettes = async (userId) => {
  try {
    const url = `${window.location.origin}${window.location.pathname}?user=${userId}`;
    
    if (navigator.share) {
      await navigator.share({
        title: 'أشرطتي في حقيبة المسلم',
        text: 'شاهد أشرطتي المرفوعة',
        url: url
      });
      return true;
    } else {
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch (error) {
    console.error('خطأ في المشاركة:', error);
    return false;
  }
};
