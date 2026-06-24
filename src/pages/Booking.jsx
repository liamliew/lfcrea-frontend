import { useState, useEffect, useRef, useMemo } from 'react';
import { categories, blockedSlots, calcBookingTotal } from '../data/bookingData';
import './Booking.css';

// ── Button ────────────────────────────────────────────────────────────────────
function Button({ variant = 'primary', onClick, disabled, children }) {
  return (
    <button className={`bk-btn bk-btn--${variant}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

// ── PillTabs ──────────────────────────────────────────────────────────────────
function PillTabs({ tabs, value, onChange }) {
  return (
    <div className="pill-tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`pill-tab${value === tab.id ? ' active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ── Utils ─────────────────────────────────────────────────────────────────────
function fmtHour(h) {
  const hh = Math.floor(h) % 24;
  const mm = Math.round((h % 1) * 60);
  const period = hh < 12 ? 'AM' : 'PM';
  const dh = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
  return `${dh}:${mm === 0 ? '00' : String(mm).padStart(2, '0')} ${period}`;
}

function fmtDur(h) {
  if (h <= 0) return '∞';
  if (h < 1) return `${Math.round(h * 60)}m`;
  if (h === Math.floor(h)) return `${h}h`;
  return `${Math.floor(h)}h ${Math.round((h % 1) * 60)}m`;
}

// ── Time Scale ────────────────────────────────────────────────────────────────
function TimeScale({ isHourly, fixedDur, minH = 2, maxH = 8, value, onChange, blocked = [] }) {
  const trackRef = useRef(null);
  const dragRef = useRef(null);

  const snap = h => Math.round(h);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const getX = e => e.touches ? e.touches[0].clientX : e.clientX;

  const startDrag = (e, type) => {
    if (e.preventDefault) e.preventDefault();
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    dragRef.current = { type, x0: getX(e), tw: rect.width, v0: { ...value } };
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current) return;
      if (e.cancelable) e.preventDefault();
      const { type, x0, tw, v0 } = dragRef.current;
      const dh = ((getX(e) - x0) / tw) * 24;
      const dur = v0.endHour - v0.startHour;
      let s = v0.startHour, en = v0.endHour;
      if (type === 'body') {
        s = clamp(snap(v0.startHour + dh), 0, 24 - dur);
        en = s + dur;
      } else if (type === 'lh' && isHourly) {
        s = clamp(snap(v0.startHour + dh), Math.max(0, en - maxH), en - minH);
      } else if (type === 'rh' && isHourly) {
        en = clamp(snap(v0.endHour + dh), s + minH, Math.min(24, s + maxH));
      }
      onChange({ startHour: s, endHour: en });
    };
    const onEnd = () => { dragRef.current = null; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };
  }, [isHourly, minH, maxH, onChange]);

  const dur = value.endHour - value.startHour;
  const lp = (value.startHour / 24) * 100;
  const wp = (dur / 24) * 100;
  const cx = Math.max(8, Math.min(92, lp + wp / 2));
  const ticks = [0, 3, 6, 9, 12, 15, 18, 21, 24];
  const tickLbl = h => h === 0 || h === 24 ? '12am' : h === 12 ? '12pm' : h < 12 ? `${h}am` : `${h - 12}pm`;
  const now = new Date();
  const nowPct = ((now.getHours() + now.getMinutes() / 60) / 24) * 100;
  const isConflict = blocked.some(sl => value.startHour < sl.end && value.endHour > sl.start);

  return (
    <div className={`ts-wrap${isConflict ? ' ts-conflict' : ''}`}>
      <div className="ts-time-display">
        <span className="ts-time-main">{fmtDur(dur)}</span>
        <span className="ts-time-dur">{fmtHour(value.startHour)} → {fmtHour(value.endHour)}</span>
      </div>

      <div className="ts-track-outer">
        <div className={`ts-float-lbl${isConflict ? ' ts-float-lbl--conflict' : ''}`} style={{ left: `${cx}%` }}>
          {fmtHour(value.startHour)} → {fmtHour(value.endHour)}
        </div>

        <div className={`ts-track${isConflict ? ' ts-track--conflict' : ''}`} ref={trackRef}>
          {blocked.map((sl, i) => (
            <div key={i} className="ts-blocked" style={{ left: `${(sl.start / 24) * 100}%`, width: `${((sl.end - sl.start) / 24) * 100}%` }}>
              <span className="ts-blocked-lbl">booked</span>
            </div>
          ))}
          <div className="ts-now" style={{ left: `${nowPct}%` }} />
          <div
            className={`ts-block ${isHourly ? 'ts-block--hr' : 'ts-block--fix'}${isConflict ? ' ts-block--conflict' : ''}`}
            style={{ left: `${lp}%`, width: `${wp}%` }}
          >
            {isHourly && (
              <div className="ts-hdl ts-hdl--l" onMouseDown={e => startDrag(e, 'lh')} onTouchStart={e => startDrag(e, 'lh')} />
            )}
            <div className="ts-body" onMouseDown={e => startDrag(e, 'body')} onTouchStart={e => startDrag(e, 'body')} />
            {isHourly && (
              <div className="ts-hdl ts-hdl--r" onMouseDown={e => startDrag(e, 'rh')} onTouchStart={e => startDrag(e, 'rh')} />
            )}
          </div>
        </div>
      </div>

      <div className="ts-ticks">
        {ticks.map(h => (
          <div key={h} className="ts-tick" style={{ left: `${(h / 24) * 100}%` }}>
            <div className="ts-tick-ln" />
            <span className="ts-tick-t">{tickLbl(h)}</span>
          </div>
        ))}
      </div>

      {isConflict && <div className="ts-conflict-msg">This time overlaps a booked slot. Please adjust.</div>}
      <div className="ts-hint">
        {isHourly
          ? `Drag edges to resize · ${minH}–${maxH}hr`
          : `Drag to choose start time · fixed at ${fmtDur(fixedDur)}`}
      </div>
    </div>
  );
}

// ── Step Indicator ────────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = ['Package', 'Date', 'Time', 'Details', 'Review', 'Contract', 'Payment'];
  return (
    <div className="step-ind">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <div key={n} style={{ display: 'contents' }}>
            {i > 0 && <div className={`step-conn${done ? ' done' : ''}`} />}
            <div className={`step-node${active ? ' active' : ''}${done ? ' done' : ''}`}>
              <div className="step-circ">{done ? '✓' : n}</div>
              <span className="step-lbl">{label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1: Package ───────────────────────────────────────────────────────────
function PackageStep({ booking, setBooking }) {
  const [activeCat, setActiveCat] = useState(booking.category || 'graduation');
  const cat = categories[activeCat];
  const catTabs = Object.entries(categories).map(([id, c]) => ({ id, label: c.label }));

  const switchCat = (id) => {
    setActiveCat(id);
    setBooking(p => ({ ...p, category: id, packageId: null, addons: [], timeRange: null }));
  };

  const selectPkg = (pkgId) => {
    setBooking(p => ({ ...p, category: activeCat, packageId: pkgId, addons: [], timeRange: null }));
  };

  const toggleAddon = (addonId) => {
    setBooking(p => {
      const has = p.addons.find(a => a.id === addonId);
      if (has) return { ...p, addons: p.addons.filter(a => a.id !== addonId) };
      const def = cat.addons.find(a => a.id === addonId);
      return { ...p, addons: [...p.addons, { id: addonId, qty: def?.minQty || 1 }] };
    });
  };

  const setQty = (addonId, qty) => {
    setBooking(p => ({ ...p, addons: p.addons.map(a => a.id === addonId ? { ...a, qty } : a) }));
  };

  return (
    <div className="step-content">
      <div className="step-hd">
        <h2 className="step-title">What are we shooting?</h2>
        <p className="step-desc">Pick a category, then choose your package.</p>
      </div>

      <PillTabs tabs={catTabs} value={activeCat} onChange={switchCat} />
      <p className="cat-sub">{cat.subtitle}</p>

      <div className="pkg-grid">
        {cat.packages.map(pkg => {
          const sel = booking.packageId === pkg.id && booking.category === activeCat;
          return (
            <button key={pkg.id} className={`pkg-card${sel ? ' selected' : ''}`} onClick={() => selectPkg(pkg.id)}>
              <div className="pkg-top">
                <span className="pkg-name">{pkg.name}</span>
                <span className="pkg-price">{pkg.priceLabel}</span>
              </div>
              {cat.type === 'fixed' && pkg.duration && (
                <div className="pkg-dur">{fmtDur(pkg.duration)} · fixed duration</div>
              )}
              <ul className="pkg-feats">
                {pkg.features.map((f, i) => (
                  <li key={i}><span className="pkg-chk">✓</span>{f}</li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {cat.addons?.length > 0 && booking.packageId && booking.category === activeCat && (
        <div className="addons-wrap">
          <h3 className="addons-title">Optional add-ons</h3>
          <div className="addons-grid">
            {cat.addons.map(addon => {
              const active = booking.addons.find(a => a.id === addon.id);
              return (
                <button key={addon.id} className={`addon-card${active ? ' selected' : ''}`} onClick={() => toggleAddon(addon.id)}>
                  <div className="addon-top">
                    <span className="addon-name">{addon.name}</span>
                    <span className="addon-price">
                      {addon.unit === 'per print' ? `RM${addon.price}/print` : `+RM${addon.price}`}
                    </span>
                  </div>
                  {addon.note && <p className="addon-note">{addon.note}</p>}
                  {active && addon.unit === 'per print' && (
                    <div className="qty-wrap" onClick={e => e.stopPropagation()}>
                      <span className="qty-label">Qty</span>
                      <div className="qty-row">
                        <button className="qty-btn" onClick={() => setQty(addon.id, Math.max(addon.minQty, (active.qty || addon.minQty) - 1))}>−</button>
                        <span className="qty-val">{active.qty || addon.minQty}</span>
                        <button className="qty-btn" onClick={() => setQty(addon.id, (active.qty || addon.minQty) + 1)}>+</button>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 2: Calendar ──────────────────────────────────────────────────────────
function CalendarStep({ value, onChange }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const yr = view.getFullYear(), mo = view.getMonth();
  const firstDay = new Date(yr, mo, 1).getDay();
  const daysInMo = new Date(yr, mo + 1, 0).getDate();
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMo; d++) cells.push(d);

  const isSelected = d => d && value && value.getFullYear() === yr && value.getMonth() === mo && value.getDate() === d;
  const isPast = d => d && new Date(yr, mo, d) < today;
  const isToday = d => d && new Date(yr, mo, d).getTime() === today.getTime();

  return (
    <div className="step-content">
      <div className="step-hd">
        <h2 className="step-title">When's the day?</h2>
        <p className="step-desc">Pick a date for your shoot.</p>
      </div>

      <div className="shad-cal">
        <div className="shad-cal-header">
          <button className="shad-cal-nav" onClick={() => setView(new Date(yr, mo - 1, 1))} aria-label="Previous month">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="shad-cal-month">{MONTHS[mo]} {yr}</span>
          <button className="shad-cal-nav" onClick={() => setView(new Date(yr, mo + 1, 1))} aria-label="Next month">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
        <div className="shad-cal-grid">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="shad-cal-wd">{d}</div>)}
          {cells.map((d, i) => (
            <button
              key={i}
              className={`shad-cal-day${!d ? ' empty' : ''}${isPast(d) ? ' past' : ''}${isToday(d) ? ' today' : ''}${isSelected(d) ? ' selected' : ''}`}
              onClick={() => d && !isPast(d) && onChange(new Date(yr, mo, d))}
              disabled={!d || isPast(d)}
            >{d}</button>
          ))}
        </div>
      </div>

      {value && (
        <p className="cal-sel-display">
          {value.toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      )}
    </div>
  );
}

// ── Step 3: Time ──────────────────────────────────────────────────────────────
function TimeStep({ booking, setBooking }) {
  const cat = categories[booking.category];
  const pkg = cat?.packages.find(p => p.id === booking.packageId);
  if (!booking.timeRange || !pkg) return null;
  const isHourly = cat.type === 'hourly';
  const dur = booking.timeRange.endHour - booking.timeRange.startHour;
  const est = calcBookingTotal(booking);

  return (
    <div className="step-content">
      <div className="step-hd">
        <h2 className="step-title">What time works?</h2>
        <p className="step-desc">
          {isHourly
            ? `Drag the edges to set your start and end. Min ${cat.minHours}hr, max ${cat.maxHours}hr.`
            : `Drag to pick your start time. Duration is locked at ${fmtDur(pkg.duration)}.`}
        </p>
      </div>

      {booking.date && (
        <div className="time-date-badge">
          {booking.date.toLocaleDateString('en-MY', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      )}

      <div className="ts-container">
        <TimeScale
          isHourly={isHourly}
          fixedDur={pkg.duration}
          minH={cat.minHours}
          maxH={cat.maxHours}
          value={booking.timeRange}
          onChange={tr => setBooking(p => ({ ...p, timeRange: tr }))}
          blocked={blockedSlots}
        />
      </div>

      <div className="time-summary">
        <div className="time-sum-row">
          <span>{pkg.name}</span>
          {isHourly
            ? <span>{dur}h × RM{pkg.price}/hr</span>
            : <span>{fmtDur(pkg.duration)} fixed</span>}
          <strong>RM{isHourly ? pkg.price * dur : pkg.price}</strong>
        </div>
        {booking.addons.length > 0 && cat.addons && booking.addons.map(a => {
          const def = cat.addons.find(x => x.id === a.id);
          if (!def) return null;
          const lineTotal = def.unit === 'per print' ? def.price * a.qty : def.price;
          return (
            <div key={a.id} className="time-sum-row time-sum-row--addon">
              <span>{def.name}</span>
              {def.unit === 'per print' ? <span>{a.qty} prints × RM{def.price}</span> : <span>flat fee</span>}
              <strong>RM{lineTotal}</strong>
            </div>
          );
        })}
        <div className="time-sum-divider" />
        <div className="time-sum-row time-sum-row--total">
          <span>Estimated total</span>
          <span></span>
          <strong className="time-sum-price">RM{est}</strong>
        </div>
      </div>
    </div>
  );
}

// ── Shad Input ────────────────────────────────────────────────────────────────
function ShadInput({ label, hint, type = 'text', placeholder, value, onChange, multiline }) {
  return (
    <div className="shad-field">
      {label && <label className="shad-label">{label}</label>}
      {multiline
        ? <textarea className="shad-input shad-textarea" placeholder={placeholder} value={value} onChange={onChange} rows={3} />
        : <input className="shad-input" type={type} placeholder={placeholder} value={value} onChange={onChange} />}
      {hint && <p className="shad-hint">{hint}</p>}
    </div>
  );
}

// ── Step 4: Contact ───────────────────────────────────────────────────────────
function ContactStep({ booking, setBooking }) {
  const set = (k, v) => setBooking(p => ({ ...p, contact: { ...p.contact, [k]: v } }));
  const c = booking.contact;
  return (
    <div className="step-content">
      <div className="step-hd">
        <h2 className="step-title">Who are we shooting with?</h2>
        <p className="step-desc">So we know who to look for on the day.</p>
      </div>
      <div className="contact-form">
        <ShadInput label="Full name" placeholder="Your name" value={c.name} onChange={e => set('name', e.target.value)} />
        <ShadInput label="Email" type="email" placeholder="you@email.com" value={c.email} onChange={e => set('email', e.target.value)} />
        <ShadInput label="Phone number" type="tel" placeholder="+60 12-345 6789" value={c.phone} onChange={e => set('phone', e.target.value)} />
        <ShadInput label="Location" placeholder="Search or describe the venue / area" value={c.location} onChange={e => set('location', e.target.value)} hint="We'll follow up to confirm directions before the shoot." />
        <ShadInput label="Notes" multiline placeholder="Outfit changes, specific shots, access details…" value={c.notes} onChange={e => set('notes', e.target.value)} />
      </div>
    </div>
  );
}

// ── Step 5: Receipt ───────────────────────────────────────────────────────────
function ReceiptStep({ booking }) {
  const [shown, setShown] = useState(0);
  const cat = categories[booking.category];
  const pkg = cat?.packages.find(p => p.id === booking.packageId);
  const total = calcBookingTotal(booking);
  const dur = booking.timeRange ? (booking.timeRange.endHour - booking.timeRange.startHour) : 0;
  const orderNum = useMemo(() => String(Math.floor(100000 + Math.random() * 900000)), []);

  const lines = [
    { t: 'sp' },
    { t: 'center', v: 'LF CREATIVE STUDIO' },
    { t: 'center', v: 'contact@lfcrea.com' },
    { t: 'center', v: '+6011 6676-7883' },
    { t: 'sp' },
    { t: 'div' },
    { t: 'row', l: 'ORDER #', r: orderNum },
    { t: 'row', l: 'DATE', r: booking.date ? booking.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
    { t: 'row', l: 'TIME', r: booking.timeRange ? `${fmtHour(booking.timeRange.startHour)} - ${fmtHour(booking.timeRange.endHour)}` : '—' },
    { t: 'div' },
    { t: 'sp' },
    { t: 'row', l: (pkg?.name || '—').toUpperCase(), r: '' },
    { t: 'row', l: `  ${cat?.label?.toUpperCase() || ''} PACKAGE`, r: '' },
    ...(pkg?.features || []).map(f => ({ t: 'row', l: `  - ${f}`, r: '' })),
    { t: 'sp' },
    cat?.type === 'hourly'
      ? { t: 'row', l: `  RM${pkg?.price}/hr x ${dur}hr`, r: `RM${pkg?.price * dur}` }
      : { t: 'row', l: `  ${fmtDur(pkg?.duration)} session`, r: pkg?.priceLabel || '—' },
    ...(booking.addons.map(a => {
      const def = cat?.addons?.find(x => x.id === a.id);
      return { t: 'row', l: (def?.name || '?').toUpperCase(), r: def?.unit === 'per print' ? `RM${def.price * a.qty}` : `RM${def?.price}` };
    })),
    { t: 'sp' },
    { t: 'div' },
    { t: 'total', l: 'TOTAL', r: `RM${total}` },
    { t: 'div' },
    { t: 'sp' },
    { t: 'center', v: 'CLIENT DETAILS' },
    { t: 'sp' },
    { t: 'row', l: 'NAME', r: booking.contact.name || '—' },
    booking.contact.email    ? { t: 'row', l: 'EMAIL', r: booking.contact.email } : null,
    booking.contact.phone    ? { t: 'row', l: 'PHONE', r: booking.contact.phone } : null,
    booking.contact.location ? { t: 'row', l: 'LOCATION', r: booking.contact.location } : null,
    { t: 'sp' },
    { t: 'div' },
    { t: 'sp' },
    { t: 'center', v: '*** *** ***' },
    { t: 'sp' },
    { t: 'footer', v: 'THANK YOU FOR CHOOSING US.' },
    { t: 'footer', v: 'CHANGE OF PLANS? WE GET IT.' },
    { t: 'sp' },
  ].filter(Boolean);

  useEffect(() => {
    setShown(0);
    let n = 0;
    const id = setInterval(() => {
      n++;
      setShown(n);
      if (n >= lines.length) clearInterval(id);
    }, 55);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="step-content receipt-outer">
      <div className="step-hd" style={{ textAlign: 'center' }}>
        <h2 className="step-title">Here's your order.</h2>
        <p className="step-desc">Give it a once-over before we lock it in.</p>
      </div>

      <div className="receipt-wrap">
        <div className="receipt-tear receipt-tear--top" />
        <div className="receipt-paper">
          {lines.slice(0, shown).map((line, i) => {
            if (line.t === 'sp') return <div key={i} style={{ height: '12px' }} />;
            if (line.t === 'div') return <div key={i} className="rcpt-div">{'- '.repeat(60)}</div>;
            if (line.t === 'center') return <div key={i} className="rcpt-center">{line.v}</div>;
            if (line.t === 'row') return <div key={i} className="rcpt-row"><span>{line.l}</span><span>{line.r}</span></div>;
            if (line.t === 'total') return <div key={i} className="rcpt-total"><span>{line.l}</span><span>{line.r}</span></div>;
            if (line.t === 'footer') return <div key={i} className="rcpt-footer">{line.v}</div>;
            return null;
          })}
          {shown < lines.length && <div className="rcpt-cursor">▌</div>}
        </div>
        <div className="receipt-tear receipt-tear--bot" />
      </div>
    </div>
  );
}

// ── Step 6: Contract ──────────────────────────────────────────────────────────
function ContractStep({ booking, setBooking }) {
  const agreed = booking.contractAgreed || false;
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="step-content">
      <div className="step-hd">
        <h2 className="step-title">Review and sign</h2>
        <p className="step-desc">Read through the terms below, then sign to proceed to payment.</p>
      </div>

      <div className="contract-wrap">
        <div className="contract-scroll">
          <p className="contract-clause-title">SERVICE AGREEMENT</p>
          <p className="contract-clause-sub">LF Creative Studio &amp; {booking.contact.name || 'Client'}</p>
          <p className="contract-clause-sub" style={{ marginBottom: '1.4em' }}>Effective date: {today}</p>

          <p className="contract-body" style={{ marginBottom: '1.2em' }}>This agreement is entered into between LF Creative ("the Company") and the undersigned client ("the Client") upon confirmation of booking. By proceeding with a booking or making any payment, the Client acknowledges that they have read, understood, and agreed to all terms outlined in this agreement.</p>

          <p className="contract-section">1. SERVICES</p>
          <p className="contract-body">The Company agrees to provide photography, videography, and/or content production services as discussed and confirmed at the time of booking. The specific scope of services, deliverables, and timeline will be outlined in the booking confirmation or project brief. Any services not explicitly agreed upon in writing are not included.</p>

          <p className="contract-section">2. BOOKING &amp; DEPOSIT</p>
          <p className="contract-body">A non-refundable deposit is required to secure the Client's booking date. The booking is not confirmed until the deposit has been received. The remaining balance is due on or before the date of the shoot unless otherwise agreed upon in writing. Failure to settle the remaining balance may result in the withholding of final deliverables.</p>

          <p className="contract-section">3. CANCELLATIONS &amp; RESCHEDULING</p>
          <p className="contract-body">Cancellations made within 48 hours of the scheduled booking will not be eligible for a refund of any payments made. Cancellations made outside of this window will forfeit the non-refundable deposit. Rescheduling requests must be made at least 48 hours in advance and are subject to the Company's availability. The Company reserves the right to charge a rescheduling fee for repeated changes.</p>

          <p className="contract-section">4. FORCE MAJEURE &amp; LIABILITY</p>
          <p className="contract-body">LF Creative shall not be held liable for failure to perform services due to circumstances beyond our reasonable control, including but not limited to equipment failure, extreme weather, natural disasters, venue restrictions, illness, accidents, acts of God, or any other unforeseen event. In such cases, the Company will make every reasonable effort to reschedule. No refunds will be issued for circumstances outside of the Company's control.</p>

          <p className="contract-section">5. RAW FILES</p>
          <p className="contract-body">Raw, unedited photo or video files will not be provided to the Client under any circumstances. Final deliverables will be provided in formats determined by the Company (e.g. JPEG, MP4) unless otherwise agreed in writing prior to the shoot.</p>

          <p className="contract-section">6. EDITING &amp; POST-PRODUCTION</p>
          <p className="contract-body">All editing, colour grading, and post-production work is performed at the artistic discretion of LF Creative. The Company's editing style, as represented in our portfolio, is what the Client can expect. Requests to match another photographer's or videographer's style are not guaranteed. Excessive retouching beyond standard editing is not included unless agreed upon separately and may incur additional charges.</p>

          <p className="contract-section">7. REVISION REQUESTS</p>
          <p className="contract-body">Any revision or alteration requests must be submitted within 48 hours of the initial delivery of photos or footage. Requests made after this window will not be accommodated. Each project includes a reasonable number of revisions as agreed at booking. Additional rounds of revisions beyond what is included may be subject to additional fees.</p>

          <p className="contract-section">8. DELIVERY TIMELINE</p>
          <p className="contract-body">The Company will make every effort to deliver final files within the timeframe communicated at booking. Timelines are estimates and may vary depending on the scope of work, season, and post-production requirements. The Client agrees not to hold the Company liable for reasonable delays.</p>

          <p className="contract-section">9. MEDIA RETENTION</p>
          <p className="contract-body">Online galleries and cloud storage uploads will remain accessible for six (6) months from the date of delivery. After this period, all files will be permanently deleted from the Company's servers. The Client is solely responsible for downloading and backing up their files within this timeframe. LF Creative is not liable for any loss of files after the retention period has elapsed.</p>

          <p className="contract-section">10. USAGE &amp; LICENSING</p>
          <p className="contract-body">All photos and videos produced by LF Creative remain the intellectual property of the Company. The Client is granted a non-exclusive, non-transferable licence to use the delivered files for personal or agreed commercial use. The Client may not sell, sublicense, or transfer the files to third parties without prior written consent from the Company. LF Creative retains the right to use any images or footage for portfolio, marketing, social media, and promotional purposes unless the Client expressly requests otherwise in writing prior to the shoot.</p>

          <p className="contract-section">11. PORTFOLIO &amp; CREDIT</p>
          <p className="contract-body">Unless otherwise agreed in writing, LF Creative reserves the right to feature any work produced for the Client in our portfolio, website, and social media channels. Where possible, the Client agrees to credit LF Creative when sharing the delivered content publicly.</p>

          <p className="contract-section">12. CLIENT RESPONSIBILITIES</p>
          <p className="contract-body">The Client is responsible for ensuring the shoot location is accessible, permitted, and suitable for photography or videography. The Client is also responsible for coordinating subjects, obtaining any necessary permissions from venues or third parties, and ensuring all participants are prepared and present at the agreed time. Time lost due to late arrival or lack of preparation on the Client's side will not be compensated with extended shoot time.</p>

          <p className="contract-section">13. CONDUCT &amp; RIGHT TO DECLINE</p>
          <p className="contract-body">LF Creative reserves the right to decline any request, booking, or instruction at our sole discretion, without obligation to provide a reason. The Company also reserves the right to terminate a session if the Client or any associated party behaves in a manner that is abusive, threatening, or unsafe. In such cases, no refund will be issued.</p>

          <p className="contract-section">14. INDEMNIFICATION</p>
          <p className="contract-body">The Client agrees to indemnify and hold harmless LF Creative, its team members, and associates from any claims, damages, or expenses arising from the Client's use of the delivered content, breach of this agreement, or any third-party claims relating to the shoot.</p>

          <p className="contract-section">15. GOVERNING LAW</p>
          <p className="contract-body">This agreement shall be governed by and construed in accordance with the laws of Malaysia. The courts of Malaysia shall have jurisdiction over any disputes arising from this agreement.</p>

          <p className="contract-section">16. AMENDMENTS</p>
          <p className="contract-body">Any amendments to this agreement must be agreed upon in writing by both parties. Verbal agreements will not be considered binding.</p>

          <p className="contract-body" style={{ marginTop: '1.4em', color: 'rgba(255,255,255,0.45)' }}>By proceeding with a booking or making any payment to LF Creative, the Client confirms they have read, understood, and agreed to the terms of this agreement in full.</p>
        </div>

        <div className="contract-sign">
          <label className="contract-agree-row" onClick={() => setBooking(p => ({ ...p, contractAgreed: !p.contractAgreed }))}>
            <div className={`contract-checkbox${agreed ? ' checked' : ''}`}>
              {agreed && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span>I have read and agree to the terms of this service agreement. I understand the cancellation policy and payment terms.</span>
          </label>

          <div className="contract-sig-row">
            <div className="contract-sig-field">
              <span className="contract-sig-label">Client name</span>
              <span className="contract-sig-val">{booking.contact.name || '—'}</span>
            </div>
            <div className="contract-sig-field">
              <span className="contract-sig-label">Date</span>
              <span className="contract-sig-val">{today}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 7: Payment ───────────────────────────────────────────────────────────
function PaymentStep() {
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const set = (k, v) => setCard(p => ({ ...p, [k]: v }));

  const fmtNumber = v => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})/g, '$1 ').trim();
  const fmtExpiry = v => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d; };
  const fmtCvc = v => v.replace(/\D/g, '').slice(0, 4);

  const cardType = () => {
    const n = card.number.replace(/\s/g, '');
    if (/^4/.test(n)) return 'visa';
    if (/^5[1-5]|^2[2-7]/.test(n)) return 'mc';
    if (/^3[47]/.test(n)) return 'amex';
    return null;
  };
  const type = cardType();

  return (
    <div className="step-content">
      <div className="step-hd">
        <h2 className="step-title">Deposit payment</h2>
        <p className="step-desc">A RM200 deposit is required to confirm your booking. The remainder is due on the day.</p>
      </div>

      <div className="pay-amount-badge">
        <span className="pay-amount-label">Deposit due now</span>
        <span className="pay-amount-val">RM200</span>
      </div>

      <div className="pay-form">
        <div className="shad-field">
          <label className="shad-label">Card number</label>
          <div className="pay-card-wrap">
            <input className="shad-input pay-card-input" type="text" inputMode="numeric"
              placeholder="1234 5678 9012 3456" value={card.number}
              onChange={e => set('number', fmtNumber(e.target.value))} maxLength={19} />
            <div className="pay-card-icon">
              {type === 'visa' && <svg viewBox="0 0 48 16" width="36" height="12"><text x="0" y="13" fontFamily="Arial" fontWeight="700" fontSize="14" fill="#1a1f71" letterSpacing="1">VISA</text></svg>}
              {type === 'mc' && <svg width="32" height="20" viewBox="0 0 32 20"><circle cx="12" cy="10" r="10" fill="#eb001b" opacity="0.9"/><circle cx="20" cy="10" r="10" fill="#f79e1b" opacity="0.9"/><path d="M16 4.8a10 10 0 010 10.4A10 10 0 0116 4.8z" fill="#ff5f00"/></svg>}
              {type === 'amex' && <svg viewBox="0 0 48 16" width="36" height="12"><text x="0" y="13" fontFamily="Arial" fontWeight="700" fontSize="11" fill="#2e77bc">AMEX</text></svg>}
              {!type && <svg width="22" height="16" viewBox="0 0 22 16" fill="none"><rect x="0.5" y="0.5" width="21" height="15" rx="2.5" stroke="rgba(255,255,255,0.2)"/><rect x="0" y="4" width="22" height="4" fill="rgba(255,255,255,0.12)"/></svg>}
            </div>
          </div>
        </div>
        <div className="pay-row">
          <div className="shad-field">
            <label className="shad-label">Expiry</label>
            <input className="shad-input" type="text" inputMode="numeric" placeholder="MM/YY"
              value={card.expiry} onChange={e => set('expiry', fmtExpiry(e.target.value))} maxLength={5} />
          </div>
          <div className="shad-field">
            <label className="shad-label">CVC</label>
            <input className="shad-input" type="text" inputMode="numeric" placeholder="123"
              value={card.cvc} onChange={e => set('cvc', fmtCvc(e.target.value))} maxLength={4} />
          </div>
        </div>
        <div className="shad-field">
          <label className="shad-label">Name on card</label>
          <input className="shad-input" type="text" placeholder="As it appears on the card"
            value={card.name} onChange={e => set('name', e.target.value)} />
        </div>
      </div>

      <div className="pay-stripe-badge">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.4 }}><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/></svg>
        <span>Powered by Stripe · Payments are encrypted and secure</span>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const INITIAL_BOOKING = {
  category: 'graduation',
  packageId: null,
  addons: [],
  date: null,
  timeRange: null,
  contact: { name: '', email: '', phone: '', location: '', notes: '' },
};

export default function Booking() {
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState(INITIAL_BOOKING);
  const [submitted, setSubmitted] = useState(false);

  const canNext = () => {
    if (step === 1) return !!booking.packageId;
    if (step === 2) return !!booking.date;
    if (step === 3) return !!booking.timeRange;
    if (step === 4) return !!(booking.contact.name && booking.contact.email && booking.contact.phone);
    if (step === 6) return !!booking.contractAgreed;
    return true;
  };

  const goNext = () => {
    if (!canNext()) return;
    if (step === 2 && !booking.timeRange) {
      const cat = categories[booking.category];
      const pkg = cat?.packages.find(p => p.id === booking.packageId);
      const s = 10;
      const e = cat.type === 'hourly' ? s + cat.minHours : s + (pkg?.duration || 1);
      setBooking(p => ({ ...p, timeRange: { startHour: s, endHour: e } }));
    }
    setStep(s => s + 1);
  };

  const resetBooking = () => {
    setSubmitted(false);
    setStep(1);
    setBooking(INITIAL_BOOKING);
  };

  if (submitted) {
    return (
      <div className="booking-page">
        <div className="bk-body">
          <div className="submitted-screen">
            <div className="submitted-icon">✓</div>
            <h2 className="submitted-title">We've got your booking.</h2>
            <p className="submitted-desc">Expect a confirmation from us within 24 hours. We'll sort out the details and get you locked in.</p>
            <Button variant="ghost" onClick={resetBooking}>Start another booking</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="bk-body">
        <StepIndicator step={step} />

        <div className="bk-step-wrap" key={step}>
          {step === 1 && <PackageStep booking={booking} setBooking={setBooking} />}
          {step === 2 && <CalendarStep value={booking.date} onChange={d => setBooking(p => ({ ...p, date: d, timeRange: null }))} />}
          {step === 3 && <TimeStep booking={booking} setBooking={setBooking} />}
          {step === 4 && <ContactStep booking={booking} setBooking={setBooking} />}
          {step === 5 && <ReceiptStep booking={booking} />}
          {step === 6 && <ContractStep booking={booking} setBooking={setBooking} />}
          {step === 7 && <PaymentStep booking={booking} />}
        </div>

        <div className="bk-nav">
          {step > 1 && <Button variant="ghost" onClick={() => setStep(s => s - 1)}>Back</Button>}
          <div style={{ flex: 1 }} />
          {step < 5 && <Button variant="primary" onClick={goNext} disabled={!canNext()}>{step === 4 ? 'Review booking' : 'Continue'}</Button>}
          {step === 5 && <Button variant="primary" onClick={goNext}>Proceed to contract</Button>}
          {step === 6 && <Button variant="primary" onClick={goNext} disabled={!canNext()}>Agree and continue</Button>}
          {step === 7 && <Button variant="accent" onClick={() => setSubmitted(true)}>Pay RM200 deposit</Button>}
        </div>
      </div>

      <div className="deposit-notice">
        <strong>A RM200 deposit is required to confirm your booking.</strong> The remainder is due on the day of the shoot.
      </div>
    </div>
  );
}
