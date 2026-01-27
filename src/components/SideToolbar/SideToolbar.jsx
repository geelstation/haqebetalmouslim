import React from 'react';
import { FaSync, FaUser, FaUserShield, FaQuestionCircle, FaDownload, FaListUl } from 'react-icons/fa';
import './SideToolbar.css';

function SideToolbar({ 
  showAdminPanel, 
  setShowAdminPanel, 
  showMyCassettes, 
  setShowMyCassettes, 
  showMyDownloads,
  setShowMyDownloads,
  showMyPlaylists,
  setShowMyPlaylists,
  isAdmin 
}) {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleMyCassettes = () => {
    setShowMyCassettes(!showMyCassettes);
    if (showAdminPanel) setShowAdminPanel(false);
    if (showMyDownloads) setShowMyDownloads(false);
    if (showMyPlaylists) setShowMyPlaylists(false);
  };

  const handleMyDownloads = () => {
    setShowMyDownloads(!showMyDownloads);
    if (showAdminPanel) setShowAdminPanel(false);
    if (showMyCassettes) setShowMyCassettes(false);
    if (showMyPlaylists) setShowMyPlaylists(false);
  };

  const handleMyPlaylists = () => {
    setShowMyPlaylists(!showMyPlaylists);
    if (showAdminPanel) setShowAdminPanel(false);
    if (showMyCassettes) setShowMyCassettes(false);
    if (showMyDownloads) setShowMyDownloads(false);
  };

  const handleAdminPanel = () => {
    setShowAdminPanel(!showAdminPanel);
    if (showMyCassettes) setShowMyCassettes(false);
    if (showMyDownloads) setShowMyDownloads(false);
    if (showMyPlaylists) setShowMyPlaylists(false);
  };

  const handleHelp = () => {
    alert('مرحباً بك في حقيبة المسلم!\n\n- اختر قسم من القائمة اليسرى\n- اختر شريط من القائمة اليمنى\n- استمتع بالاستماع\n\nللمساعدة: geelstation@gmail.com');
  };

  return (
    <div className="side-toolbar">
      <button 
        className="toolbar-btn" 
        onClick={handleRefresh}
        title="تحديث"
      >
        <FaSync />
      </button>
      
      <button 
        className={`toolbar-btn ${showMyDownloads ? 'active' : ''}`}
        onClick={handleMyDownloads}
        title="تحميلاتي"
      >
        <FaDownload />
      </button>
      
      <button 
        className={`toolbar-btn ${showMyPlaylists ? 'active' : ''}`}
        onClick={handleMyPlaylists}
        title="قوائم التشغيل"
      >
        <FaListUl />
      </button>
      
      {isAdmin && (
        <button 
          className={`toolbar-btn ${showAdminPanel ? 'active' : ''}`}
          onClick={handleAdminPanel}
          title="لوحة التحكم"
        >
          <FaUserShield />
        </button>
      )}
      
      <div className="toolbar-spacer"></div>
      
      <button 
        className="toolbar-btn" 
        onClick={handleHelp}
        title="مساعدة"
      >
        <FaQuestionCircle />
      </button>
    </div>
  );
}

export default SideToolbar;
