import React, { useContext, useState } from 'react';
import { AuthContext } from '../Context/AuthContext';
import { createCheckoutSessionAPI } from '../services/Appapi';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';
import './Aura.css'; // Reusing some base styles

const stripePromise = loadStripe('pk_test_51SnkvIRzGyc5WGuhAvtg7IbviX7FKP8lFkRNYGYFelx8SIjNq4qwSEargYHwRetkPQJYPZrx7fnO64zMF5G99JL800PLtOLoPN');

const Premium = () => {
  const { userData, isAuthorized } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!isAuthorized) {
      toast.info("Please login to upgrade to Premium");
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const header = { "Authorization": `Bearer ${token}` };
      
      const result = await createCheckoutSessionAPI(header);
      
      // Axios returns the response in 'result' if successful, 
      // or the error object if commonAPI catches it.
      const status = result.status || result.response?.status;
      const data = result.data || result.response?.data;

      if (status === 200 && data?.url) {
        window.location.href = data.url;
      } else {
        const errorMsg = data?.message || result.message || "Failed to initiate payment.";
        console.error("Payment Initiation Failed:", result);
        toast.error(`Error: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An error occurred. Check browser console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aura-page">
      <div className="aura-header-bg" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'}}>
        <div className="container" style={{textAlign: 'center'}}>
          <h1 className="aura-title">AuraCare Premium</h1>
          <p className="aura-subtitle" style={{maxWidth: '700px', margin: '1rem auto'}}>
            Unlock exclusive features and prioritize your health with our Premium membership. 
            Connect with medical experts, get priority matching, and more.
          </p>
        </div>
      </div>

      <div className="container section-padding">
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <div className="donor-card-premium" style={{maxWidth: '450px', width: '100%', padding: '3rem', textAlign: 'center', background: 'white', border: '2px solid #e2e8f0'}}>
            <div style={{display: 'inline-flex', padding: '1rem', background: '#fef3c7', borderRadius: '50%', marginBottom: '1.5rem'}}>
               <svg width="40" height="40" viewBox="0 0 24 24" fill="#d97706" stroke="#d97706" strokeWidth="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
            </div>
            <h2 style={{fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem'}}>Pro Member</h2>
            <div style={{fontSize: '3rem', fontWeight: '900', color: '#1e293b', marginBottom: '1.5rem'}}>
               $49 <span style={{fontSize: '1rem', color: '#64748b', fontWeight: '500'}}>one-time</span>
            </div>
            
            <ul style={{listStyle: 'none', padding: 0, margin: '2rem 0', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <li style={{display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '1.05rem'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3"><path d="M16 2v4M8 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>
                <strong>Online Consultancy Slots:</strong> Book instant appointments with specialized doctors across all listed hospitals.
              </li>
              <li style={{display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '1.05rem'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <strong>Multi-Hospital Network:</strong> Access consultancy services from leading medical institutions in our registry.
              </li>
              <li style={{display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '1.05rem'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <strong>Telehealth Integration:</strong> Secure video consultations with medical experts from your home.
              </li>
              <li style={{display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '1.05rem'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Priority Support & Health Analytics
              </li>
            </ul>

            <button 
              className="btn-contact-donor" 
              style={{width: '100%', padding: '1.25rem', fontSize: '1.1rem', background: '#1e293b', marginTop: '1.5rem'}}
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? "Processing..." : userData?.isPremium ? "Already a Premium Member" : "Get Started Now"}
            </button>
            
            <p style={{marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.85rem'}}>
              Secure payment via Stripe. One-time payment for lifetime access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;
