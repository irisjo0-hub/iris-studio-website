import React, { lazy, Suspense } from 'react';
import IrisDarkHero from "../components/premium/IrisDarkHero";
import IrisReelsViewer from "../components/premium/IrisReelsViewer";
import "../styles/home.css";
import "../styles/animation.css";

const IrisDivisionsSwitcher = lazy(() => import("../components/premium/IrisDivisionsSwitcher"));
const Footer = lazy(() => import("../components/Footer"));

const Home = () => (
  <div className="home-page" dir="rtl">
    <IrisDarkHero />
    <IrisReelsViewer id="iris-reels-viewer-root" />
    <Suspense fallback={null}>
      <IrisDivisionsSwitcher id="iris-divisions-section" />
      <Footer />
    </Suspense>
  </div>
);

export default Home;
