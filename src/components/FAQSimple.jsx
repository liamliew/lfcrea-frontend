import './FAQSimple.css';

const faqs = [
    {
        question: "Can cheaper ah?",
        answer: "No. Our prices are as affordable as it can be. If you think it's too expensive, drop us a message, you might just be looking at the wrong package.",
    },
    {
        question: "Do you offer discounts?",
        answer: "We have seasonal discounts as well as discounted rates when you book us for 6 or more hours.",
    },
    {
        question: "What is your cancellation policy?",
        answer: "Change of plans? We get it. We offer full refunds for cancellations made at least 3 hours before the booking starts.",
    },
    {
        question: "Does live broadcasting come with every event package?",
        answer: "No. If you need live broadcasting, you can book it separately, or add it on if you have already booked our event package.",
    },
    {
        question: "How does your billing work?",
        answer: "Before we start working, we require that you pay half of the total price of the service, as a security deposit. We charge the other half at the end of the service.",
    },
    {
        question: "Can you shoot X event for free?",
        answer: "No, we can't. LF Creative has grown to a reasonable size where our time is scarce and valuable. If you need our services, you will have to pay for our valuable time.",
    },
];

export default function FAQSimple() {
    return (
        <section className="faq-section">
            <div className="faq-container">
                <div className="faq-header">
                    <h2 className="faq-title">FAQ</h2>
                    <p className="faq-subtitle">Everything you need to know about our services and our guarantee.</p>
                </div>

                <div className="faq-grid-wrapper">
                    <dl className="faq-grid">
                        {faqs.map((item) => (
                            <div key={item.question} className="faq-item">
                                <dt className="faq-question">{item.question}</dt>
                                <dd className="faq-answer">{item.answer}</dd>
                            </div>
                        ))}
                    </dl>
                </div>

                <div className="faq-contact-box">
                    <div className="faq-avatars">
                        <img
                            src="https://www.untitledui.com/images/avatars/marco-kelly?fm=webp&q=80"
                            alt="Marco Kelly"
                            className="faq-avatar avatar-lg"
                        />
                        <img
                            src="https://www.untitledui.com/images/avatars/amelie-laurent?fm=webp&q=80"
                            alt="Amelie Laurent"
                            className="faq-avatar avatar-xl z-10"
                        />
                        <img
                            src="https://www.untitledui.com/images/avatars/jaya-willis?fm=webp&q=80"
                            alt="Jaya Willis"
                            className="faq-avatar avatar-lg"
                        />
                    </div>
                    <div className="faq-contact-text">
                        <h4 className="faq-contact-title">Still have questions?</h4>
                        <p className="faq-contact-subtitle">Can't find the answer you're looking for? Please chat to our friendly team.</p>
                    </div>
                    <a
                        className="faq-button"
                        href="https://wa.me/601166767883"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Get in touch
                    </a>
                </div>
            </div>
        </section>
    );
}