import React, { useState } from 'react';
import Lightbox from './Lightbox';
import '../styles/gallery.css';

/**
 * Props:
 * - images: array of objects { src: string, alt?: string }
 */
const Gallery = ({ images }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const goPrev = () => {
    setLightboxIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goNext = () => {
    setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="gallery-grid">
      {images.map((img, idx) => (
        <div key={idx} className="gallery-item" onClick={() => openLightbox(idx)}>
          <img src={img.src} alt={img.alt || `Image ${idx + 1}`} className="gallery-img" />
        </div>
      ))}
      {lightboxIndex !== null && (
        <Lightbox
          src={images[lightboxIndex].src}
          alt={images[lightboxIndex].alt}
          onClose={closeLightbox}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </div>
  );
};

export default Gallery;
