import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const FloatingLayer = ({
  children,
  amplitude = 6,
  duration = 12,
  delay = 0,
  className = '',
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  const floatAnimation = shouldReduceMotion 
    ? {} 
    : {
        y: [-amplitude, amplitude, -amplitude],
        transition: {
          duration: duration,
          ease: "easeInOut",
          repeat: Infinity,
          delay: delay
        }
      };

  return (
    <motion.div
      animate={floatAnimation}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};
