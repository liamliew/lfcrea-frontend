import { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { getInstagramPosts } from '../../services/instagramService';
import { mediaUrl } from '../../lib/mediaUrl';
import './InstagramCarousel.css';

function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

export default function InstagramCarousel() {
  const [posts, setPosts] = useState([]);
  const trackRef = useRef(null);
  const tweenRef = useRef(null);

  useEffect(() => {
    getInstagramPosts().then(({ data }) => {
      if (data?.length) setPosts(data);
    });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!posts.length || !track) return;

    const halfWidth = track.scrollWidth / 2;
    if (halfWidth <= 0) return;

    tweenRef.current = gsap.to(track, {
      x: -halfWidth,
      duration: halfWidth / 60,
      ease: 'none',
      repeat: -1,
    });

    return () => {
      tweenRef.current?.kill();
      gsap.set(track, { x: 0 });
    };
  }, [posts]);

  const handleMouseEnter = useCallback(() => tweenRef.current?.pause(), []);
  const handleMouseLeave = useCallback(() => tweenRef.current?.resume(), []);

  if (!posts.length) return null;

  const doubled = [...posts, ...posts];

  return (
    <section className="ig-carousel-section">
      <div
        className="ig-carousel-viewport"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div ref={trackRef} className="ig-carousel-track">
          {doubled.map((post, i) => (
            <a
              key={i}
              href={post.post_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ig-carousel-card"
              aria-label={post.caption || 'View Instagram post'}
            >
              <img
                src={mediaUrl(post.thumbnail_url)}
                alt={post.caption || ''}
                className="ig-carousel-img"
                draggable={false}
              />
              <div className="ig-carousel-overlay">
                <InstagramIcon />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
