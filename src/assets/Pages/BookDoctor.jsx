import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Aura.css';

const BookDoctor = () => {
  const { userData, isAuthorized } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingStep, setBookingStep] = useState(1); // 1: Select Doc, 2: Select Time, 3: Confirm

  const doctors = [
    { id: 1, name: "Dr. Sarah Johnson", specialty: "Cardiologist", experience: "12 years", rating: "4.9", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200" },
    { id: 2, name: "Dr. Michael Chen", specialty: "Nephrologist", experience: "15 years", rating: "4.8", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200" },
    { id: 3, name: "Dr. Elena Rodriguez", specialty: "General Surgeon", experience: "10 years", rating: "5.0", image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200" },
    { id: 4, name: "Dr. David Miller", specialty: "Hepatologist", experience: "18 years", rating: "4.7", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200" }
  ];

  useEffect(() => {
    if (isAuthorized && !userData?.isPremium) {
      toast.info("Please upgrade to Premium to book a consultation");
      navigate('/premium');
    }
  }, [isAuthorized, userData, navigate]);

  const handleConfirmBooking = () => {
    toast.success(`Appointment confirmed with ${selectedDoctor.name}! A confirmation email has been sent.`);
    navigate('/profile');
  };

  if (!isAuthorized) return null;

  return (
    <div className="aura-page">
      <div className="aura-header-bg" style={{background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'}}>
        <div className="container">
          <h1 className="aura-title">Medical Consultation</h1>
          <p className="aura-subtitle">Book a session with our world-class specialists. Exclusive for AuraCare Premium members.</p>
        </div>
      </div>

      <div className="container section-padding">
        <div style={{maxWidth: '1000px', margin: '0 auto'}}>
          
          {/* Progress Bar */}
          <div style={{display: 'flex', justifyContent: 'center', marginBottom: '4rem', gap: '1rem'}}>
            {[1, 2, 3].map(step => (
              <div key={step} style={{
                width: '80px', height: '8px', borderRadius: '4px',
                background: bookingStep >= step ? '#1e293b' : '#e2e8f0',
                transition: 'all 0.3s'
              }}></div>
            ))}
          </div>

          {/* Step 1: Doctor Selection */}
          {bookingStep === 1 && (
            <div className="doctors-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem'}}>
              {doctors.map(doc => (
                <div key={doc.id} className="donor-card-premium" style={{padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s'}} onClick={() => { setSelectedDoctor(doc); setBookingStep(2); }}>
                  <img src={doc.image} alt={doc.name} style={{width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1.5rem', border: '4px solid #f8fafc'}} />
                  <h3 style={{fontSize: '1.1rem', color: '#1e293b'}}>{doc.name}</h3>
                  <p style={{color: '#3b82f6', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem'}}>{doc.specialty}</p>
                  <p style={{color: '#64748b', fontSize: '0.85rem'}}>{doc.experience}</p>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', marginTop: '1rem', color: '#f59e0b'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                    <span style={{fontWeight: '700', fontSize: '0.9rem'}}>{doc.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Time Selection */}
          {bookingStep === 2 && (
            <div className="donor-card-premium" style={{padding: '3rem', textAlign: 'center'}}>
                <button style={{float: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'}} onClick={() => setBookingStep(1)}>
                  ← Back to Doctors
                </button>
                <div style={{clear: 'both', paddingTop: '2rem'}}>
                  <h2 style={{color: '#1e293b', marginBottom: '2rem'}}>Select a Timeslot with {selectedDoctor.name}</h2>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', marginTop: '2rem'}}>
                    {["09:00 AM", "10:30 AM", "01:00 PM", "02:30 PM", "04:00 PM", "05:30 PM"].map(time => (
                      <button key={time} className="btn-contact-donor" style={{background: 'white', border: '1px solid #e2e8f0', color: '#1e293b', padding: '1rem'}} onClick={() => setBookingStep(3)}>
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {bookingStep === 3 && (
            <div className="donor-card-premium" style={{padding: '3rem', textAlign: 'center'}}>
               <div style={{display: 'inline-flex', padding: '1rem', background: '#dcfce7', borderRadius: '50%', marginBottom: '1.5rem'}}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
               </div>
               <h2 style={{color: '#1e293b', marginBottom: '1rem'}}>Confirm Consultation</h2>
               <p style={{color: '#64748b', fontSize: '1.1rem'}}>
                 You are booking a video consultation with <strong>{selectedDoctor.name}</strong> for tomorrow.
               </p>
               <div style={{background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginTop: '2rem', textAlign: 'left'}}>
                 <div style={{marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{color: '#64748b'}}>Specialist</span>
                    <span style={{fontWeight: '600'}}>{selectedDoctor.specialty}</span>
                 </div>
                 <div style={{marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{color: '#64748b'}}>Consultation Fee</span>
                    <span style={{color: '#16a34a', fontWeight: '700'}}>FREE (Premium)</span>
                 </div>
               </div>
               <div style={{marginTop: '3rem', display: 'flex', gap: '1rem'}}>
                  <button className="btn-contact-donor" style={{flex: 1, background: '#f1f5f9', color: '#1e293b'}} onClick={() => setBookingStep(2)}>Cancel</button>
                  <button className="btn-contact-donor" style={{flex: 1}} onClick={handleConfirmBooking}>Confirm Appointment</button>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default BookDoctor;
