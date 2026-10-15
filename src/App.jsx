import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar/Navbar'
import PageLoader from './components/PageLoader'

const Home = lazy(() => import('./pages/Home'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const PortfolioCategory = lazy(() => import('./pages/PortfolioCategory'));
const Booking = lazy(() => import('./pages/Booking'));

export default function App() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/portfolio/:category" element={<PortfolioCategory />} />
        </Routes>
      </Suspense>
    </>
  )
}
