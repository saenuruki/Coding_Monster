import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CinematicTransitionProps {
  children: ReactNode;
  transitionKey: string | number;
  type?: 'fade' | 'slide' | 'scale' | 'cinema';
}

export function CinematicTransition({ 
  children, 
  transitionKey, 
  type = 'cinema' 
}: CinematicTransitionProps) {
  
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.5 },
    },
    slide: {
      initial: { x: 100, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -100, opacity: 0 },
      transition: { type: 'spring', stiffness: 100, damping: 20 },
    },
    scale: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 1.2, opacity: 0 },
      transition: { duration: 0.4 },
    },
    cinema: {
      initial: { 
        opacity: 0,
        scale: 0.95,
        y: 20,
      },
      animate: { 
        opacity: 1,
        scale: 1,
        y: 0,
      },
      exit: { 
        opacity: 0,
        scale: 1.05,
        y: -20,
      },
      transition: { 
        duration: 0.6,
        ease: [0.43, 0.13, 0.23, 0.96],
      },
    },
  };

  const currentVariant = variants[type];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={transitionKey}
        initial={currentVariant.initial}
        animate={currentVariant.animate}
        exit={currentVariant.exit}
        transition={currentVariant.transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

interface PageTransitionProps {
  children: ReactNode;
  pageKey: string | number;
}

export function PageTransition({ children, pageKey }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        className="relative z-[1]"
        initial={{ 
          opacity: 0,
          clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
        }}
        animate={{ 
          opacity: 1,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        }}
        exit={{ 
          opacity: 0,
          clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
        }}
        transition={{ 
          duration: 0.8,
          ease: [0.43, 0.13, 0.23, 0.96],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

