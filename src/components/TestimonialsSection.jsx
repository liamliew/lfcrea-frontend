import { BadgeCheck, Star } from 'lucide-react';
import SpotlightCard from './SpotlightCard';
import { SPOTLIGHT } from './spotlightPreset';
import './TestimonialsSection.css';

const PROFILE_URL = 'https://www.trustpilot.com/review/lfcrea.com';

const REVIEWS = [
    {
        title: 'Professional crew',
        body: 'The team is very professional, they are dedicated and never once left the event. The output is also very nice. In short, they overdeliver.',
        author: 'Chiu Yoong Ng',
        url: 'https://www.trustpilot.com/reviews/6acf2c1de9f2511f57218a83',
        rating: 5,
    },
    {
        title: 'They are incredibly proactive',
        body: 'They are incredibly proactive, providing structured daily status updates that keep our team perfectly aligned without any guesswork. They delivering high-quality photography',
        author: 'Cavyn Choy',
        company: 'Galmaegi House',
        url: PROFILE_URL,
        rating: 5,
    },
];

export default function TestimonialsSection() {
    return (
        <section className="testimonials-section">
            <div className="testimonials-container">
                <h2 className="testimonials-title">REVIEWS</h2>
                <div className="testimonials-cards">
                    {REVIEWS.map((r, i) => (
                        <SpotlightCard key={i} className="testimonial-card" {...SPOTLIGHT}>
                            <div className="testimonial-top">
                                <span className="testimonial-stars" role="img" aria-label={`Rated ${r.rating} out of 5 on Trustpilot`}>
                                    {[0, 1, 2, 3, 4].map((n) => (
                                        <span key={n} className={`testimonial-star${n < r.rating ? ' is-on' : ''}`}>
                                            <Star size={16} fill="currentColor" strokeWidth={0} />
                                        </span>
                                    ))}
                                </span>
                                <BadgeCheck className="testimonial-verified" size={20} aria-label="Verified" />
                            </div>
                            <h3 className="testimonial-heading">{r.title}</h3>
                            <div className="testimonial-text">
                                <p className="testimonial-body testimonial-short" aria-hidden="true">{r.body}</p>
                                <p className="testimonial-body testimonial-full">{r.body}</p>
                            </div>
                            <p className="testimonial-author">
                                <strong>{r.author}</strong>
                                {r.company && <>, {r.company}</>}
                            </p>
                            <a
                                className="testimonial-link"
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Read ${r.author}'s review on Trustpilot`}
                            />
                        </SpotlightCard>
                    ))}
                </div>
            </div>
        </section>
    );
}
