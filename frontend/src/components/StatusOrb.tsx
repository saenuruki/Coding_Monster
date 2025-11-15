import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface StatusOrbProps {
  value: number;
  maxValue?: number;
  icon: LucideIcon;
  label: string;
  color: string;
  glowColor: string;
}

export function StatusOrb({ 
  value, 
  maxValue = 100, 
  icon: Icon, 
  label, 
  color,
  glowColor 
}: StatusOrbProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(value);

  // Smooth spring animation for value changes
  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 20,
  });

  // Transform spring value to actual display value
  useEffect(() => {
    springValue.set(value);
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(Math.round(latest));
    });
    return unsubscribe;
  }, [value, springValue]);

  const percentage = (value / maxValue) * 100;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine status based on value
  let statusColor = color;
  let pulseIntensity = 1;
  
  if (value < 30) {
    statusColor = '#ef4444'; // red
    pulseIntensity = 1.5;
  } else if (value < 50) {
    statusColor = '#f59e0b'; // amber
    pulseIntensity = 1.2;
  }

  return (
    <motion.div
      className="relative flex flex-col items-center"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', delay: 0.1 }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-xl"
        style={{
          background: glowColor,
          opacity: 0.3,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2 * pulseIntensity,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* SVG Circle Progress */}
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r="45"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="6"
            fill="none"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx="48"
            cy="48"
            r="45"
            stroke={statusColor}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 8px ${glowColor})`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="h-6 w-6 text-white mb-1" style={{ color: statusColor }} />
          <motion.div
            className="text-white text-xl font-bold"
            key={displayValue}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {displayValue}
          </motion.div>
        </div>
      </div>

      {/* Label */}
      <div className="mt-2 text-white text-sm font-medium">{label}</div>

      {/* Warning indicator for low values */}
      {value < 30 && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        />
      )}
    </motion.div>
  );
}

