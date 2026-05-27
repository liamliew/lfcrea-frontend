import { useState, useEffect, useRef } from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-aria-components';
import { twMerge } from 'tailwind-merge';
import { gsap } from 'gsap';
import { getPortfolioItems, getAllCategories } from '../../services/portfolioService';
import PortfolioCard from './PortfolioCard';
import PortfolioModal from './PortfolioModal';
import './PortfolioGrid.css';

function SkeletonGrid() {
  return (
    <div className="portfolio-skeleton-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="portfolio-skeleton-card" />
      ))}
    </div>
  );
}

export default function PortfolioGrid() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const gridRef = useRef(null);

  useEffect(() => {
    getAllCategories().then((cats) => {
      if (cats.length > 0) {
        setCategories(cats);
        setActiveCategory(cats[0]);
      } else {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!activeCategory) return;
    let cancelled = false;
    setLoading(true);
    getPortfolioItems(activeCategory).then(({ data, error }) => {
      if (cancelled) return;
      if (!error) setItems(data ?? []);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [activeCategory]);

  useEffect(() => {
    if (!loading && gridRef.current) {
      gsap.fromTo(
        gridRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [loading]);

  if (categories.length === 0) return null;

  return (
    <section className="portfolio-section">
      <h2 className="portfolio-heading">Our Work</h2>
      <Tabs
        selectedKey={activeCategory}
        onSelectionChange={(key) => setActiveCategory(key)}
        className="portfolio-tabs-container"
      >
        <TabList className="portfolio-tablist" aria-label="Portfolio categories">
          {categories.map((cat) => (
            <Tab
              key={cat}
              id={cat}
              className={({ isSelected }) =>
                twMerge('portfolio-tab', isSelected && 'portfolio-tab--active')
              }
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Tab>
          ))}
        </TabList>

        {categories.map((cat) => (
          <TabPanel key={cat} id={cat} className="portfolio-tabpanel">
            <div ref={gridRef}>
              {loading ? (
                <SkeletonGrid />
              ) : items.length === 0 ? (
                <p className="portfolio-empty">
                  No {cat} work to show yet. Check back soon.
                </p>
              ) : (
                <div className="portfolio-grid">
                  {items.map((item) => (
                    <PortfolioCard
                      key={item.id}
                      item={item}
                      onClick={() => setSelectedItem(item)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabPanel>
        ))}
      </Tabs>

      {selectedItem && (
        <PortfolioModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </section>
  );
}
