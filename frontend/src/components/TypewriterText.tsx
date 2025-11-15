import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
  skipable?: boolean;
}

export function TypewriterText({ 
  text, 
  speed = 30, 
  className = '', 
  onComplete,
  skipable = true 
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);

  useEffect(() => {
    if (isSkipped) {
      setDisplayText(text);
      setIsComplete(true);
      onComplete?.();
      return;
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (!isComplete && currentIndex === text.length) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, speed, isComplete, onComplete, isSkipped]);

  const handleSkip = () => {
    if (skipable && !isComplete) {
      setIsSkipped(true);
    }
  };

  return (
    <div className="relative" onClick={handleSkip}>
      <motion.p
        className={`${className} ${skipable && !isComplete ? 'cursor-pointer' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {displayText}
        {!isComplete && (
          <motion.span
            className="inline-block ml-0.5 w-2 h-5 bg-white"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </motion.p>
      
      {skipable && !isComplete && (
        <motion.div
          className="absolute -bottom-6 right-0 text-white/40 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Click to skip
        </motion.div>
      )}
    </div>
  );
}

