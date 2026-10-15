const SAMPLE = 64;

// Fetched fresh with CORS so a cached no-CORS copy cannot taint the canvas
export async function loadCorsImage(url) {
  try {
    const res = await fetch(url, { cache: 'reload' });
    if (!res.ok) return null;
    const objectUrl = URL.createObjectURL(await res.blob());
    return await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };
      img.src = objectUrl;
    });
  } catch {
    return null;
  }
}

const luma = (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

function pixels(img, sx, sy, sw, sh, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height).data;
}

// Average brightness of the logo, or null when it is colored or mid-tone
export function logoTone(img) {
  try {
    const ratio = img.naturalHeight / Math.max(1, img.naturalWidth) || 1;
    const w = SAMPLE;
    const h = Math.max(1, Math.round(SAMPLE * ratio));
    const data = pixels(img, 0, 0, img.naturalWidth || w, img.naturalHeight || h, w, h);
    let sum = 0;
    let sat = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      sum += luma(data[i], data[i + 1], data[i + 2]);
      sat += (Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2])) / 255;
      count += 1;
    }
    if (!count) return null;
    const tone = sum / count;
    if (sat / count > 0.3 || (tone > 0.3 && tone < 0.7)) return null;
    return tone;
  } catch {
    return null;
  }
}

// Average brightness of a region given in image pixels
export function regionTone(img, x, y, w, h) {
  try {
    const sx = Math.max(0, Math.floor(x));
    const sy = Math.max(0, Math.floor(y));
    const sw = Math.max(1, Math.min(img.naturalWidth - sx, Math.ceil(w)));
    const sh = Math.max(1, Math.min(img.naturalHeight - sy, Math.ceil(h)));
    const data = pixels(img, sx, sy, sw, sh, SAMPLE, SAMPLE);
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) sum += luma(data[i], data[i + 1], data[i + 2]);
    return sum / (data.length / 4);
  } catch {
    return null;
  }
}

// Invert only when a plain light or dark logo would blend into the corner
export function shouldInvert(logo, corner) {
  if (logo == null || corner == null) return false;
  return Math.abs(corner - logo) < 0.4;
}
