import React, { useEffect, useState } from "react";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import logoImage from "../../assets/iris_logo.png";
import "../../styles/preloader.css";

const MIN_DISPLAY_MS = 350;
const MAX_DISPLAY_MS = 1200;

const Preloader = ({ onComplete }) => {
  const { settings, lang } = useSiteSettings();
  const isRtl = lang === 'ar';
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const startedAt = performance.now();
    let fadeTimer;
    let completeTimer;
    let fallbackTimer;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(fallbackTimer);
      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
      fadeTimer = setTimeout(() => setFading(true), remaining);
      completeTimer = setTimeout(() => onComplete(), remaining + 180);
    };
    if (document.readyState === 'complete') finish();
    else {
      window.addEventListener('load', finish, { once: true });
      fallbackTimer = setTimeout(finish, MAX_DISPLAY_MS);
    }
    return () => {
      window.removeEventListener('load', finish);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
      clearTimeout(fallbackTimer);
    };
  }, [onComplete]);

  return (
    <div className={`preloader-overlay${fading ? ' preloader-overlay--fading' : ''}`} aria-hidden={fading}>
      <div className="preloader-ambient-layer" aria-hidden="true">
        <div className="preloader-glow-purple-topleft" />
        <div className="preloader-glow-purple-topright" />
        <div className="preloader-glow-green-bottomleft" />
        <div className="preloader-glow-green-bottomright" />
        <div className="preloader-glow-gold-center" />
      </div>
      <div className="preloader-grain-overlay" aria-hidden="true" />
      <div className="preloader-artistic-wrap">
        <div className="preloader-halo-wrapper">
          <div className="preloader-halo-ring" aria-hidden="true" />
          <div className="preloader-logo-container">
            <img src={settings.hero_logo_url || settings.logo_url || logoImage} alt="IRIS Logo" className="preloader-logo" />
          </div>
        </div>
        <div className="preloader-brand-text">{settings.preloader_text || "استوديو • طباعة • دعاية وإعلان"}</div>
        <div className="preloader-tagline-badge">
          <span className="tagline-sparkle">❖</span>
          <span className="tagline-text">{isRtl ? "ثلاثة عوالم، مكان واحد" : "Three Worlds, One Place"}</span>
          <span className="tagline-sparkle">❖</span>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
