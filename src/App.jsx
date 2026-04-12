import { useState, useEffect } from 'react'
import './App.css'
import DomeGallery from './components/DomeGallery'
import StaggeredMenu from './components/StaggeredMenu'
import GradientText from './components/GradientText'
import TestimonialCarousel from './components/TestimonialCarousel'
import TeamSection from './components/TeamSection'
import FAQSimple from './components/FAQSimple'

const menuItems = [
  { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
  { label: 'Booking', ariaLabel: 'Book our services', link: 'https://lfcrea.setmore.com' },
  { label: 'Services', ariaLabel: 'View our services', link: '/services' },
  { label: 'Contact', ariaLabel: 'Get in touch', link: '/contact' }
];

const socialItems = [
  { label: 'Twitter', link: 'https://twitter.com' },
  { label: 'GitHub', link: 'https://github.com' },
  { label: 'LinkedIn', link: 'https://linkedin.com' }
];

export default function App() {
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
      <a href="https://lfcrea.setmore.com" className="sticky-book-btn">
        <span>book</span>
      </a>
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
              colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
              animationSpeed={6.5}
              showBorder={false}
            >
              Emotions
            </GradientText>
          </h1>
        </div>
      </div>
      <div className="section second-section">
        <h2 className="sub-header">For as low as RM70 an hour, you'll get</h2>
        <div className="cards-container">
          <div className="card">
            <h3 className="card-header">Professional Photographs</h3>
            <p className="card-content">Professional grade photos for your event, capturing the emotions, actions and milestones of your events.</p>
          </div>
          <div className="card">
            <h3 className="card-header">Hooking Video</h3>
            <p className="card-content">2 videos of your choice. Make reel-style promotional videos, or stick it the old-fashioned way, with high quality advertisements.</p>
          </div>
          <div className="card">
            <h3 className="card-header">Live Broadcast</h3>
            <p className="card-content">Need to stream your event to the world? We can provide in house live production, including for big screens. Just provide a room, and we'll do the rest. (T&C Apply)</p>
          </div>
        </div>
      </div>
      <div className="section third-section">
        <h2 className="sub-header">Here's what our clients complained about</h2>
        <TestimonialCarousel />
      </div>
      <TeamSection />
      <FAQSimple />
      <StaggeredMenu
        position="right"
        items={menuItems}
        socialItems={socialItems}
        displaySocials
        displayItemNumbering={true}
        menuButtonColor="#ffffff"
        openMenuButtonColor="#000000"
        changeMenuColorOnOpen={true}
        colors={['#B19EEF', '#5227FF']}
        logoUrl="./src/assets/lfcLogo.svg"
        accentColor="#000000"
        onMenuOpen={() => console.log('Menu opened')}
        onMenuClose={() => console.log('Menu closed')}
        isFixed={true}
      />
    </div>
  )
}
