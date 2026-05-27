import { mediaUrl } from '../../lib/mediaUrl';
import './PortfolioCard.css';

export default function PortfolioCard({ item, onClick }) {
  const thumb = mediaUrl(item.thumbnail_url);

  return (
    <button
      className="portfolio-card"
      onClick={onClick}
      aria-label={`View ${item.title}`}
    >
      <div className="portfolio-card-thumb">
        {thumb ? (
          <img
            src={thumb}
            alt={item.title}
            className="portfolio-card-img"
            loading="lazy"
          />
        ) : (
          <div className="portfolio-card-placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="portfolio-card-info">
        <p className="portfolio-card-title">{item.title}</p>
        {item.client && <p className="portfolio-card-client">{item.client}</p>}
      </div>
    </button>
  );
}
