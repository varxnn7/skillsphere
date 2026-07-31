import { useRef, useCallback } from 'react';

/**
 * use3DTilt — mouse-tracking 3D perspective tilt effect for cards
 *
 * @param {Object} options
 * @param {number} options.maxTilt       - max tilt in degrees (default 12)
 * @param {number} options.scale         - hover scale factor (default 1.03)
 * @param {number} options.perspective   - CSS perspective in px (default 900)
 * @param {number} options.transitionMs  - reset transition ms (default 400)
 *
 * @returns {{ tiltRef, onMouseMove, onMouseLeave }}
 *
 * Usage:
 *   const { tiltRef, onMouseMove, onMouseLeave } = use3DTilt();
 *   <div ref={tiltRef} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
 *     ...card content...
 *   </div>
 */
const use3DTilt = ({
  maxTilt = 12,
  scale = 1.03,
  perspective = 900,
  transitionMs = 400,
} = {}) => {
  const tiltRef = useRef(null);
  const animFrameRef = useRef(null);

  const onMouseMove = useCallback((e) => {
    const el = tiltRef.current;
    if (!el) return;

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    animFrameRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      const rotateX = (-dy / (rect.height / 2)) * maxTilt;
      const rotateY = (dx / (rect.width / 2)) * maxTilt;

      el.style.transition = 'transform 0.1s ease-out, box-shadow 0.15s ease';
      el.style.transform = `
        perspective(${perspective}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(${scale})
      `;
      el.style.boxShadow = `
        ${rotateY * -1.5}px ${rotateX * 1.5}px 40px rgba(99, 102, 241, 0.18),
        0 20px 60px rgba(0,0,0,0.08)
      `;
    });
  }, [maxTilt, scale, perspective]);

  const onMouseLeave = useCallback(() => {
    const el = tiltRef.current;
    if (!el) return;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    el.style.transition = `transform ${transitionMs}ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow ${transitionMs}ms ease`;
    el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`;
    el.style.boxShadow = '';
  }, [perspective, transitionMs]);

  return { tiltRef, onMouseMove, onMouseLeave };
};

export default use3DTilt;
