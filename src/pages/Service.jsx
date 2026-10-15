import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import ParticleText from '../components/ParticleText';
import { useQualityTier } from '../lib/useQualityTier';
import './Service.css';

export default function Service({ title, heading, body, person }) {
  const tier = useQualityTier();
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 768px)').matches);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 768px)');
    const onChange = (e) => setIsMobile(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return (
    <main className="service-page">
      {heading ? (
        <div className="service-heading">
          <ParticleText
            text={isMobile ? title.toUpperCase() : heading}
            particleSize={4}
            density={4}
            color="currentColor"
            highlightColor="#7c3aed"
            highlightMode="motion"
            shape="square"
            intro="gather"
            scatter={180}
            gatherDuration={1600}
            stagger={420}
            clickBurst
            burstStrength={1}
            pointerRepel={40}
            repelRadius={120}
            idleDrift={tier === 'low' ? 0 : 0.7}
            trigger="mount"
            fontSize={isMobile ? '40vw' : 'clamp(3rem, 12vw, 8rem)'}
            fontWeight={800}
            fontFamily="inherit"
            glow={tier === 'high'}
          />
          {person && (
            <div className="service-person">
              <Link to={`/profile/${person.slug}`} className="service-person-pill">
                <User size={16} strokeWidth={2} />
                <span>{person.name}</span>
              </Link>
            </div>
          )}
          {body && <p className="service-body">{body}</p>}
        </div>
      ) : (
        <h1 className="service-sr-title">{title}</h1>
      )}
    </main>
  );
}
