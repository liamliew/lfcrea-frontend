const BASE = (import.meta.env.VITE_MEDIA_URL ?? '').replace(/\/$/, '');

const toUrl = (key) => `${BASE}/${key.split('/').map(encodeURIComponent).join('/')}`;

let cache;

export function loadCategories() {
  cache ??= fetch(`${BASE}/portfolio/manifest.json`)
    .then((res) => {
      if (!res.ok) throw new Error(`Manifest request failed: ${res.status}`);
      return res.json();
    })
    .then((data) =>
      data.categories.map((cat) => ({
        name: cat.name,
        slug: encodeURIComponent(cat.name),
        images: cat.images.map((img) => ({
          file: img.file,
          thumb: toUrl(img.thumb),
          full: toUrl(img.full),
        })),
      }))
    )
    .catch((err) => {
      cache = undefined;
      throw err;
    });
  return cache;
}

export function toMasonryItems(entries, onProgress) {
  let done = 0;
  return Promise.all(
    entries.map(
      ({ id, thumb, full, label, to }) =>
        new Promise((resolve) => {
          const el = new Image();
          el.onload = el.onerror = () => {
            onProgress?.(++done, entries.length);
            resolve({
              id,
              img: thumb,
              url: full ?? thumb,
              label,
              to,
              height: el.naturalWidth ? (el.naturalHeight / el.naturalWidth) * 600 : 400,
            });
          };
          el.src = thumb;
        })
    )
  );
}
