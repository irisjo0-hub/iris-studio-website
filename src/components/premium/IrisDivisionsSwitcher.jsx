import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Touchpad } from 'lucide-react';
import { useSiteSettings } from '../../context/SiteSettingsContext';

import heroMediaImg from '../../assets/hero.png';
import '../../styles/iris-divisions-switcher.css';

/**
 * IRIS DIVISIONS V3 — COMPACT KINETIC IMAGE SWITCHER (FINAL INTERACTION REFINEMENT)
 * Direct Row Interaction:
 * 1st click/tap: Activates division (updates image & atmosphere, no navigation).
 * 2nd click/tap: Navigates directly to division route.
 * Desktop Hover: Previews & activates division state.
 * Fixed Header Clearance: Uses scroll-margin-top.
 */

export const IrisDivisionsSwitcher = ({ id = "iris-divisions-section" }) => {
  const navigate = useNavigate();
  const { settings, lang } = useSiteSettings();
  const isRtl = lang === 'ar';

  const [activeIdx, setActiveIdx] = useState(0);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Dynamic Division Data Binds
  const divisions = [
    {
      id: 'media',
      number: '01',
      name_en: settings.division_media_title_en || 'MEDIA',
      name_ar: settings.division_media_title_ar || 'ميديا',
      subtitle_ar: settings.division_media_subtitle_ar || 'صناعة المحتوى والحملات الإبداعية',
      subtitle_en: settings.division_media_subtitle_en || 'Content Creation & Creative Campaigns',
      image: settings.division_media_image || settings.hero_division_media_image || heroMediaImg,
      route: '/media',
      themeClass: 'theme-media',
      clipDirection: 'vertical'
    },
    {
      id: 'studio',
      number: '02',
      name_en: settings.division_studio_title_en || 'STUDIO',
      name_ar: settings.division_studio_title_ar || 'استوديو',
      subtitle_ar: settings.division_studio_subtitle_ar || 'التصوير الاحترافي ورواية القصة البصرية',
      subtitle_en: settings.division_studio_subtitle_en || 'Professional Photography & Visual Storytelling',
      image: settings.division_studio_image || settings.hero_division_studio_image || heroMediaImg,
      route: '/studio',
      themeClass: 'theme-studio',
      clipDirection: 'horizontal'
    },
    {
      id: 'print',
      number: '03',
      name_en: settings.division_print_title_en || 'PRINT',
      name_ar: settings.division_print_title_ar || 'مطبوعات',
      subtitle_ar: settings.division_print_subtitle_ar || 'المطبوعات الفاخرة والتغليف الراقي',
      subtitle_en: settings.division_print_subtitle_en || 'Luxury Print & Premium Packaging',
      image: settings.division_print_image || settings.hero_division_print_image || heroMediaImg,
      route: '/print',
      themeClass: 'theme-print',
      clipDirection: 'diagonal'
    }
  ];

  const activeDivision = divisions[activeIdx] || divisions[0];

  // Dual Action Row Handler: 1st click activates state, 2nd click on active row navigates
  const handleRowClick = (idx, route) => {
    if (idx !== activeIdx) {
      setActiveIdx(idx);
    } else {
      navigate(route);
    }
  };

  // Keyboard accessibility handler for division rows
  const handleKeyDown = (e, idx, route) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowClick(idx, route);
    }
  };

  // Mouse move handler for internal image parallax (desktop)
  const handleMouseMove = (e) => {
    if (window.innerWidth < 1024) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setMouseOffset({ x: x * 12, y: y * 12 });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  // Mobile Swipe Gesture Handlers (Swipe left/right on kinetic stage)
  const handleDragEnd = (event, info) => {
    const swipeThreshold = 40;
    if (info.offset.x < -swipeThreshold) {
      setActiveIdx((prev) => (prev + 1) % divisions.length);
    } else if (info.offset.x > swipeThreshold) {
      setActiveIdx((prev) => (prev - 1 + divisions.length) % divisions.length);
    }
  };

  // Scroll-linked progression threshold
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || window.innerWidth > 1023) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (rect.top <= windowHeight * 0.7 && rect.bottom >= windowHeight * 0.3) {
        const scrollPercent = (windowHeight * 0.7 - rect.top) / (rect.height + windowHeight * 0.4);
        if (scrollPercent < 0.33) {
          setActiveIdx(0);
        } else if (scrollPercent < 0.66) {
          setActiveIdx(1);
        } else {
          setActiveIdx(2);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section
      id={id}
      ref={containerRef}
      className={`iris-switcher-wrapper ${activeDivision.themeClass} dir-${isRtl ? 'rtl' : 'ltr'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="iris-switcher-container">
        {/* Header Section Intro */}
        <motion.div
          className="switcher-header"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="switcher-eyebrow">
            {isRtl ? "ثلاثة عوالم. مكانٌ واحد." : "THREE WORLDS. ONE IRIS."}
          </span>
          <h2 className="switcher-main-headline">
            {isRtl ? "استكشف أبعاد الإبداع" : "Discover Creative Dimensions"}
          </h2>
        </motion.div>

        {/* ===== MAIN COMPOSITION STAGE ===== */}
        <div className="switcher-composition-grid">
          {/* 1. Primary Kinetic Visual Stage (ONE IMAGE FRAME) */}
          <motion.div
            className="switcher-image-stage-wrap"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            <div className="kinetic-stage-viewport">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDivision.id}
                  className="kinetic-stage-viewport"
                  initial={{
                    opacity: 0,
                    scale: 1.04,
                    clipPath: activeDivision.clipDirection === 'horizontal'
                      ? 'inset(0 100% 0 0)'
                      : activeDivision.clipDirection === 'diagonal'
                      ? 'polygon(0 0, 0 0, 0 100%, 0 100%)'
                      : 'inset(100% 0 0 0)'
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    clipPath: activeDivision.clipDirection === 'horizontal'
                      ? 'inset(0 0% 0 0)'
                      : activeDivision.clipDirection === 'diagonal'
                      ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
                      : 'inset(0% 0 0 0)'
                  }}
                  exit={{
                    opacity: 0,
                    scale: 1.04,
                    clipPath: 'inset(0 0 100% 0)'
                  }}
                  transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                >
                  {activeDivision.image ? (
                    <img
                      src={activeDivision.image}
                      alt={activeDivision.name_en}
                      className="kinetic-image"
                      style={{
                        transform: `translate(${mouseOffset.x}px, ${mouseOffset.y}px)`
                      }}
                    />
                  ) : (
                    <div className="iris-abstract-placeholder">
                      <span className="placeholder-badge">IRIS {activeDivision.name_en}</span>
                      <h3 className="placeholder-title">{isRtl ? activeDivision.subtitle_ar : activeDivision.subtitle_en}</h3>
                    </div>
                  )}
                  <div className="stage-gradient-overlay" />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Swipe hint for mobile touch */}
            <div className="stage-swipe-hint">
              <Touchpad size={14} />
              <span>{isRtl ? "اسحب للتغيير" : "Swipe to switch"}</span>
            </div>
          </motion.div>

          {/* 2. Typographic Division Selector Rows (2-STEP CLICK/TAP INTERACTION) */}
          <div className="switcher-nav-column" role="tablist" aria-label="IRIS Divisions">
            {divisions.map((div, idx) => {
              const isActive = idx === activeIdx;
              return (
                <div
                  key={div.id}
                  role="tab"
                  tabIndex={0}
                  aria-selected={isActive}
                  aria-label={`${div.name_en} - ${isRtl ? div.subtitle_ar : div.subtitle_en}`}
                  className={`division-nav-row ${isActive ? 'active' : 'dimmed'}`}
                  onClick={() => handleRowClick(idx, div.route)}
                  onKeyDown={(e) => handleKeyDown(e, idx, div.route)}
                  onMouseEnter={() => setActiveIdx(idx)}
                >
                  <div className="row-left-meta">
                    <span className="row-number">{div.number}</span>
                    <div className="row-titles-box">
                      <span className="row-en-name">{div.name_en}</span>
                      <span className="row-ar-desc">
                        {isRtl ? div.subtitle_ar : div.subtitle_en}
                      </span>
                    </div>
                  </div>

                  <div className="row-right-group">
                    <div className="row-indicator-bar" />
                    <ArrowIcon size={18} className="row-arrow-icon" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default IrisDivisionsSwitcher;
