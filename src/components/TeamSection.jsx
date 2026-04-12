import React from 'react';
import './TeamSection.css';
import lfcLogo from '../assets/lfcLogo.svg';

const teamMembers = [
    {
        name: "Chew Yu Fong",
        title: "Co-Founder",
        avatarUrl: lfcLogo,
    },
    {
        name: "Liam Liew",
        title: "Co-Founder",
        avatarUrl: lfcLogo,
    }
];

export default function TeamSection() {
    return (
        <section className="team-section">
            <div className="team-container">
                <div className="team-header">
                    <span className="team-badge">We're all students!</span>
                    <h2 className="team-title">Meet our team</h2>
                    <p className="team-subtitle">
                        Our philosophy is simple—hire a team of diverse, passionate people and foster a culture that empowers you to do your best work.
                    </p>
                </div>

                <div className="team-grid-wrapper">
                    <ul className="team-grid">
                        {teamMembers.map((item) => (
                            <li key={item.name} className="team-item">
                                <img src={item.avatarUrl} alt={item.name} className="team-avatar" />
                                <div className="team-info">
                                    <h3 className="team-name">{item.name}</h3>
                                    <p className="team-role">{item.title}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
