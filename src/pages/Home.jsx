import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Menu, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';
import irisLogo from '../assets/iris_logo.png';
import '../styles/home-v3.css';

const FLOW = [
  { id:'media', number:'01', labelAr:'ميديا', labelEn:'MEDIA', copyAr:'نصنع المحتوى الذي يجعل العلامة تُرى وتُتذكر.', copyEn:'Content that makes brands seen, felt, and remembered.', route:'/media', image:'https://ebkgpkwdxjbebuzuqrci.supabase.co/storage/v1/object/public/portfolio/reels/1788370986276-post_1.jpg', tone:'purple' },
  { id:'studio', number:'02', labelAr:'استوديو', labelEn:'STUDIO', copyAr:'تصوير احترافي يحوّل اللحظة إلى صورة لها قيمة.', copyEn:'Photography that turns a moment into something worth keeping.', route:'/studio', image:'https://ebkgpkwdxjbebuzuqrci.supabase.co/storage/v1/object/public/portfolio/reels/1788371408375-poster.jpg', tone:'green' },
  { id:'print', number:'03', labelAr:'مطبوعات', labelEn:'PRINT', copyAr:'من الفكرة الرقمية إلى قطعة ملموسة تشعر بها.', copyEn:'From a digital idea to a physical piece you can feel.', route:'/print', image:'https://ebkgpkwdxjbebuzuqrci.supabase.co/storage/v1/object/public/portfolio/reels/1788282486205-download_13.jpg', tone:'gold' },
];

const WORK = [
  { titleAr:'صناعة محتوى وحملات', titleEn:'Content & Campaigns', categoryAr:'MEDIA', categoryEn:'MEDIA', image:FLOW[0].image, route:'/work' },
  { titleAr:'تصوير المنتجات', titleEn:'Product Photography', categoryAr:'STUDIO', categoryEn:'STUDIO', image:FLOW[1].image, route:'/product-photography' },
  { titleAr:'طباعة فاخرة', titleEn:'Premium Print', categoryAr:'PRINT', categoryEn:'PRINT', image:FLOW[2].image, route:'/printing-products' },
];

