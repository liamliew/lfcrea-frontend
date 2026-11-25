import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar/Navbar'
import PageLoader from './components/PageLoader'
import Footer from './components/Footer/Footer'
import AnimatedContent from './components/AnimatedContent'
import { SERVICES } from './data/servicesData'

const Home = lazy(() => import('./pages/Home'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const PortfolioCategory = lazy(() => import('./pages/PortfolioCategory'));
const Profile = lazy(() => import('./pages/Profile'));
const Service = lazy(() => import('./pages/Service'));
const Booking = lazy(() => import('./pages/Booking'));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Fade({ children }) {
  const { pathname } = useLocation();
  return (
    <AnimatedContent key={pathname} distance={0} duration={0.6} ease="power2.out" trigger="mount">
      {children}
    </AnimatedContent>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Fade><Home /></Fade>} />
          <Route path="/portfolio" element={<Fade><Portfolio /></Fade>} />
          {SERVICES.map((service) => (
            <Route
              key={service.slug}
              path={`/services/${service.slug}`}
              element={<Service title={service.label} heading={service.heading} mobileHeading={service.mobileHeading} tech={service.tech} body={service.body} person={service.person} />}
            />
          ))}
          <Route path="/profile/:slug" element={<Fade><Profile /></Fade>} />
          <Route path="/booking" element={<Fade><Booking /></Fade>} />
          <Route path="/portfolio/:category" element={<Fade><PortfolioCategory /></Fade>} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  )
}
