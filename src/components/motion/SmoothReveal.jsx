import React, { useContext } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { StaggerContext } from './StaggerGroup';

export const SmoothReveal = ({
  children,
  delay = 0,
  direction = 'up',
  distance = 40,
  duration = 0.8,
  className = '',
  viewportMargin = "-100px",
  once = false,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();
  const isStaggered = useContext(StaggerContext);

  let x = 0;
  let y = 0;
  if (!shouldReduceMotion) {
    const offset = Number(distance);
    if (direction === 'up') y = offset;
    else if (direction === 'down') y = -offset;
    else if (direction === 'left') x = offset;
    else if (direction === 'right') x = -offset;
  }

  const variants = {
    hidden: { 
      opacity: 0,
      x: x,
      y: y
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: duration,
        ease: [0.22, 1, 0.36, 1], // ease-premium
        delay: shouldReduceMotion ? 0 : delay
      }
    }
  };

  // If inside a StaggerGroup, let the parent control initial/whileInView states
  const animationProps = isStaggered 
    ? {} 
    : {
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: once, margin: viewportMargin }
      };

  return (
    <motion.div
      variants={variants}
      className={className}
      {...animationProps}
      {...props}
    >
      {children}
    </motion.div>
  );
};
