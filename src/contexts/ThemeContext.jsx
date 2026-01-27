import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('brown');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'brown';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const themes = ['brown', 'green', 'black', 'pink'];
    const currentIndex = themes.indexOf(theme);
    const newTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const getThemeIcon = (sectionId) => {
    // أيقونات مناسبة لكل قسم
    const icons = {
      'favorites': '💖',      // المفضلة
      'quran': '📿',          // القرآن الكريم
      'nasheeds': '🎼',       // الأناشيد
      'lectures': '🕌',       // دروس إسلامية
      'podcast': '🎧',        // بودكاست
      'student': '📚',        // طالب علم
      'latest': '✨',         // أحدث الإصدارات
      'trending': '🔥',       // الأعلى مشاهدة
      'downloaded': '⬇️'      // المحمّلة
    };
    return icons[sectionId] || '📁';
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, getThemeIcon }}>
      {children}
    </ThemeContext.Provider>
  );
}
