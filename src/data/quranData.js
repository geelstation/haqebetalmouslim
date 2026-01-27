// بيانات تجريبية للقرآن الكريم
// يمكن استبدالها ببيانات حقيقية من API أو ملف JSON

export const QURAN_DATA = [
  {
    id: 'juz-1',
    name: 'الجزء الأول',
    type: 'juz',
    children: [
      {
        id: 'surah-1',
        number: 1,
        name: 'سورة الفاتحة',
        type: 'surah',
        ayahCount: 7,
        revelation: 'مكية',
        ayahs: [
          {
            id: 'ayah-1-1',
            number: 1,
            surah: 'الفاتحة',
            text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            audio: null
          },
          {
            id: 'ayah-1-2',
            number: 2,
            surah: 'الفاتحة',
            text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
            audio: null
          },
          {
            id: 'ayah-1-3',
            number: 3,
            surah: 'الفاتحة',
            text: 'الرَّحْمَٰنِ الرَّحِيمِ',
            audio: null
          },
          {
            id: 'ayah-1-4',
            number: 4,
            surah: 'الفاتحة',
            text: 'مَالِكِ يَوْمِ الدِّينِ',
            audio: null
          },
          {
            id: 'ayah-1-5',
            number: 5,
            surah: 'الفاتحة',
            text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
            audio: null
          },
          {
            id: 'ayah-1-6',
            number: 6,
            surah: 'الفاتحة',
            text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
            audio: null
          },
          {
            id: 'ayah-1-7',
            number: 7,
            surah: 'الفاتحة',
            text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
            audio: null
          }
        ]
      },
      {
        id: 'surah-2',
        number: 2,
        name: 'سورة البقرة',
        type: 'surah',
        ayahCount: 286,
        revelation: 'مدنية',
        ayahs: [
          {
            id: 'ayah-2-1',
            number: 1,
            surah: 'البقرة',
            text: 'الم',
            audio: null
          },
          {
            id: 'ayah-2-2',
            number: 2,
            surah: 'البقرة',
            text: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ',
            audio: null
          },
          {
            id: 'ayah-2-3',
            number: 3,
            surah: 'البقرة',
            text: 'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ',
            audio: null
          },
          {
            id: 'ayah-2-4',
            number: 4,
            surah: 'البقرة',
            text: 'وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ',
            audio: null
          },
          {
            id: 'ayah-2-5',
            number: 5,
            surah: 'البقرة',
            text: 'أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ',
            audio: null
          }
        ]
      }
    ]
  },
  {
    id: 'surah-3',
    number: 3,
    name: 'سورة آل عمران',
    type: 'surah',
    ayahCount: 200,
    revelation: 'مدنية',
    ayahs: [
      {
        id: 'ayah-3-1',
        number: 1,
        surah: 'آل عمران',
        text: 'الم',
        audio: null
      },
      {
        id: 'ayah-3-2',
        number: 2,
        surah: 'آل عمران',
        text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
        audio: null
      },
      {
        id: 'ayah-3-3',
        number: 3,
        surah: 'آل عمران',
        text: 'نَزَّلَ عَلَيْكَ الْكِتَابَ بِالْحَقِّ مُصَدِّقًا لِّمَا بَيْنَ يَدَيْهِ وَأَنزَلَ التَّوْرَاةَ وَالْإِنجِيلَ',
        audio: null
      }
    ]
  },
  {
    id: 'surah-4',
    number: 4,
    name: 'سورة النساء',
    type: 'surah',
    ayahCount: 176,
    revelation: 'مدنية',
    ayahs: [
      {
        id: 'ayah-4-1',
        number: 1,
        surah: 'النساء',
        text: 'يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمُ الَّذِي خَلَقَكُم مِّن نَّفْسٍ وَاحِدَةٍ',
        audio: null
      }
    ]
  }
];

export const getSurahById = (id) => {
  for (const item of QURAN_DATA) {
    if (item.id === id) return item;
    if (item.children) {
      const found = item.children.find(child => child.id === id);
      if (found) return found;
    }
  }
  return null;
};

export const getAyahById = (ayahId) => {
  for (const item of QURAN_DATA) {
    if (item.ayahs) {
      const found = item.ayahs.find(ayah => ayah.id === ayahId);
      if (found) return found;
    }
    if (item.children) {
      for (const child of item.children) {
        if (child.ayahs) {
          const found = child.ayahs.find(ayah => ayah.id === ayahId);
          if (found) return found;
        }
      }
    }
  }
  return null;
};
