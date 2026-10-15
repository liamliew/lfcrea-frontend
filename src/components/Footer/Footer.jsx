import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
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
        <div className="site-footer-brand">
          <Link to="/" aria-label="Home" className="site-footer-logo">
            <img src="/lfcLogo.svg" alt="LF Creative" draggable={false} />
          </Link>
          <img src="/lfcLogo2.svg" alt="" className="site-footer-logo2" draggable={false} />
          <p className="site-footer-subsidiary">
            LF Creative is a subsidiary of LF Creative Media Services
          </p>
        </div>
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
      <address className="site-footer-contact">
        <a href="mailto:contact@lfcrea.com" className="site-footer-contact-link">
          <Mail size={16} aria-hidden="true" />
          contact@lfcrea.com
        </a>
        <a
          href="https://wa.me/601166767883"
          target="_blank"
          rel="noopener noreferrer"
          className="site-footer-contact-link"
        >
          <Phone size={16} aria-hidden="true" />
          +6011 6676 7883
        </a>
      </address>
      <p className="site-footer-copy">
        &copy; {new Date().getFullYear()} LF CREATIVE MEDIA SERVICES. All rights reserved.
      </p>
    </footer>
  );
}
