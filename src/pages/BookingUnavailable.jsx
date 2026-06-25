import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './BookingUnavailable.css';

export default function BookingUnavailable() {
  const ref = useRef(null);

  useEffect(() => {
    gsap.fromTo(ref.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
  }, []);

  return (
    <div className="bku-page">
      <div className="bku-card" ref={ref}>
        <div className="bku-face">:(</div>

        <p className="bku-msg bku-msg--en">
          Sorry! Our booking system is unavailable at this time.{' '}
          Please contact us on WhatsApp:{' '}
          <a href="https://wa.me/601166767883" target="_blank" rel="noopener noreferrer" className="bku-link">
            +60 11 6676 7883
          </a>
        </p>

        <p className="bku-msg bku-msg--my">
          Maaf! Sistem tempahan kami tidak tersedia pada masa ini.{' '}
          Sila hubungi kami melalui WhatsApp:{' '}
          <a href="https://wa.me/601166767883" target="_blank" rel="noopener noreferrer" className="bku-link">
            +60 11 6676 7883
          </a>
        </p>
      </div>
    </div>
  );
}
