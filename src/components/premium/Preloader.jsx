import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import logoImage from "../../assets/iris_logo.png";
import "../../styles/preloader.css";

const Preloader = ({ onComplete }) => {
  const { settings, lang } = useSiteSettings();
  const isRtl = lang === 'ar';

  useEffect(() => {
    // 1.8 seconds luxury loading sequence to enjoy the animation
    const timer = setTimeout(() => {
      onComplete();
    }, 1800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Overlay exit animation
  const overlayVariants = {
    initial: { opacity: 1 },
    exit: { 
      opacity: 0, 
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  return (
    <motion.div
      className="preloader-overlay"
      variants={overlayVariants}
      initial="initial"
      exit="exit"
    >
      {/* 1. Dynamic Ambient Background Color Fields (100% Identical to Hero Section) */}
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
          {/* Golden Halo Ring (Traces a premium circle around the white IRIS logo) */}
          <svg className="preloader-halo-svg" viewBox="0 0 200 200">
            <motion.circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="#F5BD1A"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, rotate: -90 }}
              animate={{ pathLength: 1, rotate: 270 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>

          {/* Center Pure White IRIS Logo inside Golden Halo */}
          <motion.div
            className="preloader-logo-container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <img src={settings.hero_logo_url || settings.logo_url || logoImage} alt="IRIS Logo" className="preloader-logo" />
          </motion.div>
        </div>

        {/* IRIS Gold Slogan */}
        <motion.div
          className="preloader-brand-text"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {settings.preloader_text || "استوديو • طباعة • دعاية وإعلان"}
        </motion.div>

        {/* Luxury Tagline Badge: "ثلاثة عوالم، مكان واحد" */}
        <motion.div
          className="preloader-tagline-badge"
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="tagline-sparkle">❖</span>
          <span className="tagline-text">
            {isRtl ? "ثلاثة عوالم، مكان واحد" : "Three Worlds, One Place"}
          </span>
          <span className="tagline-sparkle">❖</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Preloader;
