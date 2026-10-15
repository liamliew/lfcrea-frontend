import { useEffect, useState } from 'react';
import { ModalOverlay, Modal, Dialog } from 'react-aria-components';
import LatticeLoader from './LatticeLoader';
import './Lightbox.css';

export default function Lightbox({ preview, original, alt, onClose }) {
  const [src, setSrc] = useState(null);
  const [percent, setPercent] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl;

    (async () => {
      try {
        const res = await fetch(original, { signal: controller.signal });
        if (!res.ok || !res.body) throw new Error('Download failed');
        const total = Number(res.headers.get('content-length')) || 0;
        const reader = res.body.getReader();
        const chunks = [];
        let received = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          if (total) setPercent(Math.min(100, Math.round((received / total) * 100)));
        }
        objectUrl = URL.createObjectURL(new Blob(chunks, { type: res.headers.get('content-type') ?? 'image/jpeg' }));
        setSrc(objectUrl);
      } catch (err) {
        if (err.name !== 'AbortError') setSrc(original);
      }
    })();

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [original]);

  return (
    <ModalOverlay
      isOpen
      isDismissable
      onOpenChange={(open) => { if (!open) onClose(); }}
      className="lightbox-overlay"
    >
      <Modal className="lightbox-modal">
        <Dialog className="lightbox-dialog" aria-label={alt}>
          <button className="lightbox-close" onClick={onClose} aria-label="Close">
            ×
          </button>
          <img src={preview} alt={alt} className="lightbox-img" />
          {src && (
            <img src={src} alt={alt} className="lightbox-img lightbox-img--original" />
          )}
          {!src && (
            <span className="lightbox-status">
              <LatticeLoader
                label={percent == null ? 'Loading' : `${percent}%`}
                showTimer={false}
              />
            </span>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
