import React, { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import logoImage from "../../assets/iris_logo.png";
import shadowImage from "../../assets/shadow1.png";

const OpeningSequence = ({ onComplete }) => {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const duration = shouldReduceMotion ? 100 : 3000;
    const timer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [shouldReduceMotion, onComplete]);

  const containerVariants = {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { 
      opacity: 0, 
      transition: { 
        duration: 1.0, 
        ease: [0.25, 1, 0.5, 1] 
      } 
    }
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.97, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 1.8,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.3
      }
    }
  };

  const shadowVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 0.20,
      transition: {
        duration: 1.8,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.3
      }
    }
  };

  return (
    <motion.div
      className="opening-sequence-overlay"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.img
        src={shadowImage}
        alt="IRIS Shadow"
        className="opening-sequence-shadow"
        variants={shouldReduceMotion ? {} : shadowVariants}
        initial="hidden"
        animate="visible"
      />
      {/* Centered logo wrapper */}
      <div className="opening-sequence-logo-wrap">
        <motion.img
          src={logoImage}
          alt="IRIS Logo"
          className="opening-sequence-logo"
          variants={shouldReduceMotion ? {} : logoVariants}
          initial="hidden"
          animate="visible"
        />
      </div>
    </motion.div>
  );
};

export default OpeningSequence;
