import './FAQSimple.css';

const faqs = [
    {
        question: "Can I pay you in exposure?",
        answer: "Did you just lowball us? No, you cannot pay us in exposure. If you are looking to try our service before you book, we offer trial rates of RM15/hour. Contact us for more info.",
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
        question: "How can I trust your quality of service?",
        answer: "We offer trial rates at RM15/hour. Contact us for more info.",
    },
];

export default function FAQSimple() {
    return (
        <section className="faq-section">
            <div className="faq-container">
                <div className="faq-header">
                    <h2 className="faq-title">Frequently asked questions</h2>
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
                    <button className="faq-button">Get in touch</button>
                </div>
            </div>
        </section>
    );
}