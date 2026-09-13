import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Calendar,
  Camera,
  ChevronDown,
  ChevronUp,
  FolderKanban,
  Globe,
  Menu,
  MessageSquare,
  Printer,
  ShoppingBag,
  Share2,
  Volume2,
  VolumeX,
  X,
  Play,
  Pause,
} from 'lucide-react';

import { useSiteSettings } from '../../context/SiteSettingsContext';
import {
  getAllApprovedFeedbackAsync,
  getFlowItems,
  getFlowItemsAsync,
  submitFlowFeedback,
} from '../../repositories/flowRepository';
import irisLogo from '../../assets/iris_logo.png';
import heroMediaImg from '../../assets/hero.png';
import '../../styles/iris-reels-v2.css';

const HIDE_AFTER_MS = 2000;

const isVideoUrl = (url) =>
  typeof url === 'string' &&
  (/\.(mp4|mov|webm|m4v|mkv|avi)($|\?)/i.test(url) ||
    url.startsWith('data:video') ||
    url.startsWith('blob:video'));

const getActionIcon = (iconType) => {
  switch (iconType) {
    case 'project':
      return <FolderKanban size={20} />;
    case 'camera':
      return <Camera size={20} />;
    case 'calendar':
      return <Calendar size={20} />;
    case 'order':
      return <ShoppingBag size={20} />;
    case 'print':
      return <Printer size={20} />;
    default:
      return <ArrowUpRight size={20} />;
  }
};

const getMedia = (item, videoError) => {
  const mediaSrc = item?.media_url || item?.image || '';
  let poster = heroMediaImg;

  if (item?.image && !isVideoUrl(item.image) && !item.image.startsWith('blob:')) {
    poster = item.image;
  } else if (
    item?.media_url &&
    !isVideoUrl(item.media_url) &&
    !item.media_url.startsWith('blob:')
  ) {
    poster = item.media_url;
  }

  const isVideo =
    (item?.media_type === 'video' ||
      isVideoUrl(mediaSrc) ||
      isVideoUrl(item?.media_url)) &&
    !videoError;

  return { mediaSrc, poster, isVideo };
};

