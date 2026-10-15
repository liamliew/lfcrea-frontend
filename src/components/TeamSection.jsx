import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';
import SpotlightCard from './SpotlightCard';
import { MEMBERS, APP_ICONS } from '../data/teamData';
import { SPOTLIGHT } from './spotlightPreset';
import './TeamSection.css';

export default function TeamSection() {
    return (
        <section className="team-section">
            <div className="team-container">
                <h2 className="team-title">OUR TEAM</h2>
                <div className="team-cards">
                    {MEMBERS.map((m) => (
                        <SpotlightCard key={m.name} className="team-card" {...SPOTLIGHT}>
                            {m.certified && (
                                <div className="team-cert">
                                    <img src="/adobe.png" alt="" className="team-cert-logo" />
                                    <p className="team-cert-text">CERTIFIED<br />PROFESSIONAL</p>
                                </div>
                            )}
                            <img src={m.image} alt={m.name} className="team-photo" />
                            <h3 className="team-name">{m.name}</h3>
                            <p className="team-position">{m.position}</p>
                            <span className="team-skill">{m.skill}</span>
                            <ul className="team-tools" aria-label="Adobe tools">
                                {m.tools.map((t) => (
                                    <li key={t} className="team-tool">
                                        <img src={APP_ICONS[t]} alt={t} className="team-tool-img" />
                                        {m.certified?.includes(t) && (
                                            <Award className="team-tool-award" size={14} aria-label="Adobe Certified Professional" />
                                        )}
                                    </li>
                                ))}
                            </ul>
                            <dl className="team-stats">
                                <div className="team-stat">
                                    <dt>Years of experience</dt>
                                    <dd>{m.years}</dd>
                                </div>
                                <div className="team-stat">
                                    <dt>Total projects</dt>
                                    <dd>{m.projects}</dd>
                                </div>
                            </dl>
                            <Link to={`/profile/${m.slug}`} className="team-profile-btn">View profile</Link>
                        </SpotlightCard>
                    ))}
                </div>
            </div>
        </section>
    );
}
