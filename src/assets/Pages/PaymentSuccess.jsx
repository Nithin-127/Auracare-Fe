import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyPaymentAPI } from '../services/Appapi';
import { AuthContext } from '../Context/AuthContext';
import { toast } from 'react-toastify';
import './Aura.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const { setUserData } = useContext(AuthContext);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      navigate('/');
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const header = { "Authorization": `Bearer ${token}` };
      const result = await verifyPaymentAPI({ sessionId }, header);
      
      if (result.status === 200) {
        toast.success("Welcome to Premium! Your account has been upgraded.");
        
        // Update local state and session storage
        const existingUser = JSON.parse(sessionStorage.getItem("existingUser"));
        const updatedUser = { ...existingUser, isPremium: true };
        setUserData(updatedUser);
        sessionStorage.setItem("existingUser", JSON.stringify(updatedUser));
        
        setTimeout(() => {
          navigate('/book-doctor');
        }, 3000);
      } else {
        toast.error("Payment verification failed. Please contact support.");
        navigate('/premium');
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Error verifying payment.");
      navigate('/premium');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="aura-page" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh'}}>
      <div className="donor-card-premium" style={{maxWidth: '500px', width: '90%', padding: '4rem', textAlign: 'center', background: 'white'}}>
        {verifying ? (
          <>
            <div className="loader" style={{margin: '0 auto 2rem'}}></div>
            <h2 style={{color: '#1e293b'}}>Verifying Your Payment...</h2>
            <p style={{color: '#64748b', marginTop: '1rem'}}>Please do not refresh the page.</p>
          </>
        ) : (
          <>
            <div style={{display: 'inline-flex', padding: '1.5rem', background: '#d1fae5', borderRadius: '50%', marginBottom: '2rem'}}>
               <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h2 style={{fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '1rem'}}>Payment Successful!</h2>
            <p style={{fontSize: '1.1rem', color: '#475569', lineHeight: '1.6'}}>
              Thank you for going Premium. You now have unlimited access to doctor consultations and all premium features.
            </p>
            <div style={{marginTop: '3rem'}}>
               <p style={{color: '#94a3b8', fontSize: '0.9rem'}}>Redirecting you to the Consultation Desk...</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