const ReelSection = ({
  item,
  index,
  total,
  isRtl,
  settings,
  isMuted,
  onMuteChange,
  onOpenMenu,
  onOpenFeedback,
  onShare,
  onPrimaryAction,
  onSkipUp,
  onSkipDown,
  onVideoError,
  onVisible,
}) => {
  const videoRef = useRef(null);
  const controlsTimerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);

  const { mediaSrc, poster, isVideo } = getMedia(item, false);

  const clearControlsTimer = useCallback(() => {
    if (controlsTimerRef.current) {
      window.clearTimeout(controlsTimerRef.current);
      controlsTimerRef.current = null;
    }
  }, []);

  const showControls = useCallback(() => {
    if (!isVideo) return;

    setControlsVisible(true);
    clearControlsTimer();

    controlsTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
      controlsTimerRef.current = null;
    }, HIDE_AFTER_MS);
  }, [clearControlsTimer, isVideo]);

  useEffect(() => {
    return () => clearControlsTimer();
  }, [clearControlsTimer]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;

    const syncState = () => setIsPlaying(!video.paused && !video.ended);
    video.addEventListener('play', syncState);
    video.addEventListener('pause', syncState);
    video.addEventListener('ended', syncState);

    return () => {
      video.removeEventListener('play', syncState);
      video.removeEventListener('pause', syncState);
      video.removeEventListener('ended', syncState);
    };
  }, [isVideo]);

  const handleMediaClick = (event) => {
    if (!isVideo) return;
    if (event.target.closest('button, a')) return;
    showControls();
  };

  const handlePlayPause = (event) => {
    event.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
    showControls();
  };

  const handleMute = (event) => {
    event.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    onMuteChange(video.muted);
    showControls();
  };

  return (
    <section
      className="reel-section"
      data-index={index}
      ref={onVisible}
      aria-label={`Reel ${String(index + 1).padStart(2, '0')} of ${String(total).padStart(2, '0')}`}
    >
      <div className="reel-media-wrap" onClick={isVideo ? handleMediaClick : undefined}>
        {isVideo && mediaSrc ? (
          <video
            ref={videoRef}
            className="reel-media"
            src={mediaSrc}
            poster={poster}
            preload="metadata"
            loop
            muted={isMuted}
            playsInline
            webkit-playsinline="true"
            onError={onVideoError}
          />
        ) : (
          <img
            className="reel-media"
            src={poster}
            alt={isRtl ? item.alt_ar || '' : item.alt_en || ''}
            loading={index < 2 ? 'eager' : 'lazy'}
            decoding="async"
          />
        )}
      </div>

      {isVideo && controlsVisible && (
        <div className="reel-video-controls" aria-hidden="false">
          <button
            type="button"
            className="reel-video-mute-button"
            onClick={handleMute}
            aria-label={isMuted ? (isRtl ? 'إلغاء الكتم' : 'Unmute') : isRtl ? 'كتم' : 'Mute'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button
            type="button"
            className="reel-video-play-button"
            onClick={handlePlayPause}
            aria-label={isPlaying ? (isRtl ? 'إيقاف' : 'Pause') : isRtl ? 'تشغيل' : 'Play'}
          >
            {isPlaying ? <Pause size={30} /> : <Play size={30} />}
          </button>
        </div>
      )}

      <div className="reel-overlay" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="reel-top-bar">
          <button
            type="button"
            className="reel-skip-up-button"
            onClick={onSkipUp}
            aria-label={isRtl ? 'العودة للقسم السابق' : 'Go to previous section'}
          >
            <span>{isRtl ? 'تخطي' : 'Skip'}</span>
            <ChevronUp size={16} />
          </button>

          <button
            type="button"
            className="reel-hamburger-button"
            onClick={onOpenMenu}
            aria-label={isRtl ? 'فتح القائمة' : 'Open menu'}
          >
            <Menu size={21} />
          </button>
        </div>

        <div className="reel-side-actions">
          <div className="reel-side-action">
            <button
              type="button"
              className="reel-side-action-button reel-side-action-primary"
              onClick={() => onPrimaryAction(item.cta_url)}
              aria-label={isRtl ? item.cta_label_ar : item.cta_label_en}
            >
              {getActionIcon(item.cta_icon_type)}
            </button>
            <button
              type="button"
              className="reel-side-action-label reel-side-action-label-primary"
              onClick={() => onPrimaryAction(item.cta_url)}
            >
              {isRtl ? item.cta_label_ar : item.cta_label_en}
            </button>
          </div>

          <div className="reel-side-action">
            <button
              type="button"
              className="reel-side-action-button"
              onClick={onOpenFeedback}
              aria-label={isRtl ? 'فيدباك' : 'Feedback'}
            >
              <MessageSquare size={20} />
            </button>
            <button type="button" className="reel-side-action-label" onClick={onOpenFeedback}>
              {isRtl ? 'فيدباك' : 'Feedback'}
            </button>
          </div>

          <div className="reel-side-action">
            <button
              type="button"
              className="reel-side-action-button"
              onClick={onShare}
              aria-label={isRtl ? 'شير' : 'Share'}
            >
              <Share2 size={20} />
            </button>
            <button type="button" className="reel-side-action-label" onClick={onShare}>
              {isRtl ? 'شير' : 'Share'}
            </button>
          </div>
        </div>

        <div className="reel-footer">
          <div className="reel-caption">
            <button type="button" className="reel-profile" onClick={() => onPrimaryAction('/')}>
              <span className="reel-profile-avatar">
                <img
                  src={settings.hero_logo_url || settings.logo_url || irisLogo}
                  alt="IRIS"
                />
              </span>
              <span className="reel-profile-meta">
                <span className="reel-profile-name">IRIS HOME</span>
                <span className="reel-profile-handle" dir="ltr">@iris.jo</span>
              </span>
            </button>

            <span className="reel-counter">
              <span>0{index + 1}</span>
              <span>/</span>
              <span>{String(total).padStart(2, '0')}</span>
            </span>

            <span className="reel-category">
              {isRtl ? item.category_label_ar : item.category_label_en}
            </span>

            <h2 className="reel-title">
              {isRtl ? item.headline_ar : item.headline_en}
            </h2>

            <p className="reel-description">
              {isRtl ? item.secondary_text_ar : item.secondary_text_en}
            </p>
          </div>

          <button
            type="button"
            className="reel-skip-down-button"
            onClick={onSkipDown}
            aria-label={isRtl ? 'النزول للقسم التالي' : 'Go to next section'}
          >
            <span>{isRtl ? 'تخطي' : 'Skip'}</span>
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};

const IrisReelsViewerV2 = ({ id = 'iris-reels-viewer-root' }) => {
  const navigate = useNavigate();
  const { settings, lang, toggleLanguage } = useSiteSettings();
  const isRtl = lang === 'ar';

  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [toast, setToast] = useState('');

  const containerRef = useRef(null);
  const sectionRefs = useRef([]);
  const videoRefs = useRef([]);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    const localItems = getFlowItems();
    const enabled = localItems.filter((item) => item.enabled);
    setItems(enabled.length ? enabled : localItems);

    getFlowItemsAsync()
      .then((cloudItems) => {
        if (!cloudItems?.length) return;
        const cloudEnabled = cloudItems.filter((item) => item.enabled);
        setItems(cloudEnabled.length ? cloudEnabled : cloudItems);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
    const item = items[activeIndex];
    if (item?.slug) {
      window.history.replaceState(null, '', `#flow-${item.slug}`);
    }
  }, [activeIndex, items]);

  useEffect(() => {
    if (!items.length || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let bestEntry = null;

        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
            bestEntry = entry;
          }
        });

        if (!bestEntry || bestEntry.intersectionRatio <= 0.9) return;

        const index = Number(bestEntry.target.dataset.index);
        if (!Number.isInteger(index)) return;

        setActiveIndex((current) => (current === index ? current : index));

        sectionRefs.current.forEach((section, sectionIndex) => {
          const video = videoRefs.current[sectionIndex];
          if (!video) return;

          if (sectionIndex === index && bestEntry.intersectionRatio > 0.9) {
            video.muted = isMuted;
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      {
        root: containerRef.current,
        threshold: [0, 0.9, 1],
      }
    );

    sectionRefs.current.filter(Boolean).forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [items, isMuted]);

  useEffect(() => {
    if (!items.length) return;

    const hash = window.location.hash;
    if (!hash.startsWith('#flow-')) return;

    const slug = hash.slice('#flow-'.length);
    const index = items.findIndex((item) => item.slug === slug);
    if (index < 0) return;

    requestAnimationFrame(() => {
      sectionRefs.current[index]?.scrollIntoView({
        behavior: 'auto',
        block: 'start',
      });
    });
  }, [items]);

  useEffect(() => {
    const visibilityHandler = () => {
      if (document.visibilityState === 'hidden') {
        videoRefs.current.forEach((video) => video?.pause());
        return;
      }

      const activeVideo = videoRefs.current[activeIndexRef.current];
      if (activeVideo) {
        activeVideo.muted = isMuted;
        activeVideo.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', visibilityHandler);
    return () => document.removeEventListener('visibilitychange', visibilityHandler);
  }, [isMuted]);

  useEffect(() => {
    window.__resetReelToHero = () => {
      containerRef.current?.scrollTo({ top: 0, behavior: 'auto' });
      setActiveIndex(0);
      if (window.location.hash.startsWith('#flow-')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    return () => {
      delete window.__resetReelToHero;
    };
  }, []);

  const setSectionRef = (index, node) => {
    sectionRefs.current[index] = node;
  };

  const setVideoRef = (index, node) => {
    videoRefs.current[index] = node;
  };

  const goToIndex = (index) => {
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    sectionRefs.current[clamped]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const skipUp = () => {
    const previousSection =
      document.getElementById('iris-dark-hero-root') ||
      document.querySelector('.hero-section') ||
      document.body;
    previousSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const skipDown = () => {
    const nextSection =
      document.getElementById('iris-divisions-section') ||
      document.getElementById('iris-divisions-switcher') ||
      document.querySelector('.iris-switcher-wrapper') ||
      document.querySelector('footer');

    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const openFeedback = () => {
    getAllApprovedFeedbackAsync().then(setFeedbackList).catch(() => {});
    setFeedbackSubmitted(false);
    setFeedbackOpen(true);
  };

  const submitFeedback = async (event) => {
    event.preventDefault();
    const item = items[activeIndex];
    if (!item || !feedbackInput.trim()) return;

    try {
      await submitFlowFeedback(item.id, feedbackInput, feedbackName);
      setFeedbackInput('');
      setFeedbackName('');
      setFeedbackSubmitted(true);
      getAllApprovedFeedbackAsync().then(setFeedbackList).catch(() => {});
      window.setTimeout(() => setFeedbackSubmitted(false), 3500);
    } catch (error) {
      console.error('Failed to submit visitor feedback:', error);
      setToast(isRtl ? 'تعذر إرسال التقييم، حاول مرة أخرى.' : 'Could not submit your feedback.');
      window.setTimeout(() => setToast(''), 3000);
    }
  };

  const share = async () => {
    const item = items[activeIndex];
    const shareUrl = `${window.location.origin}/#flow-${item?.slug || '01'}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `IRIS — ${isRtl ? item?.category_label_ar : item?.category_label_en}`,
          text: isRtl ? item?.headline_ar : item?.headline_en,
          url: shareUrl,
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setToast(isRtl ? 'تم نسخ الرابط' : 'Link copied');
      window.setTimeout(() => setToast(''), 3000);
    } catch {}
  };

  const primaryAction = (url) => {
    if (url === '/') {
      navigate('/');
      return;
    }
    if (url) navigate(url);
  };

  const handleMuteChange = (muted) => {
    setIsMuted(muted);
    window.dispatchEvent(new CustomEvent('iris-reel-mute-change', { detail: { muted } }));
  };

  if (!items.length) return null;

  return (
    <section id={id} className="iris-reels-v2" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="reels-container" ref={containerRef}>
        {items.map((item, index) => (
          <ReelSection
            key={item.id}
            item={item}
            index={index}
            total={items.length}
            isRtl={isRtl}
            settings={settings}
            isMuted={isMuted}
            onMuteChange={handleMuteChange}
            onOpenMenu={() => setMenuOpen(true)}
            onOpenFeedback={openFeedback}
            onShare={share}
            onPrimaryAction={primaryAction}
            onSkipUp={skipUp}
            onSkipDown={skipDown}
            onVideoError={() => {}}
            onVisible={(node) => {
              setSectionRef(index, node);
              if (node) {
                const media = node.querySelector('video');
                setVideoRef(index, media);
              }
            }}
          />
        ))}
      </div>

      {feedbackOpen && (
        <div className="reels-feedback-drawer-overlay" onClick={() => setFeedbackOpen(false)}>
          <div
            className="reels-feedback-sheet"
            onClick={(event) => event.stopPropagation()}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div className="reels-feedback-header">
              <h3 className="reels-feedback-title">
                <MessageSquare size={20} />
                <span>{isRtl ? 'آراء وتقييمات الزوار (IRIS)' : 'IRIS Visitor Reviews'}</span>
              </h3>
              <button type="button" onClick={() => setFeedbackOpen(false)} className="reels-feedback-close-btn">
                <X size={18} />
              </button>
            </div>

            {feedbackSubmitted && (
              <div className="reels-feedback-success">
                {isRtl ? '✨ تم نشر تقييمك بنجاح!' : '✨ Your review was published successfully!'}
              </div>
            )}

            <form onSubmit={submitFeedback} className="reels-feedback-form">
              <input
                type="text"
                placeholder={isRtl ? 'الاسم (اختياري)...' : 'Name (Optional)...'}
                value={feedbackName}
                onChange={(event) => setFeedbackName(event.target.value)}
              />
              <textarea
                required
                rows={3}
                placeholder={isRtl ? 'اكتب رأيك أو تقييمك...' : 'Write feedback or review...'}
                value={feedbackInput}
                onChange={(event) => setFeedbackInput(event.target.value)}
              />
              <button type="submit">
                {isRtl ? 'إرسال التقييم' : 'Submit Review'}
              </button>
            </form>

            <div className="reels-feedback-list">
              {feedbackList.map((feedback) => (
                <div key={feedback.id} className="reels-feedback-card">
                  <div className="reels-feedback-card-header">
                    <span>{feedback.name}</span>
                    <small>IRIS</small>
                  </div>
                  <p>{feedback.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {menuOpen &&
        createPortal(
          <div className={`iris-reels-v2-menu dir-${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="iris-reels-v2-menu-top">
              <img src={settings.hero_logo_url || settings.logo_url || irisLogo} alt="IRIS" />
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X size={24} />
              </button>
            </div>

            <nav>
              <Link to="/" onClick={() => setMenuOpen(false)}>{isRtl ? 'الرئيسية' : 'Home'}</Link>
              <Link to="/media" onClick={() => setMenuOpen(false)}>{isRtl ? 'ميديا' : 'Media'}</Link>
              <Link to="/studio" onClick={() => setMenuOpen(false)}>{isRtl ? 'الاستوديو' : 'Studio'}</Link>
              <Link to="/print" onClick={() => setMenuOpen(false)}>{isRtl ? 'المطبوعات' : 'Print'}</Link>
              <Link to="/work" onClick={() => setMenuOpen(false)}>{isRtl ? 'أعمالنا' : 'Our Work'}</Link>
              <Link to="/packages" onClick={() => setMenuOpen(false)}>{isRtl ? 'البكجات والعروض' : 'Packages & Offers'}</Link>
              <a
                href="#iris-footer-root"
                onClick={() => {
                  setMenuOpen(false);
                  document.getElementById('iris-footer-root')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {isRtl ? 'تواصل معنا' : 'Contact Us'}
              </a>
            </nav>

            <div className="iris-reels-v2-menu-bottom">
              <button type="button" onClick={toggleLanguage}>
                <Globe size={16} />
                <span>{isRtl ? 'EN English' : 'ع العربية'}</span>
              </button>
              <span>WE BREAK THE BOX</span>
            </div>
          </div>,
          document.body
        )}

      {toast && <div className="reels-toast-notification">{toast}</div>}
    </section>
  );
};

export default IrisReelsViewerV2;
