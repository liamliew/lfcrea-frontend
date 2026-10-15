import { useEffect, useRef, useState } from 'react';
import { ModalOverlay, Modal, Dialog } from 'react-aria-components';
import LatticeLoader from './LatticeLoader';
import { loadCorsImage, logoTone, regionTone, shouldInvert } from '../lib/watermarkContrast';
import './Lightbox.css';

export default function Lightbox({ preview, original, alt, fileName, watermark, onClose }) {
  const [src, setSrc] = useState(null);
  const [percent, setPercent] = useState(null);
  const [invert, setInvert] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [markReady, setMarkReady] = useState(false);
  const previewRef = useRef(null);
  const markRef = useRef(null);

  useEffect(() => {
    if (!watermark || !previewReady || !markReady) return undefined;
    let cancelled = false;
    Promise.all([loadCorsImage(preview), loadCorsImage(watermark)]).then(([photo, logo]) => {
      const photoEl = previewRef.current;
      const markEl = markRef.current;
      if (cancelled || !photo || !logo || !photoEl || !markEl) return;
      const pr = photoEl.getBoundingClientRect();
      const mr = markEl.getBoundingClientRect();
      const scale = photo.naturalWidth / Math.max(1, pr.width);
      const pad = 8;
      const corner = regionTone(
        photo,
        (mr.left - pr.left - pad) * scale,
        (mr.top - pr.top - pad) * scale,
        (mr.width + pad * 2) * scale,
        (mr.height + pad * 2) * scale
      );
      setInvert(shouldInvert(logoTone(logo), corner));
    });
    return () => { cancelled = true; };
  }, [watermark, preview, previewReady, markReady]);

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
        <div className="lightbox-backdrop" onClick={onClose} aria-hidden="true" />
        <Dialog className="lightbox-dialog" aria-label={alt}>
          <button className="lightbox-close" onClick={onClose} aria-label="Close">
            ×
          </button>
          <img
            ref={previewRef}
            src={preview}
            alt={alt}
            className="lightbox-img"
            onLoad={() => setPreviewReady(true)}
          />
          {src && (
            <img src={src} alt={alt} className="lightbox-img lightbox-img--original" />
          )}
          {watermark && (
            <img
              ref={markRef}
              src={watermark}
              alt=""
              className={`lightbox-watermark${invert ? ' is-inverted' : ''}`}
              draggable={false}
              onLoad={() => setMarkReady(true)}
            />
          )}
          {fileName && <span className="lightbox-caption">{fileName}</span>}
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
