import React, { useEffect } from 'react';
import '../styles/gallery.css';

const Lightbox = ({ src, alt, onClose, onPrev, onNext }) => {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div className="gallery-lightbox" onClick={onClose}>
      <button className="close-btn" onClick={onClose}>✖</button>
      <button className="prev-btn" onClick={(e) => { e.stopPropagation(); onPrev(); }}>←</button>
      <img src={src} alt={alt} onClick={(e) => e.stopPropagation()} />
      <button className="next-btn" onClick={(e) => { e.stopPropagation(); onNext(); }}>→</button>
    </div>
  );
};

export default Lightbox;
