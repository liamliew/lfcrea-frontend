import { Link } from 'react-router-dom';
import './Footer.css';

const PAGES = [
  { label: 'Home', to: '/' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Booking', to: '/booking' },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <Link to="/" aria-label="Home" className="site-footer-logo">
          <img src="/lfcLogo.svg" alt="LF Creative" draggable={false} />
        </Link>
        <nav aria-label="Footer navigation">
          <ul className="site-footer-links">
            {PAGES.map((page) => (
              <li key={page.to}>
                <Link to={page.to} className="site-footer-link">{page.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="site-footer-copy">
        &copy; {new Date().getFullYear()} LF CREATIVE MEDIA SERVICES. All rights reserved.
      </p>
    </footer>
  );
}
