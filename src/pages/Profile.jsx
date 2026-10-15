import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import GradualBlur from '../components/GradualBlur';
import Lanyard from '../components/Lanyard';
import { useQualityTier } from '../lib/useQualityTier';
import { MEMBERS } from '../data/teamData';
import './Profile.css';

const FACE_W = 1024;
const FACE_H = 1440;
const FONT = '"KH Interference", sans-serif';

function drawFace(draw) {
  const canvas = document.createElement('canvas');
  canvas.width = FACE_W;
  canvas.height = FACE_H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#111';
  ctx.font = `400 48px ${FONT}`;
  draw(ctx);
  return canvas.toDataURL('image/png');
}

const STRAP_W = 2048;
const STRAP_H = 256;

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function tintedLogo(logo, color, size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(logo, 0, 0, size, size);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

async function buildStrap() {
  const logo = await loadImage('/lfcLogo.svg');
  const canvas = document.createElement('canvas');
  canvas.width = STRAP_W;
  canvas.height = STRAP_H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, STRAP_W, STRAP_H);
  if (logo) {
    const size = STRAP_H * 0.8;
    ctx.drawImage(logo, STRAP_W - size - 160, (STRAP_H - size) / 2, size, size);
  }
  return canvas.toDataURL('image/png');
}

async function buildFaces(handle) {
  try {
    await document.fonts.load(`400 48px ${FONT}`);
  } catch {
    // Fall back to default font
  }
  const mark = await loadImage('/lfcLogo2.svg');
  const backMark = await loadImage('/lfcLogo.svg');
  const front = drawFace((ctx) => {
    if (mark) ctx.drawImage(tintedLogo(mark, 'rgba(17, 17, 17, 0.12)', 160), 72, 72);
    ctx.textAlign = 'right';
    ctx.fillText(handle, FACE_W - 72, 130);
  });
  const back = drawFace((ctx) => {
    if (backMark) ctx.drawImage(tintedLogo(backMark, '#111', 520), (FACE_W - 520) / 2, FACE_H / 2 - 260);
    ctx.textAlign = 'center';
    ctx.fillText('lfcrea.com', FACE_W / 2, FACE_H - 96);
  });
  const strap = await buildStrap();
  return { front, back, strap };
}

export default function Profile() {
  const tier = useQualityTier();
  const [faces, setFaces] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 899px)').matches);
  const { slug } = useParams();
  const member = MEMBERS.find((m) => m.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 899px)');
    const onChange = (e) => setIsMobile(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!member) return undefined;
    let cancelled = false;
    buildFaces(member.handle).then((result) => {
      if (!cancelled) setFaces(result);
    });
    return () => { cancelled = true; };
  }, [member]);

  if (!member) {
    return (
      <main className="profile-page profile-missing">
        <h1 className="profile-name">Not found</h1>
        <Link to="/" className="profile-back">Back home</Link>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <GradualBlur target="page" position="top" height="6rem" strength={2} divCount={5} curve="bezier" zIndex={800} />
      <div className="profile-hero">
        <div className="profile-lanyard">
          {faces && (
            <Lanyard
              frontImage={faces.front}
              backImage={faces.back}
              strapImage={faces.strap}
              anchor={isMobile ? 'center' : 'left'}
              breeze={tier === 'low' ? 0 : 1}
            />
          )}
        </div>
        <div className="profile-info">
          <div className="profile-name-block">
            <h1 className="profile-name">{member.name}</h1>
          </div>
          <p className="profile-position">{member.position}</p>
          <Link to="/" className="profile-back">Back home</Link>
        </div>
      </div>
    </main>
  );
}
