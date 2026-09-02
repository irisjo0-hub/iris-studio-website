import React from "react";
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
  return (
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
  );
};

export default Home;