const Home = () => {
  const navigate = useNavigate();
  const { settings, lang } = useSiteSettings();
  const isRtl = lang === 'ar';
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDivision, setActiveDivision] = useState(0);

  const heroTitle = isRtl ? (settings.slogan_line_1_ar || settings.slogan_line_1 || 'من زهرة نادرة') : (settings.slogan_line_1_en || 'From a Rare Flower');
  const heroTitle2 = isRtl ? (settings.slogan_line_2_ar || settings.slogan_line_2 || 'إلى علامة لا تُنسى') : (settings.slogan_line_2_en || 'to an Unforgettable Brand');
  const heroCopy = isRtl ? (settings.supporting_text_ar || settings.supporting_text || 'منظومة إبداعية تجمع الميديا، الاستوديو، والمطبوعات تحت سقف واحد.') : (settings.supporting_text_en || 'One creative ecosystem for media, studio, and print.');

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' });

  useEffect(() => {
    const items = [...document.querySelectorAll('[data-reveal]')];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold:0.12 });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('iris-menu-open', menuOpen);
    return () => document.body.classList.remove('iris-menu-open');
  }, [menuOpen]);

  const navItems = useMemo(() => [
    { ar:'ميديا', en:'MEDIA', route:'/media' },
    { ar:'استوديو', en:'STUDIO', route:'/studio' },
    { ar:'مطبوعات', en:'PRINT', route:'/print' },
    { ar:'أعمالنا', en:'WORK', route:'/work' },
    { ar:'الباقات', en:'PACKAGES', route:'/packages' },
    { ar:'تواصل معنا', en:'CONTACT', route:'/studio/contact' },
  ], []);

  return (
    <div className="iris-home-v3" dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="iris-v3-header">
        <Link to="/" className="iris-v3-brand" aria-label="IRIS home"><img src={settings.hero_logo_url || settings.logo_url || irisLogo} alt="IRIS" /></Link>
        <div className="iris-v3-header-note">WE BREAK THE BOX<span>•</span></div>
        <button className="iris-v3-menu-trigger" type="button" onClick={() => setMenuOpen(true)} aria-label={isRtl ? 'فتح القائمة' : 'Open menu'}><span>{isRtl ? 'القائمة' : 'MENU'}</span><Menu size={20} strokeWidth={1.5} /></button>
      </header>

      {menuOpen && (
        <div className="iris-v3-menu" role="dialog" aria-modal="true">
          <button className="iris-v3-menu-close" onClick={() => setMenuOpen(false)} type="button" aria-label="Close">×</button>
          <div className="iris-v3-menu-inner">
            <div className="iris-v3-menu-kicker">IRIS / NAVIGATION</div>
            <nav>
              {navItems.map((item, index) => (
                <Link key={item.route} to={item.route} onClick={() => setMenuOpen(false)}>
                  <span>0{index + 1}</span><strong>{isRtl ? item.ar : item.en}</strong><ArrowUpRight size={22} />
                </Link>
              ))}
            </nav>
            <button className="iris-v3-menu-contact" onClick={() => { setMenuOpen(false); navigate('/booking'); }} type="button">{isRtl ? 'احجز جلسة' : 'BOOK A SESSION'} <ArrowUpRight size={18} /></button>
          </div>
        </div>
      )}

      <main>
        <section className="iris-v3-hero">
          <div className="iris-v3-hero-glow iris-v3-glow-purple" /><div className="iris-v3-hero-glow iris-v3-glow-green" /><div className="iris-v3-hero-grid" />
          <div className="iris-v3-hero-content">
            <div className="iris-v3-eyebrow"><Sparkles size={14} /> {isRtl ? 'منظومة إبداعية أردنية' : 'A Jordanian creative ecosystem'}</div>
            <h1><span>{heroTitle}</span><span>{heroTitle2}</span></h1>
            <p>{heroCopy}</p>
            <div className="iris-v3-hero-actions">
              <button type="button" className="iris-v3-primary" onClick={() => scrollTo('iris-flow')}>{isRtl ? 'اكتشف آيرس' : 'Discover IRIS'} <ArrowUpRight size={18} /></button>
              <button type="button" className="iris-v3-text-button" onClick={() => scrollTo('iris-work')}>{isRtl ? 'شاهد أعمالنا' : 'View our work'}</button>
            </div>
          </div>
          <div className="iris-v3-hero-art">
            <div className="iris-v3-orbit iris-v3-orbit-one" /><div className="iris-v3-orbit iris-v3-orbit-two" />
            <div className="iris-v3-hero-card iris-v3-card-main"><img src={settings.hero_image_url || '/assets/hero-CLDdwZDr.png'} alt="" fetchPriority="high" /></div>
            <div className="iris-v3-hero-card iris-v3-card-small"><span>01</span><b>IRIS</b></div>
            <div className="iris-v3-hero-art-caption">MEDIA / STUDIO / PRINT</div>
          </div>
          <button className="iris-v3-scroll" type="button" onClick={() => scrollTo('iris-flow')}><span>{isRtl ? 'مرر للأسفل' : 'SCROLL TO EXPLORE'}</span><span className="iris-v3-scroll-line" /></button>
        </section>

        <section id="iris-flow" className="iris-v3-flow-section">
          <div className="iris-v3-section-head" data-reveal><div><span className="iris-v3-kicker">IRIS / 01</span><h2>{isRtl ? 'ثلاثة عوالم. كيان واحد.' : 'Three worlds. One IRIS.'}</h2></div><p>{isRtl ? 'اختر نقطة البداية. الباقي علينا.' : 'Choose where to start. We will take it from there.'}</p></div>
          <div className="iris-v3-division-list">
            {FLOW.map((division, index) => (
              <Link key={division.id} to={division.route} className={`iris-v3-division \${index === activeDivision ? 'is-active' : ''} iris-v3-tone-\${division.tone}`} onMouseEnter={() => setActiveDivision(index)} onFocus={() => setActiveDivision(index)}>
                <div className="iris-v3-division-number">{division.number}</div>
                <div className="iris-v3-division-copy"><span>{isRtl ? division.labelAr : division.labelEn}</span><h3>{isRtl ? division.copyAr : division.copyEn}</h3></div>
                <div className="iris-v3-division-media"><img src={division.image} alt="" loading={index === 0 ? 'eager' : 'lazy'} decoding="async" /></div>
                <ArrowUpRight className="iris-v3-division-arrow" size={24} />
              </Link>
            ))}
          </div>
        </section>

        <section id="iris-work" className="iris-v3-work-section">
          <div className="iris-v3-section-head" data-reveal><div><span className="iris-v3-kicker">IRIS / 02</span><h2>{isRtl ? 'نصنع. نصور. نطبع.' : 'Create. Capture. Make.'}</h2></div><Link to="/work" className="iris-v3-inline-link">{isRtl ? 'كل الأعمال' : 'All work'} <ArrowUpRight size={16} /></Link></div>
          <div className="iris-v3-work-grid">
            {WORK.map((item, index) => (
              <Link key={item.route + index} to={item.route} className={`iris-v3-work-card iris-v3-work-card-\${index + 1}`} data-reveal>
                <div className="iris-v3-work-image"><img src={item.image} alt="" loading="lazy" decoding="async" /><div className="iris-v3-work-overlay" /></div>
                <div className="iris-v3-work-meta"><span>{isRtl ? item.categoryAr : item.categoryEn}</span><ArrowUpRight size={18} /></div>
                <h3>{isRtl ? item.titleAr : item.titleEn}</h3>
              </Link>
            ))}
          </div>
        </section>

        <section className="iris-v3-statement" data-reveal><div className="iris-v3-statement-mark">IRIS</div><p>{isRtl ? 'من الفكرة إلى الصورة، ومن الصورة إلى قطعة ملموسة — نبني التجربة كاملة.' : 'From idea to image, and from image to something tangible — we build the experience end to end.'}</p></section>

        <section className="iris-v3-cta" data-reveal><div><span className="iris-v3-kicker">IRIS / 03</span><h2>{isRtl ? 'عندك فكرة؟ خلينا نبدأ.' : 'Have an idea? Let’s start.'}</h2></div><Link to="/booking" className="iris-v3-primary">{isRtl ? 'ابدأ مشروعك' : 'Start a project'} <ArrowUpRight size={18} /></Link></section>
      </main>

      <footer className="iris-v3-footer"><div><img src={settings.logo_url || settings.hero_logo_url || irisLogo} alt="IRIS" /><span>MEDIA / STUDIO / PRINT</span></div><span>IRIS © {new Date().getFullYear()}</span></footer>
    </div>
  );
};

export default Home;
