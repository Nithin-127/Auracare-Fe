import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';
import { updateProfileAPI, getMyDonorAPI, getMyReceiverAPI } from '../services/Appapi';
import { BASE_URL } from '../services/Baseurl';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const { userData, setUserData, logout, isAuthorized } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    password: '',
    profilePic: '',
    imageFile: null
  });

  useEffect(() => {
    if (userData) {
      setEditForm({
        fullName: userData.fullName || '',
        email: userData.email || '',
        password: '',
        profilePic: userData.profilePic ? `${BASE_URL}/uploads/${userData.profilePic}` : '',
        imageFile: null
      });
      fetchRegistrationStatus();
    }
  }, [userData]);

  const fetchRegistrationStatus = async () => {
    const token = sessionStorage.getItem("token");
    const header = { "Authorization": `Bearer ${token}` };
    
    if (userData.role === 'donor') {
      const result = await getMyDonorAPI(userData._id, header);
      if (result.status === 200) setRegistrationData(result.data);
    } else if (userData.role === 'receiver') {
      const result = await getMyReceiverAPI(userData._id, header);
      if (result.status === 200) setRegistrationData(result.data);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditForm({
        fullName: userData.fullName,
        email: userData.email,
        password: '',
        profilePic: userData.profilePic ? `${BASE_URL}/uploads/${userData.profilePic}` : '',
        imageFile: null
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm(prev => ({ 
        ...prev, 
        imageFile: file,
        profilePic: URL.createObjectURL(file) 
      }));
    }
  };

  const handleSave = async () => {
    const { fullName, password, imageFile } = editForm;
    const reqBody = new FormData();
    if (fullName) reqBody.append("fullName", fullName);
    if (password) reqBody.append("password", password);
    if (imageFile) reqBody.append("profilePic", imageFile);

    const token = sessionStorage.getItem("token");
    const header = {
      "Authorization": `Bearer ${token}`
    };

    const result = await updateProfileAPI(userData._id, reqBody, header);
    if (result.status === 200) {
      toast.success("Profile updated successfully");
      const updatedUser = result.data.user;
      setUserData(updatedUser);
      sessionStorage.setItem("existingUser", JSON.stringify(updatedUser));
      setIsEditing(false);
    } else {
      toast.error("Update failed");
    }
  };

  if (!isAuthorized) return <div className="profile-page"><p>Please login to view profile.</p></div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        
        {/* Left Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-pic-wrapper">
            <img 
              src={editForm.profilePic || 'https://via.placeholder.com/150'} 
              alt="Profile" 
              className="profile-pic" 
            />
            {isEditing && (
              <label className="profile-pic-edit-overlay">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                <input type="file" className="profile-pic-input" accept="image/*" onChange={handleImageChange} />
              </label>
            )}
          </div>
          <h2 className="profile-name">{userData?.fullName}</h2>
          <span className="profile-role-badge">{userData?.role?.toUpperCase()}</span>
          
          <ul className="profile-nav">
            <li className="profile-nav-item active">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              My Profile
            </li>
            <li className="profile-nav-item" onClick={logout} style={{color: '#ef4444', marginTop: '1rem', borderTop: '1px solid #f3f4f6', cursor: 'pointer'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Log Out
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="profile-content">
          <div className="content-header">
            <h2 className="content-title">Account Settings</h2>
            <button className={`edit-btn ${isEditing ? 'active' : ''}`} onClick={handleEditToggle}>
              {isEditing ? 'Cancel Edit' : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  Edit Profile
                </>
              )}
            </button>
          </div>

          <div className="info-group">
            <label className="info-label">Full Name</label>
            {isEditing ? (
              <input type="text" name="fullName" className="info-input" value={editForm.fullName} onChange={handleInputChange} />
            ) : (
              <div className="info-value">{userData?.fullName}</div>
            )}
          </div>

          <div className="info-group">
            <label className="info-label">Email Address</label>
            <div className="info-value">{userData?.email}</div>
          </div>

          {isEditing && (
             <div className="info-group">
                <label className="info-label">New Password (leave blank to keep current)</label>
                <input type="password" name="password" className="info-input" value={editForm.password} onChange={handleInputChange} />
             </div>
          )}

          <div className="info-group" style={{marginTop: '2rem', borderTop: '1px solid #f3f4f6', paddingTop: '2rem'}}>
            <h3 style={{fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem'}}>Registration Status</h3>
            {registrationData ? (
               <div className="registration-status-card">
                  <div className="status-item">
                    <strong>Status:</strong> 
                    <span className={`status-badge ${registrationData.status}`}>
                      {registrationData.status?.toUpperCase()}
                    </span>
                  </div>
                  {userData.role === 'donor' ? (
                    <div className="status-details">
                      <p>Currently registered as an organ donor.</p>
                      <p>Organs Pledged: {Object.keys(registrationData.organs).filter(k => registrationData.organs[k]).join(', ')}</p>
                    </div>
                  ) : (
                    <div className="status-details">
                       <p>Requested Organ: {registrationData.organNeeded?.toUpperCase()}</p>
                       <p>Urgency: {registrationData.urgency?.toUpperCase()}</p>
                    </div>
                  )}
               </div>
            ) : (
              <p>You haven't registered as a {userData.role} yet.</p>
            )}
          </div>

          {isEditing && (
            <div className="save-actions">
              <button className="cancel-btn" onClick={handleEditToggle}>Cancel</button>
              <button className="save-btn" onClick={handleSave}>Save Changes</button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default Profile;
