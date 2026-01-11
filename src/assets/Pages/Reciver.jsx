import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import { registerReceiverAPI, getMyReceiverAPI } from '../services/Appapi';
import { toast } from 'react-toastify';
import LoginRequired from '../Components/LoginRequired';
import './Reciver.css';

const Reciver = () => {
  const { isAuthorized, userData, setUserData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [receiverProfile, setReceiverProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthorized) {
      if (userData?.role !== 'receiver' && userData?.role !== 'admin') {
        toast.warning("You are not registered with a recipient role. Please update your role or register with a receiver account.");
        navigate('/');
      } else {
        fetchReceiverProfile();
      }
    }
  }, [isAuthorized, userData, navigate]);

  const fetchReceiverProfile = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (token && userData?._id) {
        const header = { "Authorization": `Bearer ${token}` };
        const result = await getMyReceiverAPI(userData._id, header);
        if (result.status === 200 && result.data) {
          setReceiverProfile(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching receiver profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    bloodGroup: '',
    address: '',
    city: '',
    state: '',
    organNeeded: '',
    urgency: 'low',
    hospitalName: '',
    doctorInCharge: '',
    agreement: false,
    photo: null,
    photoPreview: null,
    identityCard: null,
    identityCardPreview: null
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        photo: file,
        photoPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleIdentityCardChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        identityCard: file,
        identityCardPreview: file.name
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { 
      firstName, lastName, email, phone, dob, gender, bloodGroup, 
      address, city, state, organNeeded, urgency, photo, identityCard,
      hospitalName, doctorInCharge
    } = formData;

    if (!photo || !identityCard) {
      toast.warning("Please upload both photo and identity card");
      return;
    }

    const reqBody = new FormData();
    reqBody.append("firstName", firstName);
    reqBody.append("lastName", lastName);
    reqBody.append("email", email);
    reqBody.append("phone", phone);
    reqBody.append("dob", dob);
    reqBody.append("gender", gender);
    reqBody.append("bloodGroup", bloodGroup);
    reqBody.append("address", address);
    reqBody.append("city", city);
    reqBody.append("state", state);
    reqBody.append("organNeeded", organNeeded);
    reqBody.append("urgency", urgency);
    reqBody.append("photo", photo);
    reqBody.append("identityCard", identityCard);
    reqBody.append("hospitalName", hospitalName);
    reqBody.append("doctorInCharge", doctorInCharge);

    const token = sessionStorage.getItem("token");
    const header = {
      "Authorization": `Bearer ${token}`
    };

    const result = await registerReceiverAPI(reqBody, header);
    if (result.status === 201) {
      toast.success("Recipient Request Submitted Successfully!");
      if (result.data.user) {
        setUserData(result.data.user);
        sessionStorage.setItem("existingUser", JSON.stringify(result.data.user));
      }
      navigate('/profile');
    } else {
      toast.error(result.response?.data?.message || "Submission Failed");
    }
  };

  if (!isAuthorized) return <LoginRequired pageName="Recipient Registration" />;

  if (loading) return <div className="donor-page"><div className="donor-container"><p>Loading...</p></div></div>;

  if (receiverProfile) {
    return (
      <div className="donor-page">
        <div className="donor-container">
          <div className="form-card status-card">
            <div className="status-icon-wrapper">
              {receiverProfile.status === 'pending' && <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
              {receiverProfile.status === 'approved' && <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>}
              {receiverProfile.status === 'rejected' && <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>}
            </div>
            <h1 className="status-title">
              {receiverProfile.status === 'pending' && "Request Under Review"}
              {receiverProfile.status === 'approved' && "Request Approved"}
              {receiverProfile.status === 'rejected' && "Request Rejected"}
            </h1>
            <p className="status-message">
              {receiverProfile.status === 'pending' && "Your request for an organ transplant has been received. Our medical board is currently reviewing your case and verifying the submitted documents."}
              {receiverProfile.status === 'approved' && "Great news! Your request has been approved and you are now in our active matching queue. Our system will notify you as soon as a compatible donor is found."}
              {receiverProfile.status === 'rejected' && "We regret to inform you that your recipient request could not be approved at this time. Please ensure all medical documents and government IDs are valid and clear."}
            </p>
            {receiverProfile.status === 'approved' && (
              <div className="pledge-summary">
                 <h3>Request Details:</h3>
                 <p><strong>Organ Needed:</strong> {receiverProfile.organNeeded?.toUpperCase()}</p>
                 <p><strong>Urgency:</strong> {receiverProfile.urgency?.toUpperCase()}</p>
              </div>
            )}
            <button className="btn btn-primary" onClick={() => navigate('/profile')}>Go to Profile</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="donor-page">
      <div className="donor-container">
        <div className="form-card">
          <div className="form-header">
            <h1 className="form-title">Recipient Registration</h1>
            <p className="form-subtitle">
              Register to find a matching donor. We are here to support you in your journey to recovery.
            </p>
          </div>

          <div className="photo-upload-container">
            <div className="photo-preview">
              {formData.photoPreview ? (
                <img src={formData.photoPreview} alt="Recipient Preview" />
              ) : (
                <div className="photo-placeholder">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              )}
            </div>
            <div className="upload-btn-wrapper">
              <button className="btn-upload" type="button">Upload Photo</button>
              <input type="file" name="photo" accept="image/*" onChange={handlePhotoChange} />
            </div>
            <p style={{fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.5rem'}}>Allowed: JPG, PNG. Max 2MB.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="form-section">
              <h3 className="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Personal Details
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input required name="firstName" value={formData.firstName} onChange={handleChange} type="text" className="form-input" placeholder="Enter first name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input required name="lastName" value={formData.lastName} onChange={handleChange} type="text" className="form-input" placeholder="Enter last name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input required name="dob" value={formData.dob} onChange={handleChange} type="date" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select required name="gender" value={formData.gender} onChange={handleChange} className="form-input">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select required name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="form-input">
                    <option value="">Select Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" className="form-input" placeholder="+1 (555) 000-0000" />
                </div>
                <div className="form-group full-width">
                   <label className="form-label">Email Address</label>
                   <input required name="email" value={formData.email} onChange={handleChange} type="email" className="form-input" placeholder="you@example.com" />
                </div>
              </div>
            </div>

            {/* Medical Info */}
            <div className="form-section">
              <h3 className="section-title">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                 Medical Requirements
              </h3>
              <div className="form-grid">
                <div className="form-group">
                    <label className="form-label">Organ Needed</label>
                    <select required name="organNeeded" value={formData.organNeeded} onChange={handleChange} className="form-input">
                      <option value="">Select Organ</option>
                      <option value="kidneys">Kidneys</option>
                      <option value="liver">Liver</option>
                      <option value="heart">Heart</option>
                      <option value="lungs">Lungs</option>
                      <option value="pancreas">Pancreas</option>
                      <option value="eyes">Eyes</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Urgency Level</label>
                    <select required name="urgency" value={formData.urgency} onChange={handleChange} className="form-input">
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                </div>
              </div>
            </div>

            {/* Medical Facility */}
            <div className="form-section">
              <h3 className="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                Hospital & Physician Details
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Treating Hospital</label>
                  <input required name="hospitalName" value={formData.hospitalName} onChange={handleChange} type="text" className="form-input" placeholder="Enter hospital name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Doctor in Charge</label>
                  <input required name="doctorInCharge" value={formData.doctorInCharge} onChange={handleChange} type="text" className="form-input" placeholder="Enter doctor's name" />
                </div>
              </div>
            </div>

            {/* Valid Identity Card Upload */}
             <div className="form-section">
              <h3 className="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                Identity Verification
              </h3>
              <div className="form-group full-width">
                  <label className="form-label">Upload Government ID (PDF/JPG/PNG)</label>
                  <div className="upload-btn-wrapper" style={{display: 'block', textAlign: 'left', marginTop: '0.5rem'}}>
                    <button className="btn-upload" type="button" style={{width: '100%', textAlign: 'center'}}>
                      {formData.identityCardPreview ? `Selected: ${formData.identityCardPreview}` : "Choose File"}
                    </button>
                    <input required type="file" name="identityCard" accept=".pdf,image/*" onChange={handleIdentityCardChange} style={{width: '100%'}} />
                  </div>
              </div>
            </div>

            {/* Address */}
            <div className="form-section">
              <h3 className="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                Result Address
              </h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">Street Address</label>
                  <input required name="address" value={formData.address} onChange={handleChange} type="text" className="form-input" placeholder="123 Main St" />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input required name="city" value={formData.city} onChange={handleChange} type="text" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input required name="state" value={formData.state} onChange={handleChange} type="text" className="form-input" />
                </div>
              </div>
            </div>

            {/* Agreement */}
            <div className="agreement-box">
              <h3 style={{fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--primary-red)'}}>Declaration</h3>
              <p className="agreement-text">
                I hereby declare that the information provided is true and accurate. I understand that my request will be reviewed by medical professionals and matched based on eligibility and availability.
              </p>
              <label className="agreement-confirm">
                <input 
                  type="checkbox" 
                  name="agreement" 
                  required 
                  checked={formData.agreement}
                  onChange={handleChange}
                />
                <span>I agree to the terms and privacy policy of AuraCare.</span>
              </label>
            </div>

            <button type="submit" className="submit-btn" disabled={!formData.agreement}>
              Submit Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Reciver;
