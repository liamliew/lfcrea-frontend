import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Masonry from '../components/Masonry';
import LatticeLoader from '../components/LatticeLoader';
import { getCategory, toMasonryItems } from '../services/portfolioAssets';
import './Portfolio.css';

export default function PortfolioCategory() {
  const { category } = useParams();
  const cat = getCategory(encodeURIComponent(category));
  const [items, setItems] = useState([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    if (!cat) return;
    let cancelled = false;
    toMasonryItems(
      cat.images.map((img) => ({ id: img.file, url: img.url })),
      (done, total) => { if (!cancelled) setProgress({ done, total }); }
    )
      .then((list) => {
        if (!cancelled) setItems(list);
      });
    return () => { cancelled = true; };
  }, [cat]);

  return (
    <div className="pf-page">
      <header className="pf-page-header">
        <Link to="/portfolio" className="pf-back">Back to portfolio</Link>
        <h1 className="pf-page-title">{cat ? cat.name : 'Not found'}</h1>
      </header>
      {!cat ? (
        <p className="pf-page-empty">This category does not exist.</p>
      ) : (
        <div className="pf-masonry">
          {items.length === 0 && (
            <div className="pf-loader">
              <LatticeLoader
                label={`${progress.done}/${progress.total} images`}
                showTimer={false}
              />
            </div>
          )}
          {items.length > 0 && <Masonry items={items} />}
        </div>
      )}
    </div>
  );
}
