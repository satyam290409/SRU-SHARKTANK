import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  value, 
  duration = 1, 
  prefix = '', 
  suffix = '',
  className = ''
}) => {
  const [hasMounted, setHasMounted] = useState(false);
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const displayValue = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      spring.set(value);
    }
  }, [value, hasMounted, spring]);

  return (
    <span className={className}>
      {prefix}
      <motion.span>{displayValue}</motion.span>
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
