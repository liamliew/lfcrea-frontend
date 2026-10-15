const BASE = (import.meta.env.VITE_MEDIA_URL ?? '').replace(/\/$/, '');

const toUrl = (key) => `${BASE}/${key.split('/').map(encodeURIComponent).join('/')}`;

let cache;

function loadManifest() {
  cache ??= fetch(`${BASE}/portfolio/manifest.json`)
    .then((res) => {
      if (!res.ok) throw new Error(`Manifest request failed: ${res.status}`);
      return res.json();
    })
    .catch((err) => {
      cache = undefined;
      throw err;
    });
  return cache;
}

export function loadCategories() {
  return loadManifest().then((data) =>
    data.categories.map((cat) => ({
      name: cat.name,
      slug: encodeURIComponent(cat.name),
      images: cat.images.map((img) => ({
        file: img.file,
        thumb: toUrl(img.thumb),
        full: toUrl(img.full),
        original: toUrl(`portfolio/${cat.name}/${img.file}`),
      })),
    }))
  );
}

// Map of lowercase name to watermark url
export function loadWatermarks() {
  return loadManifest().then((data) =>
    Object.fromEntries(
      Object.entries(data.watermarks ?? {}).map(([name, key]) => [name.toLowerCase(), toUrl(key)])
    )
  );
}

// Watermark matches the first word of the file name
export function watermarkFor(watermarks, fileName) {
  const word = String(fileName ?? '').split(/[\s_-]+/)[0].toLowerCase();
  return watermarks[word] ?? null;
}

export function toMasonryItems(entries, onProgress) {
  let done = 0;
  return Promise.all(
    entries.map(
      ({ id, thumb, full, original, label, to }) =>
        new Promise((resolve) => {
          const el = new Image();
          el.onload = el.onerror = () => {
            onProgress?.(++done, entries.length);
            resolve({
              id,
              img: thumb,
              url: full ?? thumb,
              original,
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

// Loads a first group, then the rest in the background
export function streamMasonryItems(
  entries,
  { initial = 24, timeoutMs = 10000, concurrency = 6, onProgress, onReady, onMore }
) {
  let cancelled = false;
  let ready = false;
  let timedOut = false;
  let done = 0;
  let flushTimer = null;
  const first = entries.slice(0, initial);
  const rest = entries.slice(initial);
  const initialItems = [];
  const late = [];

  const loadEntry = ({ id, thumb, full, original, label, to }) =>
    new Promise((resolve) => {
      const el = new Image();
      el.onload = el.onerror = () =>
        resolve({
          id,
          img: thumb,
          url: full ?? thumb,
          original,
          label,
          to,
          height: el.naturalWidth ? (el.naturalHeight / el.naturalWidth) * 600 : 400,
        });
      el.src = thumb;
    });

  const flush = () => {
    flushTimer = null;
    if (cancelled || !late.length) return;
    onMore?.(late.splice(0, late.length));
  };

  const addLate = (item) => {
    late.push(item);
    if (!flushTimer) flushTimer = setTimeout(flush, 250);
  };

  const loadRest = () => {
    const queue = [...rest];
    const worker = async () => {
      for (let entry = queue.shift(); entry && !cancelled; entry = queue.shift()) {
        addLate(await loadEntry(entry));
      }
    };
    for (let i = 0; i < concurrency; i++) worker();
  };

  const open = () => {
    if (ready || cancelled) return;
    ready = true;
    clearTimeout(timer);
    onReady?.(initialItems.slice());
    loadRest();
  };

  const timer = setTimeout(() => {
    timedOut = true;
    if (initialItems.length) open();
  }, timeoutMs);

  if (!first.length) open();
  first.forEach((entry) =>
    loadEntry(entry).then((item) => {
      if (cancelled) return;
      onProgress?.(++done, first.length);
      if (ready) return addLate(item);
      initialItems.push(item);
      if (initialItems.length === first.length || timedOut) open();
    })
  );

  return () => {
    cancelled = true;
    clearTimeout(timer);
    clearTimeout(flushTimer);
  };
}
