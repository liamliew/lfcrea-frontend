import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Masonry from '../components/Masonry';
import LatticeLoader from '../components/LatticeLoader';
import { loadCategories, toMasonryItems } from '../services/portfolioAssets';
import './Portfolio.css';

function CategoryView({ category }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    let cancelled = false;
    loadCategories()
      .then((categories) => {
        const cat = categories.find((c) => c.slug === encodeURIComponent(category));
        if (!cat) return null;
        return toMasonryItems(
          cat.images.map((img) => ({ id: img.file, thumb: img.thumb, full: img.full })),
          (done, total) => { if (!cancelled) setProgress({ done, total }); }
        );
      })
      .then((list) => {
        if (cancelled) return;
        if (!list) return setStatus('missing');
        setItems(list);
        setStatus('ready');
      })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [category]);

  return (
    <div className="pf-page">
      <header className="pf-page-header">
        <Link to="/portfolio" className="pf-back">Back to portfolio</Link>
        <h1 className="pf-page-title">{status === 'missing' ? 'Not found' : category}</h1>
      </header>
      {status === 'missing' && (
        <p className="pf-page-empty">This category does not exist.</p>
      )}
      {status === 'error' && (
        <p className="pf-page-empty">Could not load this category. Please try again later.</p>
      )}
      {status === 'loading' && (
        <div className="pf-loader">
          <LatticeLoader
            label={`${progress.done}/${progress.total} images`}
            showTimer={false}
          />
        </div>
      )}
      {status === 'ready' && (
        <div className="pf-masonry">
          <Masonry items={items} />
        </div>
      )}
    </div>
  );
}

export default function PortfolioCategory() {
  const { category } = useParams();
  return <CategoryView key={category} category={category} />;
}
