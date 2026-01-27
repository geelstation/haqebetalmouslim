import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaStop, FaStepForward, FaStepBackward, FaExpand } from 'react-icons/fa';
import { SECTIONS_DATA } from '../../data/sectionsData';
import { useTheme } from '../../contexts/ThemeContext';
import './LeftPanel.css';

function LeftPanel({ 
  selectedSection, 
  setSelectedSection, 
  selectedAyah, 
  isPlaying, 
  setIsPlaying,
  refreshTrigger
}) {
  const [progress, setProgress] = useState(0);
  const [sections, setSections] = useState([]);
  const { getThemeIcon } = useTheme();

  // 🔥 تحميل الأقسام من Firebase (فارغة الآن - ستمتلئ بالأشرطة تلقائياً)
  useEffect(() => {
    setSections(SECTIONS_DATA);
  }, [refreshTrigger]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleSectionClick = (section) => {
    setSelectedSection(section);
  };

  return (
    <div className="left-panel">
      {/* قائمة الأقسام الرئيسية */}
      <div className="sections-list">
        <div className="sections-items">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`section-item ${selectedSection?.id === section.id ? 'active' : ''}`}
              onClick={() => handleSectionClick(section)}
            >
              <span className="section-icon">{getThemeIcon(section.id)}</span>
              <span className="section-name">{section.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LeftPanel;
