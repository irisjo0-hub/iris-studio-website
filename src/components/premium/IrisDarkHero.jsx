import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { HeroLivingCollage } from './HeroLivingCollage';
import irisLogo from '../../assets/iris_logo.png';
import DivisionMenu from '../DivisionMenu';
import '../../styles/iris-dark-hero.css';

export const IrisDarkHero = () => {
  const { settings, lang } = useSiteSettings();
  const isRtl = lang === 'ar';
  const [active, setActive] = useState(true);
  const heroRef = useRef(null);

  const line1 = isRtl
    ? (settings.slogan_line_1_ar || settings.slogan_line_1 || 'من زهرة نادرة')
    : (settings.slogan_line_1_en || 'From a Rare Flower');

  const line2 = isRtl
    ? (settings.slogan_line_2_ar || settings.slogan_line_2 || 'إلى علامة تجارية لا تُنسى')
    : (settings.slogan_line_2_en || 'to an Unforgettable Brand');

  const copy = isRtl
    ? (settings.supporting_text_ar || settings.supporting_text || 'منظومة إبداعية متكاملة تجمع بين إنتاج الميديا، تصوير الاستوديو، والمطبوعات الفاخرة تحت سقف واحد.')
    : (settings.supporting_text_en || 'An integrated creative ecosystem unifying media, studio and premium print under one roof.');

  useEffect(() => {
    const node = heroRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const discover = () => {
    const target = document.getElementById('iris-worlds') || document.getElementById('iris-work');
    target?.scrollIntoView({ behavior:'smooth', block:'start' });
  };

  return (
    <section ref={heroRef} id="iris-dark-hero-root" className={'iris-dark-hero-v2-wrapper iris-hero-v7 ' + (active ? 'is-active' : 'is-offscreen')} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="hero-v7-bg" aria-hidden="true">
        <div className="hero-v7-glow hero-v7-glow-purple" />
        <div className="hero-v7-glow hero-v7-glow-green" />
        <div className="hero-v7-glow hero-v7-glow-gold" />
        <div className="hero-v7-grid" />
        <div className="hero-v7-noise" />
      </div>

      <div className="hero-v7-shell">
        <header className="hero-v7-nav">
          <Link to="/" className="hero-v7-logo" aria-label="IRIS home">
            <img src={settings.hero_logo_url || settings.logo_url || irisLogo} alt="IRIS" />
          </Link>

          <div className="hero-v7-nav-center">
            <span className="hero-v7-status-dot" />
            <span>WE BREAK THE BOX</span>
          </div>

          <div className="hero-v7-nav-right">
            <span className="hero-v7-location">IRBID · JORDAN</span>
            <DivisionMenu />
          </div>
        </header>

        <div className="hero-v7-content">
          <div className="hero-v7-kicker">
            <span>01 / CREATIVE ECOSYSTEM</span>
            <span>{isRtl ? 'ميديا · استوديو · مطبوعات' : 'MEDIA · STUDIO · PRINT'}</span>
          </div>

          <div className="hero-v7-title-wrap">
            <h1>
              <span>{line1}</span>
              <strong>{line2}</strong>
            </h1>

            <div className="hero-v7-side-copy">
              <p>{copy}</p>
              <button type="button" onClick={discover} className="hero-v7-discover">
                <span>{isRtl ? 'اكتشف آيرس' : 'Discover IRIS'}</span>
                <span className="hero-v7-arrow"><ArrowDown size={17} /></span>
              </button>
            </div>
          </div>
        </div>

        <div className="hero-v7-media">
          <HeroLivingCollage />
        </div>

        <div className="hero-v7-footer">
          <span>© {new Date().getFullYear()} IRIS</span>
          <span className="hero-v7-scroll-cue"><i /> SCROLL TO EXPLORE</span>
          <span><ArrowUpRight size={14} /> IRISJO.AGENCY</span>
        </div>
      </div>
    </section>
  );
};

export default IrisDarkHero;
