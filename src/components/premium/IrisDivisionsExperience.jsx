import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useSiteSettings } from '../../context/SiteSettingsContext';

import heroMediaImg from '../../assets/hero.png';
import '../../styles/iris-divisions-experience.css';

/**
 * IRIS Standalone Divisions Experience Section
 * MEDIA / STUDIO / PRINT
 * Interactive Desktop Staggered Typography + Mask Image Reveals
 * Mobile Editorial Panels with Scroll Entrance
 */

export const IrisDivisionsExperience = ({ id = "iris-divisions-section" }) => {
  const navigate = useNavigate();
  const { settings, lang } = useSiteSettings();
  const isRtl = lang === 'ar';

  const [activeDivId, setActiveDivId] = useState('media');
  const [isNavigating, setIsNavigating] = useState(false);

  // Dynamic Division Data Binds
  const divisions = [
    {
      id: 'media',
      name_en: settings.division_media_title_en || 'MEDIA',
      name_ar: settings.division_media_title_ar || 'ميديا',
      subtitle_ar: settings.division_media_subtitle_ar || 'صناعة المحتوى والحملات الإبداعية',
      subtitle_en: settings.division_media_subtitle_en || 'Content Creation & Creative Campaigns',
      image: settings.division_media_image || settings.hero_division_media_image || heroMediaImg,
      route: '/media',
      themeClass: 'theme-media',
      color: '#67245F'
    },
    {
      id: 'studio',
      name_en: settings.division_studio_title_en || 'STUDIO',
      name_ar: settings.division_studio_title_ar || 'استوديو',
      subtitle_ar: settings.division_studio_subtitle_ar || 'التصوير الاحترافي ورواية القصة البصرية',
      subtitle_en: settings.division_studio_subtitle_en || 'Professional Photography & Visual Storytelling',
      image: settings.division_studio_image || settings.hero_division_studio_image || heroMediaImg,
      route: '/studio',
      themeClass: 'theme-studio',
      color: '#044630'
    },
    {
      id: 'print',
      name_en: settings.division_print_title_en || 'PRINT',
      name_ar: settings.division_print_title_ar || 'مطبوعات',
      subtitle_ar: settings.division_print_subtitle_ar || 'المطبوعات الفاخرة والتغليف الراقي',
      subtitle_en: settings.division_print_subtitle_en || 'Luxury Print & Premium Packaging',
      image: settings.division_print_image || settings.hero_division_print_image || heroMediaImg,
      route: '/print',
      themeClass: 'theme-print',
      color: '#F5BD1A'
    }
  ];

  const activeDivision = divisions.find((d) => d.id === activeDivId) || divisions[0];

  // Fast focus transition animation before router navigation (300-450ms)
  const handleDivisionClick = (route) => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate(route);
    }, 380);
  };

  return (
    <section
      id={id}
      className={`iris-divisions-section-wrapper ${activeDivision.themeClass} dir-${isRtl ? 'rtl' : 'ltr'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="iris-divisions-container">
        {/* Section Minimal Intro */}
        <motion.div
          className="divisions-intro-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="divisions-eyebrow">
            {isRtl ? "ثلاثة عوالم. آيرس واحدة." : "THREE WORLDS. ONE IRIS."}
          </span>
          <h2 className="divisions-main-headline">
            {isRtl
              ? "استكشف أبعاد الإبداع في آيرس"
              : "Discover the Creative Dimensions of IRIS"}
          </h2>
        </motion.div>

        {/* ===== DESKTOP EDITORIAL COMPOSITION (>= 1024px) ===== */}
        <div className="desktop-divisions-stage">
          {/* Staggered Typographic Division List */}
          <div className="desktop-divisions-list">
            {divisions.map((div) => {
              const isActive = div.id === activeDivId;
              return (
                <div
                  key={div.id}
                  className={`desktop-division-item ${isActive ? 'active' : 'dimmed'}`}
                  onMouseEnter={() => setActiveDivId(div.id)}
                  onClick={() => handleDivisionClick(div.route)}
                >
                  <div className="desktop-division-head">
                    <span className="div-display-name">{div.name_en}</span>
                    <span className="div-subtitle-text">
                      {isRtl ? div.name_ar : div.subtitle_en}
                    </span>
                  </div>

                  {isActive && (
                    <motion.div
                      className="active-details-reveal"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="div-subtitle-text">
                        {isRtl ? div.subtitle_ar : div.subtitle_en}
                      </p>
                      <button
                        type="button"
                        className="div-action-cta-link"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDivisionClick(div.route);
                        }}
                      >
                        <span>{isRtl ? `اكتشف ${div.name_ar}` : `Explore ${div.name_en}`}</span>
                        {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                      </button>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Cinematic Image Reveal Frame */}
          <div className="desktop-division-viewport">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDivision.id}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: isNavigating ? 1.08 : 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: '100%', height: '100%', position: 'relative' }}
              >
                <img
                  src={activeDivision.image}
                  alt={activeDivision.name_en}
                  className="cinematic-division-img"
                />
                <div className="cinematic-gradient-overlay" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ===== MOBILE EDITORIAL PANELS (< 1024px) ===== */}
        <div className="mobile-divisions-list">
          {divisions.map((div, idx) => (
            <motion.div
              key={div.id}
              className="mobile-division-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <div className="mobile-media-frame">
                <img src={div.image} alt={div.name_en} className="mobile-media-img" />
                <div className="cinematic-gradient-overlay" />
              </div>

              <div className="mobile-div-content">
                <h3 className="mobile-div-title">{div.name_en}</h3>
                <p className="mobile-div-subtitle">
                  {isRtl ? div.subtitle_ar : div.subtitle_en}
                </p>
                <button
                  type="button"
                  className="mobile-div-cta-btn"
                  onClick={() => handleDivisionClick(div.route)}
                >
                  <span>{isRtl ? `اكتشف ${div.name_ar}` : `Explore ${div.name_en}`}</span>
                  {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IrisDivisionsExperience;
