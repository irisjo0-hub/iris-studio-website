import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const MagneticButton = ({
  children,
  className = '',
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Gentle, spring-driven premium transitions
  const hoverAnimation = shouldReduceMotion
    ? { opacity: 0.9 }
    : {
        y: -3,
        scale: 1.02,
        boxShadow: "0 12px 30px rgba(0, 0, 0, 0.15)",
      };

  const tapAnimation = shouldReduceMotion
    ? {}
    : {
        scale: 0.98,
      };

  return (
    <motion.div
      whileHover={hoverAnimation}
      whileTap={tapAnimation}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`magnetic-button-wrapper ${className}`}
      style={{ display: "inline-block" }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
