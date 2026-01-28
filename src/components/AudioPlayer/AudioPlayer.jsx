import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaStop, FaStepForward, FaStepBackward, FaExpand, FaCompress, FaTachometerAlt, FaClock } from 'react-icons/fa';
import { getLocalPath } from '../../services/downloadService';
import './AudioPlayer.css';

function AudioPlayer({ 
  selectedAyah, 
  selectedSection,
  selectedCassette,
  isPlaying, 
  setIsPlaying,
  onNext,
  onPrevious,
  autoPlay,
  sequentialPlay,
  isExpanded,
  onToggleExpand,
  onPositionUpdate,
  savedPosition,
  audioRefCallback // callback لتمرير ref للخارج
}) {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0); // سرعة التشغيل
  const [showSpeedMenu, setShowSpeedMenu] = useState(false); // قائمة السرعة
  const [sleepTimer, setSleepTimer] = useState(null); // مؤقت النوم
  const [sleepTimeLeft, setSleepTimeLeft] = useState(0); // الوقت المتبقي
  const [showSleepMenu, setShowSleepMenu] = useState(false); // قائمة المؤقت
  const audioRef = useRef(null);
  const sleepTimerRef = useRef(null);

  // تمرير ref للخارج لاستخدامها في الاختصارات
  useEffect(() => {
    if (audioRefCallback && audioRef.current) {
      audioRefCallback(audioRef.current);
    }
  }, [audioRefCallback]);

  // تحديث المشغل عند تغيير الملف
  useEffect(() => {
    if (selectedAyah && audioRef.current) {
      const audioUrl = selectedAyah.audioUrl || selectedAyah.src;
      
      if (audioUrl) {
        try {
          // التحقق من وجود نسخة محملة محلياً
          const localPath = getLocalPath(audioUrl);
          
          if (localPath) {
            // استخدام الملف المحلي
            console.log('🎵 تشغيل من الملف المحلي:', localPath);
            audioRef.current.src = `file://${localPath}`;
          } else if (audioUrl.startsWith('http')) {
            // استخدام الرابط الأصلي
            audioRef.current.src = audioUrl;
          }
        } catch (error) {
          // في حالة خطأ، استخدام الرابط الأصلي
          console.log('⚠️ استخدام الرابط الأصلي');
          if (audioUrl.startsWith('http')) {
            audioRef.current.src = audioUrl;
          }
        }
        
        // تحميل البيانات دون التشغيل التلقائي
        audioRef.current.load();
        
        // التشغيل فقط إذا كان المستخدم قد ضغط زر التشغيل مسبقاً
        if (isPlaying && autoPlay) {
          // استخدام timeout قصير للسماح بتحميل البيانات الوصفية
          setTimeout(() => {
            audioRef.current?.play().catch(err => console.error('خطأ في التشغيل:', err));
          }, 100);
        }
      }
    }
  }, [selectedAyah, isPlaying, autoPlay]);

  // التحكم في التشغيل/الإيقاف
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => console.error('خطأ في التشغيل:', err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // تحديث التقدم أثناء التشغيل
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setCurrentTime(current);
      if (total > 0) {
        setProgress((current / total) * 100);
      }
      
      // حفظ position كل 5 ثواني
      if (onPositionUpdate && Math.floor(current) % 5 === 0) {
        onPositionUpdate(current);
      }
    }
  };

  // تحميل البيانات
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      
      // استعادة الوضع المحفوظ
      if (savedPosition && savedPosition > 0) {
        audioRef.current.currentTime = savedPosition;
        console.log('✅ تم استعادة الموضع:', savedPosition);
      }
    }
  };

  // تغيير موضع التشغيل عند سحب شريط التقدم
  const handleProgressChange = (e) => {
    const newProgress = e.target.value;
    setProgress(newProgress);
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = (newProgress / 100) * duration;
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
    }
  };

  // ⏱️ التحكم في السرعة
  const handleSpeedChange = (speed) => {
    setPlaybackRate(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  // 😴 ضبط مؤقت النوم
  const setSleepTimerMinutes = (minutes) => {
    // إلغاء المؤقت السابق
    if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
    }
    
    if (minutes === 0) {
      setSleepTimer(null);
      setSleepTimeLeft(0);
      setShowSleepMenu(false);
      return;
    }
    
    const endTime = Date.now() + (minutes * 60 * 1000);
    setSleepTimer(endTime);
    setSleepTimeLeft(minutes * 60);
    setShowSleepMenu(false);
    
    // عداد تنازلي
    sleepTimerRef.current = setInterval(() => {
      const remaining = Math.floor((endTime - Date.now()) / 1000);
      
      if (remaining <= 0) {
        // إيقاف التشغيل
        handleStop();
        setSleepTimer(null);
        setSleepTimeLeft(0);
        clearInterval(sleepTimerRef.current);
        alert('⏰ انتهى مؤقت النوم - تم إيقاف التشغيل');
      } else {
        setSleepTimeLeft(remaining);
      }
    }, 1000);
  };

  // تنظيف المؤقت عند إلغاء التحميل
  useEffect(() => {
    return () => {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
      }
    };
  }, []);

  // تطبيق السرعة على العنصر الصوتي
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // تنسيق الوقت
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // تنسيق وقت المؤقت (ساعات:دقائق:ثواني)
  const formatSleepTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`audio-player ${isExpanded ? 'expanded' : ''}`}>
      {/* مشغل الصوت المخفي */}
      <audio 
        ref={audioRef} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          if (sequentialPlay && onNext) {
            onNext();
          } else {
            setIsPlaying(false);
            setProgress(0);
          }
        }}
      />
      
      {/* زر التكبير/التصغير */}
      {onToggleExpand && (
        <button 
          className="expand-toggle-btn"
          onClick={onToggleExpand}
          title={isExpanded ? "تصغير" : "تكبير"}
        >
          {isExpanded ? <FaCompress /> : <FaExpand />}
        </button>
      )}
      
      <div className="media-viewer">
        <div className="no-media-placeholder">
          {selectedAyah ? (
            <div className="ayah-display">
              {/* صورة الشريط/الشيخ */}
              {selectedCassette?.imageUrl ? (
                <div className={`cassette-cover ${isPlaying ? 'playing' : ''}`}>
                  <img src={selectedCassette.imageUrl} alt={selectedCassette.title} />
                  {/* لمعة متحركة */}
                  <div className="shine-effect"></div>
                  {/* موجات صوتية */}
                  {isPlaying && (
                    <div className="sound-waves">
                      <span className="wave"></span>
                      <span className="wave"></span>
                      <span className="wave"></span>
                      <span className="wave"></span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="ayah-arabic arabic-text">{selectedAyah.title}</p>
              )}
            </div>
          ) : (
            <p className="placeholder-text">اختر ملف للتشغيل</p>
          )}
        </div>
      </div>

      <div className="media-controls">
        <div className="control-buttons">
          <button 
            className="control-btn" 
            onClick={onPrevious}
            disabled={!selectedAyah || !onPrevious}
            title="السابق"
          >
            <FaStepBackward />
          </button>
          
          <button 
            className="control-btn play-btn" 
            onClick={handlePlayPause}
            disabled={!selectedAyah}
            title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          
          <button 
            className="control-btn" 
            onClick={handleStop}
            disabled={!selectedAyah}
            title="إيقاف"
          >
            <FaStop />
          </button>
          
          <button 
            className="control-btn" 
            onClick={onNext}
            disabled={!selectedAyah || !onNext}
            title="التالي"
          >
            <FaStepForward />
          </button>

          {/* زر التحكم في السرعة */}
          <div className="speed-control">
            <button 
              className="control-btn speed-btn" 
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              disabled={!selectedAyah}
              title="سرعة التشغيل"
            >
              <FaTachometerAlt />
              <span className="speed-label">{playbackRate}x</span>
            </button>
            
            {showSpeedMenu && (
              <div className="speed-menu">
                <button onClick={() => handleSpeedChange(0.5)}>0.5x</button>
                <button onClick={() => handleSpeedChange(0.75)}>0.75x</button>
                <button onClick={() => handleSpeedChange(1.0)} className="default">1x</button>
                <button onClick={() => handleSpeedChange(1.25)}>1.25x</button>
                <button onClick={() => handleSpeedChange(1.5)}>1.5x</button>
                <button onClick={() => handleSpeedChange(2.0)}>2x</button>
              </div>
            )}
          </div>

          {/* مؤقت النوم */}
          <div className="sleep-timer-control">
            <button 
              className="control-btn sleep-btn" 
              onClick={() => setShowSleepMenu(!showSleepMenu)}
              title="مؤقت النوم"
            >
              <FaClock />
              {sleepTimer && <span className="timer-badge">{formatSleepTime(sleepTimeLeft)}</span>}
            </button>
            
            {showSleepMenu && (
              <div className="sleep-menu">
                <button onClick={() => setSleepTimerMinutes(15)}>15 دقيقة</button>
                <button onClick={() => setSleepTimerMinutes(30)}>30 دقيقة</button>
                <button onClick={() => setSleepTimerMinutes(45)}>45 دقيقة</button>
                <button onClick={() => setSleepTimerMinutes(60)}>60 دقيقة</button>
                {sleepTimer && <button onClick={() => setSleepTimerMinutes(0)} className="cancel">إلغاء</button>}
              </div>
            )}
          </div>
        </div>

        <div className="progress-container">
          <div className="time-display">
            <span className="current-time">{formatTime(currentTime)}</span>
            <span className="duration-time">{formatTime(duration)}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={progress}
            onChange={handleProgressChange}
            className="progress-slider"
            disabled={!selectedAyah}
          />
        </div>
      </div>

      <div className="metadata-section">
        <h3 className="metadata-title">المعلومات</h3>
        <div className="metadata-content">
          <div className="metadata-item">
            <span className="metadata-label">الاسم:</span>
            <span className="metadata-value">
              {selectedAyah ? selectedAyah.title : '-'}
            </span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">القسم:</span>
            <span className="metadata-value">
              {selectedSection ? selectedSection.name : '-'}
            </span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">عدد الملفات:</span>
            <span className="metadata-value">
              {selectedCassette ? selectedCassette.items?.length || 0 : '-'}
            </span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">المشاهدات:</span>
            <span className="metadata-value stat-value">
              {selectedCassette?.views || 0}
            </span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">التحميلات:</span>
            <span className="metadata-value stat-value">
              {selectedCassette?.downloads || 0}
            </span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">تاريخ الرفع:</span>
            <span className="metadata-value">
              {selectedCassette?.createdAt ? new Date(selectedCassette.createdAt).toLocaleDateString('ar-EG', {year: 'numeric', month: 'short', day: 'numeric'}) : '-'}
            </span>
          </div>
          <div className="metadata-item uploader-item">
            <span className="metadata-label">تم الرفع بواسطة:</span>
            <div className="uploader-info">
              <span className="metadata-value uploader-name">
                {selectedCassette?.createdByName || 'مجهول'}
              </span>
              <span className="free-badge">مجاني</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(AudioPlayer);
