import { useState, useEffect, useRef } from 'react';

/**
 * IntersectionObserver hook — fires once when element enters viewport.
 * @param {{ threshold?: number, triggerOnce?: boolean, rootMargin?: string }} options
 * @returns {[React.RefObject, boolean]}
 */
export default function useInView({ threshold = 0.15, triggerOnce = true, rootMargin = '0px' } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (triggerOnce) observer.unobserve(el);
        } else if (!triggerOnce) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, triggerOnce, rootMargin]);

  return [ref, inView];
}
