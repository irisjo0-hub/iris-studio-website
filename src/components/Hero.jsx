// src/components/Hero.jsx
import React from 'react';
import '../styles/hero.css';
import irisLogo from '../assets/iris_logo.png'; // fallback to existing logo
import heroImg from '../assets/hero_feature.png'; // large visual image

export const Hero = () => (
  <section className="hero-section full-width glass-panel fade-in-up hero-bg">
    <div className="particles">
      <div className="particle particle1" />
      <div className="particle particle2" />
      <div className="particle particle3" />
    </div>
    <div className="hero-container">
      <div className="hero-left">
        <img src={heroImg} alt="Studio showcase" className="hero-image" />
      </div>
      <div className="hero-right">
        <img src={irisLogo} alt="IRIS Logo" className="hero-logo" />
        <div className="badge-gold">استديو تصوير • تصميم • طباعة</div>
        <h1 className="hero-title text-gradient-purple">
          من زهرة نادرة<br />إلى علامة تجارية لا تُنسى
        </h1>
        <p className="hero-description">
          استديو آيرس في إربد — تجربة تصوير منظمة لجلسات التخرج والعائلة والأطفال والمناسبات، مع خدمات دفاتر التخرج والتصاميم والطباعة.
        </p>
        <div className="hero-buttons">
          <a href="/booking" className="btn btn-primary">احجز جلستك</a>
          <a href="/packages" className="btn btn-secondary">طلب دفتر تخرج</a>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
