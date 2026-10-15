import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar/Navbar'
import PageLoader from './components/PageLoader'
import Footer from './components/Footer/Footer'
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

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/portfolio" element={<Portfolio />} />
          {SERVICES.map((service) => (
            <Route
              key={service.slug}
              path={`/services/${service.slug}`}
              element={<Service title={service.label} heading={service.heading} body={service.body} person={service.person} />}
            />
          ))}
          <Route path="/profile/:slug" element={<Profile />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/portfolio/:category" element={<PortfolioCategory />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  )
}
