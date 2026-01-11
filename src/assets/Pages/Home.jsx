import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import heroImg from '../hero.png';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="home-hero container">
        <div className="hero-content">
          <h1 className="hero-title">
            Bridge the Gap to a <span className="text-gradient">Second Chance</span>
          </h1>
          <p className="hero-subtitle">
            AuraCare connects compassionate donors with recipients in need. 
            Join our secure, transparent platform and be the hero in someone's story.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" style={{ marginRight: '1rem' }} onClick={() => navigate('/donor')}>Register as Donor</button>
            <button className="btn btn-outline" onClick={() => navigate('/receiver')}>Find a Recipient</button>
          </div>
        </div>
        <div className="hero-image-container">
          <div className="hero-circle"></div>
          <img src={heroImg} alt="Connecting lives" className="hero-image" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>2,500+</h3>
              <p>Lives Saved</p>
            </div>
            <div className="stat-item">
              <h3>150+</h3>
              <p>Partner Hospitals</p>
            </div>
            <div className="stat-item">
              <h3>100%</h3>
              <p>Secure Process</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / Features */}
      <section className="section-padding container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>How AuraCare Works</h2>
          <p style={{ color: 'var(--text-light)', maxWidth: '600px', margin: '0 auto' }}>
            We've simplified the organ donation process to ensure safety, speed, and transparency for everyone involved.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <h3>Register & Profile</h3>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-light)' }}>
              Create a secure profile as a donor or recipient. Our verified system ensures authenticity and privacy.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <h3>Smart Matching</h3>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-light)' }}>
              Our advanced algorithm connects compatible donors and recipients based on medical criteria and location.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
            </div>
            <h3>Safe Transplant</h3>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-light)' }}>
              We coordinate with partner hospitals to facilitate a safe, legal, and smooth transplant procedure.
            </p>
          </div>

          <div className="feature-card" style={{border: '1px solid #fef3c7', background: '#fffbeb'}}>
            <div className="feature-icon" style={{background: '#fef3c7', color: '#d97706'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <h3 style={{color: '#92400e'}}>Doctor Consultation 🌟</h3>
            <p style={{ marginTop: '0.5rem', color: '#b45309' }}>
              <strong>Premium Benefit:</strong> Book direct consultations with top specialists to guide your donation or recovery journey.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container">
        <div className="cta-section">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--text-dark)' }}>
            Ready to Make a Difference?
          </h2>
          <p style={{ marginBottom: '2.5rem', color: 'var(--text-light)' }}>
            Join thousands of others who are changing lives today.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Get Started Now</button>
        </div>
      </section>
    </div>
  );
};

export default Home;
