import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, MessageSquare, Share2, ArrowUpRight, Globe,
  Camera, Calendar, Printer, ShoppingBag, FolderKanban,
  Music, Volume2, VolumeX, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';

import { useSiteSettings } from '../../context/SiteSettingsContext';
import { getFlowItems, getFlowItemsAsync, getApprovedFeedbackForFlow, getAllApprovedFeedback, submitFlowFeedback } from '../../repositories/flowRepository';
import irisLogo from '../../assets/iris_logo.png';
import heroMediaImg from '../../assets/hero.png';
import '../../styles/iris-reels-viewer.css';
import '../../styles/iris-dark-hero.css';

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
  const [isMuted, setIsMuted] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Shared Feedback State across all 8 Reels
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [allFeedbackList, setAllFeedbackList] = useState([]);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState('');
  const [videoErrorMap, setVideoErrorMap] = useState({});

  const stageRef = useRef(null);
  const videoRef = useRef(null);
  const touchStartY = useRef(0);
  const cooldownRef = useRef(false);
  const activeIndexRef = useRef(0);
  const isSkippingRef = useRef(false);

  // Auto-pause video when scrolling away from Reels stage or tab loses focus
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isStageActive && document.visibilityState === 'visible') {
      video.muted = isMuted;
      video.defaultMuted = true;
      video.playsInline = true;
      try {
        video.load();
      } catch (e) {}
      const promise = video.play();
      if (promise !== undefined) {
        promise.catch((err) => {
          console.warn("Mobile autoplay notice:", err);
        });
      }
    } else {
      video.pause();
    }
  }, [isStageActive, activeIndex, isMuted]);

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

  // Load items from Supabase Cloud on mount for all devices
  useEffect(() => {
    const loaded = getFlowItems().filter((it) => it.enabled);
    const initialItems = loaded.length > 0 ? loaded : getFlowItems();
    setItems(initialItems);

    getFlowItemsAsync().then((cloudItems) => {
      if (cloudItems && cloudItems.length > 0) {
        const filtered = cloudItems.filter((it) => it.enabled);
        setItems(filtered.length > 0 ? filtered : cloudItems);
      }
    });

    // Load shared approved feedback for all reels
    setAllFeedbackList(getAllApprovedFeedback());

    // Evaluate URL Deep Link
    const currentHash = window.location.hash;
    if (currentHash && currentHash.startsWith('#flow-')) {
      const targetSlug = currentHash.replace('#flow-', '');
      const matchedIndex = initialItems.findIndex((it) => it.slug === targetSlug);
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
    if (isSkippingRef.current) return;
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
      if (!isStageActive || isSkippingRef.current) return;
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
            if (divisionsSec) divisionsSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      if (!isStageActive || isSkippingRef.current) return;
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
        if (divisionsSec) divisionsSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Swipe DOWN (Upward Intent -> Prev Reel)
      if (currIndex > 0) {
        navigateToIndex(currIndex - 1, -1);
      } else if (currIndex === 0 && !cooldownRef.current) {
        const heroSec = document.getElementById('iris-dark-hero-root');
        if (heroSec) heroSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          if (divisionsSec) divisionsSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    isSkippingRef.current = true;
    setIsStageActive(false);
    const nextSection = document.getElementById('iris-divisions-section') || document.getElementById('iris-divisions-switcher') || document.querySelector('.iris-switcher-wrapper') || document.querySelector('footer');
    if (nextSection) {
      const targetY = nextSection.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    } else {
      window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
    setTimeout(() => {
      isSkippingRef.current = false;
    }, 1000);
  };

  const handleSkipUp = () => {
    isSkippingRef.current = true;
    setIsStageActive(false);
    const heroSection = document.getElementById('iris-dark-hero-root') || document.querySelector('.hero-section') || document.body;
    if (heroSection) {
      const targetY = heroSection.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setTimeout(() => {
      isSkippingRef.current = false;
    }, 1000);
  };

  if (items.length === 0) return null;

  const currentReel = items[activeIndex] || items[0];

  // Instagram/TikTok Silky Smooth Vertical Slide Engine (0% Jitter & Zero Vibration)
  const slideVariants = {
    initial: (dir) => ({
      y: dir > 0 ? '100%' : '-100%',
      opacity: 1
    }),
    animate: {
      y: '0%',
      opacity: 1,
      transition: {
        duration: 0.42,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    exit: (dir) => ({
      y: dir > 0 ? '-100%' : '100%',
      opacity: 1,
      transition: {
        duration: 0.42,
        ease: [0.16, 1, 0.3, 1]
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
      {/* VIBRANT IRIS BRAND ATMOSPHERE BACKGROUND (OPTION 2: KINETIC AMBIENT MESH) */}
      <div className="reels-bg-ambient-layer">
        <div className="reels-glow-purple-top" />
        <div className="reels-glow-green-bottom" />
        <div className="reels-glow-gold-center" />
        <div className="reels-grain-overlay" />
      </div>

      <div className="reels-stage-container">
        {/* OUTER FLOATING TOP SKIP PILL (FLOATING IN AMBIENT BACKGROUND ABOVE REEL) */}
        <button
          type="button"
          className="reels-floating-skip-pill reels-skip-top-pill-outer"
          onClick={handleSkipUp}
          aria-label={isRtl ? 'تخطي للأعلى' : 'Skip Up'}
          title={isRtl ? 'تخطي للأعلى' : 'Skip Up'}
        >
          <span>{isRtl ? 'تخطي' : 'Skip'}</span>
          <ChevronUp size={16} className="skip-up-arrow-anim" />
        </button>

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
              style={{ willChange: 'transform', transform: 'translate3d(0,0,0)', backfaceVisibility: 'hidden' }}
            >
              {(() => {
                const isVidUrl = (url) => typeof url === 'string' && (/\.(mp4|mov|webm|m4v|mkv|avi)($|\?)/i.test(url) || url.startsWith('data:video') || url.startsWith('blob:video'));
                const mediaSrc = currentReel.media_url || currentReel.image || '';
                
                let validImage = heroMediaImg;
                if (currentReel.image && !isVidUrl(currentReel.image) && !currentReel.image.startsWith('blob:')) {
                  validImage = currentReel.image;
                } else if (currentReel.media_url && !isVidUrl(currentReel.media_url) && !currentReel.media_url.startsWith('blob:')) {
                  validImage = currentReel.media_url;
                }

                const isVideo = (currentReel.media_type === 'video' || isVidUrl(mediaSrc) || isVidUrl(currentReel.media_url)) && !videoErrorMap[currentReel.id];

                if (isVideo && mediaSrc) {
                  return (
                    <video
                      ref={videoRef}
                      src={mediaSrc}
                      poster={validImage}
                      autoPlay={isStageActive}
                      loop
                      muted={isMuted}
                      playsInline
                      webkit-playsinline="true"
                      className="reel-static-img"
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      onError={() => setVideoErrorMap(prev => ({ ...prev, [currentReel.id]: true }))}
                    />
                  );
                }
                return (
                  <img
                    src={validImage}
                    alt={isRtl ? currentReel.alt_ar : currentReel.alt_en}
                    className="reel-static-img"
                  />
                );
              })()}
              <div className="reel-darkness-gradient" />

              {/* INSTAGRAM REEL BOTTOM CAPTION BLOCK (FLUID FLEX LAYOUT) */}
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
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ===== 2. PERSISTENT SPATIAL OVERLAYS INSIDE 9:16 FRAME ===== */}
          <div className="reels-persistent-ui-layer">

            {/* STATIC & STATIONARY IRIS PROFILE IDENTITY BADGE (NEVER SLIDES ON REEL FLIP) */}
            <div className="instagram-caption-profile-row-persistent" dir={isRtl ? 'rtl' : 'ltr'}>
              <div className="instagram-avatar-ring">
                <img src={settings.hero_logo_url || settings.logo_url || irisLogo} alt="IRIS" className="instagram-avatar-img" />
              </div>
              <div className="instagram-user-meta">
                <span className="instagram-username">IRIS HOME</span>
                <span className="instagram-handle bidi-isolate" dir="ltr">@iris.jo</span>
              </div>
            </div>

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

              {/* 4. MUTE / UNMUTE SOUND BUTTON */}
              <div className="reels-action-btn-group-single">
                <button
                  type="button"
                  className="reels-action-circle-btn"
                  onClick={() => setIsMuted((prev) => !prev)}
                  aria-label={isMuted ? (isRtl ? "تشغيل الصوت" : "Unmute") : (isRtl ? "كتم الصوت" : "Mute")}
                  title={isMuted ? (isRtl ? "تشغيل الصوت" : "Unmute") : (isRtl ? "كتم الصوت" : "Mute")}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <span className="reels-action-counter" onClick={() => setIsMuted((prev) => !prev)}>
                  {isMuted ? (isRtl ? 'مكتوم' : 'Muted') : (isRtl ? 'مسموع' : 'Sound')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* OUTER FLOATING BOTTOM SKIP PILL (FLOATING IN AMBIENT BACKGROUND BELOW REEL) */}
        <button
          type="button"
          className="reels-floating-skip-pill reels-skip-bottom-pill-outer"
          onClick={handleSkipReels}
          aria-label={isRtl ? 'تخطي الريلز والنزول لأسفل' : 'Skip Reels'}
          title={isRtl ? 'تخطي الريلز والنزول لأسفل' : 'Skip Reels'}
        >
          <span>{isRtl ? 'تخطي' : 'Skip'}</span>
          <ChevronDown size={16} className="skip-arrow-anim" />
        </button>
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
            transition={{ duration: 0.28 }}
          >
            {/* Top Bar: IRIS Logo (Left), Close X (Right) */}
            <div className="overlay-top-bar">
              <img src={settings.hero_logo_url || settings.logo_url || irisLogo} alt="IRIS" className="overlay-brand-logo" />

              <button
                type="button"
                className="overlay-close-btn"
                onClick={() => setMenuOpen(false)}
                aria-label="Close Menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Vertical Menu List (One Item Per Row) */}
            <nav className="overlay-vertical-menu">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
                <Link to="/" className="overlay-nav-item active" onClick={() => setMenuOpen(false)}>
                  {isRtl ? "الرئيسية" : "Home"}
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                <Link to="/media" className="overlay-nav-item" onClick={() => setMenuOpen(false)}>
                  {isRtl ? "ميديا" : "Media"}
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                <Link to="/studio" className="overlay-nav-item" onClick={() => setMenuOpen(false)}>
                  {isRtl ? "الاستوديو" : "Studio"}
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
                <Link to="/print" className="overlay-nav-item" onClick={() => setMenuOpen(false)}>
                  {isRtl ? "المطبوعات" : "Print"}
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.20 }}>
                <Link to="/work" className="overlay-nav-item" onClick={() => setMenuOpen(false)}>
                  {isRtl ? "أعمالنا" : "Our Work"}
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
                <Link to="/packages" className="overlay-nav-item" onClick={() => setMenuOpen(false)}>
                  {isRtl ? "البكجات والعروض" : "Packages & Offers"}
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
                <a
                  href="#iris-footer-root"
                  className="overlay-nav-item"
                  onClick={() => {
                    setMenuOpen(false);
                    const footerEl = document.getElementById('iris-footer-root');
                    if (footerEl) footerEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {isRtl ? "تواصل معنا" : "Contact Us"}
                </a>
              </motion.div>
            </nav>

            {/* Bottom Row: Language Control & Brand Signature */}
            <div className="overlay-bottom-bar">
              <button
                type="button"
                className="overlay-lang-btn"
                onClick={toggleLanguage}
                aria-label={isRtl ? "Switch to English" : "التحويل إلى العربية"}
              >
                <Globe size={16} />
                <span>{isRtl ? 'EN English' : 'ع العربية'}</span>
              </button>

              <div className="overlay-brand-signature">
                <span>WE BREAK THE BOX</span>
                <span className="gold-dot" />
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
