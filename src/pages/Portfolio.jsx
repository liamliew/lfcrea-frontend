import { useState, useEffect, useRef } from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-aria-components';
import { twMerge } from 'tailwind-merge';
import { gsap } from 'gsap';
import { getPortfolioCategories, getPortfolioItems } from '../services/portfolioService';
import PortfolioCard from '../components/Portfolio/PortfolioCard';
import PortfolioModal from '../components/Portfolio/PortfolioModal';
import { mediaUrl } from '../lib/mediaUrl';
import './Portfolio.css';

function SkeletonGrid() {
  return (
    <div className="pf-page-skeleton-grid">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="pf-page-skeleton-card" />
      ))}
    </div>
  );
}

function CategoryPanel({ category, items, onCardClick }) {
  const wrapperRef = useRef(null);
  const coverUrl = mediaUrl(category.cover_image_url);

  useEffect(() => {
    if (wrapperRef.current) {
      gsap.fromTo(
        wrapperRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <div ref={wrapperRef}>
      <div
        className={twMerge('pf-page-cat-header', !coverUrl && 'pf-page-cat-header--plain')}
        style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined}
      >
        <div className="pf-page-cat-header-overlay">
          <h1 className="pf-page-cat-title">{category.label}</h1>
          {category.description && (
            <p className="pf-page-cat-desc">{category.description}</p>
          )}
        </div>
      </div>
      <div className="pf-page-grid-area">
        {items.length === 0 ? (
          <p className="pf-page-empty">
            No {category.label.toLowerCase()} work to show yet. Check back soon.
          </p>
        ) : (
          <div className="pf-page-grid">
            {items.map((item) => (
              <PortfolioCard key={item.id} item={item} onClick={() => onCardClick(item)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    getPortfolioCategories().then(({ data }) => {
      if (data?.length) {
        setCategories(data);
        setActiveCategory(data[0]);
      } else {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!activeCategory) return;
    let cancelled = false;
    setLoading(true);
    getPortfolioItems(activeCategory.slug).then(({ data, error }) => {
      if (cancelled) return;
      if (!error) setItems(data ?? []);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [activeCategory]);

  if (!categories.length) return null;

  return (
    <div className="pf-page">
      <Tabs
        selectedKey={activeCategory?.slug ?? ''}
        onSelectionChange={(key) => {
          const cat = categories.find((c) => c.slug === key);
          if (cat) setActiveCategory(cat);
        }}
        className="pf-page-tabs"
      >
        <div className="pf-page-nav">
          <TabList className="pf-page-tablist" aria-label="Portfolio categories">
            {categories.map((cat) => (
              <Tab
                key={cat.slug}
                id={cat.slug}
                className={({ isSelected }) =>
                  twMerge('pf-page-tab', isSelected && 'pf-page-tab--active')
                }
              >
                {cat.label}
              </Tab>
            ))}
          </TabList>
        </div>

        {categories.map((cat) => (
          <TabPanel key={cat.slug} id={cat.slug} className="pf-page-tabpanel">
            {loading && cat.slug === activeCategory?.slug && <SkeletonGrid />}
            {!loading && cat.slug === activeCategory?.slug && (
              <CategoryPanel
                category={cat}
                items={items}
                onCardClick={setSelectedItem}
              />
            )}
          </TabPanel>
        ))}
      </Tabs>

      {selectedItem && (
        <PortfolioModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
