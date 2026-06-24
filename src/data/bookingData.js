export const categories = {
  graduation: {
    label: 'Graduation',
    subtitle: 'Outdoor portraits that feel like you.',
    type: 'fixed',
    packages: [
      {
        id: 'grad-basic',
        name: 'Basic Package',
        price: 175,
        priceLabel: 'RM175',
        duration: 1.5,
        features: ['10–15 edited photos', '1 location (e.g. Downtown KL)', '1–2 hours'],
      },
      {
        id: 'grad-standard',
        name: 'Standard Package',
        price: 275,
        priceLabel: 'RM275',
        duration: 2.5,
        features: ['15–20 edited photos', '2 locations', '2–3 hours', '5 printed photos'],
      },
    ],
    addons: [
      { id: 'grad-prints', name: 'Printed photos', price: 3, unit: 'per print', minQty: 3, note: 'Min. order 3 prints · RM3 each' },
    ],
  },
  sports: {
    label: 'Sports',
    subtitle: 'Game-day energy, frame by frame.',
    type: 'hourly',
    minHours: 2,
    maxHours: 8,
    packages: [
      {
        id: 'sports-photo',
        name: 'Photography Coverage',
        price: 100,
        priceLabel: 'RM100/hr',
        features: ['2 photographers', 'Edited photos', 'Online gallery', '48hr turnaround'],
      },
      {
        id: 'sports-media',
        name: 'Photo & Video Coverage',
        price: 180,
        priceLabel: 'RM180/hr',
        features: ['1 photographer + 1 videographer', 'Edited photos', '30–60s highlight reel', 'Same-day shots (5–10)', 'Online gallery', '32hr turnaround'],
      },
    ],
    addons: [
      { id: 'addon-basic-vid', name: 'Add-on Basic Video', price: 150, unit: 'flat', note: '2-hour coverage · 1 short reel' },
      { id: 'addon-premium-vid', name: 'Add-on Premium Video', price: 250, unit: 'flat', note: 'Full coverage · highlight reel · social media edits · edited clips' },
    ],
  },
  events: {
    label: 'Events',
    subtitle: 'Every detail. Every moment.',
    type: 'hourly',
    minHours: 2,
    maxHours: 8,
    packages: [
      {
        id: 'events-photo',
        name: 'Photography Coverage',
        price: 120,
        priceLabel: 'RM120/hr',
        features: ['2 photographers', 'Edited photos', 'Online gallery', '48hr turnaround'],
      },
      {
        id: 'events-media',
        name: 'Media Coverage',
        price: 220,
        priceLabel: 'RM220/hr',
        features: ['1 photographer + 1 videographer', 'Edited photos', '30–60s highlight reel', 'Same-day shots (5–10)', 'Online gallery', '32hr turnaround'],
      },
    ],
    addons: [
      { id: 'addon-basic-vid', name: 'Add-on Basic Video', price: 150, unit: 'flat', note: '2-hour coverage · 1 short reel' },
      { id: 'addon-premium-vid', name: 'Add-on Premium Video', price: 250, unit: 'flat', note: 'Full coverage · highlight reel · social media edits · edited clips' },
    ],
  },
  live: {
    label: 'Live Production',
    subtitle: 'Broadcast-ready from frame one.',
    type: 'hourly',
    minHours: 2,
    maxHours: 8,
    packages: [
      {
        id: 'live-basic',
        name: 'Basic Package',
        price: 150,
        priceLabel: 'RM150/hr',
        features: ['2 cameras', 'Stream to online services or Jumbotron (LED wall)'],
      },
    ],
  },
  personal: {
    label: 'Personal Sports',
    subtitle: 'Your game. Your highlight reel.',
    type: 'fixed',
    packages: [
      {
        id: 'personal-basic',
        name: 'Basic Package',
        price: 100,
        priceLabel: 'RM100',
        duration: 1,
        features: ['1-hour coverage', 'Edited photos', 'Online gallery', '48hr turnaround'],
      },
      {
        id: 'personal-standard',
        name: 'Standard Package',
        price: 150,
        priceLabel: 'RM150',
        duration: 2,
        features: ['2-hour coverage', 'Edited photos', 'Online gallery', '32hr turnaround', 'Same-day shots (2–4)'],
      },
      {
        id: 'personal-premium',
        name: 'Premium Package',
        price: 200,
        priceLabel: 'RM200',
        duration: 4,
        features: ['4-hour coverage', 'Edited photos', 'Online gallery', 'Same-day turnaround'],
      },
    ],
  },
};

export const blockedSlots = [
  { start: 9, end: 11 },
  { start: 14, end: 16.5 },
  { start: 20, end: 22 },
];

export function calcBookingTotal(bk) {
  const cat = categories[bk.category];
  if (!cat) return 0;
  const pkg = cat.packages.find(p => p.id === bk.packageId);
  if (!pkg) return 0;
  let total = 0;
  if (cat.type === 'hourly' && bk.timeRange) {
    total += pkg.price * (bk.timeRange.endHour - bk.timeRange.startHour);
  } else {
    total += pkg.price;
  }
  if (bk.addons && cat.addons) {
    bk.addons.forEach(a => {
      const def = cat.addons.find(x => x.id === a.id);
      if (!def) return;
      if (def.unit === 'per print') total += def.price * (a.qty || def.minQty);
      else total += def.price;
    });
  }
  return total;
}
