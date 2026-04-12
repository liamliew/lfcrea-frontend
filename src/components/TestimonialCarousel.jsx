import React, { useState, useEffect } from 'react';
import './TestimonialCarousel.css';

const testimonials = [
  {
    text: "I feel bad because the quality is high, but I pay them low.",
    name: "Anonymous (for now)",
    company: "Sri Desa International School"
  },
  {
    text: "The video quality was so crisp, that my phone took a long time to load it.",
    name: "Anonymous (for now)",
    company: "Sri Desa International School"
  },
  {
    text: "I regret not hiring you guys earlier.",
    name: "PRIME Dodgeball Admin",
    company: "PRIME Dodgeball"
  }
];

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000); // Rotate every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="testimonial-carousel">
      <div className="testimonial-cards-wrapper">
        {testimonials.map((testimonial, index) => {
          let position = 'next';
          if (index === currentIndex) {
            position = 'active';
          } else if (index === (currentIndex - 1 + testimonials.length) % testimonials.length) {
            position = 'prev';
          }

          return (
            <div key={index} className={`testimonial-card ${position}`}>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="testimonial-author">
                <span className="testimonial-name">{testimonial.name}</span>
                <span className="testimonial-company">{testimonial.company}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
