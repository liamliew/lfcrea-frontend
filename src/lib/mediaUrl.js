export function mediaUrl(path) {
  const base = import.meta.env.VITE_MINIO_PUBLIC_URL;
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${base}/${path}`;
}
