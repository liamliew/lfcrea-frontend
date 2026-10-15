import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Masonry from '../components/Masonry';
import LatticeLoader from '../components/LatticeLoader';
import { categories, toMasonryItems } from '../services/portfolioAssets';
import './Portfolio.css';

export default function Portfolio() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    let cancelled = false;
    toMasonryItems(
      categories.map((cat) => ({
        id: cat.slug,
        url: cat.images[Math.floor(Math.random() * cat.images.length)].url,
        label: cat.name,
        to: `/portfolio/${cat.slug}`,
      })),
      (done, total) => { if (!cancelled) setProgress({ done, total }); }
    ).then((list) => {
      if (!cancelled) setItems(list);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="pf-page">
      <header className="pf-page-header">
        <h1 className="pf-page-title">Portfolio</h1>
      </header>
      {categories.length === 0 ? (
        <p className="pf-page-empty">No work to show yet. Check back soon.</p>
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
          {items.length > 0 && (
            <Masonry items={items} onItemClick={(item) => navigate(item.to)} />
          )}
        </div>
      )}
    </div>
  );
}
