import React, { lazy, Suspense } from 'react';
import IrisDarkHero from "../components/premium/IrisDarkHero";
import "../styles/home.css";
import "../styles/animation.css";

const IrisReelsViewer = lazy(() => import("../components/premium/IrisReelsViewer"));
const IrisDivisionsSwitcher = lazy(() => import("../components/premium/IrisDivisionsSwitcher"));
const Footer = lazy(() => import("../components/Footer"));

const Home = () => (
  <div className="home-page" dir="rtl">
    <IrisDarkHero />

    <Suspense fallback={<div id="iris-reels-viewer-root" className="iris-section-loading iris-section-loading--reels" role="status" aria-label="Loading section"><span className="iris-route-loading__spinner" aria-hidden="true" /></div>}>
      <IrisReelsViewer id="iris-reels-viewer-root" />
    </Suspense>

    <Suspense fallback={<div id="iris-divisions-section" className="iris-section-loading iris-section-loading--divisions" role="status" aria-label="Loading section"><span className="iris-route-loading__spinner" aria-hidden="true" /></div>}>
      <IrisDivisionsSwitcher id="iris-divisions-section" />
    </Suspense>

    <Suspense fallback={<div id="iris-footer-root" className="iris-section-loading iris-section-loading--footer" role="status" aria-label="Loading section"><span className="iris-route-loading__spinner" aria-hidden="true" /></div>}>
      <Footer />
    </Suspense>
  </div>
);

export default Home;
