-- Placeholder catalogue content, replace before launch.

insert into public.services
  (slug, name, service_type, audience, short_description, long_description, hero_image_key, sort_order)
values
  (
    'corporate-event-coverage',
    'Corporate event coverage',
    'Photography',
    'business',
    'Full-day photography for conferences, launches, and company milestones across the Klang Valley.',
    $md$Placeholder copy. Our corporate coverage team documents your event end to end, from registration and keynote sessions through to the networking floor. We work discreetly around your run-of-show so the day looks and feels unstaged.

Placeholder copy. You receive a same-week selection of hero images for press and social, followed by the full colour-graded gallery. Delivery is via a private online gallery with usage rights for marketing and internal communications.$md$,
    'services/corporate-event-coverage/hero.jpg',
    1
  ),
  (
    'product-photography',
    'Product photography',
    'Photography',
    'business',
    'Studio and lifestyle product imagery built for e-commerce listings and campaign use.',
    $md$Placeholder copy. We shoot on a controlled studio set with consistent lighting so your catalogue stays visually coherent as it grows. Packshots are cut out and colour-matched to your brand references.

Placeholder copy. Lifestyle sets add context for campaign and social use, styled with props sourced to your brief. Files are delivered in web-ready and print-ready formats, named to your SKU convention.$md$,
    'services/product-photography/hero.jpg',
    2
  ),
  (
    'brand-video',
    'Brand video',
    'Videography',
    'business',
    'Narrative brand films and cutdowns that explain what your company does and why it matters.',
    $md$Placeholder copy. We start with a short discovery session to find the story worth telling, then build a treatment covering structure, interview questions, and visual direction before anyone picks up a camera.

Placeholder copy. Production covers interviews, b-roll, and any studio work required. You receive a primary film plus vertical and square cutdowns sized for paid social, with licensed music and subtitles included.$md$,
    'services/brand-video/hero.jpg',
    3
  ),
  (
    'wedding-film',
    'Wedding film',
    'Videography',
    'consumer',
    'Cinematic wedding films covering your ceremony, reception, and the quiet moments in between.',
    $md$Placeholder copy. We shoot documentary style, staying out of the way so the day unfolds as it would without us. Two shooters cover the ceremony so nothing important happens off camera.

Placeholder copy. Your edit is scored to licensed music and colour graded for a warm, filmic look. A highlight film lands first, with the full ceremony and speeches edit following a few weeks later.$md$,
    'services/wedding-film/hero.jpg',
    4
  ),
  (
    'portrait-session',
    'Portrait session',
    'Photography',
    'consumer',
    'Relaxed portrait sessions for individuals, couples, and families, on location or in studio.',
    $md$Placeholder copy. Sessions run at an unhurried pace with direction throughout, so you do not need prior experience in front of a camera. We scout locations with you beforehand and plan around the best light.

Placeholder copy. You receive a proofing gallery to make your selections, then fully retouched files at high resolution. Print and album options are available as an add-on.$md$,
    'services/portrait-session/hero.jpg',
    5
  ),
  (
    'social-media-content-pack',
    'Social media content pack',
    'Content production',
    'consumer',
    'A monthly batch of photo and short-form video content, shot and edited to a consistent look.',
    $md$Placeholder copy. One shoot day produces a month of content. We plan the shot list against your posting calendar so every asset has a slot to fill rather than sitting unused in a folder.

Placeholder copy. Deliverables include stills and vertical video cutdowns edited for each platform, with captions burned in where needed. Assets arrive in a shared folder organised by posting week.$md$,
    'services/social-media-content-pack/hero.jpg',
    6
  );

insert into public.service_pricing
  (service_id, package_name, includes, price_from, currency, unit, sort_order)
select s.id, v.package_name, v.includes, v.price_from, 'MYR', v.unit, v.sort_order
from public.services s
join (values
  ('corporate-event-coverage', 'Half day', 'Up to 4 hours, one photographer, 60 edited images', 1200.00, 'per session', 1),
  ('corporate-event-coverage', 'Full day', 'Up to 9 hours, two photographers, 150 edited images', 2400.00, 'per session', 2),
  ('corporate-event-coverage', 'Multi-day conference', 'Custom crew and delivery schedule', null, 'on enquiry', 3),

  ('product-photography', 'Packshot', 'White background, cut out, colour matched', 45.00, 'per deliverable', 1),
  ('product-photography', 'Lifestyle set', 'Styled set, props sourced, 15 edited images', 900.00, 'per session', 2),
  ('product-photography', 'Catalogue volume', 'Tiered rate for 100+ SKUs', null, 'on enquiry', 3),

  ('brand-video', 'Brand story', 'Treatment, one shoot day, 90 second film', 6500.00, 'per deliverable', 1),
  ('brand-video', 'Campaign suite', 'Hero film plus vertical and square cutdowns', null, 'on enquiry', 2),

  ('wedding-film', 'Ceremony film', 'Six hours coverage, 5 minute highlight film', 3800.00, 'per session', 1),
  ('wedding-film', 'Full day film', 'Ten hours, two shooters, highlight and full edits', 6200.00, 'per session', 2),
  ('wedding-film', 'Destination', 'Travel and accommodation quoted separately', null, 'on enquiry', 3),

  ('portrait-session', 'Studio session', 'One hour, one look, 10 retouched images', 450.00, 'per session', 1),
  ('portrait-session', 'On location', 'Two hours, location scouting, 20 retouched images', 750.00, 'per session', 2),

  ('social-media-content-pack', 'Starter pack', '15 stills and 5 vertical videos', 1800.00, 'per deliverable', 1),
  ('social-media-content-pack', 'Growth pack', '30 stills and 12 vertical videos', 3200.00, 'per deliverable', 2),
  ('social-media-content-pack', 'Retainer', 'Ongoing monthly production', null, 'on enquiry', 3)
) as v (slug, package_name, includes, price_from, unit, sort_order)
  on v.slug = s.slug;

insert into public.service_gallery (service_id, image_key, caption, sort_order)
select s.id, v.image_key, v.caption, v.sort_order
from public.services s
join (values
  ('corporate-event-coverage', 'services/corporate-event-coverage/gallery-01.jpg', 'Keynote session', 1),
  ('corporate-event-coverage', 'services/corporate-event-coverage/gallery-02.jpg', 'Networking floor', 2),

  ('product-photography', 'services/product-photography/gallery-01.jpg', 'Studio packshot', 1),
  ('product-photography', 'services/product-photography/gallery-02.jpg', 'Styled lifestyle set', 2),

  ('brand-video', 'services/brand-video/gallery-01.jpg', 'Interview setup', 1),
  ('brand-video', 'services/brand-video/gallery-02.jpg', 'On location b-roll', 2),

  ('wedding-film', 'services/wedding-film/gallery-01.jpg', 'Ceremony', 1),
  ('wedding-film', 'services/wedding-film/gallery-02.jpg', 'Reception toast', 2),

  ('portrait-session', 'services/portrait-session/gallery-01.jpg', 'Studio portrait', 1),
  ('portrait-session', 'services/portrait-session/gallery-02.jpg', 'Golden hour on location', 2),

  ('social-media-content-pack', 'services/social-media-content-pack/gallery-01.jpg', 'Vertical video still', 1),
  ('social-media-content-pack', 'services/social-media-content-pack/gallery-02.jpg', 'Flat lay set', 2)
) as v (slug, image_key, caption, sort_order)
  on v.slug = s.slug;
