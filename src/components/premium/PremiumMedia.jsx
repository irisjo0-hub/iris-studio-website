import React from "react";

/**
 * PremiumMedia
 * 
 * Reusable component designed to render premium assets seamlessly.
 * Supports standard images, HTML5 looping videos, Spline 3D WebGL scenes, and Lottie animations.
 */
const PremiumMedia = ({ 
  asset, 
  className = "hero-gallery-video", 
  videoRef, 
  muted = true, 
  onVideoClick 
}) => {
  if (!asset) return null;

  // Fallback to "image" type if the selected asset type's source is null/undefined
  let type = asset.type;
  if (type === "video" && !asset.video) type = "image";
  if (type === "spline" && !asset.spline) type = "image";
  if (type === "lottie" && !asset.lottieLogo) type = "image";

  switch (type) {
    case "video":
      return (
        <video
          ref={videoRef}
          className={className}
          autoPlay
          loop
          muted={muted}
          playsInline
          onClick={onVideoClick}
          poster={asset.fallbackImage}
        >
          {asset.video && <source src={asset.video} type="video/mp4" />}
          <img 
            src={asset.fallbackImage} 
            alt="" 
            className={className} 
          />
        </video>
      );

    case "spline":
      return (
        <div className="premium-spline-wrapper" style={{ width: "100%", height: "100%", position: "relative" }}>
          {/* 
            [DEVELOPER INSTRUCTION: 3D MODEL INTEGRATION]
            To swap in an interactive Spline 3D Scene:
            1. Install dependency: npm install @splinetool/react-spline
            2. Import Spline: import Spline from '@splinetool/react-spline';
            3. Replace the image tag below with:
               <Spline scene={asset.spline} />
          */}
          <img 
            src={asset.fallbackImage} 
            alt="" 
            className={className} 
          />
        </div>
      );

    case "lottie":
      return (
        <div className="premium-lottie-wrapper" style={{ width: "100%", height: "100%", position: "relative" }}>
          {/* 
            [DEVELOPER INSTRUCTION: LOTTIE LOGO / ANIMATION INTEGRATION]
            To swap in a vector Lottie logo animation:
            1. Install dependency: npm install lottie-react
            2. Import Lottie: import Lottie from 'lottie-react';
            3. Replace the image tag below with:
               <Lottie animationData={asset.lottieLogo} loop={true} />
          */}
          <img 
            src={asset.fallbackImage} 
            alt="" 
            className={className} 
          />
        </div>
      );

    case "image":
    default:
      return (
        <img
          src={asset.image || asset.fallbackImage}
          alt=""
          className={className}
        />
      );
  }
};

export default PremiumMedia;
