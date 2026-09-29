import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDown, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSiteSettings } from '../context/SiteSettingsContext';
import IrisDarkHero from '../components/premium/IrisDarkHero';
import Footer from '../components/Footer';
import '../styles/home-v4.css';

const fallbackWork = [
  { id:'f1', title:'IRIS / Creative Production', category:'MEDIA', image_url:'https://ebkgpkwdxjbebuzuqrci.supabase.co/storage/v1/object/public/portfolio/reels/1788370986276-post_1.jpg' },
  { id:'f2', title:'IRIS / Studio Photography', category:'STUDIO', image_url:'https://ebkgpkwdxjbebuzuqrci.supabase.co/storage/v1/object/public/portfolio/reels/1788371408375-poster.jpg' },
  { id:'f3', title:'IRIS / Premium Print', category:'PRINT', image_url:'https://ebkgpkwdxjbebuzuqrci.supabase.co/storage/v1/object/public/portfolio/reels/1788282486205-download_13.jpg' }
];

const Home = () => {
  const { settings, lang } = useSiteSettings();
  const isRtl = lang === 'ar';
  const [work, setWork] = useState(fallbackWork);

  const divisions = [
    { number:'01', key:'MEDIA', title:isRtl ? (settings.division_media_title_ar || 'ميديا') : (settings.division_media_title_en || 'MEDIA'), text:isRtl ? (settings.division_media_subtitle_ar || 'صناعة المحتوى والحملات الإبداعية') : (settings.division_media_subtitle_en || 'Content Creation & Creative Campaigns'), image:settings.division_media_image || settings.hero_division_media_image, route:'/media', className:'media' },
    { number:'02', key:'STUDIO', title:isRtl ? (settings.division_studio_title_ar || 'استوديو') : (settings.division_studio_title_en || 'STUDIO'), text:isRtl ? (settings.division_studio_subtitle_ar || 'التصوير الاحترافي ورواية القصة البصرية') : (settings.division_studio_subtitle_en || 'Professional Photography & Visual Storytelling'), image:settings.division_studio_image || settings.hero_division_studio_image, route:'/studio', className:'studio' },
    { number:'03', key:'PRINT', title:isRtl ? (settings.division_print_title_ar || 'مطبوعات') : (settings.division_print_title_en || 'PRINT'), text:isRtl ? (settings.division_print_subtitle_ar || 'المطبوعات الفاخرة والتغليف الراقي') : (settings.division_print_subtitle_en || 'Luxury Print & Premium Packaging'), image:settings.division_print_image || settings.hero_division_print_image, route:'/print', className:'print' }
  ];

  useEffect(() => {
    let mounted = true;
    supabase.from('portfolio_items').select('id,title,category,image_url,created_at').order('created_at', { ascending:false }).limit(6)
      .then(({ data, error }) => { if (mounted && !error && data && data.length) setWork(data); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll('[data-iris-reveal]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('iris-visible'); observer.unobserve(entry.target); } });
    }, { threshold:0.12, rootMargin:'0px 0px -40px' });
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [work.length]);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });

  return (
    <div className="iris-home-v4" dir={isRtl ? 'rtl' : 'ltr'}>
      <IrisDarkHero />
      <main>
        <section className="iris-intro" data-iris-reveal>
          <div className="iris-intro-index">IRIS / 01</div>
          <div className="iris-intro-copy">
            <p className="iris-intro-lead">{isRtl ? 'آيرس ليست خدمة واحدة. هي منظومة إبداعية تبني حضورك من الفكرة إلى التجربة.' : 'IRIS is not one service. It is a creative system that builds your presence from idea to experience.'}</p>
            <div className="iris-intro-bottom">
              <span>MEDIA · STUDIO · PRINT</span>
              <button type="button" onClick={() => scrollTo('iris-worlds')} aria-label="Explore IRIS"><ArrowDown size={18} /></button>
            </div>
          </div>
        </section>

        <section id="iris-worlds" className="iris-worlds">
          <div className="iris-section-header" data-iris-reveal>
            <div><span className="iris-overline">THE IRIS SYSTEM</span><h2>{isRtl ? 'ثلاثة عوالم، رؤية واحدة.' : 'Three disciplines. One vision.'}</h2></div>
            <p>{isRtl ? 'كل جزء من آيرس مصمم ليكمل الآخر.' : 'Each part of IRIS is designed to complete the others.'}</p>
          </div>
          <div className="iris-world-list">
            {divisions.map((item) => (
              <Link key={item.key} to={item.route} className={'iris-world-row iris-world-' + item.className} data-iris-reveal>
                <div className="iris-world-number">{item.number}</div>
                <div className="iris-world-title"><span>{item.key}</span><h3>{item.title}</h3></div>
                <p className="iris-world-description">{item.text}</p>
                <div className="iris-world-image">{item.image ? <img src={item.image} alt="" loading="lazy" /> : <div className="iris-world-placeholder" />}</div>
                <span className="iris-world-arrow"><ArrowUpRight size={21} /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="iris-work" id="iris-work">
          <div className="iris-section-header iris-work-header" data-iris-reveal>
            <div><span className="iris-overline">SELECTED WORK / 02</span><h2>{isRtl ? 'شغل يحكي عن نفسه.' : 'Work that speaks for itself.'}</h2></div>
            <Link to="/work" className="iris-line-link">{isRtl ? 'كل الأعمال' : 'View all work'} <ArrowUpRight size={17} /></Link>
          </div>
          <div className="iris-work-grid">
            {work.map((item, index) => (
              <Link key={item.id} to="/work" className={'iris-work-card iris-work-card-' + (index + 1)} data-iris-reveal>
                <div className="iris-work-image"><img src={item.image_url} alt={item.title || ''} loading={index < 2 ? 'eager' : 'lazy'} /><span className="iris-work-plus"><Plus size={18} /></span></div>
                <div className="iris-work-meta"><span>{item.category || 'IRIS'}</span><span>0{index + 1}</span></div>
                <h3>{item.title || (isRtl ? 'مشروع من أعمال آيرس' : 'An IRIS project')}</h3>
              </Link>
            ))}
          </div>
        </section>

        <section className="iris-manifesto" data-iris-reveal>
          <div className="iris-manifesto-orb iris-orb-purple" /><div className="iris-manifesto-orb iris-orb-green" />
          <span className="iris-overline">WE BREAK THE BOX</span>
          <h2>{isRtl ? <>نأخذ الفكرة.<br/><em>ونعطيها حضور.</em></> : <>We take the idea.<br/><em>We give it presence.</em></>}</h2>
          <p>{isRtl ? 'من المحتوى والتصوير إلى المطبوعات، نبني التفاصيل التي تجعل العلامة محسوسة.' : 'From content and photography to print, we build the details that make a brand tangible.'}</p>
        </section>

        <section className="iris-cta" data-iris-reveal>
          <div className="iris-cta-number">03 / START</div>
          <div className="iris-cta-main"><span className="iris-overline">{isRtl ? 'جاهز نبدأ؟' : 'READY WHEN YOU ARE'}</span><h2>{isRtl ? 'خلينا نصنع شيئًا يُرى.' : 'Let’s make something worth seeing.'}</h2><Link to="/booking" className="iris-cta-button"><span>{isRtl ? 'ابدأ مشروعك' : 'Start a project'}</span><ArrowUpRight size={20} /></Link></div>
          <div className="iris-cta-side"><span>{isRtl ? 'إربد · الأردن' : 'Irbid · Jordan'}</span><span>MEDIA · STUDIO · PRINT</span></div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;