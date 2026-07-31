import { useEffect, useRef, useState } from 'react';

/**
 * useScrollAnimation — adds .ss-visible class when element enters viewport
 *
 * @param {Object} options
 * @param {number} options.threshold   - 0..1, how much of element must be visible (default 0.12)
 * @param {string} options.rootMargin  - IntersectionObserver rootMargin (default '0px 0px -60px 0px')
 * @param {boolean} options.once       - only trigger once (default true)
 *
 * @returns {{ ref, isVisible }}
 *
 * Usage:
 *   const { ref, isVisible } = useScrollAnimation();
 *   <div ref={ref} className={`ss-animate ${isVisible ? 'ss-visible' : ''}`}>
 */
const useScrollAnimation = ({
  threshold = 0.12,
  rootMargin = '0px 0px -60px 0px',
  once = true
} = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(element);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
};

/**
 * useScrollAnimationGroup — efficiently observes multiple children via a parent ref
 * Adds .ss-visible to each child when it enters the viewport.
 *
 * @param {string} childSelector  - CSS selector for animated children (default '.ss-animate, .ss-animate-left, .ss-animate-right, .ss-animate-scale')
 *
 * @returns {{ groupRef }}
 *
 * Usage:
 *   const { groupRef } = useScrollAnimationGroup();
 *   <div ref={groupRef}>
 *     <div className="ss-animate ss-delay-1">...</div>
 *     <div className="ss-animate ss-delay-2">...</div>
 *   </div>
 */
export const useScrollAnimationGroup = ({
  childSelector = '.ss-animate, .ss-animate-left, .ss-animate-right, .ss-animate-scale',
  threshold = 0.1,
  rootMargin = '0px 0px -40px 0px',
} = {}) => {
  const groupRef = useRef(null);

  useEffect(() => {
    const container = groupRef.current;
    if (!container) return;

    const children = container.querySelectorAll(childSelector);
    const observers = [];

    children.forEach((child) => {
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ss-visible');
            obs.unobserve(entry.target);
          }
        },
        { threshold, rootMargin }
      );
      obs.observe(child);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, [childSelector, threshold, rootMargin]);

  return { groupRef };
};

export default useScrollAnimation;
