import { SECTIONS_DATA } from '../data/sectionsData';

// دمج الشرايط المخصصة من localStorage مع البيانات الأساسية
export function getSectionsWithCustomCassettes() {
  try {
    // قراءة الشرايط المخصصة من localStorage
    const saved = localStorage.getItem('customCassettes');
    const customCassettes = saved ? JSON.parse(saved) : [];
    
    if (customCassettes.length === 0) {
      return SECTIONS_DATA;
    }

    // نسخ البيانات الأساسية
    const sectionsWithCustom = JSON.parse(JSON.stringify(SECTIONS_DATA));
    
    // إضافة الشرايط المخصصة للأقسام المناسبة
    customCassettes.forEach(customCassette => {
      const section = sectionsWithCustom.find(s => s.id === customCassette.sectionId);
      if (section) {
        // تحويل البيانات للصيغة المتوقعة
        const formattedCassette = {
          id: customCassette.id,
          title: customCassette.title,
          description: `شريط مخصص - ${customCassette.items.length} ملفات`,
          isCustom: true,
          createdBy: customCassette.createdBy,
          createdByName: customCassette.createdByName,
          createdAt: customCassette.createdAt,
          items: customCassette.items.map(item => ({
            id: item.id,
            title: item.title,
            audioUrl: item.audioUrl,
            src: item.audioUrl // للتوافق
          }))
        };
        
        // إضافة في البداية
        section.cassettes.unshift(formattedCassette);
      }
    });
    
    return sectionsWithCustom;
  } catch (error) {
    console.error('خطأ في قراءة الشرايط المخصصة:', error);
    return SECTIONS_DATA;
  }
}

// حذف شريط مخصص
export function deleteCustomCassette(cassetteId) {
  try {
    const saved = localStorage.getItem('customCassettes');
    const cassettes = saved ? JSON.parse(saved) : [];
    const filtered = cassettes.filter(c => c.id !== cassetteId);
    localStorage.setItem('customCassettes', JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('خطأ في حذف الشريط:', error);
    return false;
  }
}
