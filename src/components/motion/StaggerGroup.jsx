import React, { createContext } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const StaggerContext = createContext(false);

export const StaggerGroup = ({
  children,
  staggerDelay = 0.12,
  delay = 0.1,
  once = false,
  className = '',
  viewportMargin = "-100px",
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
        delayChildren: delay,
      }
    }
  };

  return (
    <StaggerContext.Provider value={true}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: once, margin: viewportMargin }}
        variants={containerVariants}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    </StaggerContext.Provider>
  );
};
