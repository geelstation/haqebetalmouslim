// ===================================================
// خدمة المشاركة (Share Service)
// ===================================================

/**
 * مشاركة شريط على الفيسبوك
 */
export const shareOnFacebook = (cassette) => {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(`استمع إلى: ${cassette.title}`);
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`;
  window.open(facebookUrl, '_blank', 'width=600,height=400');
};

/**
 * مشاركة شريط على تويتر
 */
export const shareOnTwitter = (cassette) => {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(`استمع إلى: ${cassette.title}`);
  const twitterUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
  window.open(twitterUrl, '_blank', 'width=600,height=400');
};

/**
 * مشاركة شريط على واتساب
 */
export const shareOnWhatsApp = (cassette) => {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(`استمع إلى: ${cassette.title}\n${url}`);
  const whatsappUrl = `https://wa.me/?text=${text}`;
  window.open(whatsappUrl, '_blank');
};

/**
 * نسخ رابط الشريط
 */
export const copyShareLink = async (cassette) => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    return true;
  } catch (error) {
    console.error('خطأ في النسخ:', error);
    return false;
  }
};

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
