import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Menu, X, ArrowDown, Home, Clapperboard, Camera, Printer, BriefcaseBusiness, Tags, MessageCircle } from 'lucide-react';
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
  const location = useLocation();
  const { settings, lang, toggleLanguage } = useSiteSettings();
  const isRtl = lang === 'ar';
  const [heroMenuOpen, setHeroMenuOpen] = useState(false);
  const [isHeroActive, setIsHeroActive] = useState(true);

  // Desktop pointer effects. Keep glow transforms off React state so mouse movement
  // does not re-render the entire hero/collage tree on every pointer event.
  const glowRafRef = useRef(null);
  const glowOffsetRef = useRef({ x: 0, y: 0 });
  const glowElementsRef = useRef(null);
  const [isCtaHovered, setIsCtaHovered] = useState(false);
  const ctaRef = useRef(null);
  const ctaOffsetRef = useRef({ x: 0, y: 0 });
  const ctaRafRef = useRef(null);

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
    const hero = e.currentTarget;
    if (!glowElementsRef.current) {
      glowElementsRef.current = hero.querySelectorAll('.hero-v2-ambient-layer .ambient-glow');
    }
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 16;
    const y = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * 16;
    glowOffsetRef.current = { x, y };
    if (glowRafRef.current) return;
    glowRafRef.current = window.requestAnimationFrame(() => {
      glowRafRef.current = null;
      const { x: gx, y: gy } = glowOffsetRef.current;
      const glows = glowElementsRef.current;
      const multipliers = [[-0.5, -0.5], [0.8, 0.8], [-0.9, -0.9], [0.6, 0.6], [1.2, 1.2]];
      glows.forEach((glow, index) => {
        const [mx, my] = multipliers[index] || [1, 1];
        glow.style.transform = 'translate(' + (gx * mx) + 'px, ' + (gy * my) + 'px)';
      });
    });
  };

  const handleHeroMouseLeave = (e) => {
    if (glowRafRef.current) {
      window.cancelAnimationFrame(glowRafRef.current);
      glowRafRef.current = null;
    }
    const glows = glowElementsRef.current || e.currentTarget.querySelectorAll('.hero-v2-ambient-layer .ambient-glow');
    glows.forEach((glow) => {
      glow.style.transform = 'translate(0px, 0px)';
    });
    if (ctaRef.current) ctaRef.current.style.transform = 'translate3d(0,0,0)';
    setIsCtaHovered(false);
  };

  // CTA Magnetic Proximity Handler
  const handleCtaMouseMove = (e) => {
    if (window.innerWidth < 1024) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
    if (ctaRef.current) ctaRef.current.style.willChange = 'transform';
    ctaOffsetRef.current = { x, y };
    if (!ctaRafRef.current) {
      ctaRafRef.current = window.requestAnimationFrame(() => {
        ctaRafRef.current = null;
        if (ctaRef.current) {
          const { x: offsetX, y: offsetY } = ctaOffsetRef.current;
          ctaRef.current.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
        }
      });
    }
    if (!isCtaHovered) setIsCtaHovered(true);
  };

  const handleCtaMouseLeave = () => {
    if (ctaRafRef.current) {
      window.cancelAnimationFrame(ctaRafRef.current);
      ctaRafRef.current = null;
    }
    if (ctaRef.current) {
      ctaRef.current.style.transform = 'translate3d(0,0,0)';
      ctaRef.current.style.willChange = 'auto';
    }
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
    const hero = document.getElementById('iris-dark-hero-root');
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsHeroActive(entry.isIntersecting),
      { threshold: 0.05 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

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
      className={`iris-dark-hero-v2-wrapper dir-${isRtl ? 'rtl' : 'ltr'} ${!isHeroActive ? 'is-offscreen' : 'is-active'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      onMouseMove={handleHeroMouseMove}
      onMouseLeave={handleHeroMouseLeave}
    >
      {/* 1. Dynamic Ambient Background Color Fields */}
      <div className="hero-v2-ambient-layer">
        <div
          className="ambient-glow glow-purple-topleft"

        />
        <div
          className="ambient-glow glow-purple-topright"

        />
        <div
          className="ambient-glow glow-green-bottomleft"

        />
        <div
          className="ambient-glow glow-green-bottomright"

        />
        <div
          className="ambient-glow glow-gold-accent"

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
            <img
              src={settings.hero_logo_url || settings.logo_url || irisLogo}
              alt="IRIS"
              className="hero-v2-logo-img"
              decoding="async"
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
          {/* Line-by-Line Headline */}
          <div className="hero-v2-primary-headline-box">
            <h1 className="hero-v2-editorial-title">
              <span className="headline-line-1">
                {headlinePart1}
              </span>
              <span className="headline-line-2">
                {headlinePart2}
              </span>
            </h1>

            <p className="hero-v2-supporting-desc">
              {supportingCopy}
            </p>
          </div>

          {/* Magnetic Interactive Primary CTA */}
          <div className="hero-v2-action-wrapper">
            <button
              type="button"
              className="hero-v2-discover-cta glass-gold-pulse-btn"
              onClick={handleDiscoverScroll}
              onMouseMove={handleCtaMouseMove}
              onMouseLeave={handleCtaMouseLeave}
              ref={ctaRef}
              aria-label={ctaLabel}
            >
              <span className="cta-label-text">{ctaLabel}</span>
              <span className="cta-arrow-badge">
                <ArrowDown size={17} />
              </span>
            </button>
          </div>
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
              <img src={settings.hero_logo_url || settings.logo_url || irisLogo} alt="IRIS" className="overlay-brand-logo" decoding="async" />

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
            <nav className="overlay-vertical-menu" aria-label={isRtl ? "القائمة الرئيسية" : "Main navigation"}>
              {[
                { to: '/', label: isRtl ? 'الرئيسية' : 'Home', Icon: Home },
                { to: '/media', label: isRtl ? 'ميديا' : 'Media', Icon: Clapperboard },
                { to: '/studio', label: isRtl ? 'الاستوديو' : 'Studio', Icon: Camera },
                { to: '/print', label: isRtl ? 'المطبوعات' : 'Print', Icon: Printer },
                { to: '/work', label: isRtl ? 'أعمالنا' : 'Our Work', Icon: BriefcaseBusiness },
                { to: '/packages', label: isRtl ? 'البكجات والعروض' : 'Packages & Offers', Icon: Tags },
              ].map(({ to, label, Icon }, index) => {
                const active = to === '/' ? location.pathname === '/' : location.pathname === to || location.pathname.startsWith(to + '/');
                return (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, x: isRtl ? 18 : -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 + index * 0.045, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to={to}
                      className={`overlay-nav-item${active ? ' active' : ''}`}
                      onClick={() => setHeroMenuOpen(false)}
                    >
                      <span className="overlay-nav-icon"><Icon size={20} strokeWidth={1.8} /></span>
                      <span className="overlay-nav-label">{label}</span>
                      <span className="overlay-nav-arrow" aria-hidden="true">↗</span>
                    </Link>
                  </motion.div>
                );
              })}

              <motion.div
                initial={{ opacity: 0, x: isRtl ? 18 : -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.33, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <a
                  href="#iris-footer-root"
                  className={`overlay-nav-item overlay-nav-contact${location.hash === '#iris-footer-root' ? ' active' : ''}`}
                  onClick={() => {
                    setHeroMenuOpen(false);
                    const footerEl = document.getElementById('iris-footer-root');
                    if (footerEl) footerEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span className="overlay-nav-icon"><MessageCircle size={20} strokeWidth={1.8} /></span>
                  <span className="overlay-nav-label">{isRtl ? 'تواصل معنا' : 'Contact Us'}</span>
                  <span className="overlay-nav-arrow" aria-hidden="true">↗</span>
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
