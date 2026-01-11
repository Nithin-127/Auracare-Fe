import React from 'react';
import './About.css';
import aboutHero from '../about-hero.png';

const About = () => {
  return (
    <div>
      <section className="about-hero-section">
        <div className="container">
          <h1 className="about-title">Empowering <span className="text-gradient">Hope</span></h1>
          <p className="about-subtitle">
            We are dedicated to bridging the gap between donors and recipients, creating a world where every life has a fighting chance.
          </p>
          <div className="about-image-wrapper">
            <img src={aboutHero} alt="Compassionate Care" className="about-image" />
          </div>
        </div>
      </section>

      <section className="mission-section container">
        <div className="story-grid">
          <div className="story-content">
            <h2>Our Story</h2>
            <p>
              Founded with a simple yet profound mission, AuraCare began as a small initiative to tackle the complexities of organ donation. We realized that while the will to give often exists, the pathway to do so is cluttered with obstacles.
            </p>
            <p>
              Today, we operate as a beacon of hope for thousands. By leveraging technology and building a network of trust, we ensure that no potential gift of life goes unreceived due to logistical barriers.
            </p>
          </div>
          <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="stat-item" style={{ background: '#FFF5F5', padding: '2rem', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '2.5rem', marginBottom: '0.2rem' }}>5+</h3>
              <p>Years of Service</p>
            </div>
            <div className="stat-item" style={{ background: '#FFF5F5', padding: '2rem', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '2.5rem', marginBottom: '0.2rem' }}>24/7</h3>
              <p>Support System</p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>Core Values</h2>
          <p style={{ color: 'var(--text-light)' }}>The principles that guide every decision we make.</p>
        </div>

        <div className="values-grid">
          <div className="value-card">
            <span className="value-icon">🤝</span>
            <h3>Trust & Transparency</h3>
            <p>We build our foundation on absolute honesty. Every process is verifiable and every interaction is secure.</p>
          </div>
          <div className="value-card">
            <span className="value-icon">❤️</span>
            <h3>Compassion First</h3>
            <p>We approach every case with deep empathy, understanding the emotional journey of both donors and recipients.</p>
          </div>
          <div className="value-card">
            <span className="value-icon">🛡️</span>
            <h3>Safety & Ethics</h3>
            <p>We adhere to the strictest ethical standards and medical safety protocols without compromise.</p>
          </div>
          <div className="value-card">
            <span className="value-icon">🚀</span>
            <h3>Innovation</h3>
            <p>We constantly evolve our technology to make the matching and donation process faster and more accurate.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
