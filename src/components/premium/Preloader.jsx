import React, { useEffect, useState } from "react";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import logoImage from "../../assets/iris_logo.png";
import "../../styles/preloader.css";

const Preloader = ({ onComplete }) => {
  const { settings, lang } = useSiteSettings();
  const isRtl = lang === 'ar';
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setFading(true);
    }, 1000);

    const timer2 = setTimeout(() => {
      onComplete();
    }, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div
      className="preloader-overlay"
      style={{
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? 'none' : 'auto',
        transition: 'opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        visibility: fading && !onComplete ? 'hidden' : 'visible'
      }}
    >
      {/* 1. Dynamic Ambient Background Color Fields */}
      <div className="preloader-ambient-layer">
        <div className="preloader-glow-purple-topleft" />
        <div className="preloader-glow-purple-topright" />
        <div className="preloader-glow-green-bottomleft" />
        <div className="preloader-glow-green-bottomright" />
        <div className="preloader-glow-gold-center" />
      </div>

      {/* 2. Hero Noise Grain Overlay */}
      <div className="preloader-grain-overlay" />

      {/* 3. Central Artistic Layout Box */}
      <div className="preloader-artistic-wrap">
        {/* Golden Halo Ring Wrapper with Centered Logo */}
        <div className="preloader-halo-wrapper">
          <svg className="preloader-halo-svg" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="#F5BD1A"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>

          {/* Center Pure White IRIS Logo inside Golden Halo */}
          <div className="preloader-logo-container">
            <img src={settings.hero_logo_url || settings.logo_url || logoImage} alt="IRIS Logo" className="preloader-logo" />
          </div>
        </div>

        {/* IRIS Gold Slogan */}
        <div className="preloader-brand-text">
          {settings.preloader_text || "استوديو • طباعة • دعاية وإعلان"}
        </div>

        {/* Luxury Tagline Badge */}
        <div className="preloader-tagline-badge">
          <span className="tagline-sparkle">❖</span>
          <span className="tagline-text">
            {isRtl ? "ثلاثة عوالم، مكان واحد" : "Three Worlds, One Place"}
          </span>
          <span className="tagline-sparkle">❖</span>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
