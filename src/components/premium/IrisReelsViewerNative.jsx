import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  Menu, X, MessageSquare, Share2, ArrowUpRight, Globe,
  Camera, Calendar, Printer, ShoppingBag, FolderKanban,
  Volume2, VolumeX, ChevronDown, ChevronUp
} from 'lucide-react';

import { useSiteSettings } from '../../context/SiteSettingsContext';
import { getFlowItems, getFlowItemsAsync, getAllApprovedFeedbackAsync, submitFlowFeedback } from '../../repositories/flowRepository';
import irisLogo from '../../assets/iris_logo.png';
import heroMediaImg from '../../assets/hero.png';
import '../../styles/iris-reels-viewer.css';
import '../../styles/iris-dark-hero.css';

/**
 * Native scroll-snap implementation.
 * The legacy IrisReelsViewer remains untouched on main and can be selected
 * from Home with one flag/import switch.
 */
export const IrisReelsViewerNative = ({ id = 'iris-reels-viewer-root' }) => {
  const navigate = useNavigate();
  const { settings, lang, toggleLanguage } = useSiteSettings();
  const isRtl = lang === 'ar';

  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isStageActive, setIsStageActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [allFeedbackList, setAllFeedbackList] = useState([]);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [videoErrorMap, setVideoErrorMap] = useState({});

  const stageRef = useRef(null);
  const scrollRef = useRef(null);
  const sectionRefs = useRef([]);
  const activeIndexRef = useRef(0);

  const isVideoUrl = useCallback((url) => (
    typeof url === 'string' &&
    (/\.(mp4|mov|webm|m4v|mkv|avi)($|\?)/i.test(url) ||
      url.startsWith('data:video') ||
      url.startsWith('blob:video'))
  ), []);

  const getMedia = useCallback((item) => {
    const mediaSrc = item?.media_url || item?.image || '';
    let poster = heroMediaImg;
    if (item?.image && !isVideoUrl(item.image) && !item.image.startsWith('blob:')) poster = item.image;
    else if (item?.media_url && !isVideoUrl(item.media_url) && !item.media_url.startsWith('blob:')) poster = item.media_url;
    return {
      mediaSrc,
      poster,
      isVideo: (item?.media_type === 'video' || isVideoUrl(mediaSrc) || isVideoUrl(item?.media_url)) &&
        !videoErrorMap[item?.id]
    };
  }, [isVideoUrl, videoErrorMap]);

  useEffect(() => {
    const onMute = (event) => {
      if (typeof event.detail?.muted === 'boolean') setIsMuted(event.detail.muted);
    };
    window.addEventListener('iris-reel-mute-change', onMute);
    return () => window.removeEventListener('iris-reel-mute-change', onMute);
  }, []);

  useEffect(() => {
    const localItems = getFlowItems();
    const initial = localItems.filter((it) => it.enabled);
    setItems(initial.length ? initial : localItems);

    getFlowItemsAsync().then((cloudItems) => {
      if (!cloudItems?.length) return;
      const enabled = cloudItems.filter((it) => it.enabled);
      setItems(enabled.length ? enabled : cloudItems);
    });
  }, []);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
    const item = items[activeIndex];
    if (item?.slug) window.history.replaceState(null, '', `#flow-${item.slug}`);
  }, [activeIndex, items]);

  useEffect(() => {
    if (!items.length || !scrollRef.current) return;

    const container = scrollRef.current;
    const sections = sectionRefs.current.filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      let best = null;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
      }
      if (!best || best.intersectionRatio < 0.6) return;

      const index = Number(best.target.dataset.index);
      if (!Number.isInteger(index)) return;

      setActiveIndex((previous) => previous === index ? previous : index);

      sections.forEach((section, sectionIndex) => {
        const video = section.querySelector('video');
        if (!video) return;

        if (
          sectionIndex === index &&
          best.intersectionRatio >= 0.6 &&
          document.visibilityState === 'visible'
        ) {
          video.muted = isMuted;
          video.defaultMuted = isMuted;
          video.playsInline = true;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, {
      root: container,
      threshold: [0.6, 0.75, 0.9]
    });

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [items, isMuted]);

  useEffect(() => {
    if (!items.length || !scrollRef.current) return;
    const hash = window.location.hash;
    if (!hash?.startsWith('#flow-')) return;

    const slug = hash.replace('#flow-', '');
    const index = items.findIndex((item) => item.slug === slug);
    if (index < 0) return;

    requestAnimationFrame(() => {
      sectionRefs.current[index]?.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
  }, [items]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsStageActive(entry.isIntersecting);
      const navbar = document.querySelector('.navbar-container, header.site-navbar, .app-header');
      if (navbar) navbar.style.display = entry.isIntersecting ? 'none' : '';
    }, { threshold: 0.25 });

    if (stageRef.current) observer.observe(stageRef.current);

    return () => {
      observer.disconnect();
      const navbar = document.querySelector('.navbar-container, header.site-navbar, .app-header');
      if (navbar) navbar.style.display = '';
    };
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      const sections = sectionRefs.current;
      if (document.visibilityState === 'hidden') {
        sections.forEach((section) => section?.querySelector('video')?.pause());
        return;
      }

      if (!isStageActive) return;
      const video = sections[activeIndexRef.current]?.querySelector('video');
      if (video) {
        video.muted = isMuted;
        video.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isStageActive, isMuted]);

  useEffect(() => {
    window.__resetReelToHero = () => {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
      setActiveIndex(0);
      if (window.location.hash?.startsWith('#flow-')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    };
    return () => delete window.__resetReelToHero;
  }, []);

  const scrollToIndex = (index) => {
    sectionRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const handleSkipUp = () => {
    const hero = document.getElementById('iris-dark-hero-root') ||
      document.querySelector('.hero-section') ||
      document.body;
    hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSkipReels = () => {
    const next = document.getElementById('iris-divisions-section') ||
      document.getElementById('iris-divisions-switcher') ||
      document.querySelector('.iris-switcher-wrapper') ||
      document.querySelector('footer');

    if (next) next.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  };

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

  const refreshFeedback = () => {
    getAllApprovedFeedbackAsync().then(setAllFeedbackList).catch(() => {});
  };

  const handleToggleFeedback = () => {
    refreshFeedback();
    setFeedbackOpen((previous) => !previous);
    setFeedbackSubmitted(false);
  };

  const handleFeedbackSubmit = async (event) => {
    event.preventDefault();
    const item = items[activeIndex];
    if (!feedbackInput.trim() || !item) return;

    try {
      await submitFlowFeedback(item.id, feedbackInput, feedbackName);
    } catch (error) {
      console.error('Failed to submit visitor feedback:', error);
      setToastMessage(isRtl ? 'تعذر إرسال التقييم، حاول مرة أخرى.' : 'Could not submit your feedback. Please try again.');
      return;
    }

    setFeedbackInput('');
    setFeedbackName('');
    setFeedbackSubmitted(true);
    refreshFeedback();
    window.setTimeout(() => setFeedbackSubmitted(false), 3500);
  };

  const handleShare = async () => {
    const item = items[activeIndex];
    const shareUrl = `${window.location.origin}/#flow-${item?.slug || '01'}`;
    const title = isRtl ? item?.category_label_ar : item?.category_label_en;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `IRIS — ${title}`,
          text: isRtl ? item?.headline_ar : item?.headline_en,
          url: shareUrl
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setToastMessage(isRtl ? 'تم نسخ الرابط' : 'Link copied');
      window.setTimeout(() => setToastMessage(''), 3000);
    } catch {}
  };

  if (!items.length) return null;

  const currentReel = items[activeIndex] || items[0];
  const total = items.length;

  return (
    <section id={id} ref={stageRef} className="iris-reels-viewer-wrapper iris-reels-native-wrapper">
      <div className="reels-bg-ambient-layer">
        <div className="reels-glow-purple-top" />
        <div className="reels-glow-green-bottom" />
        <div className="reels-glow-gold-center" />
        <div className="reels-grain-overlay" />
      </div>

      <button type="button" className="reels-floating-skip-pill reels-skip-top-pill-outer" onClick={handleSkipUp}>
        <span>{isRtl ? 'تخطي' : 'Skip'}</span>
        <ChevronUp size={16} className="skip-up-arrow-anim" />
      </button>

      <div className="reels-stage-container reels-native-stage">
        <div ref={scrollRef} className="reels-scroll-container" data-locale={isRtl ? 'ar' : 'en'}>
          {items.map((item, index) => {
            const { mediaSrc, poster, isVideo } = getMedia(item);

            return (
              <section
                key={item.id}
                ref={(node) => { sectionRefs.current[index] = node; }}
                className="reel-section"
                data-index={index}
              >
                <div className="reel-frame">
                  <div className="reel-canvas-layer">
                    {isVideo && mediaSrc ? (
                      <video
                        src={mediaSrc}
                        poster={poster}
                        preload="none"
                        loop
                        muted={isMuted}
                        playsInline
                        webkit-playsinline="true"
                        className="reel-static-img"
                        onError={() => setVideoErrorMap((previous) => ({ ...previous, [item.id]: true }))}
                      />
                    ) : (
                      <img
                        src={poster}
                        alt={isRtl ? item.alt_ar : item.alt_en}
                        className="reel-static-img"
                        loading={index < 2 ? 'eager' : 'lazy'}
                        decoding="async"
                      />
                    )}

                    <div className="reel-darkness-gradient" />

                    <div className="instagram-reel-caption-block" dir={isRtl ? 'rtl' : 'ltr'}>
                      <div className="instagram-caption-profile-row">
                        <div className="instagram-avatar-ring">
                          <img
                            src={settings.hero_logo_url || settings.logo_url || irisLogo}
                            alt="IRIS"
                            className="instagram-avatar-img"
                          />
                        </div>
                        <div className="instagram-user-meta">
                          <span className="instagram-username">IRIS HOME</span>
                          <span className="instagram-handle bidi-isolate" dir="ltr">@iris.jo</span>
                        </div>
                      </div>

                      <span className="reel-item-number">
                        <span className="bidi-isolate" dir="ltr">IRIS</span>
                        {' / '}
                        {isRtl ? item.category_label_ar : item.category_label_en}
                        {' / '}
                        0{index + 1}
                      </span>

                      <h2 className="reel-headline-text">
                        {isRtl ? item.headline_ar : item.headline_en}
                      </h2>

                      {item.secondary_text_ar && (
                        <p className="reel-secondary-text">
                          {isRtl ? item.secondary_text_ar : item.secondary_text_en}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <div className="reels-persistent-ui-layer">
          <div className="reels-top-bar">
            <button type="button" className="reels-hamburger-btn" onClick={() => setMenuOpen(true)} aria-label="Open Navigation Menu">
              <Menu size={20} />
            </button>
            <div className="reels-counter-pill-tag">
              <span className="gold-accent-line" />
              <span className="bidi-isolate" dir="ltr">
                0{activeIndex + 1} / {String(total).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="reels-action-rail">
            <div className="reels-action-btn-group-single">
              <button
                type="button"
                className="reels-action-circle-btn primary-action-btn"
                onClick={() => currentReel.cta_url && navigate(currentReel.cta_url)}
                aria-label={isRtl ? currentReel.cta_label_ar : currentReel.cta_label_en}
              >
                {getActionIcon(currentReel.cta_icon_type)}
              </button>
              {currentReel.cta_label_ar && (
                <span className="reels-action-counter reels-action-cta-text" onClick={() => currentReel.cta_url && navigate(currentReel.cta_url)}>
                  {isRtl ? currentReel.cta_label_ar : currentReel.cta_label_en}
                </span>
              )}
            </div>

            <div className="reels-action-btn-group-single">
              <button type="button" className="reels-action-circle-btn feedback-btn" onClick={handleToggleFeedback} aria-label="Feedback">
                <MessageSquare size={20} />
              </button>
              <span className="reels-action-counter" onClick={handleToggleFeedback}>{isRtl ? 'فيدباك' : 'Feedback'}</span>
            </div>

            <div className="reels-action-btn-group-single">
              <button type="button" className="reels-action-circle-btn" onClick={handleShare} aria-label="Share">
                <Share2 size={20} />
              </button>
              <span className="reels-action-counter" onClick={handleShare}>{isRtl ? 'شير' : 'Share'}</span>
            </div>

            <div className="reels-action-btn-group-single">
              <button
                type="button"
                className="reels-action-circle-btn"
                onClick={() => setIsMuted((previous) => !previous)}
                aria-label={isMuted ? (isRtl ? 'تشغيل الصوت' : 'Unmute') : (isRtl ? 'كتم الصوت' : 'Mute')}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <span className="reels-action-counter" onClick={() => setIsMuted((previous) => !previous)}>
                {isMuted ? (isRtl ? 'مكتوم' : 'Muted') : (isRtl ? 'مسموع' : 'Sound')}
              </span>
            </div>
          </div>
        </div>

        <button type="button" className="reels-floating-skip-pill reels-skip-bottom-pill-outer" onClick={handleSkipReels}>
          <span>{isRtl ? 'تخطي' : 'Skip'}</span>
          <ChevronDown size={16} className="skip-arrow-anim" />
        </button>
      </div>

      {feedbackOpen && (
        <div className="reels-feedback-drawer-overlay" onClick={() => setFeedbackOpen(false)}>
          <div
            className="reels-feedback-sheet"
            onClick={(event) => event.stopPropagation()}
            onWheel={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.stopPropagation()}
            onTouchEnd={(event) => event.stopPropagation()}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div className="reels-feedback-header">
              <h3 className="reels-feedback-title"><MessageSquare size={20} /><span>{isRtl ? 'آراء وتقييمات الزوار (IRIS)' : 'IRIS Visitor Reviews'}</span></h3>
              <button type="button" onClick={() => setFeedbackOpen(false)} className="reels-feedback-close-btn"><X size={18} /></button>
            </div>

            {feedbackSubmitted && (
              <div style={{ padding: '10px 14px', marginBottom: '16px', borderRadius: '14px', backgroundColor: 'rgba(245, 189, 26, 0.18)', border: '1px solid rgba(245, 189, 26, 0.4)', color: '#F5BD1A', fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'center' }}>
                {isRtl ? '✨ تم نشر تقييمك بنجاح ونزل في القائمة أدناه!' : '✨ Your review has been published successfully below!'}
              </div>
            )}

            <form onSubmit={handleFeedbackSubmit} className="reels-feedback-form">
              <input type="text" placeholder={isRtl ? 'الاسم (اختياري)...' : 'Name (Optional)...'} value={feedbackName} onChange={(event) => setFeedbackName(event.target.value)} className="reels-feedback-input" />
              <textarea required rows={3} placeholder={isRtl ? 'اكتب رأيك أو تقييمك...' : 'Write feedback or review...'} value={feedbackInput} onChange={(event) => setFeedbackInput(event.target.value)} className="reels-feedback-textarea" />
              <button type="submit" className="reels-feedback-submit-btn">{isRtl ? 'إرسال التقييم' : 'Submit Review'}</button>
            </form>

            <div className="reels-feedback-section">
              <h4 className="reels-feedback-section-title">
                {isRtl ? `آراء الزوار الحقيقية (${allFeedbackList.length})` : `Real Visitor Reviews (${allFeedbackList.length})`}
              </h4>
              {allFeedbackList.length === 0 ? (
                <p style={{ fontSize: '0.85rem', opacity: 0.5, fontStyle: 'italic', padding: '16px 0', textAlign: 'center' }}>
                  {isRtl ? 'لا توجد تقييمات حتى الآن. كن أول من يكتب تقييمه!' : 'No reviews yet. Be the first to leave a review!'}
                </p>
              ) : (
                <div className="reels-feedback-list">
                  {allFeedbackList.map((fb) => (
                    <div key={fb.id} className="reels-feedback-card">
                      <div className="reels-feedback-card-header"><span className="reels-feedback-author">{fb.name}</span><span className="reels-feedback-badge">IRIS</span></div>
                      <p className="reels-feedback-message">{fb.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {menuOpen && createPortal(
        <motion.div
          className={`iris-portal-fullscreen-overlay dir-${isRtl ? 'rtl' : 'ltr'}`}
          dir={isRtl ? 'rtl' : 'ltr'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28 }}
        >
          <div className="overlay-top-bar">
            <img src={settings.hero_logo_url || settings.logo_url || irisLogo} alt="IRIS" className="overlay-brand-logo" />
            <button type="button" className="overlay-close-btn" onClick={() => setMenuOpen(false)}><X size={24} /></button>
          </div>

          <nav className="overlay-vertical-menu">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}><Link to="/" className="overlay-nav-item active" onClick={() => setMenuOpen(false)}>{isRtl ? 'الرئيسية' : 'Home'}</Link></motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}><Link to="/media" className="overlay-nav-item" onClick={() => setMenuOpen(false)}>{isRtl ? 'ميديا' : 'Media'}</Link></motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}><Link to="/studio" className="overlay-nav-item" onClick={() => setMenuOpen(false)}>{isRtl ? 'الاستوديو' : 'Studio'}</Link></motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}><Link to="/print" className="overlay-nav-item" onClick={() => setMenuOpen(false)}>{isRtl ? 'المطبوعات' : 'Print'}</Link></motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.20 }}><Link to="/work" className="overlay-nav-item" onClick={() => setMenuOpen(false)}>{isRtl ? 'أعمالنا' : 'Our Work'}</Link></motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}><Link to="/packages" className="overlay-nav-item" onClick={() => setMenuOpen(false)}>{isRtl ? 'البكجات والعروض' : 'Packages & Offers'}</Link></motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}><a href="#iris-footer-root" className="overlay-nav-item" onClick={() => { setMenuOpen(false); document.getElementById('iris-footer-root')?.scrollIntoView({ behavior: 'smooth' }); }}>{isRtl ? 'تواصل معنا' : 'Contact Us'}</a></motion.div>
          </nav>

          <div className="overlay-bottom-bar">
            <button type="button" className="overlay-lang-btn" onClick={toggleLanguage}><Globe size={16} /><span>{isRtl ? 'EN English' : 'ع العربية'}</span></button>
            <div className="overlay-brand-signature"><span>WE BREAK THE BOX</span><span className="gold-dot" /></div>
          </div>
        </motion.div>,
        document.body
      )}

      {toastMessage && <div className="reels-toast-notification"><span>{toastMessage}</span></div>}
    </section>
  );
};

export default IrisReelsViewerNative;
