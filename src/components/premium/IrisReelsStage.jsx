import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, MessageSquare, Share2, ArrowUpRight, Globe,
  Camera, Calendar, Printer, ShoppingBag, FolderKanban,
  Volume2, VolumeX
} from 'lucide-react';

import { useSiteSettings } from '../../context/SiteSettingsContext';
import { getFlowItems, getApprovedFeedbackForFlow, submitFlowFeedback } from '../../repositories/flowRepository';
import irisLogo from '../../assets/iris_logo.png';
import '../../styles/iris-flow-stage.css';

/**
 * IRIS REELS STAGE — SINGLE PERSISTENT VIEWPORT STAGE
 * Instagram-Style Fullscreen Reel Navigation using Static Imagery.
 * Sequence: HERO <-> REELS 01-08 <-> FOOTER
 */

export const IrisReelsStage = ({ id = "iris-reels-stage-root" }) => {
  const navigate = useNavigate();
  const { settings, lang, toggleLanguage } = useSiteSettings();
  const isRtl = lang === 'ar';

  const [items, setItems] = useState([]);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isStageActive, setIsStageActive] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Feedback State
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState('');

  const stageRef = useRef(null);
  const videoRef = useRef(null);
  const touchStartY = useRef(0);

  // Auto-pause video when scrolling away from Reels stage or tab loses focus
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isStageActive && document.visibilityState === 'visible') {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isStageActive, activeReelIndex]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const video = videoRef.current;
      if (!video) return;
      if (document.visibilityState === 'hidden' || !isStageActive) {
        video.pause();
      } else if (isStageActive) {
        video.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [isStageActive]);

  // Load items on mount
  useEffect(() => {
    const loaded = getFlowItems().filter((it) => it.enabled);
    setItems(loaded.length > 0 ? loaded : getFlowItems());
    getFlowItemsAsync().then(asyncItems => {
      if (asyncItems && asyncItems.length > 0) {
        const filtered = asyncItems.filter((it) => it.enabled);
        setItems(filtered.length > 0 ? filtered : asyncItems);
      }
    });
  }, []);

  // Sync URL hash with active Reel
  useEffect(() => {
    if (items.length === 0) return;
    const currentItem = items[activeReelIndex];
    if (currentItem && currentItem.slug) {
      window.history.replaceState(null, '', `#flow-${currentItem.slug}`);
    }
  }, [activeReelIndex, items]);

  // Load Approved Feedback for Active Reel
  useEffect(() => {
    if (items.length > 0 && items[activeReelIndex]) {
      const approved = getApprovedFeedbackForFlow(items[activeReelIndex].id);
      setFeedbackList(approved);
    }
  }, [activeReelIndex, items]);

  // IntersectionObserver to detect when Reels stage owns the viewport & hide main navbar
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStageActive(entry.isIntersecting);
        const navbar = document.querySelector('.navbar-container, header.site-navbar, .app-header');
        if (navbar) {
          if (entry.isIntersecting) {
            navbar.style.display = 'none';
          } else {
            navbar.style.display = '';
          }
        }
      },
      { threshold: 0.5 }
    );

    if (stageRef.current) {
      observer.observe(stageRef.current);
    }

    return () => {
      observer.disconnect();
      const navbar = document.querySelector('.navbar-container, header.site-navbar, .app-header');
      if (navbar) navbar.style.display = '';
    };
  }, []);

  // Reel Navigation Methods with Boundary Gesture Release
  const advanceReel = () => {
    if (isLocked) return;
    if (activeReelIndex < items.length - 1) {
      setIsLocked(true);
      setActiveReelIndex((prev) => prev + 1);
      setTimeout(() => setIsLocked(false), 650);
    } else {
      // Boundary release: Reel 08 -> FOOTER
      const footerSec = document.getElementById('iris-footer-root');
      if (footerSec) {
        footerSec.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const reverseReel = () => {
    if (isLocked) return;
    if (activeReelIndex > 0) {
      setIsLocked(true);
      setActiveReelIndex((prev) => prev - 1);
      setTimeout(() => setIsLocked(false), 650);
    } else {
      // Boundary release: Reel 01 -> HERO
      const heroSec = document.getElementById('iris-dark-hero-root');
      if (heroSec) {
        heroSec.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Wheel Gesture Navigation
  const handleWheel = (e) => {
    if (isLocked || feedbackOpen || menuOpen) return;

    if (Math.abs(e.deltaY) < 35) return;

    if (e.deltaY > 0) {
      if (activeReelIndex < items.length - 1) {
        e.preventDefault();
        advanceReel();
      }
      // If at Reel 08 (index 7), default wheel down naturally scrolls to Footer
    } else {
      if (activeReelIndex > 0) {
        e.preventDefault();
        reverseReel();
      }
      // If at Reel 01 (index 0), default wheel up naturally scrolls to Hero
    }
  };

  // Touch Swipe Gesture Handling
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (isLocked || feedbackOpen || menuOpen) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (diff > 60) {
      // Swiped Up -> Advance Reel
      advanceReel();
    } else if (diff < -60) {
      // Swiped Down -> Reverse Reel
      reverseReel();
    }
  };

  // Keyboard Arrow Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (feedbackOpen || menuOpen || !isStageActive) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        advanceReel();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        reverseReel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeReelIndex, items.length, isLocked, feedbackOpen, menuOpen, isStageActive]);

  // Primary Action Icon Mapping
  const getActionIcon = (iconType) => {
    switch (iconType) {
      case 'project': return <FolderKanban size={22} />;
      case 'camera': return <Camera size={22} />;
      case 'calendar': return <Calendar size={22} />;
      case 'order': return <ShoppingBag size={22} />;
      case 'print': return <Printer size={22} />;
      default: return <ArrowUpRight size={22} />;
    }
  };

  const handlePrimaryAction = (url) => {
    if (url) {
      navigate(url);
    }
  };

  const handleToggleFeedback = () => {
    setFeedbackOpen((prev) => !prev);
    setFeedbackSubmitted(false);
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackInput.trim()) return;
    if (items[activeReelIndex]) {
      submitFlowFeedback(items[activeReelIndex].id, feedbackInput, feedbackName);
      setFeedbackInput('');
      setFeedbackName('');
      setFeedbackSubmitted(true);
    }
  };

  const handleShare = async () => {
    const currentItem = items[activeReelIndex];
    const shareUrl = `${window.location.origin}/#flow-${currentItem?.slug || '01'}`;
    const shareTitle = isRtl ? currentItem?.category_label_ar : currentItem?.category_label_en;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `IRIS — ${shareTitle}`,
          text: isRtl ? currentItem?.headline_ar : currentItem?.headline_en,
          url: shareUrl
        });
        return;
      } catch (err) {}
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setToastMessage(isRtl ? 'تم نسخ الرابط' : 'Link copied');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      setToastMessage(isRtl ? 'تم نسخ الرابط' : 'Link copied');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  const handleReturnHome = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (items.length === 0) return null;

  const currentReel = items[activeReelIndex] || items[0];

  return (
    <section
      id={id}
      ref={stageRef}
      className={`iris-flow-section-wrapper dir-${isRtl ? 'rtl' : 'ltr'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flow-stage-container">
        <div className="flow-stage-viewport">
          {/* ===== 1. SINGLE ACTIVE REEL CANVAS (TRANSITIONS IN 100% VISIBILITY) ===== */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`reel-canvas-${currentReel.id}`}
              className="flow-image-layer"
              initial={{ y: '100%', opacity: 1 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '-100%', opacity: 1 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              {currentReel.media_type === 'video' || (currentReel.media_url && (currentReel.media_url.endsWith('.mp4') || currentReel.media_url.endsWith('.mov') || currentReel.media_url.endsWith('.webm') || currentReel.media_url.startsWith('blob:') || currentReel.media_url.startsWith('data:video'))) ? (
                <video
                  ref={videoRef}
                  src={currentReel.media_url || currentReel.image}
                  autoPlay={isStageActive}
                  loop
                  muted={isMuted}
                  playsInline
                  className="flow-static-img"
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              ) : (
                <img
                  src={currentReel.image || currentReel.media_url}
                  alt={isRtl ? currentReel.alt_ar : currentReel.alt_en}
                  className="flow-static-img"
                />
              )}
              <div className="flow-darkness-gradient" />

              {/* FLOATING EDITORIAL OVERLAY ATTACHED TO CANVAS */}
              <div className="flow-editorial-overlay">
                <span className="flow-item-number">
                  IRIS / {isRtl ? currentReel.category_label_ar : currentReel.category_label_en} / 0{activeReelIndex + 1}
                </span>
                <h2 className="flow-headline-text">
                  {isRtl ? currentReel.headline_ar : currentReel.headline_en}
                </h2>
                {currentReel.secondary_text_ar && (
                  <p className="flow-secondary-text">
                    {isRtl ? currentReel.secondary_text_ar : currentReel.secondary_text_en}
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ===== 2. PERSISTENT SPATIAL UI LAYER (STATIONS IN PLACE ACROSS REELS) ===== */}
          <div className="flow-top-bar">
            {/* Reel Counter Micro Label */}
            <div className="flow-category-pill">
              <span>0{activeReelIndex + 1} / 0{items.length}</span>
            </div>

            {/* Hamburger Button (Top Right, Min 48x48 Target) */}
            <button
              type="button"
              className="flow-hamburger-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Open Menu"
            >
              <Menu size={22} />
            </button>
          </div>

          {/* RIGHT ACTION RAIL (3 CIRCULAR CONTROLS) */}
          <div className="flow-action-rail">
            {/* 1. DYNAMIC PRIMARY ACTION */}
            <div className="flow-action-btn-group">
              {currentReel.cta_label_ar && (
                <button
                  type="button"
                  className="flow-floating-cta-label"
                  onClick={() => handlePrimaryAction(currentReel.cta_url)}
                >
                  {isRtl ? currentReel.cta_label_ar : currentReel.cta_label_en}
                </button>
              )}
              <button
                type="button"
                className="flow-action-circle-btn primary-action-btn"
                onClick={() => handlePrimaryAction(currentReel.cta_url)}
                aria-label={isRtl ? currentReel.cta_label_ar : currentReel.cta_label_en}
              >
                {getActionIcon(currentReel.cta_icon_type)}
              </button>
            </div>

            {/* 2. FEEDBACK BUTTON */}
            <button
              type="button"
              className="flow-action-circle-btn"
              onClick={handleToggleFeedback}
              aria-label="Feedback"
              title={isRtl ? "آراء الزوار" : "Feedback"}
            >
              <MessageSquare size={22} />
            </button>

            {/* 3. SHARE BUTTON */}
            <button
              type="button"
              className="flow-action-circle-btn"
              onClick={handleShare}
              aria-label="Share"
              title={isRtl ? "مشاركة" : "Share"}
            >
              <Share2 size={22} />
            </button>

            {/* 4. MUTE / UNMUTE SOUND BUTTON */}
            <button
              type="button"
              className="flow-action-circle-btn"
              onClick={() => setIsMuted((prev) => !prev)}
              aria-label={isMuted ? (isRtl ? "تشغيل الصوت" : "Unmute") : (isRtl ? "كتم الصوت" : "Mute")}
              title={isMuted ? (isRtl ? "تشغيل الصوت" : "Unmute") : (isRtl ? "كتم الصوت" : "Mute")}
            >
              {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
            </button>
          </div>

          {/* IRIS HOME BRANDED MARK (BOTTOM LEFT) */}
          <button
            type="button"
            className="flow-iris-home-mark"
            onClick={handleReturnHome}
            aria-label="Return to Top of Home"
          >
            <div className="home-mark-circle">
              <img src={settings.hero_logo_url || settings.logo_url || irisLogo} alt="IRIS" className="home-mark-logo" />
            </div>
            <span className="home-mark-text">IRIS HOME</span>
          </button>
        </div>
      </div>

      {/* ===== 3. FEEDBACK BOTTOM SHEET / DRAWER ===== */}
      {feedbackOpen && (
        <div className="flow-feedback-drawer-overlay" onClick={() => setFeedbackOpen(false)}>
          <div className="flow-feedback-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#F5BD1A] flex items-center gap-2">
                <MessageSquare size={20} />
                <span>{isRtl ? 'آراء الزوار' : 'Visitor Feedback'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setFeedbackOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-[#ECEBE7]"
              >
                <X size={20} />
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="p-4 mb-6 rounded-2xl bg-green-500/20 border border-green-500/40 text-green-300 text-sm">
                {isRtl
                  ? 'شكراً لك! تم إرسال رأيك بنجاح وسوف يظهر بعد مراجعته من الإدارة.'
                  : 'Thank you! Your feedback was submitted for review.'}
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-3 mb-6">
                <input
                  type="text"
                  placeholder={isRtl ? 'الاسم (اختياري)...' : 'Name (Optional)...'}
                  value={feedbackName}
                  onChange={(e) => setFeedbackName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-sm text-[#ECEBE7]"
                />
                <textarea
                  required
                  rows={3}
                  placeholder={isRtl ? 'اكتب رأيك...' : 'Write feedback...'}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-sm text-[#ECEBE7]"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#F5BD1A] text-[#044630] font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  {isRtl ? 'إرسال' : 'Submit'}
                </button>
              </form>
            )}

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#ECEBE7]/60 uppercase tracking-wider">
                {isRtl ? 'الآراء المعتمدة' : 'Approved Reviews'}
              </h4>
              {feedbackList.length === 0 ? (
                <p className="text-xs opacity-50 italic py-4">
                  {isRtl ? 'لا توجد آراء معتمدة حالياً بهذا القسم.' : 'No approved reviews yet.'}
                </p>
              ) : (
                feedbackList.map((fb) => (
                  <div key={fb.id} className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-sm space-y-1">
                    <span className="font-bold text-[#F5BD1A] text-xs block">{fb.name}</span>
                    <p className="text-xs text-[#ECEBE7]/90 leading-relaxed">{fb.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== 4. FULLSCREEN NAVIGATION OVERLAY ===== */}
      {menuOpen &&
        createPortal(
          <motion.div
            className={`iris-portal-fullscreen-overlay dir-${isRtl ? 'rtl' : 'ltr'}`}
            dir={isRtl ? 'rtl' : 'ltr'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="overlay-top-bar">
              <img src={settings.hero_logo_url || settings.logo_url || irisLogo} alt="IRIS" className="overlay-brand-logo" />
              <div className="overlay-actions-group">
                <button type="button" className="overlay-lang-toggle-btn" onClick={toggleLanguage}>
                  <Globe size={16} />
                  <span>{isRtl ? 'ENGLISH' : 'العربية'}</span>
                </button>
                <button type="button" className="overlay-close-btn" onClick={() => setMenuOpen(false)}>
                  <X size={26} />
                </button>
              </div>
            </div>

            <nav className="overlay-menu-list">
              <button
                type="button"
                className="overlay-nav-link text-left"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/');
                }}
              >
                {isRtl ? "الرئيسية" : "Home"}
              </button>
              <button
                type="button"
                className="overlay-nav-link text-left"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/booking');
                }}
              >
                {isRtl ? "حجز السيشنات" : "Book Session"}
              </button>
              <button
                type="button"
                className="overlay-nav-link text-left"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/work');
                }}
              >
                {isRtl ? "أعمالنا والإنتاج" : "Media & Work"}
              </button>
              <button
                type="button"
                className="overlay-nav-link text-left"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/graduation-books');
                }}
              >
                {isRtl ? "كتب التخرج" : "Graduation Books"}
              </button>
              <button
                type="button"
                className="overlay-nav-link text-left"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/printing-products');
                }}
              >
                {isRtl ? "المطبوعات الفاخرة" : "Luxury Print"}
              </button>
            </nav>

            <div className="overlay-bottom-bar">
              <div className="overlay-brand-line">
                <span className="brand-dot" />
                <span>IRIS AGENCY — WE BREAK THE BOX</span>
              </div>
            </div>
          </motion.div>,
          document.body
        )}

      {/* ===== 5. TOAST NOTIFICATION ===== */}
      {toastMessage && (
        <div className="flow-toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}
    </section>
  );
};

export default IrisReelsStage;
