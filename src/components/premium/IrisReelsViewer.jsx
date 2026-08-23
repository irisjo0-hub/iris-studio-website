import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, MessageSquare, Share2, ArrowUpRight, Globe,
  Camera, Calendar, Printer, ShoppingBag, FolderKanban,
  Music, Volume2, VolumeX, Sparkles, ChevronDown
} from 'lucide-react';

import { useSiteSettings } from '../../context/SiteSettingsContext';
import { getFlowItems, getApprovedFeedbackForFlow, getAllApprovedFeedback, submitFlowFeedback } from '../../repositories/flowRepository';
import irisLogo from '../../assets/iris_logo.png';
import '../../styles/iris-reels-viewer.css';

/**
 * IRIS REELS VIEWER — AUTHENTIC INSTAGRAM REELS EXPERIENCE
 * Features:
 * 1. Native Instagram Reel 9:16 layout without Story lines
 * 2. Directional spring vertical slide transitions (Lockstep Reel motion)
 * 3. Dynamic Action Button on top of side rail (Booking / Order / Print / Studio per Reel)
 * 4. Shared Visitor Feedback drawer across all 8 Reels
 * 5. RTL (Arabic) & LTR (English) spatial alignment
 */

export const IrisReelsViewer = ({ id = "iris-reels-viewer-root" }) => {
  const navigate = useNavigate();
  const { settings, lang, toggleLanguage } = useSiteSettings();
  const isRtl = lang === 'ar';

  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = down/next, -1 = up/prev
  const [isLocked, setIsLocked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isStageActive, setIsStageActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Shared Feedback State across all 8 Reels
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [allFeedbackList, setAllFeedbackList] = useState([]);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState('');

  const stageRef = useRef(null);
  const touchStartY = useRef(0);
  const cooldownRef = useRef(false);
  const activeIndexRef = useRef(0);

  // Keep activeIndexRef synced for non-passive listeners
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Expose global window reset helper for Hero CTA
  useEffect(() => {
    window.__resetReelToHero = () => {
      setDirection(-1);
      setActiveIndex(0);
      setIsLocked(false);
      cooldownRef.current = false;
      if (window.location.hash && window.location.hash.startsWith('#flow-')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    };
    return () => {
      delete window.__resetReelToHero;
    };
  }, []);

  // Load items and all approved feedback on mount
  useEffect(() => {
    const loaded = getFlowItems().filter((it) => it.enabled);
    const flowItems = loaded.length > 0 ? loaded : getFlowItems();
    setItems(flowItems);

    // Load shared approved feedback for all reels
    setAllFeedbackList(getAllApprovedFeedback());

    // Evaluate URL Deep Link
    const currentHash = window.location.hash;
    if (currentHash && currentHash.startsWith('#flow-')) {
      const targetSlug = currentHash.replace('#flow-', '');
      const matchedIndex = flowItems.findIndex((it) => it.slug === targetSlug);
      if (matchedIndex !== -1) {
        setActiveIndex(matchedIndex);
        return;
      }
    }

    setActiveIndex(0);
  }, []);

  // Sync URL hash with active Reel
  useEffect(() => {
    if (items.length === 0) return;
    const currentItem = items[activeIndex];
    if (currentItem && currentItem.slug) {
      window.history.replaceState(null, '', `#flow-${currentItem.slug}`);
    }
  }, [activeIndex, items]);

  // Refresh Shared Approved Feedback
  const refreshFeedback = () => {
    setAllFeedbackList(getAllApprovedFeedback());
  };

  // Helper to lock window position to stage top during active Reels browsing
  const lockWindowToStage = () => {
    if (stageRef.current) {
      const stageTop = stageRef.current.offsetTop;
      if (Math.abs(window.scrollY - stageTop) > 3) {
        window.scrollTo({ top: stageTop, behavior: 'instant' in window ? 'instant' : 'auto' });
      }
    }
  };

  // IntersectionObserver to detect entry mode, auto-snap to stage top & control main navbar
  useEffect(() => {
    let wasIntersecting = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStageActive(entry.isIntersecting);

        if (entry.isIntersecting) {
          const navbar = document.querySelector('.navbar-container, header.site-navbar, .app-header');
          if (navbar) navbar.style.display = 'none';

          if (!wasIntersecting && stageRef.current) {
            const stageTop = stageRef.current.offsetTop;
            const scrollY = window.scrollY;
            if (Math.abs(scrollY - stageTop) > 50) {
              window.scrollTo({ top: stageTop, behavior: 'smooth' });
            }
          }
          wasIntersecting = true;
        } else {
          wasIntersecting = false;
          const navbar = document.querySelector('.navbar-container, header.site-navbar, .app-header');
          if (navbar) navbar.style.display = '';
        }
      },
      { threshold: 0.25 }
    );

    if (stageRef.current) {
      observer.observe(stageRef.current);
    }

    return () => {
      observer.disconnect();
      const navbar = document.querySelector('.navbar-container, header.site-navbar, .app-header');
      if (navbar) navbar.style.display = '';
    };
  }, [items.length]);

  // Trigger Cooldown Lock on Index Change
  const navigateToIndex = (newIndex, customDirection = null) => {
    if (isLocked || cooldownRef.current) return;
    const dir = customDirection !== null ? customDirection : (newIndex > activeIndex ? 1 : -1);
    setDirection(dir);
    setIsLocked(true);
    cooldownRef.current = true;
    setActiveIndex(newIndex);

    setTimeout(() => {
      setIsLocked(false);
      cooldownRef.current = false;
    }, 500);
  };

  // NON-PASSIVE WHEEL & TOUCH EVENT LISTENERS WITH PINNED WINDOW LOCK
  useEffect(() => {
    const stageEl = stageRef.current;
    if (!stageEl) return;

    const handleWheelNonPassive = (e) => {
      if (!isStageActive) return;
      if (menuOpen || feedbackOpen) {
        e.preventDefault();
        return;
      }

      const currIndex = activeIndexRef.current;
      const totalCount = items.length > 0 ? items.length : 8;
      const maxIndex = totalCount - 1;
      const deltaY = e.deltaY;

      if (Math.abs(deltaY) < 25) return;

      // Inner Reels Navigation: strictly lock window and navigate Reel
      if (currIndex > 0 && currIndex < maxIndex) {
        e.preventDefault();
        lockWindowToStage();
        if (cooldownRef.current) return;

        if (deltaY > 0) {
          navigateToIndex(currIndex + 1, 1);
        } else {
          navigateToIndex(currIndex - 1, -1);
        }
        return;
      }

      // Reel 01 (index 0)
      if (currIndex === 0) {
        if (deltaY < 0) {
          if (cooldownRef.current) {
            e.preventDefault();
          } else {
            const heroSec = document.getElementById('iris-dark-hero-root');
            if (heroSec) heroSec.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          e.preventDefault();
          lockWindowToStage();
          if (!cooldownRef.current) {
            navigateToIndex(1, 1);
          }
        }
        return;
      }

      // Last Reel (maxIndex)
      if (currIndex === maxIndex) {
        if (deltaY > 0) {
          if (cooldownRef.current) {
            e.preventDefault();
          } else {
            const divisionsSec = document.getElementById('iris-divisions-section') || document.getElementById('iris-footer-root');
            if (divisionsSec) divisionsSec.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          e.preventDefault();
          lockWindowToStage();
          if (!cooldownRef.current) {
            navigateToIndex(maxIndex - 1, -1);
          }
        }
        return;
      }
    };

    const handleTouchMoveNonPassive = (e) => {
      if (!isStageActive) return;
      if (menuOpen || feedbackOpen) {
        e.preventDefault();
        return;
      }

      const currIndex = activeIndexRef.current;
      const totalCount = items.length > 0 ? items.length : 8;
      const maxIndex = totalCount - 1;

      if (currIndex >= 0 && currIndex <= maxIndex) {
        e.preventDefault();
        lockWindowToStage();
      }
    };

    stageEl.addEventListener('wheel', handleWheelNonPassive, { passive: false });
    stageEl.addEventListener('touchmove', handleTouchMoveNonPassive, { passive: false });

    return () => {
      stageEl.removeEventListener('wheel', handleWheelNonPassive);
      stageEl.removeEventListener('touchmove', handleTouchMoveNonPassive);
    };
  }, [isStageActive, menuOpen, feedbackOpen, items.length]);

  // Touch Swipe Gesture End Handling
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (isLocked || cooldownRef.current || feedbackOpen || menuOpen || !isStageActive) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (Math.abs(diff) < 50) return;

    const currIndex = activeIndex;

    if (diff > 0) {
      // Swipe UP (Downward Intent -> Next Reel)
      if (currIndex < 7) {
        navigateToIndex(currIndex + 1, 1);
      } else if (currIndex === 7 && !cooldownRef.current) {
        const divisionsSec = document.getElementById('iris-divisions-section') || document.getElementById('iris-footer-root');
        if (divisionsSec) divisionsSec.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Swipe DOWN (Upward Intent -> Prev Reel)
      if (currIndex > 0) {
        navigateToIndex(currIndex - 1, -1);
      } else if (currIndex === 0 && !cooldownRef.current) {
        const heroSec = document.getElementById('iris-dark-hero-root');
        if (heroSec) heroSec.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Keyboard Arrow Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (feedbackOpen || menuOpen || !isStageActive || cooldownRef.current) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        if (activeIndex < items.length - 1) {
          navigateToIndex(activeIndex + 1, 1);
        } else if (activeIndex === items.length - 1) {
          const divisionsSec = document.getElementById('iris-divisions-section');
          if (divisionsSec) divisionsSec.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        if (activeIndex > 0) {
          navigateToIndex(activeIndex - 1, -1);
        } else if (activeIndex === 0) {
          const heroSec = document.getElementById('iris-dark-hero-root');
          if (heroSec) heroSec.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, items.length, feedbackOpen, menuOpen, isStageActive]);

  // Action Icon Mapping
  const getActionIcon = (iconType) => {
    switch (iconType) {
      case 'project': return <FolderKanban size={20} />;
      case 'camera': return <Camera size={20} />;
      case 'calendar': return <Calendar size={20} />;
      case 'order': return <ShoppingBag size={20} />;
      case 'print': return <Printer size={20} />;
      default: return <ArrowUpRight size={20} />;
    }
  };

  const handlePrimaryAction = (url) => {
    if (url) {
      navigate(url);
    }
  };

  const handleToggleFeedback = () => {
    refreshFeedback();
    setFeedbackOpen((prev) => !prev);
    setFeedbackSubmitted(false);
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackInput.trim()) return;
    if (items[activeIndex]) {
      submitFlowFeedback(items[activeIndex].id, feedbackInput, feedbackName);
      setFeedbackInput('');
      setFeedbackName('');
      setFeedbackSubmitted(true);
      refreshFeedback();
    }
  };

  const handleShare = async () => {
    const currentItem = items[activeIndex];
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

  const handleReturnHome = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSkipReels = () => {
    const nextSection = document.getElementById('iris-divisions-section') || document.getElementById('iris-divisions-switcher') || document.querySelector('.iris-divisions-switcher') || document.querySelector('footer');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  if (items.length === 0) return null;

  const currentReel = items[activeIndex] || items[0];

  // Motion variants for Instagram continuous spring vertical slide
  const slideVariants = {
    initial: (dir) => ({
      y: dir > 0 ? '100%' : '-100%',
      scale: 1.04,
      opacity: 1
    }),
    animate: {
      y: '0%',
      scale: 1,
      opacity: 1,
      transition: {
        y: { type: 'spring', stiffness: 260, damping: 28 },
        scale: { duration: 0.4 }
      }
    },
    exit: (dir) => ({
      y: dir > 0 ? '-100%' : '100%',
      scale: 0.96,
      opacity: 1,
      transition: {
        y: { type: 'spring', stiffness: 260, damping: 28 },
        scale: { duration: 0.4 }
      }
    })
  };

  return (
    <section
      id={id}
      ref={stageRef}
      className="iris-reels-viewer-wrapper"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="reels-stage-container">
        {/* ===== TRUE 9:16 REEL FRAME CANVAS WITH EXPLICIT BILINGUAL LOCALE ===== */}
        <div className="reel-frame" data-locale={isRtl ? 'ar' : 'en'}>
          {/* ===== 1. ACTIVE 9:16 REEL CANVAS (LOCKSTEP INSTAGRAM SPRING SLIDE) ===== */}
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={`reel-canvas-${currentReel.id}`}
              className="reel-canvas-layer"
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <img
                src={currentReel.image}
                alt={isRtl ? currentReel.alt_ar : currentReel.alt_en}
                className="reel-static-img"
              />
              <div className="reel-darkness-gradient" />

              {/* INSTAGRAM REEL BOTTOM CAPTION BLOCK (NATIVE OVERLAY) */}
              <div className="instagram-reel-caption-block" dir={isRtl ? 'rtl' : 'ltr'}>
                <span className="reel-item-number">
                  <span className="bidi-isolate" dir="ltr">IRIS</span> / {isRtl ? currentReel.category_label_ar : currentReel.category_label_en} / 0{activeIndex + 1}
                </span>

                <h2 className="reel-headline-text">
                  {isRtl ? currentReel.headline_ar : currentReel.headline_en}
                </h2>

                {currentReel.secondary_text_ar && (
                  <p className="reel-secondary-text">
                    {isRtl ? currentReel.secondary_text_ar : currentReel.secondary_text_en}
                  </p>
                )}

                {/* PROFILE IDENTITY ROW */}
                <div className="instagram-caption-profile-row">
                  <div className="instagram-avatar-ring">
                    <img src={settings.hero_logo_url || settings.logo_url || irisLogo} alt="IRIS" className="instagram-avatar-img" />
                  </div>
                  <div className="instagram-user-meta">
                    <span className="instagram-username">IRIS HOME</span>
                    <span className="instagram-handle bidi-isolate" dir="ltr">@iris.jo</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ===== 2. PERSISTENT SPATIAL OVERLAYS INSIDE 9:16 FRAME ===== */}
          <div className="reels-persistent-ui-layer">
            {/* Top Bar Controls */}
            <div className="reels-top-bar">
              <button
                type="button"
                className="reels-hamburger-btn"
                onClick={() => setMenuOpen(true)}
                aria-label="Open Navigation Menu"
              >
                <Menu size={20} />
              </button>

              <div className="reels-counter-pill-tag">
                <span className="gold-accent-line" />
                <span className="bidi-isolate" dir="ltr">0{activeIndex + 1} / 08</span>
              </div>
            </div>

            {/* ACTION RAIL (PINNED STRICTLY TO SIDE EDGE) */}
            <div className="reels-action-rail">
              {/* 1. DYNAMIC PRIMARY ACTION BUTTON (ICON ON TOP, TEXT UNDERNEATH) */}
              <div className="reels-action-btn-group-single">
                <button
                  type="button"
                  className="reels-action-circle-btn primary-action-btn"
                  onClick={() => handlePrimaryAction(currentReel.cta_url)}
                  aria-label={isRtl ? currentReel.cta_label_ar : currentReel.cta_label_en}
                  title={isRtl ? currentReel.cta_label_ar : currentReel.cta_label_en}
                >
                  {getActionIcon(currentReel.cta_icon_type)}
                </button>
                {currentReel.cta_label_ar && (
                  <span
                    className="reels-action-counter reels-action-cta-text"
                    onClick={() => handlePrimaryAction(currentReel.cta_url)}
                  >
                    {isRtl ? currentReel.cta_label_ar : currentReel.cta_label_en}
                  </span>
                )}
              </div>

              {/* 2. SHARED VISITOR FEEDBACK BUTTON */}
              <div className="reels-action-btn-group-single">
                <button
                  type="button"
                  className="reels-action-circle-btn feedback-btn"
                  onClick={handleToggleFeedback}
                  aria-label="Feedback"
                  title={isRtl ? "فيدباك" : "Feedback"}
                >
                  <MessageSquare size={20} />
                </button>
                <span className="reels-action-counter" onClick={handleToggleFeedback}>
                  {isRtl ? 'فيدباك' : 'Feedback'}
                </span>
              </div>

              {/* 3. SHARE BUTTON */}
              <div className="reels-action-btn-group-single">
                <button
                  type="button"
                  className="reels-action-circle-btn"
                  onClick={handleShare}
                  aria-label="Share"
                  title={isRtl ? "شير" : "Share"}
                >
                  <Share2 size={20} />
                </button>
                <span className="reels-action-counter" onClick={handleShare}>
                  {isRtl ? 'شير' : 'Share'}
                </span>
              </div>
            </div>

            {/* FLOATING SKIP REELS PILL AT BOTTOM CENTER */}
            <button
              type="button"
              className="reels-floating-skip-pill"
              onClick={handleSkipReels}
              aria-label={isRtl ? 'تخطي الريلز والنزول لأسفل' : 'Skip Reels'}
              title={isRtl ? 'تخطي الريلز والنزول لأسفل' : 'Skip Reels'}
            >
              <span>{isRtl ? 'تخطي الريلز' : 'Skip Reels'}</span>
              <ChevronDown size={16} className="skip-arrow-anim" />
            </button>
          </div>
        </div>
      </div>

      {/* ===== 3. SHARED VISITOR FEEDBACK BOTTOM SHEET (MOBILE) / DRAWER (DESKTOP) ===== */}
      {feedbackOpen && (
        <div className="reels-feedback-drawer-overlay" onClick={() => setFeedbackOpen(false)}>
          <div className="reels-feedback-sheet" onClick={(e) => e.stopPropagation()} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#F5BD1A] flex items-center gap-2">
                <MessageSquare size={20} />
                <span>{isRtl ? 'آراء وتقييمات الزوار (IRIS)' : 'IRIS Visitor Reviews'}</span>
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
                  placeholder={isRtl ? 'اكتب رأيك أو تقييمك...' : 'Write feedback or review...'}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-sm text-[#ECEBE7]"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#F5BD1A] text-[#044630] font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  {isRtl ? 'إرسال التقييم' : 'Submit Review'}
                </button>
              </form>
            )}

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#ECEBE7]/60 uppercase tracking-wider">
                {isRtl ? 'آراء الزوار المعتمدة' : 'Approved Visitor Reviews'}
              </h4>
              {allFeedbackList.length === 0 ? (
                <p className="text-xs opacity-50 italic py-4">
                  {isRtl ? 'لا توجد آراء معتمدة حالياً.' : 'No approved reviews yet.'}
                </p>
              ) : (
                allFeedbackList.map((fb) => (
                  <div key={fb.id} className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-sm space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#F5BD1A] text-xs block">{fb.name}</span>
                      <span className="text-[10px] opacity-40">IRIS</span>
                    </div>
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
        <div className="reels-toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}
    </section>
  );
};

export default IrisReelsViewer;
