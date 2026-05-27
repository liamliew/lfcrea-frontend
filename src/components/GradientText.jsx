import { useCallback, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './GradientText.css';

export default function GradientText({
  children,
  className = '',
  colors = ['#5227FF', '#FF9FFC', '#B19EEF'],
  animationSpeed = 8,
  showBorder = false,
  direction = 'horizontal',
  pauseOnHover = false,
  yoyo = true,
}) {
  const overlayRef = useRef(null);
  const textRef = useRef(null);
  const tweenRef = useRef(null);
  const pauseOnHoverRef = useRef(pauseOnHover);

  useEffect(() => {
    pauseOnHoverRef.current = pauseOnHover;
  }, [pauseOnHover]);

  useEffect(() => {
    const proxy = { p: 0 };

    const setPosition = (p) => {
      const pos = direction === 'vertical' ? `50% ${p}%` : `${p}% 50%`;
      if (overlayRef.current) overlayRef.current.style.backgroundPosition = pos;
      if (textRef.current) textRef.current.style.backgroundPosition = pos;
    };

    setPosition(0);

    tweenRef.current = gsap.to(proxy, {
      p: 100,
      duration: animationSpeed,
      ease: 'none',
      repeat: -1,
      yoyo,
      onUpdate: () => setPosition(proxy.p),
    });

    return () => {
      tweenRef.current.kill();
    };
  }, [animationSpeed, yoyo, direction]);

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHoverRef.current) tweenRef.current?.pause();
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHoverRef.current) tweenRef.current?.resume();
  }, []);

  const gradientAngle =
    direction === 'horizontal' ? 'to right' :
    direction === 'vertical' ? 'to bottom' :
    'to bottom right';
  const gradientColors = [...colors, colors[0]].join(', ');

  const gradientStyle = {
    backgroundImage: `linear-gradient(${gradientAngle}, ${gradientColors})`,
    backgroundSize:
      direction === 'horizontal' ? '300% 100%' :
      direction === 'vertical' ? '100% 300%' :
      '300% 300%',
    backgroundRepeat: 'repeat',
  };

  return (
    <div
      className={`animated-gradient-text ${showBorder ? 'with-border' : ''} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showBorder && (
        <div ref={overlayRef} className="gradient-overlay" style={gradientStyle} />
      )}
      <div ref={textRef} className="text-content" style={gradientStyle}>
        {children}
      </div>
    </div>
  );
}
