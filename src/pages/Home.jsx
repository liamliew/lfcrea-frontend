import { useState, useEffect, lazy, Suspense } from 'react'
import PageLoader from '../components/PageLoader'
import { Link } from 'react-router-dom'
import DomeGallery from '../components/DomeGallery'
import GradientText from '../components/GradientText'
import TeamSection from '../components/TeamSection'
import FAQSimple from '../components/FAQSimple'
import InstagramCarousel from '../components/InstagramCarousel/InstagramCarousel'
import AboutUs from '../components/AboutUs/AboutUs'
import PhotographySection from '../components/PhotographySection/PhotographySection'

const PortfolioGrid = lazy(() => import('../components/Portfolio/PortfolioGrid'));

const HERO_GRADIENT_COLORS = ['#5227FF', '#FF9FFC', '#B19EEF'];

export default function Home() {
  const [segments, setSegments] = useState(typeof window !== 'undefined' && window.innerWidth < 768 ? 16 : 34);

  useEffect(() => {
    const handleResize = () => {
      setSegments(window.innerWidth < 768 ? 16 : 34);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app-container">
<div className="section first-section">
        <DomeGallery
          fit={0.6}
          minRadius={600}
          maxVerticalRotationDeg={0}
          segments={segments}
          dragDampening={2}
          grayscale={false}
        />
        <div className="hero-content">
          <h1 className="middle-header">
            We chase{' '}
            <GradientText
              colors={HERO_GRADIENT_COLORS}
              animationSpeed={6.5}
              showBorder={false}
            >
              Emotions
            </GradientText>
          </h1>
          <p className="hero-tagline">
            Photography &amp; videography for the moments that matter —<br />
            based in Malaysia, run by students.
          </p>
          <div className="hero-buttons">
            <a
              href="https://lfcrea.setmore.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-btn hero-btn-primary"
            >
              Book us
            </a>
          </div>
        </div>
      </div>
<AboutUs />
      <PhotographySection />
      <InstagramCarousel />
      <Suspense fallback={<PageLoader />}>
        <PortfolioGrid />
      </Suspense>
      <TeamSection />
      <FAQSimple />
    </div>
  )
}
