import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import IrisDarkHero from "../components/premium/IrisDarkHero";
import "../styles/home.css";
import "../styles/animation.css";

const IrisReelsViewer = lazy(() => import("../components/premium/IrisReelsViewer"));
const IrisDivisionsSwitcher = lazy(() => import("../components/premium/IrisDivisionsSwitcher"));
const Footer = lazy(() => import("../components/Footer"));

// Do not download/render below-the-fold experiences during the first mobile
// paint. The reserved placeholder keeps scroll targets and layout stable until
// the section approaches the viewport.
const DeferredSection = ({ id, className, label, children }) => {
  const sectionRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(
    () => typeof window === "undefined"
      || !("IntersectionObserver" in window)
      || (id === "iris-reels-viewer-root" && window.location.hash.startsWith("#flow-"))
  );

  useEffect(() => {
    if (shouldRender || !sectionRef.current) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -1px 0px" }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <div ref={sectionRef} className="iris-deferred-section">
      {shouldRender ? children : (
        <div id={id} className={className} role="status" aria-label={label}>
          <span className="iris-route-loading__spinner" aria-hidden="true" />
        </div>
      )}
    </div>
  );
};

const SectionLoadingFallback = ({ id, className, label }) => (
  <div id={id} className={className} role="status" aria-label={label}>
    <span className="iris-route-loading__spinner" aria-hidden="true" />
  </div>
);

const Home = () => (
  <div className="home-page" dir="rtl">
    <IrisDarkHero />

    <DeferredSection
      id="iris-reels-viewer-root"
      className="iris-section-loading iris-section-loading--reels"
      label="Loading reels"
    >
      <Suspense fallback={<SectionLoadingFallback id="iris-reels-viewer-root" className="iris-section-loading iris-section-loading--reels" label="Loading reels" />}>
        <IrisReelsViewer id="iris-reels-viewer-root" />
      </Suspense>
    </DeferredSection>

    <DeferredSection
      id="iris-divisions-section"
      className="iris-section-loading iris-section-loading--divisions"
      label="Loading divisions"
    >
      <Suspense fallback={<SectionLoadingFallback id="iris-divisions-section" className="iris-section-loading iris-section-loading--divisions" label="Loading divisions" />}>
        <IrisDivisionsSwitcher id="iris-divisions-section" />
      </Suspense>
    </DeferredSection>

    <DeferredSection
      id="iris-footer-root"
      className="iris-section-loading iris-section-loading--footer"
      label="Loading footer"
    >
      <Suspense fallback={<SectionLoadingFallback id="iris-footer-root" className="iris-section-loading iris-section-loading--footer" label="Loading footer" />}>
        <Footer />
      </Suspense>
    </DeferredSection>
  </div>
);

export default Home;
