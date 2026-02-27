import React, { useState, useEffect, useRef } from 'react';

/**
 * Count-up number animation. When `active` flips to true, animates from 0 → value.
 * Uses requestAnimationFrame with cubic ease-out.
 */
const AnimatedNumber = ({ value, suffix = '', prefix = '', decimals = 0, duration = 800, active = true }) => {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!active || hasRun.current) return;
    hasRun.current = true;
    const start = performance.now();

    const animate = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // cubic ease-out
      setDisplay(value * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, value, duration]);

  return <>{prefix}{display.toFixed(decimals)}{suffix}</>;
};

export default AnimatedNumber;
