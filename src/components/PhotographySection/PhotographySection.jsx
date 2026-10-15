import './PhotographySection.css';

const PHOTO_URL = `${(import.meta.env.VITE_MEDIA_URL ?? '').replace(/\/$/, '')}/homePhotos/photography-preview.webp`;

const SERVICES = [
  'Corporate Event',
  'Graduation',
  'Product',
  'Food',
  'Roadshows',
];

export default function PhotographySection() {
  return (
    <section className="photography-section">
      <div className="photography-content">
        <div className="photography-text">
          <h2 className="sub-header photography-header">Photography</h2>
          <ul className="photography-list">
            {SERVICES.map((service) => (
              <li key={service} className="photography-item">{service}</li>
            ))}
          </ul>
        </div>
        <img
          src={PHOTO_URL}
          alt="Photography"
          className="photography-img"
          draggable={false}
          loading="lazy"
        />
      </div>
    </section>
  );
}
