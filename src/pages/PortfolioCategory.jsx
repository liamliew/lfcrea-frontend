import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Masonry from '../components/Masonry';
import Lightbox from '../components/Lightbox';
import BackToTop from '../components/BackToTop';
import LatticeLoader from '../components/LatticeLoader';
import { loadCategories, loadWatermarks, streamMasonryItems, watermarkFor } from '../services/portfolioAssets';
import './Portfolio.css';

function shuffle(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function CategoryView({ category }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [watermarks, setWatermarks] = useState({});
  const [status, setStatus] = useState('loading');
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    loadWatermarks().then(setWatermarks).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    let stop = () => {};
    loadCategories()
      .then((categories) => {
        if (cancelled) return;
        const cat = categories.find((c) => c.slug === encodeURIComponent(category));
        if (!cat) return setStatus('missing');
        const entries = shuffle(cat.images).map((img) => ({
          id: img.file,
          thumb: img.thumb,
          full: img.full,
          original: img.original,
        }));
        stop = streamMasonryItems(entries, {
          onProgress: (done, total) => setProgress({ done, total }),
          onReady: (list) => {
            setItems(list);
            setStatus('ready');
          },
          onMore: (more) => setItems((prev) => [...prev, ...more]),
        });
      })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => {
      cancelled = true;
      stop();
    };
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
          <Masonry items={items} animateFrom="bottom" stagger={0.12} onItemClick={setSelected} />
        </div>
      )}
      <BackToTop />
      {selected && (
        <Lightbox
          preview={selected.url}
          original={selected.original}
          alt={`${category} ${selected.id}`}
          fileName={selected.id}
          watermark={watermarkFor(watermarks, selected.id)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

export default function PortfolioCategory() {
  const { category } = useParams();
  return <CategoryView key={category} category={category} />;
}
