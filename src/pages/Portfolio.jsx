import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Masonry from '../components/Masonry';
import LatticeLoader from '../components/LatticeLoader';
import { loadCategories, toMasonryItems } from '../services/portfolioAssets';
import './Portfolio.css';

export default function Portfolio() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    let cancelled = false;
    loadCategories()
      .then((categories) =>
        toMasonryItems(
          categories
            .filter((cat) => cat.images.length > 0)
            .map((cat) => {
              const cover = cat.images[Math.floor(Math.random() * cat.images.length)];
              return {
                id: cat.slug,
                thumb: cover.thumb,
                label: cat.name,
                to: `/portfolio/${cat.slug}`,
              };
            }),
          (done, total) => { if (!cancelled) setProgress({ done, total }); }
        )
      )
      .then((list) => {
        if (cancelled) return;
        setItems(list);
        setStatus(list.length ? 'ready' : 'empty');
      })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="pf-page">
      <header className="pf-page-header">
        <h1 className="pf-page-title">Portfolio</h1>
      </header>
      {status === 'empty' && (
        <p className="pf-page-empty">No work to show yet. Check back soon.</p>
      )}
      {status === 'error' && (
        <p className="pf-page-empty">Could not load the portfolio. Please try again later.</p>
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
          <Masonry items={items} animateFrom="bottom" stagger={0.12} onItemClick={(item) => navigate(item.to)} />
        </div>
      )}
    </div>
  );
}
