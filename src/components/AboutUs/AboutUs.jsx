import { Star } from 'lucide-react';
import './AboutUs.css';

const RATING = 3.8;
const TRUSTPILOT_URL = 'https://www.trustpilot.com/review/lfcrea.com';

// Placeholder; replace when ready
const ABOUT_IMAGE_SRC = `${(import.meta.env.VITE_MEDIA_URL ?? '').replace(/\/$/, '')}/homePhotos/photography-preview.webp`;

export default function AboutUs() {
  return (
    <section className="about-us-section">
      <div className="about-us-content">
        {ABOUT_IMAGE_SRC ? (
          <img
            src={ABOUT_IMAGE_SRC}
            alt="About us"
            className="about-us-img"
            draggable={false}
            loading="lazy"
          />
        ) : (
          <div className="about-us-img about-us-img-placeholder" aria-hidden="true" />
        )}
        <div className="about-us-body">
          <h2 className="about-us-title">About Us</h2>
          <p className="about-us-text">
            We are a team of passionate visual storytellers based in Malaysia,
            dedicated to capturing the moments that matter most. From intimate
            gatherings to large-scale productions, we bring creativity and
            precision to every frame — helping brands, businesses, and individuals
            tell their stories in ways that resonate and endure.
          </p>
          <a
            className="about-us-rating"
            href={TRUSTPILOT_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="about-us-label">Great</span>
            <span className="about-us-stars" role="img" aria-label={`Rated ${RATING} out of 5 on Trustpilot`}>
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="about-us-star"
                  style={{ '--fill': `${Math.min(1, Math.max(0, RATING - i)) * 100}%` }}
                >
                  <Star size={16} fill="currentColor" strokeWidth={0} />
                </span>
              ))}
            </span>
            <img src="/trustpilot.svg" alt="Trustpilot" className="about-us-trustpilot" draggable={false} />
          </a>
        </div>
      </div>
    </section>
  );
}
