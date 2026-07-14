/**
 * Premium Asset Configuration
 * 
 * Edit this configuration to swap assets dynamically (image, video, Spline 3D, or Lottie animation).
 * Ensure new assets are placed under the appropriate folders in src/assets/premium/
 */

import heroImage from "../assets/hero.png";

export const heroAssets = {
  // Asset Type options: "image", "video", "spline", "lottie"
  type: "image",
  
  // Filepaths for assets
  image: heroImage,
  video: null,          // Example: "/videos/premium-hero.mp4"
  spline: null,         // Example: "https://prod.spline.design/your-scene/scene.splinecode"
  lottieLogo: null,     // Example: "/assets/premium/logo-animation/branding.json"
  
  // Fallback image path (used when loading or if loading fails)
  fallbackImage: heroImage
};

export const premiumConfig = {
  // Global config settings
  logoAnimation: null,  // Set Lottie source to replace Navbar logo with animation
  ambientAudio: null,   // Set file path to play background ambient soundtrack
  textures: {
    filmGrainEnabled: true,  // Toggle cinematic film grain overlay
    glowIntensity: "moderate" // Scale glowing backdrops
  }
};
