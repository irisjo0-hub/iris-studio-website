import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import logoImage from "../../assets/iris_logo.png";

const Preloader = ({ onComplete }) => {
  const { settings } = useSiteSettings();

  useEffect(() => {
    // 1.5 seconds loading as requested
    const timer = setTimeout(() => {
      onComplete();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Overlay exit animation
  const overlayVariants = {
    initial: { opacity: 1 },
    exit: { 
      opacity: 0, 
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  return (
    <motion.div
      className="preloader-overlay"
      variants={overlayVariants}
      initial="initial"
      exit="exit"
    >
      <div className="preloader-artistic-wrap">
        {/* Golden Halo Ring (Traces a premium circle around the logo) */}
        <svg className="preloader-halo-svg" viewBox="0 0 200 200">
          <motion.circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, rotate: -90 }}
            animate={{ pathLength: 1, rotate: 270 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>

        {/* Center Logo with soft scale and breathing fade-in */}
        <motion.div
          className="preloader-logo-container"
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src={settings.logo_url || logoImage} alt="IRIS Logo" className="preloader-logo" />
        </motion.div>

        {/* Elegant expanding studio slogan */}
        <motion.div
          className="preloader-brand-text"
          initial={{ opacity: 0, letterSpacing: "1px" }}
          animate={{ opacity: 1, letterSpacing: "5px" }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {settings.preloader_text || "آيـرس • اسـتـوديـو إبـداعـي"}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Preloader;
