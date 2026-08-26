import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Menu, X, ArrowDown } from 'lucide-react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { HeroLivingCollage } from './HeroLivingCollage';
import irisLogo from '../../assets/iris_logo.png';

import '../../styles/iris-dark-hero.css';

/**
 * HERO V6 (Living Collage Motion System)
 * Approved Top Composition Preserved: Top Logo (Left), [ WE BREAK THE BOX ● ] (Right), Arabic Headline, Supporting Paragraph, Living CTA
 * Lower Viewport: IRIS Living Collage System (<HeroLivingCollage />)
 */

export const IrisDarkHero = () => {
  const navigate = useNavigate();
  const { settings, lang, toggleLanguage } = useSiteSettings();
  const isRtl = lang === 'ar';
  const [heroMenuOpen, setHeroMenuOpen] = useState(false);

  // Desktop Pointer Parallax & Magnetic CTA State
  const [glowOffset, setGlowOffset] = useState({ x: 0, y: 0 });
  const [ctaOffset, setCtaOffset] = useState({ x: 0, y: 0 });
  const [isCtaHovered, setIsCtaHovered] = useState(false);

  // Dynamic Headline Binds from Site Settings
  const headlinePart1 = isRtl
    ? (settings.slogan_line_1_ar || settings.slogan_line_1 || "من زهرة نادرة")
    : (settings.slogan_line_1_en || "From a Rare Flower");

  const headlinePart2 = isRtl
    ? (settings.slogan_line_2_ar || settings.slogan_line_2 || "إلى علامة تجارية لا تُنسى")
    : (settings.slogan_line_2_en || "to an Unforgettable Brand");

  const supportingCopy = isRtl
    ? (settings.supporting_text_ar || settings.supporting_text || "منظومة إبداعية متكاملة تجمع بين إنتاج الميديا، تصوير الاستوديو، والمطبوعات الفاخرة تحت سقف واحد.")
    : (settings.supporting_text_en || "An integrated creative ecosystem unifying Media Production, Studio Photography, and Luxury Print under one roof.");

  const ctaLabel = isRtl ? "اكتشف آيرس" : "Discover IRIS";

  // Lerp Mouse Parallax Handler (Desktop Pointer Only)
  const handleHeroMouseMove = (e) => {
    if (window.innerWidth < 1024) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setGlowOffset({ x: x * 16, y: y * 16 });
  };

  const handleHeroMouseLeave = () => {
    setGlowOffset({ x: 0, y: 0 });
    setCtaOffset({ x: 0, y: 0 });
    setIsCtaHovered(false);
  };

  // CTA Magnetic Proximity Handler
  const handleCtaMouseMove = (e) => {
    if (window.innerWidth < 1024) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
    setCtaOffset({ x, y });
    setIsCtaHovered(true);
  };

  const handleCtaMouseLeave = () => {
    setCtaOffset({ x: 0, y: 0 });
    setIsCtaHovered(false);
  };

  // Smooth scroll transition from Hero to Reels stage (Resetting Reel index to 01)
  const handleDiscoverScroll = (e) => {
    e.preventDefault();
    if (typeof window.__resetReelToHero === 'function') {
      window.__resetReelToHero();
    }
    const reelsStage = document.getElementById('iris-reels-viewer-root');
    if (reelsStage) {
      reelsStage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const divisionsSection = document.getElementById('iris-divisions-section');
      if (divisionsSection) {
        divisionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  useEffect(() => {
    if (heroMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [heroMenuOpen]);

  return (
    <section
      id="iris-dark-hero-root"
      className={`iris-dark-hero-v2-wrapper dir-${isRtl ? 'rtl' : 'ltr'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      onMouseMove={handleHeroMouseMove}
      onMouseLeave={handleHeroMouseLeave}
    >
      {/* 1. Dynamic Ambient Background Color Fields */}
      <div className="hero-v2-ambient-layer">
        <div
          className="ambient-glow glow-purple-topleft"
          style={{ transform: `translate(${-glowOffset.x * 0.5}px, ${-glowOffset.y * 0.5}px)` }}
        />
        <div
          className="ambient-glow glow-purple-topright"
          style={{ transform: `translate(${glowOffset.x * 0.8}px, ${glowOffset.y * 0.8}px)` }}
        />
        <div
          className="ambient-glow glow-green-bottomleft"
          style={{ transform: `translate(${-glowOffset.x * 0.9}px, ${-glowOffset.y * 0.9}px)` }}
        />
        <div
          className="ambient-glow glow-green-bottomright"
          style={{ transform: `translate(${glowOffset.x * 0.6}px, ${glowOffset.y * 0.6}px)` }}
        />
        <div
          className="ambient-glow glow-gold-accent"
          style={{ transform: `translate(${glowOffset.x * 1.2}px, ${glowOffset.y * 1.2}px)` }}
        />
      </div>

      <div className="hero-v2-grain-overlay" />

      {/* Dedicated Lower Floating Images Area Container (Starts strictly below the CTA button) */}
      <div className="hero-v2-lower-animation-area">
        <HeroLivingCollage isCtaHovered={isCtaHovered} />
      </div>

      {/* 3. Main Hero Content Container */}
      <div className="hero-v2-main-container">
        {/* Top Header Bar: Logo (Left) ... Equal-Distance Mid Wrapper (WE BREAK THE BOX) ... Menu (Right) */}
        <header className="hero-v2-top-bar">
          {/* 1. IRIS Logo (Left Edge) */}
          <Link to="/" className="hero-v2-logo-link" aria-label="IRIS Agency">
            <motion.img
              src={settings.hero_logo_url || settings.logo_url || irisLogo}
              alt="IRIS"
              className="hero-v2-logo-img"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            />
          </Link>

          {/* 2. Equal-Distance Middle Space Container for WE BREAK THE BOX */}
          <div className="hero-v2-nav-mid-wrapper">
            <div className="hero-v2-eyebrow-pill">
              <span className="pill-text">WE BREAK THE BOX</span>
              <span className="pill-dot" />
            </div>
          </div>

          {/* 3. Hamburger Menu Control (Right Edge) */}
          <button
            type="button"
            className="hero-v2-hamburger-btn"
            onClick={() => setHeroMenuOpen(true)}
            aria-label="Open Navigation Menu"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* 4. Main Hero Content Stage (Simplified & Confident) */}
        <div className="hero-v2-content-stage">
          {/* Line-by-Line Masked Headline Reveal */}
          <div className="hero-v2-primary-headline-box">
            <h1 className="hero-v2-editorial-title">
              <motion.span
                className="headline-line-1"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                {headlinePart1}
              </motion.span>
              <motion.span
                className="headline-line-2"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                {headlinePart2}
              </motion.span>
            </h1>

            <motion.p
              className="hero-v2-supporting-desc"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {supportingCopy}
            </motion.p>
          </div>

          {/* Magnetic Interactive Primary CTA */}
          <motion.div
            className="hero-v2-action-wrapper"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              className="hero-v2-discover-cta"
              onClick={handleDiscoverScroll}
              onMouseMove={handleCtaMouseMove}
              onMouseLeave={handleCtaMouseLeave}
              style={{
                transform: `translate3d(${ctaOffset.x}px, ${ctaOffset.y}px, 0)`
              }}
              aria-label={ctaLabel}
            >
              <span className="cta-label-text">{ctaLabel}</span>
              <span className="cta-arrow-icon">
                <ArrowDown size={18} />
              </span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* ===== 5. FULLSCREEN IRIS NAVIGATION OVERLAY (REACT PORTAL) ===== */}
      {heroMenuOpen &&
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
                onClick={() => setHeroMenuOpen(false)}
                aria-label="Close Menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Vertical Menu List (One Item Per Row) */}
            <nav className="overlay-vertical-menu">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
                <Link to="/" className="overlay-nav-item active" onClick={() => setHeroMenuOpen(false)}>
                  {isRtl ? "الرئيسية" : "Home"}
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                <Link to="/media" className="overlay-nav-item" onClick={() => setHeroMenuOpen(false)}>
                  {isRtl ? "ميديا" : "Media"}
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                <Link to="/studio" className="overlay-nav-item" onClick={() => setHeroMenuOpen(false)}>
                  {isRtl ? "الاستوديو" : "Studio"}
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
                <Link to="/print" className="overlay-nav-item" onClick={() => setHeroMenuOpen(false)}>
                  {isRtl ? "المطبوعات" : "Print"}
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.20 }}>
                <Link to="/work" className="overlay-nav-item" onClick={() => setHeroMenuOpen(false)}>
                  {isRtl ? "أعمالنا" : "Our Work"}
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
                <Link to="/packages" className="overlay-nav-item" onClick={() => setHeroMenuOpen(false)}>
                  {isRtl ? "البكجات والعروض" : "Packages & Offers"}
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
                <a
                  href="#iris-footer-root"
                  className="overlay-nav-item"
                  onClick={() => {
                    setHeroMenuOpen(false);
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
    </section>
  );
};

export default IrisDarkHero;
