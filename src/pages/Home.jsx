import { useState, useEffect, lazy, Suspense } from 'react'
import DomeGallery from '../components/DomeGallery'
import GradientText from '../components/GradientText'
import TeamSection from '../components/TeamSection'
import FAQSimple from '../components/FAQSimple'
import InstagramCarousel from '../components/InstagramCarousel/InstagramCarousel'
import AboutUs from '../components/AboutUs/AboutUs'

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
        <div className="middle-header-container">
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
        </div>
      </div>
<AboutUs />
      <InstagramCarousel />
      <Suspense fallback={<div style={{ minHeight: '400px' }} />}>
        <PortfolioGrid />
      </Suspense>
      <TeamSection />
      <FAQSimple />
    </div>
  )
}
