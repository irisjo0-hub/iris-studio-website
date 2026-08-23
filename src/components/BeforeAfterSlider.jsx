import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import '../styles/home.css';

const BeforeAfterSlider = ({ 
  beforeImage, 
  afterImage, 
  title = "معالجة الصورة وتعديل الألوان الاحترافي",
  beforeLabel = "قبل التعديل (RAW)",
  afterLabel = "بعد التعديل والمعالجة" 
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX, rect) => {
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    handleMove(e.touches[0].clientX, rect);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    handleMove(e.clientX, rect);
  };

  return (
    <div className="before-after-wrapper">
      {title && (
        <div className="ba-title-box">
          <Sparkles size={20} className="ba-icon" />
          <h3>{title}</h3>
        </div>
      )}

      <div 
        className="ba-slider-container"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
      >
        {/* After Image (Full Viewport) */}
        <img 
          src={afterImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80"} 
          alt="After Retouch" 
          className="ba-image ba-after-img" 
        />
        <span className="ba-label label-after">{afterLabel}</span>

        {/* Before Image (Clipped Viewport) */}
        <div 
          className="ba-before-overlay"
          style={{ width: `${sliderPosition}%` }}
        >
          <img 
            src={beforeImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=40"} 
            alt="Before Retouch" 
            className="ba-image ba-before-img" 
          />
          <span className="ba-label label-before">{beforeLabel}</span>
        </div>

        {/* Slider Divider Line & Handle */}
        <div 
          className="ba-slider-handle"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="ba-handle-line" />
          <div className="ba-handle-button">
            <span>↔</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
