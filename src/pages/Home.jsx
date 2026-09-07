import React from 'react';
import IrisDarkHero from "../components/premium/IrisDarkHero";
import IrisReelsViewer from "../components/premium/IrisReelsViewer";
import IrisDivisionsSwitcher from "../components/premium/IrisDivisionsSwitcher";
import Footer from "../components/Footer";
import "../styles/home.css";
import "../styles/animation.css";

/**
 * HOMEPAGE ARCHITECTURE:
 * 1. HERO (IrisDarkHero)
 * 2. FULLSCREEN IRIS REELS VIEWER (IrisReelsViewer)
 * 3. THREE WORLDS (IrisDivisionsSwitcher)
 * 4. ONE FOOTER (Footer)
 *
 * Preloader ownership intentionally lives at app level only (App.tsx).
 */

const Home = () => (
  <div className="home-page" dir="rtl">
    <IrisDarkHero />
    <IrisReelsViewer id="iris-reels-viewer-root" />
    <IrisDivisionsSwitcher id="iris-divisions-section" />
    <Footer />
  </div>
);

export default Home;
