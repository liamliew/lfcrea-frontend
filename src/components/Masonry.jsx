import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';

import './Masonry.css';

const useMedia = (queries, values, defaultValue) => {
  const get = () => {
    if (typeof window === 'undefined') return defaultValue;
    return values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue;
  };

  const [value, setValue] = useState(get);

  useEffect(() => {
    const mediaQueries = queries.map(q => matchMedia(q));
    const handler = () => setValue(get);
    mediaQueries.forEach(query => query.addEventListener('change', handler));
    return () => mediaQueries.forEach(query => query.removeEventListener('change', handler));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries]);

  return value;
};

const useMeasure = () => {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
};

const preloadImages = async urls => {
  await Promise.all(
    urls.map(
      src =>
        new Promise(resolve => {
          const img = new Image();
          img.src = src;
          img.onload = img.onerror = () => resolve();
        })
    )
  );
};

const ENTRY_DISTANCE = 160;

const Masonry = ({
  items,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false,
  onItemClick
}) => {
  const columns = useMedia(
    ['(min-width:1500px)', '(min-width:1000px)', '(min-width:600px)', '(min-width:400px)'],
    [5, 4, 3, 2],
    1
  );

  const [containerRef, { width }] = useMeasure();
  const [imagesReady, setImagesReady] = useState(false);

  const getEntryOffset = () => {
    let direction = animateFrom;
    if (animateFrom === 'random') {
      const directions = ['top', 'bottom', 'left', 'right'];
      direction = directions[Math.floor(Math.random() * directions.length)];
    }
    switch (direction) {
      case 'top':
        return { x: 0, y: -ENTRY_DISTANCE };
      case 'left':
        return { x: -ENTRY_DISTANCE, y: 0 };
      case 'right':
        return { x: ENTRY_DISTANCE, y: 0 };
      case 'center':
        return { x: 0, y: 0 };
      default:
        return { x: 0, y: ENTRY_DISTANCE };
    }
  };

  useEffect(() => {
    preloadImages(items.map(i => i.img)).then(() => setImagesReady(true));
  }, [items]);

  const grid = useMemo(() => {
    if (!width) return [];

    const colHeights = new Array(columns).fill(0);
    const columnWidth = width / columns;

    return items.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = columnWidth * col;
      const height = child.height / 2;
      const y = colHeights[col];

      colHeights[col] += height;

      return { ...child, x, y, w: columnWidth, h: height };
    });
  }, [columns, items, width]);

  const gridHeight = grid.reduce((max, item) => Math.max(max, item.y + item.h), 0);

  const positionedIds = useRef(new Set());
  const enteredIds = useRef(new Set());

  // Positions only; the entrance animates the inner image so resizes never interrupt it
  useLayoutEffect(() => {
    if (!grid.length) return;

    grid.forEach(item => {
      const selector = `[data-key="${item.id}"]`;
      const props = { x: item.x, y: item.y, width: item.w, height: item.h };

      if (!positionedIds.current.has(item.id)) {
        gsap.set(selector, props);
        positionedIds.current.add(item.id);
      } else {
        gsap.to(selector, { ...props, duration, ease, overwrite: 'auto' });
      }
    });
  }, [grid, duration, ease]);

  useLayoutEffect(() => {
    if (!imagesReady || !grid.length) return;
    const fresh = grid.filter(item => !enteredIds.current.has(item.id));
    if (!fresh.length) return;
    fresh.forEach(item => enteredIds.current.add(item.id));

    fresh.forEach((item, index) => {
      const offset = getEntryOffset();
      gsap.fromTo(
        `[data-key="${item.id}"] .item-img`,
        {
          opacity: 0,
          x: offset.x,
          y: offset.y,
          scale: animateFrom === 'center' ? 0.6 : 1,
          ...(blurToFocus && { filter: 'blur(10px)' })
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          ...(blurToFocus && { filter: 'blur(0px)' }),
          duration: 0.7 + Math.random() * 0.5,
          ease: 'power3.out',
          delay: index * stagger + Math.random() * 0.35
        }
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, imagesReady]);

  const handleMouseEnter = (e, item) => {
    const element = e.currentTarget;
    const selector = `[data-key="${item.id}"]`;

    if (scaleOnHover) {
      gsap.to(selector, {
        scale: hoverScale,
        duration: 0.3,
        ease: 'power2.out'
      });
    }

    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay');
      if (overlay) {
        gsap.to(overlay, {
          opacity: 0.3,
          duration: 0.3
        });
      }
    }
  };

  const handleMouseLeave = (e, item) => {
    const element = e.currentTarget;
    const selector = `[data-key="${item.id}"]`;

    if (scaleOnHover) {
      gsap.to(selector, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    }

    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay');
      if (overlay) {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.3
        });
      }
    }
  };

  return (
    <div ref={containerRef} className="list" style={{ height: gridHeight }}>
      {grid.map(item => {
        return (
          <div
            key={item.id}
            data-key={item.id}
            className="item-wrapper"
            onClick={() =>
              onItemClick ? onItemClick(item) : window.open(item.url, '_blank', 'noopener')
            }
            onMouseEnter={e => handleMouseEnter(e, item)}
            onMouseLeave={e => handleMouseLeave(e, item)}
          >
            <div className="item-img" style={{ backgroundImage: `url(${item.img})`, opacity: 0 }}>
              {colorShiftOnHover && (
                <div
                  className="color-overlay"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(45deg, rgba(255,0,150,0.5), rgba(0,150,255,0.5))',
                    opacity: 0,
                    pointerEvents: 'none',
                    borderRadius: '8px'
                  }}
                />
              )}
              {item.label && <span className="item-label">{item.label}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Masonry;
