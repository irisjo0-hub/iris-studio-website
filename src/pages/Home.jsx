import React, { useEffect, useState, useCallback } from "react";
import Preloader from "../components/premium/Preloader";
import IrisDarkHero from "../components/premium/IrisDarkHero";
import IrisReelsViewer from "../components/premium/IrisReelsViewer";
import IrisDivisionsSwitcher from "../components/premium/IrisDivisionsSwitcher";
import Footer from "../components/Footer";
import "../styles/home.css";
import "../styles/animation.css";

/**
 * EXACT HOMEPAGE ARCHITECTURE:
 * 1. HERO (IrisDarkHero)
 * 2. FULLSCREEN IRIS REELS VIEWER (IrisReelsViewer - Reels 01 to 08)
 * 3. THREE WORLDS (IrisDivisionsSwitcher - MEDIA / STUDIO / PRINT)
 * 4. ONE FOOTER (Footer - Canonical Footer Instance)
 */

const Home = () => {
  const [loading, setLoading] = useState(() => !window.hasPreloaded);

  const handlePreloaderComplete = useCallback(() => {
    window.hasPreloaded = true;
    setLoading(false);
  }, []);

  // Scroll lock during preloader
  useEffect(() => {
    if (loading) {
      document.body.classList.add("scroll-lock");
    } else {
      document.body.classList.remove("scroll-lock");
    }
    return () => {
      document.body.classList.remove("scroll-lock");
    };
  }, [loading]);

  return (
    <>
      {loading && (
        <Preloader onComplete={handlePreloaderComplete} />
      )}

      <div className="home-page" dir="rtl">
        {/* 1. HERO */}
        <IrisDarkHero />

        {/* 2. FULLSCREEN IRIS REELS VIEWER */}
        <IrisReelsViewer id="iris-reels-viewer-root" />

        {/* 3. THREE WORLDS */}
        <IrisDivisionsSwitcher id="iris-divisions-section" />

        {/* 4. ONE FOOTER */}
        <Footer />
      </div>
    </>
  );
};

export default Home;