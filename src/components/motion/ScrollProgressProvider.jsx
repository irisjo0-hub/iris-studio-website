import React, { createContext, useContext } from 'react';
import { useScroll } from 'framer-motion';

const ScrollProgressContext = createContext(null);

export const ScrollProgressProvider = ({ children }) => {
  const scrollData = useScroll(); // returns scrollX, scrollY, scrollXProgress, scrollYProgress

  return (
    <ScrollProgressContext.Provider value={scrollData}>
      {children}
    </ScrollProgressContext.Provider>
  );
};

export const useScrollProgress = () => {
  const context = useContext(ScrollProgressContext);
  if (!context) {
    // Fallback: If not wrapped in Provider, return fresh useScroll() call
    return useScroll();
  }
  return context;
};
