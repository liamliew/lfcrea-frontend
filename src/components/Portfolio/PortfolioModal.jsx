import { useCallback, useEffect, useRef } from 'react';
import { ModalOverlay, Modal, Dialog } from 'react-aria-components';
import { gsap } from 'gsap';
import { mediaUrl } from '../../lib/mediaUrl';
import './PortfolioModal.css';

export default function PortfolioModal({ item, onClose }) {
  const innerRef = useRef(null);

  useEffect(() => {
    if (innerRef.current) {
      gsap.fromTo(
        innerRef.current,
        { opacity: 0, scale: 0.95, y: 24 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power3.out' }
      );
    }
  }, []);

  const handleClose = useCallback(() => {
    if (innerRef.current) {
      gsap.to(innerRef.current, {
        opacity: 0,
        scale: 0.95,
        y: 24,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  }, [onClose]);

  return (
    <ModalOverlay
      isOpen
      onOpenChange={(open) => { if (!open) handleClose(); }}
      isDismissable
      className="portfolio-modal-overlay"
    >
      <Modal className="portfolio-modal">
        <Dialog className="portfolio-modal-dialog" aria-label={item.title}>
          <div ref={innerRef} className="portfolio-modal-inner">
            <button
              className="portfolio-modal-close"
              onClick={handleClose}
              aria-label="Close modal"
            >
              ×
            </button>
            {item.category === 'videography' ? (
              <video
                src={mediaUrl(item.media_url)}
                className="portfolio-modal-media"
                controls
              />
            ) : (
              <img
                src={mediaUrl(item.media_url)}
                alt={item.title}
                className="portfolio-modal-media"
              />
            )}
            <div className="portfolio-modal-info">
              <h2 className="portfolio-modal-title">{item.title}</h2>
              {item.client && (
                <p className="portfolio-modal-client">{item.client}</p>
              )}
              {item.date && (
                <p className="portfolio-modal-date">
                  {new Date(item.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
              {item.description && (
                <p className="portfolio-modal-description">{item.description}</p>
              )}
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
