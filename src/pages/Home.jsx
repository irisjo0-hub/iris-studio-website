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

    <Suspense fallback={<div className="iris-section-loading" role="status" aria-label="Loading section"><span className="iris-route-loading__spinner" aria-hidden="true" /></div>}>
      <IrisReelsViewer id="iris-reels-viewer-root" />
    </Suspense>

    <Suspense fallback={<div className="iris-section-loading" role="status" aria-label="Loading section"><span className="iris-route-loading__spinner" aria-hidden="true" /></div>}>
      <IrisDivisionsSwitcher id="iris-divisions-section" />
    </Suspense>

    <Suspense fallback={<div className="iris-section-loading" role="status" aria-label="Loading section"><span className="iris-route-loading__spinner" aria-hidden="true" /></div>}>
      <Footer />
    </Suspense>
  </div>
);

export default Home;
