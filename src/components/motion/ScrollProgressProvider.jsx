import { createContext, useContext } from 'react';
import { useScroll } from 'framer-motion';

const ScrollProgressContext = createContext(null);

export const ScrollProgressProvider = ({ children }) => {
  const scrollData = useScroll();

  return (
    <ScrollProgressContext.Provider value={scrollData}>
      {children}
    </ScrollProgressContext.Provider>
  );
};

export const useScrollProgress = () => {
  const context = useContext(ScrollProgressContext);
  const fallbackScrollData = useScroll();
  return context || fallbackScrollData;
};
