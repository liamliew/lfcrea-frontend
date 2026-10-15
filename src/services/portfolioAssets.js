const modules = import.meta.glob(
  '/src/assets/portfolio/*/*.{jpg,jpeg,png,webp}',
  { eager: true, query: '?url', import: 'default' }
);

const byCategory = {};
for (const [path, url] of Object.entries(modules)) {
  const [, , , , folder, file] = path.split('/');
  (byCategory[folder] ??= []).push({ file, url });
}

export const categories = Object.keys(byCategory)
  .sort((a, b) => a.localeCompare(b))
  .map((name) => {
    const images = byCategory[name].sort((a, b) =>
      a.file.localeCompare(b.file, undefined, { numeric: true })
    );
    return { name, slug: encodeURIComponent(name), images };
  });

export function getCategory(slug) {
  return categories.find((c) => c.slug === slug);
}

export function toMasonryItems(entries, onProgress) {
  let done = 0;
  return Promise.all(
    entries.map(
      ({ id, url, label, to }) =>
        new Promise((resolve) => {
          const el = new Image();
          el.onload = el.onerror = () => {
            onProgress?.(++done, entries.length);
            resolve({
              id,
              img: url,
              url,
              label,
              to,
              height: el.naturalWidth ? (el.naturalHeight / el.naturalWidth) * 600 : 400,
            });
          };
          el.src = url;
        })
    )
  );
}
