import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import { registerDonorAPI, getMyDonorAPI, getDonorRequestsAPI } from '../services/Appapi';
import { BASE_URL } from '../services/Baseurl';
import { toast } from 'react-toastify';
import LoginRequired from '../Components/LoginRequired';
import './Donor.css';

const Donor = () => {
  const { isAuthorized, userData, setUserData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [donorProfile, setDonorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchingRequests, setMatchingRequests] = useState([]);

  useEffect(() => {
    if (isAuthorized) {
      if (userData?.role !== 'donor' && userData?.role !== 'admin') {
        toast.warning("You are not registered with a donor role. Please update your role or register with a donor account.");
        navigate('/');
      } else {
        fetchDonorProfile();
      }
    }
  }, [isAuthorized, userData, navigate]);

  const fetchDonorProfile = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (token && userData?._id) {
        const header = { "Authorization": `Bearer ${token}` };
        const result = await getMyDonorAPI(userData._id, header);
        if (result.status === 200 && result.data) {
          setDonorProfile(result.data);
          // Also fetch contact requests
          fetchContactRequests(userData._id, header);
        }
      }
    } catch (error) {
      console.error("Error fetching donor profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactRequests = async (donorId, header) => {
    try {
        const result = await getDonorRequestsAPI(donorId, header);
        if (result.status === 200) {
            setMatchingRequests(result.data);
        }
    } catch (error) {
        console.error("Error fetching contact requests:", error);
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
    organs: {
      kidneys: false,
      liver: false,
      heart: false,
      lungs: false,
      pancreas: false,
      eyes: false,
    },
    agreement: false,
    photo: null,
    photoPreview: null,
    hospitalName: '',
    doctorInCharge: '',
    witnessName: '',
    witnessRelation: '',
    witnessPhoto: null,
    witnessPhotoPreview: null
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

  const handleWitnessPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        witnessPhoto: file,
        witnessPhotoPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('organ_')) {
      const organName = name.split('_')[1];
      setFormData(prev => ({
        ...prev,
        organs: {
          ...prev.organs,
          [organName]: checked
        }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { 
      firstName, lastName, email, phone, dob, gender, bloodGroup, 
      address, city, state, organs, photo, witnessName, witnessRelation, witnessPhoto,
      hospitalName, doctorInCharge 
    } = formData;

    if (!photo || !witnessPhoto) {
      toast.warning("Please upload both photos");
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
    reqBody.append("organs", JSON.stringify(organs));
    reqBody.append("photo", photo);
    reqBody.append("witnessName", witnessName);
    reqBody.append("witnessRelation", witnessRelation);
    reqBody.append("witnessPhoto", witnessPhoto);
    reqBody.append("hospitalName", hospitalName);
    reqBody.append("doctorInCharge", doctorInCharge);

    const token = sessionStorage.getItem("token");
    const header = {
      "Authorization": `Bearer ${token}`
    };

    const result = await registerDonorAPI(reqBody, header);
    if (result.status === 201) {
      toast.success("Donor Registration Successful!");
      if (result.data.user) {
        setUserData(result.data.user);
        sessionStorage.setItem("existingUser", JSON.stringify(result.data.user));
      }
      navigate('/profile');
    } else {
      toast.error(result.response?.data?.message || "Registration Failed");
    }
  };

  if (!isAuthorized) return <LoginRequired pageName="Donor Registration" />;

  if (loading) return <div className="donor-page"><div className="donor-container"><p>Loading...</p></div></div>;
  
  if (donorProfile) {
    return (
      <div className="donor-page">
        <div className="donor-container">
          <div className="form-card status-card">
            <div className="status-icon-wrapper">
              {donorProfile.status === 'pending' && <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
              {donorProfile.status === 'approved' && <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>}
              {donorProfile.status === 'rejected' && <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>}
            </div>
            <h1 className="status-title">
              {donorProfile.status === 'pending' && "Registration Under Review"}
              {donorProfile.status === 'approved' && "Certified Donor"}
              {donorProfile.status === 'rejected' && "Registration Rejected"}
            </h1>
            <p className="status-message">
              {donorProfile.status === 'pending' && "Thank you for your noble pledge. Our team is currently reviewing your registration details. You will be notified once your profile is approved."}
              {donorProfile.status === 'approved' && "Congratulations! Your profile has been approved. You are now officially registered in the AuraCare donor network. Your contribution can save lives."}
              {donorProfile.status === 'rejected' && "We regret to inform you that your donor registration could not be approved at this time. This may be due to verification issues with the submitted documents."}
            </p>
            {donorProfile.status === 'approved' && (
              <div className="contact-requests-section" style={{marginTop: '3rem', width: '100%', maxWidth: '800px'}}>
                <h2 style={{fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e293b', textAlign: 'left'}}>
                  Recipient Contact Requests
                </h2>
                {matchingRequests.length > 0 ? (
                  <div className="requests-list" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    {matchingRequests.map((req) => (
                      <div key={req._id} className="request-item" style={{background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'left', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem'}}>
                          <img 
                            src={req.receiverProfile?.photo ? `${BASE_URL}/uploads/${req.receiverProfile.photo}` : "https://via.placeholder.com/80"} 
                            alt="Recipient" 
                            style={{width: '80px', height: '80px', borderRadius: '20px', objectFit: 'cover', border: '3px solid #f8fafc'}}
                          />
                          <div style={{flex: 1}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                              <div>
                                <h4 style={{fontSize: '1.25rem', fontWeight: '700', color: '#1e293b'}}>{req.receiverProfile?.firstName} {req.receiverProfile?.lastName}</h4>
                                <p style={{fontSize: '0.95rem', color: '#64748b'}}>{req.receiverProfile?.city}, {req.receiverProfile?.state}</p>
                              </div>
                              <span className={`organ-tag urgency-${req.receiverProfile?.urgency}`} style={{fontSize: '0.8rem', padding: '0.5rem 1rem'}}>
                                {req.receiverProfile?.urgency?.toUpperCase()} PRIORITY
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem'}}>
                          <div className="detail-group">
                            <label style={{display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', marginBottom: '0.4rem', textTransform: 'uppercase'}}>Organ Requested</label>
                            <span style={{fontSize: '1rem', fontWeight: '700', color: 'var(--primary-red)'}}>{req.receiverProfile?.organNeeded?.toUpperCase()}</span>
                          </div>
                          <div className="detail-group">
                            <label style={{display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', marginBottom: '0.4rem', textTransform: 'uppercase'}}>Blood Group</label>
                            <span style={{fontSize: '1rem', fontWeight: '700', color: '#1e293b'}}>{req.receiverProfile?.bloodGroup}</span>
                          </div>
                          <div className="detail-group">
                            <label style={{display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', marginBottom: '0.4rem', textTransform: 'uppercase'}}>Gender / Age</label>
                            <span style={{fontSize: '1rem', fontWeight: '600', color: '#1e293b'}}>
                              {req.receiverProfile?.gender?.charAt(0).toUpperCase() + req.receiverProfile?.gender?.slice(1)} / {new Date().getFullYear() - new Date(req.receiverProfile?.dob).getFullYear()} Years
                            </span>
                          </div>
                          <div className="detail-group">
                            <label style={{display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', marginBottom: '0.4rem', textTransform: 'uppercase'}}>Contact Number</label>
                            <span style={{fontSize: '1rem', fontWeight: '600', color: '#1e293b'}}>{req.receiverProfile?.phone}</span>
                          </div>
                          <div className="detail-group">
                            <label style={{display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', marginBottom: '0.4rem', textTransform: 'uppercase'}}>Hospital</label>
                            <span style={{fontSize: '0.95rem', fontWeight: '600', color: '#1e293b'}}>{req.receiverProfile?.hospitalName}</span>
                          </div>
                          <div className="detail-group">
                            <label style={{display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', marginBottom: '0.4rem', textTransform: 'uppercase'}}>Doctor in Charge</label>
                            <span style={{fontSize: '0.95rem', fontWeight: '600', color: '#1e293b'}}>{req.receiverProfile?.doctorInCharge}</span>
                          </div>
                          <div className="detail-group" style={{gridColumn: '1 / -1'}}>
                            <label style={{display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', marginBottom: '0.4rem', textTransform: 'uppercase'}}>Full Residential Address</label>
                            <span style={{fontSize: '0.95rem', fontWeight: '500', color: '#475569'}}>{req.receiverProfile?.address}, {req.receiverProfile?.city}, {req.receiverProfile?.state}</span>
                          </div>
                        </div>

                        <div style={{display: 'flex', gap: '1rem', marginTop: '0.5rem'}}>
                          <a href={`mailto:${req.receiverId.email}`} className="btn" style={{flex: 1, background: '#1e293b', color: 'white', textDecoration: 'none', padding: '0.8rem', borderRadius: '12px', fontSize: '0.9rem', textAlign: 'center', fontWeight: '600'}}>
                            Send Official Email
                          </a>
                          <a href={`tel:${req.receiverProfile?.phone}`} className="btn btn-outline" style={{flex: 1, padding: '0.8rem', borderRadius: '12px', fontSize: '0.9rem', textAlign: 'center', fontWeight: '600'}}>
                            Contact via Phone
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{padding: '3rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#64748b'}}>
                    No contact requests yet. Your profile is visible to receivers in need.
                  </div>
                )}
              </div>
            )}
            <button className="btn btn-primary" style={{marginTop: '2rem'}} onClick={() => navigate('/profile')}>Go to Profile</button>

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
            <h1 className="form-title">Donor Registration</h1>
            <p className="form-subtitle">
              "The measure of life is not its duration, but its donation." <br/>
              Fill out the form below to become a certified organ donor.
            </p>
          </div>

          <div className="photo-upload-container">
            <div className="photo-preview">
              {formData.photoPreview ? (
                <img src={formData.photoPreview} alt="Donor Preview" />
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

            {/* Medical Facility */}
            <div className="form-section">
              <h3 className="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                Medical Facility Details
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Preferred Hospital</label>
                  <input required name="hospitalName" value={formData.hospitalName} onChange={handleChange} type="text" className="form-input" placeholder="Enter hospital name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Doctor in Charge</label>
                  <input required name="doctorInCharge" value={formData.doctorInCharge} onChange={handleChange} type="text" className="form-input" placeholder="Enter doctor's name" />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="form-section">
              <h3 className="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                Residential Address
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

            {/* Organ Donation Preference */}
            <div className="form-section">
              <h3 className="section-title">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                 Organs to Donate
              </h3>
              <p style={{marginBottom: '1rem', color: 'var(--text-light)', fontSize: '0.9rem'}}>Select the organs/tissues you wish to pledge:</p>
              <div className="checkbox-group">
                {['Kidneys', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Eyes'].map((organ) => (
                  <label key={organ} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      name={`organ_${organ.toLowerCase()}`}
                      checked={formData.organs[organ.toLowerCase()]}
                      onChange={handleChange}
                    />
                    {organ}
                  </label>
                ))}
              </div>
            </div>

            {/* Witness Information */}
            <div className="form-section">
              <h3 className="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                Witness Details
              </h3>
              <p style={{marginBottom: '1rem', color: 'var(--text-light)', fontSize: '0.9rem'}}>Ideally a close relative who can verify your identity and intent.</p>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Witness Name</label>
                  <input required name="witnessName" value={formData.witnessName} onChange={handleChange} type="text" className="form-input" placeholder="Enter witness name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Relationship to Donor</label>
                  <input required name="witnessRelation" value={formData.witnessRelation} onChange={handleChange} type="text" className="form-input" placeholder="e.g. Spouse, Parent, Sibling" />
                </div>
                
                <div className="form-group full-width">
                  <label className="form-label">Witness Photo</label>
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem'}}>
                    {formData.witnessPhotoPreview && (
                      <div className="photo-preview" style={{width: '60px', height: '60px', margin: 0, border: '2px solid white'}}>
                        <img src={formData.witnessPhotoPreview} alt="Witness" />
                      </div>
                    )}
                    <div className="upload-btn-wrapper">
                      <button className="btn-upload" type="button">Upload Photo</button>
                      <input type="file" required name="witnessPhoto" accept="image/*" onChange={handleWitnessPhotoChange} />
                    </div>
                  </div>
                   <p style={{fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.5rem'}}>Please upload a clear photo of the witness.</p>
                </div>
              </div>
            </div>

            {/* Willing Agreement */}
            <div className="agreement-box">
              <h3 style={{fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--primary-red)'}}>Declaration of Consent</h3>
              <p className="agreement-text">
                I hereby declare that I am of sound mind and voluntarily pledge to donate my organs/tissues after my death for therapeutic purposes. I understand that this pledge is a gift of life to those in need. I also understand that I can withdraw this pledge at any time by notifying the registry in writing.
              </p>
              <label className="agreement-confirm">
                <input 
                  type="checkbox" 
                  name="agreement" 
                  required 
                  checked={formData.agreement}
                  onChange={handleChange}
                />
                <span>I have read and agreed to the terms and conditions, and I willingly sign up to be an organ donor.</span>
              </label>
            </div>

            <button type="submit" className="submit-btn" disabled={!formData.agreement}>
              Complete Registration
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Donor;
