import './AboutUs.css';

// Replace these with your image paths when ready
const LEFT_IMAGE_SRC = '';
const RIGHT_IMAGE_SRC = '';

function SideImage({ src, alt, side }) {
  if (!src) {
    return <div className={`about-us-img about-us-img-placeholder about-us-img-${side}`} aria-hidden="true" />;
  }
  return (
    <img
      src={src}
      alt={alt}
      className={`about-us-img about-us-img-${side}`}
      draggable={false}
    />
  );
}

export default function AboutUs() {
  return (
    <section className="about-us-section">
      <h2 className="sub-header">About Us</h2>
      <div className="about-us-content">
        <SideImage src={LEFT_IMAGE_SRC} alt="About us" side="left" />
        <p className="about-us-text">
          We are a team of passionate visual storytellers based in Malaysia,
          dedicated to capturing the moments that matter most. From intimate
          gatherings to large-scale productions, we bring creativity and
          precision to every frame — helping brands, businesses, and individuals
          tell their stories in ways that resonate and endure.
        </p>
        <SideImage src={RIGHT_IMAGE_SRC} alt="About us" side="right" />
      </div>
    </section>
  );
}
