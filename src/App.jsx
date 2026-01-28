import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ADMIN_EMAIL } from './firebase/config';
import { savePlaybackState, getPlaybackState } from './services/storageService';
import { getCassetteById } from './services/cassetteService';
import { SECTIONS_DATA } from './data/sectionsData';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import TopBar from './components/TopBar/TopBar';
import LeftPanel from './components/LeftPanel/LeftPanel';
import CenterPanel from './components/CenterPanel/CenterPanel';
import RightPanel from './components/RightPanel/RightPanel';
import AudioPlayer from './components/AudioPlayer/AudioPlayer';
import SideToolbar from './components/SideToolbar/SideToolbar';
import BottomBar from './components/BottomBar/BottomBar';
import AddCassetteModal from './components/AddCassetteModal/AddCassetteModal';
import AdminPanel from './components/AdminPanel/AdminPanel';
import MyCassettes from './components/MyCassettes/MyCassettes';
import MyDownloads from './components/MyDownloads/MyDownloads';
import MyPlaylists from './components/MyPlaylists/MyPlaylists';
import UserProfile from './components/UserProfile/UserProfile';
import { startTrackingPresence, updateCurrentPlayback } from './services/analyticsService';

function AppContent() {
  const { currentUser } = useAuth();
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showMyCassettes, setShowMyCassettes] = useState(false);
  const [showMyDownloads, setShowMyDownloads] = useState(false);
  const [showMyPlaylists, setShowMyPlaylists] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);
  const isAdmin = currentUser?.email === ADMIN_EMAIL;
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedCassette, setSelectedCassette] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [sequentialPlay, setSequentialPlay] = useState(false);
  const [isAddCassetteModalOpen, setIsAddCassetteModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // لتحديث القوائم
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false); // وضع التكبير
  const audioPlayerRef = useRef(null); // مرجع للمشغل للتحكم به من الاختصارات

  // تتبع الزوار والحضور (أونلاين)
  useEffect(() => {
    try {
      startTrackingPresence(currentUser || null);
    } catch (e) {
      console.warn('Presence tracking init failed:', e);
    }
  }, [currentUser]);

  // ✅ اختيار القسم الافتراضي عند فتح التطبيق
  useEffect(() => {
    if (!selectedSection && SECTIONS_DATA.length > 0) {
      // اختر قسم "القرآن الكريم" كقسم افتراضي
      const defaultSection = SECTIONS_DATA.find(s => s.id === 'quran') || SECTIONS_DATA[1];
      setSelectedSection(defaultSection);
      console.log('✅ تم اختيار القسم الافتراضي:', defaultSection.name);
    }
  }, [selectedSection]);

  // 💾 استعادة آخر حالة تشغيل عند فتح التطبيق
  useEffect(() => {
    const restorePlaybackState = async () => {
      const savedState = getPlaybackState();
      if (savedState && savedState.cassetteId) {
        try {
          console.log('🔄 استعادة حالة التشغيل:', savedState);
          const cassette = await getCassetteById(savedState.cassetteId);
          if (cassette) {
            setSelectedCassette(cassette);
            const item = cassette.items.find(i => i.id === savedState.itemId);
            if (item) {
              setSelectedItem(item);
              // حفظ position لاستعادته في AudioPlayer
              if (savedState.position) {
                console.log('✅ تم استعادة التشغيل:', cassette.title, '-', item.title, 'عند', savedState.position, 'ثانية');
              } else {
                console.log('✅ تم استعادة التشغيل:', cassette.title, '-', item.title);
              }
            }
          }
        } catch (error) {
          console.error('❌ فشل استعادة حالة التشغيل:', error);
        }
      }
    };
    restorePlaybackState();
  }, []);

  // 💾 حفظ حالة التشغيل عند تغيير الشريط أو المقطع (بدون position)
  useEffect(() => {
    if (selectedCassette && selectedItem) {
      savePlaybackState(selectedCassette.id, selectedItem.id, 0);
      console.log('💾 تم حفظ حالة التشغيل:', selectedCassette.title, '-', selectedItem.title);
      
      // تحديث بيانات التشغيل في Analytics
      if (isPlaying) {
        updateCurrentPlayback(selectedCassette.title, selectedItem.title);
      }
    }
  }, [selectedCassette, selectedItem]);
  
  // حفظ position من AudioPlayer
  const handlePositionUpdate = (position) => {
    if (selectedCassette && selectedItem && position > 0) {
      savePlaybackState(selectedCassette.id, selectedItem.id, position);
    }
  };

  // تحديث حالة التشغيل في Analytics عند تغيير isPlaying
  useEffect(() => {
    if (!isPlaying) {
      updateCurrentPlayback(null, null); // مسح بيانات التشغيل عند الإيقاف
    } else if (selectedCassette && selectedItem) {
      updateCurrentPlayback(selectedCassette.title, selectedItem.title);
    }
  }, [isPlaying]);

  // عند اختيار شريط جديد، شغّل أول ملف تلقائياً (استمرار التشغيل إذا كان شغالاً)
  useEffect(() => {
    if (selectedCassette && selectedCassette.items && selectedCassette.items.length > 0) {
      const firstItem = selectedCassette.items[0];
      setSelectedItem(firstItem);
      // لا تغيير حالة isPlaying - يستمر كما هو
    }
  }, [selectedCassette]);

  // التنقل للملف التالي
  const handleNext = () => {
    if (selectedCassette && selectedItem) {
      const currentIndex = selectedCassette.items.findIndex(item => item.id === selectedItem.id);
      if (currentIndex < selectedCassette.items.length - 1) {
        setSelectedItem(selectedCassette.items[currentIndex + 1]);
        setIsPlaying(true);
      }
    }
  };

  // التنقل للملف السابق
  const handlePrevious = () => {
    if (selectedCassette && selectedItem) {
      const currentIndex = selectedCassette.items.findIndex(item => item.id === selectedItem.id);
      if (currentIndex > 0) {
        setSelectedItem(selectedCassette.items[currentIndex - 1]);
        setIsPlaying(true);
      }
    }
  };

  // ⌨️ اختصارات لوحة المفاتيح
  useKeyboardShortcuts({
    onPlayPause: () => {
      if (selectedItem) {
        setIsPlaying(!isPlaying);
      }
    },
    onStop: () => {
      if (selectedItem) {
        setIsPlaying(false);
        if (audioPlayerRef.current) {
          audioPlayerRef.current.currentTime = 0;
        }
      }
    },
    onNext: handleNext,
    onPrevious: handlePrevious,
    onToggleFullscreen: () => setIsPlayerExpanded(!isPlayerExpanded),
    onSeekForward: () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.currentTime = Math.min(
          audioPlayerRef.current.currentTime + 10,
          audioPlayerRef.current.duration
        );
      }
    },
    onSeekBackward: () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.currentTime = Math.max(
          audioPlayerRef.current.currentTime - 10,
          0
        );
      }
    },
    onSeekToPercent: (percent) => {
      if (audioPlayerRef.current && audioPlayerRef.current.duration) {
        audioPlayerRef.current.currentTime = 
          (percent / 100) * audioPlayerRef.current.duration;
      }
    }
  });

  const handleAddCassetteClick = () => {
    setIsAddCassetteModalOpen(true);
    // إيقاف التشغيل عند فتح صفحة الرفع فقط
    setIsPlaying(false);
  };

  const handleCassetteAdded = (newCassette) => {
    console.log('🎯 App.jsx: تم إضافة شريط جديد:', newCassette);
    console.log('📍 القسم:', newCassette.sectionId);
    console.log('📝 العنوان:', newCassette.title);
    // تحديث جميع القوائم
    const newTrigger = Date.now(); // استخدام timestamp بدلاً من counter
    console.log('🔄 تحديث refreshTrigger إلى:', newTrigger);
    setRefreshTrigger(newTrigger);
    // لا حاجة لإغلاق Modal هنا - AddCassetteModal يغلقه بنفسه
  };

  return (
    <div className="app">
      <TopBar onAddCassetteClick={handleAddCassetteClick} />
    
      <div className="main-container">
        <SideToolbar 
          showAdminPanel={showAdminPanel}
          setShowAdminPanel={setShowAdminPanel}
          showMyCassettes={showMyCassettes}
          setShowMyCassettes={setShowMyCassettes}
          showMyDownloads={showMyDownloads}
          setShowMyDownloads={setShowMyDownloads}
          showMyPlaylists={showMyPlaylists}
          setShowMyPlaylists={setShowMyPlaylists}
          isAdmin={isAdmin}
        />
        
        {showAdminPanel ? (
          <AdminPanel isAdmin={isAdmin} currentUser={currentUser} />
        ) : showMyCassettes ? (
          <MyCassettes refreshTrigger={refreshTrigger} />
        ) : showMyDownloads ? (
          <MyDownloads 
            onClose={() => setShowMyDownloads(false)}
            onPlayCassette={(cassette) => {
              setSelectedCassette(cassette);
              setShowMyDownloads(false);
            }}
          />
        ) : showMyPlaylists ? (
          <MyPlaylists 
            onClose={() => setShowMyPlaylists(false)}
            onPlayPlaylist={(playlist) => {
              // تحويل قائمة التشغيل لشريط مؤقت
              const playlistCassette = {
                id: playlist.id,
                title: playlist.name,
                items: playlist.items.map(item => ({
                  id: item.itemId,
                  title: item.itemTitle,
                  audioUrl: item.audioUrl
                }))
              };
              setSelectedCassette(playlistCassette);
              setShowMyPlaylists(false);
            }}
          />
        ) : (
          <div className="content-area">
            <AudioPlayer
              selectedAyah={selectedItem}
              selectedSection={selectedSection}
              selectedCassette={selectedCassette}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              onNext={handleNext}
              onPrevious={handlePrevious}
              autoPlay={autoPlay}
              sequentialPlay={sequentialPlay}
              onPositionUpdate={handlePositionUpdate}
              savedPosition={getPlaybackState()?.position || 0}
              isExpanded={isPlayerExpanded}
              onToggleExpand={() => setIsPlayerExpanded(!isPlayerExpanded)}
              audioRefCallback={(ref) => { audioPlayerRef.current = ref; }}
            />
            
            <LeftPanel 
              selectedSection={selectedSection}
              setSelectedSection={setSelectedSection}
              refreshTrigger={refreshTrigger}
            />
            
            <CenterPanel 
              selectedCassette={selectedCassette}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              onOpenUserProfile={(user) => {
                setSelectedProfileUser(user);
                setShowUserProfile(true);
              }}
              onNext={handleNext}
              onPrevious={handlePrevious}
              autoPlay={autoPlay}
              sequentialPlay={sequentialPlay}
            />
            
            <RightPanel 
              selectedSection={selectedSection}
              selectedCassette={selectedCassette}
              setSelectedCassette={setSelectedCassette}
              refreshTrigger={refreshTrigger}
              isPlaying={isPlaying}
            />
          </div>
        )}
      </div>
      
      <BottomBar 
        selectedAyah={selectedItem}
        selectedCassette={selectedCassette}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        autoPlay={autoPlay}
        setAutoPlay={setAutoPlay}
        sequentialPlay={sequentialPlay}
        setSequentialPlay={setSequentialPlay}
        setShowMyDownloads={setShowMyDownloads}
      />

      {/* Modal إضافة شريط */}
      <AddCassetteModal
        isOpen={isAddCassetteModalOpen}
        onClose={() => setIsAddCassetteModalOpen(false)}
        onCassetteAdded={handleCassetteAdded}
      />

      {/* صفحة البروفايل */}
      {showUserProfile && selectedProfileUser && (
        <UserProfile
          userId={selectedProfileUser.userId}
          userName={selectedProfileUser.userName}
          currentUser={currentUser}
          onClose={() => {
            setShowUserProfile(false);
            setSelectedProfileUser(null);
          }}
          onCassetteClick={(cassette) => {
            setSelectedCassette(cassette);
            setShowUserProfile(false);
          }}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
