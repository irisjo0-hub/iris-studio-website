import React, { lazy, Suspense } from 'react';
import IrisDarkHero from "../components/premium/IrisDarkHero";
import "../styles/home.css";
import "../styles/animation.css";

import IrisReelsViewer from "../components/premium/IrisReelsViewer";
const IrisDivisionsSwitcher = lazy(() => import("../components/premium/IrisDivisionsSwitcher"));
const Footer = lazy(() => import("../components/Footer"));

const Home = () => (
  <div className="home-page" dir="rtl">
    <IrisDarkHero />

    <IrisReelsViewer id="iris-reels-viewer-root" />

    <Suspense fallback={null}>
      <IrisDivisionsSwitcher id="iris-divisions-section" />
    </Suspense>

    <Suspense fallback={null}>
      <Footer />
    </Suspense>
  </div>
);

export default Home;
