import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginAPI, registerAPI, googleLoginAPI } from '../services/Appapi';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../Context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Auth = () => {
  const { login } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminCode: ""
  });

  // Determine mode (login or register) based on URL path
  const isLogin = location.pathname === '/login';
  const modeText = isLogin ? 'Log In' : 'Register';

  // Clear role and form when switching modes
  useEffect(() => {
    setRole(null);
    setFormData({ fullName: "", email: "", password: "", confirmPassword: "", adminCode: "" });
  }, [location.pathname]);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
  };

  const handleSwitchMode = () => {
    navigate(isLogin ? '/register' : '/login');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, password, adminCode } = formData;

    if (isLogin) {
      // Login Logic
      if (!email || !password) {
        toast.warning("Please fill all fields");
        return;
      }

      const result = await loginAPI({ email, password });
      if (result.status === 200) {
        toast.success("Login Successful");
        login(result.data.user, result.data.token);
        
        if (result.data.user.role === 'admin') {
          navigate('/admin');
        } else if (result.data.user.role === 'donor') {
          navigate('/donor');
        } else if (result.data.user.role === 'receiver') {
          navigate('/receiver');
        } else {
          navigate('/');
        }
      } else {
        toast.error(result.response?.data?.message || "Login Failed");
      }
    } else {
      // Register Logic
      const { fullName, email, password, confirmPassword, adminCode } = formData;
      if (!fullName || !email || !password || !confirmPassword) {
        toast.warning("Please fill all fields");
        return;
      }

      if (password !== confirmPassword) {
        toast.error("Passwords do not match!");
        return;
      }

      const reqBody = { fullName, email, password, role };
      if (role === 'admin') reqBody.adminCode = adminCode;

      const result = await registerAPI(reqBody);
      if (result.status === 201) {
        toast.success("Registration Successful! Please login.");
        navigate('/login');
      } else {
        toast.error(result.response?.data?.message || "Registration Failed");
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (credentialResponse.credential) {
      const result = await googleLoginAPI({ token: credentialResponse.credential, role });
      if (result.status === 200 || result.status === 201) {
        toast.success(result.status === 200 ? "Login Successful" : "Registration Successful");
        login(result.data.user, result.data.token);
        
        const userRole = result.data.user.role;
        if (userRole === 'admin') {
          navigate('/admin');
        } else if (userRole === 'donor') {
          navigate('/donor');
        } else if (userRole === 'receiver') {
          navigate('/receiver');
        } else {
          navigate('/');
        }
      } else {
         toast.error(result.response?.data?.message || "Google Login Failed");
      }
    }
  };

  const handleGoogleError = () => {
    toast.error("Google Login Failed");
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        {role && (
          <button className="back-btn" onClick={() => setRole(null)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
        )}

        <div className="auth-header">
          <h1 className="auth-title">
            {role ? `${modeText} as ${role.charAt(0).toUpperCase() + role.slice(1)}` : `Welcome to AuraCare`}
          </h1>
          <p className="auth-subtitle">
            {role 
              ? `Please enter your details to ${isLogin ? 'access your account' : 'create your account'}.`
              : `Select your role to ${isLogin ? 'log in' : 'register'}.`
            }
          </p>
        </div>

        {!role ? (
          /* Role Selection View */
          <div className="role-grid">
            <div className="role-card" onClick={() => handleRoleSelect('donor')}>
              <div className="role-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <span className="role-name">Donor</span>
            </div>

            <div className="role-card" onClick={() => handleRoleSelect('receiver')}>
              <div className="role-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 8v8M8 12h8"></path>
                </svg>
              </div>
              <span className="role-name">Receiver</span>
            </div>

            {isLogin && (
              <div className="role-card" onClick={() => handleRoleSelect('admin')}>
                <div className="role-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path>
                    <path d="M12 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm0 2a5 5 0 0 0-5 5v1h10v-1a5 5 0 0 0-5-5z"></path>
                  </svg>
                </div>
                <span className="role-name">Admin</span>
              </div>
            )}
          </div>
        ) : (
          /* Logical Form View */
          <div className="auth-form-container">
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="form-input" placeholder="John Doe" />
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" placeholder="you@example.com" />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-input" placeholder="••••••••" />
              </div>

              {!isLogin && (
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="form-input" placeholder="••••••••" />
                </div>
              )}



              <button type="submit" className="btn auth-submit-btn">
                {modeText}
              </button>

              <div className="google-login-container" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ margin: '10px 0', fontSize: '14px', color: '#666' }}>OR</div>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_blue"
                  shape="pill"
                  text={isLogin ? "signin_with" : "signup_with"}
                />
              </div>
            </form>
          </div>
        )}

        <div className="toggle-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span className="toggle-link" onClick={handleSwitchMode}>
            {isLogin ? 'Register now' : 'Log in here'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Auth;
