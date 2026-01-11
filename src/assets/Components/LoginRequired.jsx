import React from 'react';
import { useNavigate } from 'react-router-dom';
import notLoggedInImg from '../Images/not-logged-in.png';
import './LoginRequired.css';

const LoginRequired = ({ pageName }) => {
  const navigate = useNavigate();

  return (
    <div className="login-required-container">
      <div className="login-required-card">
        <div className="login-required-image-wrapper">
          <img src={notLoggedInImg} alt="Not Logged In" className="login-required-img" />
        </div>
        <h1 className="login-required-title">Login for this operation</h1>
        <p className="login-required-text">
          Please sign in to your account to access the {pageName} section and its features.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default LoginRequired;
