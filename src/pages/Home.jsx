import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/home.css";
import "../styles/animation.css";

const FALLBACK_PACKAGES = [
  { id: 1, title: 'بكج 20', price: 20, features: ['جلسة مدتها 25 دقيقة', 'تعديل احترافي لـ 5 صور', 'تسليم كافة الصور الأصلية'] },
  { id: 2, title: 'بكج 30', price: 30, features: ['جلسة مدتها 50 دقيقة', 'تعديل احترافي لـ 10 صور', 'تسليم كافة الصور الأصلية'] },
  { id: 3, title: 'بكج 35', price: 35, features: ['جلسة مدتها 50 دقيقة', 'تعديل لـ 10 صور', 'دفتر تخرج غلاف اسفنجي'] }
];

const Home = () => {
  const [heroVisible, setHeroVisible] = useState(false);
  const [breakBoxVisible, setBreakBoxVisible] = useState(false);
  const [muted, setMuted] = useState(true);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);

  const [portfolio, setPortfolio] = useState([]);
  const [packages, setPackages] = useState([]);
  const [offers, setOffers] = useState([]);

  const heroRef = useRef(null);
  const breakBoxRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const observerOptions = { threshold: 0.15 };

    const heroObserver = new IntersectionObserver(([entry]) => {
      setHeroVisible(entry.isIntersecting);
    }, observerOptions);

    const breakBoxObserver = new IntersectionObserver(([entry]) => {
      setBreakBoxVisible(entry.isIntersecting);
    }, observerOptions);

    if (heroRef.current) heroObserver.observe(heroRef.current);
    if (breakBoxRef.current) breakBoxObserver.observe(breakBoxRef.current);

    return () => {
      heroObserver.disconnect();
      breakBoxObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const { data, error } = await supabase
          .from('portfolio_items')
          .select('*')
          .limit(6);
        if (!error && data) setPortfolio(data);
      } catch (err) {
        console.error("Failed to fetch portfolio:", err);
      }
    };

    const fetchPackages = async () => {
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .eq('is_hidden', false)
          .order('sort_order', { ascending: true })
          .limit(3);
        if (!error && data && data.length > 0) {
          setPackages(data);
        } else {
          setPackages(FALLBACK_PACKAGES);
        }
      } catch (err) {
        setPackages(FALLBACK_PACKAGES);
      }
    };

    const fetchOffers = async () => {
      try {
        const { data, error } = await supabase
          .from('offers')
          .select('*')
          .eq('is_hidden', false)
          .limit(3);
        if (!error && data) setOffers(data);
      } catch (err) {
        console.error("Failed to fetch offers:", err);
      }
    };

    fetchPortfolio();
    fetchPackages();
    fetchOffers();
  }, []);

  const handleVideoClick = () => {
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted;
      videoRef.current.muted = newMuted;
      setMuted(newMuted);
      videoRef.current.play().catch(err => console.log("Video play interrupted", err));
    }
  };

  return (
    <main className="home-page" dir="rtl">
      {/* 1. Hero Section */}
      <section ref={heroRef} className={`hero-section ${heroVisible ? "animate" : ""}`}>
        <div className="hero-bg-shape shape-one"></div>
        <div className="hero-bg-shape shape-two"></div>

        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              استديو تصوير • تصميم • طباعة
            </div>

            <h1 className="hero-title">
              <span>من زهرة نادرة</span>
              <span>إلى علامة تجارية</span>
              <span>لا تُنسى</span>
            </h1>

            <p>
              استديو آيرس في إربد — تجربة تصوير منظمة لجلسات التخرج والعائلة
              والأطفال والمناسبات، مع خدمات دفاتر التخرج والتصاميم المطبوعة
              بجودة تليق بلحظتك.
            </p>

            <div className="hero-actions">
              <Link to="/booking" className="btn btn-gold">
                احجز جلستك
              </Link>

              <Link
                to="/graduation-order"
                className="btn btn-purple"
              >
                طلب دفتر تخرج
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-card">
              <video
                ref={videoRef}
                className="hero-main-video"
                autoPlay
                loop
                muted={muted}
                playsInline
                onClick={handleVideoClick}
                poster="/assets/hero.png"
                style={{ cursor: "pointer" }}
              >
                <source src="/videos/IRIS.mp4" type="video/mp4" />
                <img
                  src="/assets/hero.png"
                  alt="IRIS Studio"
                  className="hero-main-video"
                />
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Services Section */}
      <section className="preview-section">
        <div className="section-container">
          <div className="section-title">
            <span className="kicker"> خدماتنا</span>
            <h2>كل ما تحتاجه في مكان واحد</h2>
          </div>

          <div className="preview-grid">
            <Link to="/booking" className="preview-card">
              <span>📸</span>
              <h3>التصوير</h3>
              <p>جلسات تصوير التخرج، العائلات، الأطفال، والمناسبات المتنوعة بأعلى دقة.</p>
            </Link>

            <Link
              to="/graduation-books"
              className="preview-card gold-card"
            >
              <span>📚</span>
              <h3>دفاتر التخرج</h3>
              <p>تصميم وطباعة دفاتر تخرج مخصصة وأغلفة فاخرة تناسب تميزكم.</p>
            </Link>

            <Link
              to="/printing-products"
              className="preview-card"
            >
              <span>🖨️</span>
              <h3>المطبوعات</h3>
              <p>خدمات طباعة الصور والبوسترات واللوحات الفنية بجودة استثنائية.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Portfolio Section */}
      <section className="home-portfolio-section">
        <div className="section-container">
          <div className="section-title">
            <span className="kicker">معرض أعمالنا</span>
            <h2>لقطات إبداعية مميزة</h2>
          </div>

          {portfolio.length > 0 ? (
            <div className="home-portfolio-grid">
              {portfolio.map((item) => (
                <div key={item.id} className="home-portfolio-card">
                  <img src={item.image_url} alt={item.title} className="home-portfolio-img" />
                  <div className="portfolio-info-overlay">
                    <h3>{item.title}</h3>
                    <span>{item.category}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state" style={{ padding: '24px 0' }}>
              <p style={{ color: 'var(--color-text-muted)' }}>استكشف معرض الصور والجلسات الإبداعية عبر صفحة أعمالنا.</p>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <Link to="/work" className="btn btn-purple">
              تصفح المعرض الكامل
            </Link>
          </div>
        </div>
      </section>

      {/* 3. About Us Section (Moved below Portfolio, shortened) */}
      <section className="about-section">
        <div className="section-container text-only-about">
          <span className="kicker">من نحن</span>
          <h2>استديو آيرس</h2>
          <p>
            نحن استوديو آيرس، متخصصون في التصوير والطباعة الإبداعية وتوثيق أجمل لحظاتكم من خلال جلسات تصوير التخرج والعائلات والمناسبات، وتصميم دفاتر التخرج الفاخرة والمطبوعات المخصصة بدقة واحترافية عالية تليق بذكرياتكم.
          </p>
        </div>
      </section>

      {/* 4. Packages & Offers Section */}
      <section className="home-packages-section">
        <div className="section-container">
          <div className="section-title">
            <span className="kicker">الباقات المتوفرة</span>
            <h2>باقات جلسات التصوير المخصصة</h2>
          </div>

          <div className="home-packages-grid">
            {packages.map((pkg, i) => (
              <article key={pkg.id || i} className="home-package-card">
                <h3 className="package-title">{pkg.title}</h3>
                <div className="price-tag">{pkg.price} JOD</div>
                <ul className="package-features">
                  {(Array.isArray(pkg.features)
                    ? pkg.features
                    : typeof pkg.features === 'string'
                      ? JSON.parse(pkg.features || '[]')
                      : []
                  ).slice(0, 4).map((f, idx) => (
                    <li key={idx}>
                      <span className="pkg-feature-check">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to={`/booking?package=${encodeURIComponent(pkg.title)}`} className="btn btn-gold pkg-book-btn">
                  احجز هذه الباقة
                </Link>
              </article>
            ))}
          </div>

          {offers.length > 0 && (
            <div className="home-offers-sub" style={{ marginTop: '50px' }}>
              <div className="section-title">
                <span className="kicker">عروض خاصة</span>
                <h2>عروض وخصومات موسمية مميزة</h2>
              </div>
              
              <div className="offers-slider-container">
                <button 
                  onClick={() => setCurrentOfferIndex((prev) => (prev - 1 + offers.length) % offers.length)} 
                  className="slider-arrow prev-arrow" 
                  aria-label="Previous Offer"
                >
                  &#8250;
                </button>
                
                <div className="offers-slider-track">
                  <div className="home-offer-card slider-active">
                    {offers[currentOfferIndex].image_url && (
                      <img src={offers[currentOfferIndex].image_url} alt={offers[currentOfferIndex].title} className="offer-img" />
                    )}
                    <div className="offer-body">
                      <h3>{offers[currentOfferIndex].title}</h3>
                      <p>{offers[currentOfferIndex].description}</p>
                      <span className="offer-price">{offers[currentOfferIndex].price} JOD</span>
                      <Link to="/booking" className="btn btn-purple" style={{ marginTop: '12px' }}>
                        {offers[currentOfferIndex].button_text || 'استفد من العرض'}
                      </Link>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setCurrentOfferIndex((prev) => (prev + 1) % offers.length)} 
                  className="slider-arrow next-arrow" 
                  aria-label="Next Offer"
                >
                  &#8249;
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Decorative SVG break box banner positioned cleanly */}
      <section ref={breakBoxRef} className={`break-box-banner ${breakBoxVisible ? "animate" : ""}`}>
        <svg className="break-box-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12784.25 7001.57">
          <path id="Purple_right_piece" d="M11568.27,5350.5l-2236.56,1268.92-687.61-1154.49h2241.18v-2163.23l575.12,240.96c772.86,323.9,836.77,1394.25,107.88,1807.83Z" fill="#6F246F" />
          <polygon id="Green_bottom_piece" points="4024.44 5464.93 1435.28 5464.93 1434.11 4896.06 3565.1 4846.52 4024.44 5464.93" fill="#0F5A46" />
          <path id="Yellow_piece_left" d="M1000.81,4897.54H471.98c16.28-264.49,255.86-476.78,528.83-446.95v446.95Z" fill="#F2C21A" />
          <path id="Yellow_piece_right" d="M10885.28,1354.69v581.95l-493.66,202.08c-637.18,260.82-1292.19-172.99-1381.97-784.04h1875.62Z" fill="#F2C21A" />
          <polygon id="Green_top_piece" points="6891.17 1405.71 5851.86 1405.71 5851.86 835.81 6806.48 1139.29 6891.17 1405.71" fill="#0F5A46" />
          <path id="Purple_top-left_piece" d="M4207.09,1354.69H1434.11v1828.98l-487.84-507.79c-580.47-604.3-213.81-1611.94,619.36-1701.8l2556.58-275.69,84.88,656.3Z" fill="#6F246F" />
          <g id="We_Break">
            <path d="M4408.23,2358.74c-29.69,103.22-66.46,230.49-100.4,342.19l-132.92,418.55h-96.15l-248.87-848.42h87.67l118.78,429.86c32.52,114.54,62.22,229.07,89.08,343.61h7.07c32.52-120.19,65.04-223.42,100.4-342.19l137.16-431.28h83.43l137.16,431.28c35.35,118.78,66.46,222,100.4,342.19h5.66c28.28-114.54,57.97-229.07,90.5-343.61l117.36-429.86h86.26l-248.87,848.42h-97.57l-131.5-418.55c-33.94-111.71-72.12-238.97-100.4-342.19h-4.24Z" fill="#0F5A46" />
            <path d="M4965.37,2791.43c0-214.93,138.57-340.78,326.64-340.78s299.77,121.61,299.77,302.6c0,11.31-1.41,38.18-2.83,60.8h-547.23c5.66,156.96,100.4,251.7,253.11,251.7,139.99,0,196.55-74.94,224.83-166.86l67.87,21.21c-33.94,135.75-132.92,213.52-291.29,213.52-205.03,0-330.88-131.5-330.88-342.2ZM5519.67,2749.01c-5.66-145.64-79.19-230.49-230.49-230.49-137.16,0-230.49,79.19-246.04,230.49h476.53Z" fill="#0F5A46" />
            <path d="M5900.05,2271.07h326.64c173.92,0,261.6,82.01,261.6,216.35,0,96.15-41.01,168.27-124.43,197.96v2.83c114.54,25.45,171.1,93.33,171.1,203.62,0,124.43-82.01,227.66-270.08,227.66h-364.82v-848.42ZM5979.23,2658.52h243.21c108.88,0,188.07-43.83,188.07-162.61,0-96.15-57.98-152.71-178.17-152.71h-253.11v315.33ZM5979.23,3047.37h282.81c135.75,0,193.72-73.53,193.72-159.79,0-94.74-65.04-159.79-202.21-159.79h-274.32v319.57Z" fill="#0F5A46" />
            <path d="M6700.39,2645.79h2.83c24.04-120.19,91.91-181,205.03-181h46.66v79.19h-48.08c-137.16,0-206.45,59.39-206.45,205.03v370.48h-74.94v-654.69h74.94v181Z" fill="#0F5A46" />
            <path d="M6950.67,2791.43c0-214.93,138.57-340.78,326.64-340.78s299.77,121.61,299.77,302.6c0,11.31-1.41,38.18-2.83,60.8h-547.23c5.66,156.96,100.4,251.7,253.11,251.7,139.99,0,196.55-74.94,224.83-166.86l67.87,21.21c-33.94,135.75-132.92,213.52-291.29,213.52-205.03,0-330.88-131.5-330.88-342.2ZM7504.97,2749.01c-5.66-145.64-79.19-230.49-230.49-230.49-137.16,0-230.49,79.19-246.04,230.49h476.53Z" fill="#0F5A46" />
            <path d="M7626.58,2792.85c0-210.69,108.88-343.61,285.63-342.2,164.03-1.41,243.21,94.74,267.25,220.59h1.41v-206.45h74.94v654.69h-74.94v-203.62h-2.83c-26.87,125.85-106.05,217.76-260.18,217.76-190.9,0-291.29-131.5-291.29-340.78ZM8180.88,2788.61c0-162.61-96.15-271.49-247.45-271.49s-231.9,101.81-231.9,275.74,74.94,271.49,231.9,271.49,247.45-96.15,247.45-267.25v-8.48Z" fill="#0F5A46" />
            <path d="M8472.18,2252.69v507.64h4.24l347.85-295.53h100.4v2.83l-386.03,323.81,415.72,325.23v2.83h-101.81l-374.72-296.95h-5.66v296.95h-74.94v-866.8h74.94Z" fill="#0F5A46" />
          </g>
          <g id="The_Box">
            <path d="M3851.66,3743.54v-223.43h803.35v223.43h-282.57v762.28h-236.57v-762.28h-284.21Z" fill="#0F5A46" />
            <path d="M4931.01,3945.61h1.64c37.78-179.07,129.78-239.85,254.64-239.85,169.21,0,239.85,110.07,239.85,279.28v520.78h-223.43v-456.71c0-78.86-37.79-141.28-129.78-141.28s-142.93,50.93-142.93,141.28v456.71h-225.07v-1007.06h225.07v446.85Z" fill="#0F5A46" />
            <path d="M5483.01,4132.89c0-269.43,151.14-427.14,402.5-427.14s356.5,151.14,356.5,364.71v16.43c0,26.29,1.64,52.57-3.29,87.07h-532.28c14.79,111.71,73.93,161,179.07,161s138-50.93,156.07-111.71l193.86,54.21c-39.43,141.28-138,249.71-353.21,249.71-233.28,0-399.21-134.71-399.21-394.28ZM6036.65,4047.47c-6.57-103.5-59.14-156.07-157.71-156.07s-157.71,46-172.5,156.07h330.21Z" fill="#0F5A46" />
            <path d="M6552.51,3520.12h432.07c249.71,0,363.07,82.14,363.07,251.35,0,113.36-49.28,188.93-149.5,230v3.29c138,27.93,188.93,100.21,188.93,231.64,0,159.36-101.86,269.43-358.14,269.43h-476.42v-985.7ZM6789.08,3924.25h187.28c90.35,0,136.36-27.93,136.36-105.14,0-65.71-39.43-100.21-133.07-100.21h-190.57v205.35ZM6789.08,4307.04h226.71c90.36,0,131.43-44.36,131.43-103.5,0-65.71-36.14-103.5-134.71-103.5h-223.43v207Z" fill="#0F5A46" />
            <path d="M7416.65,4116.47c0-257.93,156.07-410.71,404.14-410.71s402.5,152.78,402.5,410.71-152.78,412.35-402.5,412.35-404.14-156.07-404.14-412.35ZM7641.71,4114.82c0,126.5,60.79,208.64,177.43,208.64s180.71-82.14,180.71-208.64-65.71-205.35-179.07-205.35-179.07,80.5-179.07,205.35Z" fill="#0F5A46" />
            <path d="M8441.78,3727.11l129.78,289.14h13.14l121.57-289.14h238.21v3.29l-198.78,400.85,208.64,371.28v3.29h-259.57l-131.43-292.43h-13.14l-121.57,292.43h-251.35v-3.29l211.93-402.5-207-369.64v-3.29h259.57Z" fill="#0F5A46" />
          </g>
        </svg>
      </section>

      {/* 6. Contact Section (Including Irbid location & WhatsApp chat link) */}
      <section className="contact-section">
        <div className="section-container location-card">
          <div>
            <span className="kicker">موقعنا واتصالنا</span>
            <h2>إربد – إشارة المحافظة – مجمع الخضر</h2>
            <p>الطابق الأول – فوق مختبرات ميد لاب</p>
            <small>
              IRBID - Alkhader Center - 1st Floor - Near McDonald's
            </small>
          </div>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            <a
              href="https://maps.app.goo.gl/VhqQbnM86PTucjTv5"
              target="_blank"
              rel="noreferrer"
              className="btn btn-gold"
            >
              افتح على خرائط قوقل
            </a>
            <a
              href="https://wa.me/962797303260?text=مرحباً، أود الاستفسار عن خدمات استديو آيرس"
              target="_blank"
              rel="noreferrer"
              className="btn btn-purple"
            >
              راسلنا واتساب
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;