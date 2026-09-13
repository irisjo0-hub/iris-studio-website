import React, { lazy, Suspense } from 'react';
import IrisDarkHero from "../components/premium/IrisDarkHero";
import IrisReelsViewer from "../components/premium/IrisReelsViewer";
import IrisReelsViewerNative from "../components/premium/IrisReelsViewerNative";

// One switch for A/B testing. No separate build is required.
const USE_NATIVE_REELS = true;
import "../styles/home.css";
import "../styles/animation.css";

const IrisDivisionsSwitcher = lazy(() => import("../components/premium/IrisDivisionsSwitcher"));
const Footer = lazy(() => import("../components/Footer"));

const Home = () => (
  <div className="home-page" dir="rtl">
    <IrisDarkHero />
    {USE_NATIVE_REELS ? <IrisReelsViewerNative id="iris-reels-viewer-root" /> : <IrisReelsViewer id="iris-reels-viewer-root" />}
    <Suspense fallback={null}>
      <IrisDivisionsSwitcher id="iris-divisions-section" />
      <Footer />
    </Suspense>
  </div>
);

export default Home;
