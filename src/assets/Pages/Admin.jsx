import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAdminStatsAPI, getAllDonorsAPI, getAllReceiversAPI, updateDonorStatusAPI, updateReceiverStatusAPI, getAllMessagesAPI, updateProfileAPI, deleteDonorAPI, deleteReceiverAPI } from '../services/Appapi';
import { BASE_URL } from '../services/Baseurl';
import { toast } from 'react-toastify';
import './Admin.css';

const Admin = () => {
  const { userData, setUserData, isAuthorized, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dashboardTab, setDashboardTab] = useState('home');
  const [activeTab, setActiveTab] = useState('pending'); // for home/requests
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonors: 0,
    totalReceivers: 0,
    pendingDonors: 0,
    pendingReceivers: 0
  });
  
  const [requests, setRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Profile Editing States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    password: '',
    profilePic: null
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (!isAuthorized || userData?.role !== 'admin') {
      toast.error("Unauthorized Access");
      navigate('/');
    } else {
      fetchData();
      fetchMessages();
    }
  }, [isAuthorized, userData, navigate]);

  const fetchData = async () => {
    const token = sessionStorage.getItem("token");
    const header = { "Authorization": `Bearer ${token}` };

    // Fetch Stats
    const statsRes = await getAdminStatsAPI(header);
    if (statsRes.status === 200) setStats(statsRes.data);

    // Fetch All Data
    const donorsRes = await getAllDonorsAPI(header);
    const receiversRes = await getAllReceiversAPI(header);

    let allRequests = [];
    if (donorsRes.status === 200) {
      allRequests = [...allRequests, ...donorsRes.data.map(d => ({ ...d, type: 'donor' }))];
    }
    if (receiversRes.status === 200) {
      allRequests = [...allRequests, ...receiversRes.data.map(r => ({ ...r, type: 'receiver' }))];
    }

    setRequests(allRequests);
  };

  const fetchMessages = async () => {
    const token = sessionStorage.getItem("token");
    const header = { "Authorization": `Bearer ${token}` };
    const result = await getAllMessagesAPI(header);
    if (result.status === 200) {
      setMessages(result.data);
    }
  };

  const handleStatusChange = async (id, type, newStatus) => {
    const token = sessionStorage.getItem("token");
    const header = { "Authorization": `Bearer ${token}` };
    
    let result;
    if (type === 'donor') {
      result = await updateDonorStatusAPI(id, { status: newStatus }, header);
    } else {
      result = await updateReceiverStatusAPI(id, { status: newStatus }, header);
    }

    if (result.status === 200) {
      toast.success(`Request ${newStatus} successfully`);
      fetchData(); // Refresh data
    } else {
      toast.error("Status update failed");
    }
  };

  const handleDeleteUser = async (id, type) => {
    const token = sessionStorage.getItem("token");
    const header = { "Authorization": `Bearer ${token}` };
    
    // Simple confirmation dialog
    if (window.confirm(`Are you sure you want to remove this ${type}? This action cannot be undone.`)) {
      let result;
      if (type === 'donor') {
        result = await deleteDonorAPI(id, header);
      } else {
        result = await deleteReceiverAPI(id, header);
      }

      if (result.status === 200) {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} removed successfully`);
        fetchData(); // Refresh data to reflect deletion
      } else {
        toast.error("Failed to remove user");
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileForm(prev => ({ ...prev, profilePic: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    const header = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    };

    const reqBody = new FormData();
    if (profileForm.fullName) reqBody.append("fullName", profileForm.fullName);
    if (profileForm.password) reqBody.append("password", profileForm.password);
    if (profileForm.profilePic) reqBody.append("profilePic", profileForm.profilePic);

    try {
      const result = await updateProfileAPI(userData._id, reqBody, header);
      if (result.status === 200) {
        toast.success("Profile updated successfully");
        setUserData(result.data.user);
        sessionStorage.setItem("existingUser", JSON.stringify(result.data.user));
        setIsEditingProfile(false);
        setProfileForm({ fullName: '', password: '', profilePic: null });
        setPreviewImage(null);
      } else {
        toast.error("Profile update failed");
      }
    } catch (error) {
      console.error("Profile Update Error:", error);
      toast.error("An error occurred during update");
    }
  };

  const toggleEditProfile = () => {
    if (!isEditingProfile) {
      setProfileForm({
        fullName: userData.fullName,
        password: '',
        profilePic: null
      });
      setPreviewImage(null);
    }
    setIsEditingProfile(!isEditingProfile);
  };

  const filteredRequestsByStatus = activeTab === 'all' 
    ? requests 
    : requests.filter(req => req.status === activeTab);

  const donorsOnly = requests.filter(req => req.type === 'donor');
  const receiversOnly = requests.filter(req => req.type === 'receiver');

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span>AuraCare Admin</span>
        </div>
        <nav className="sidebar-nav">
          <div className={`nav-item ${dashboardTab === 'home' ? 'active' : ''}`} onClick={() => setDashboardTab('home')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span>Home</span>
          </div>
          <div className={`nav-item ${dashboardTab === 'donors' ? 'active' : ''}`} onClick={() => setDashboardTab('donors')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <span>Donor List</span>
          </div>
          <div className={`nav-item ${dashboardTab === 'receivers' ? 'active' : ''}`} onClick={() => setDashboardTab('receivers')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span>Receiver List</span>
          </div>
          <div className={`nav-item ${dashboardTab === 'messages' ? 'active' : ''}`} onClick={() => setDashboardTab('messages')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <span>Messages</span>
          </div>
          <div className={`nav-item ${dashboardTab === 'profile' ? 'active' : ''}`} onClick={() => setDashboardTab('profile')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>Profile</span>
          </div>
        </nav>
        <div className="nav-item-logout" onClick={handleLogout}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span>Logout</span>
        </div>
      </aside>

      <main className="admin-main-content">
        <div className="dashboard-container">
          
          {/* Home View */}
          {dashboardTab === 'home' && (
            <>
              <div className="dashboard-header">
                <div>
                  <h1 className="dashboard-title">Dashboard Overview</h1>
                  <p style={{color: 'var(--text-light)'}}>Welcome back, Admin</p>
                </div>
                <div className="dashboard-stats">
                  <div className="stat-card">
                    <span className="stat-value">{stats.totalDonors + stats.totalReceivers}</span>
                    <span className="stat-label">Total Requests</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-value" style={{color: '#d97706'}}>{stats.pendingDonors + stats.pendingReceivers}</span>
                    <span className="stat-label">Pending</span>
                  </div>
                </div>
              </div>

              <div className="dashboard-content">
                <div className="tabs">
                  <div className={`tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>Pending Approval</div>
                  <div className={`tab ${activeTab === 'approved' ? 'active' : ''}`} onClick={() => setActiveTab('approved')}>Approved</div>
                  <div className={`tab ${activeTab === 'rejected' ? 'active' : ''}`} onClick={() => setActiveTab('rejected')}>Rejected</div>
                  <div className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Requests</div>
                </div>

                <div className="table-wrapper">
                  <table className="request-table">
                    <thead>
                      <tr>
                        <th>User Details</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequestsByStatus.map(req => (
                        <tr key={req._id}>
                          <td>
                            <div className="user-info">
                              <div className="user-avatar">
                                {req.photo ? (
                                  <img src={`${BASE_URL}/uploads/${req.photo}`} alt="Avatar" style={{width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover'}} />
                                ) : (
                                  <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: req.type === 'donor' ? '#fecaca' : '#d1fae5', color: req.type === 'donor' ? '#b91c1c' : '#065f46'}}>
                                    {req.firstName?.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="user-details">
                                <h4>{req.firstName} {req.lastName}</h4>
                                <p>{req.email}</p>
                              </div>
                            </div>
                          </td>
                          <td><span className={`type-badge ${req.type}`}>{req.type?.toUpperCase()}</span></td>
                          <td><span className={`status-badge ${req.status}`}>● {req.status?.toUpperCase()}</span></td>
                          <td>
                            <div className="action-buttons">
                              {req.status === 'pending' ? (
                                <button className="btn btn-primary btn-sm" onClick={() => setSelectedRequest(req)}>
                                  Verify & Approve
                                </button>
                              ) : (
                                <span style={{color: '#9ca3af'}}>-</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Donors List View */}
          {dashboardTab === 'donors' && (
            <>
              <div className="dashboard-header">
                <h1 className="dashboard-title">Donor Registry</h1>
              </div>
              <div className="dashboard-content">
                <div className="table-wrapper">
                  <table className="request-table">
                    <thead>
                      <tr>
                        <th>Donor Details</th>
                        <th>Contact Info</th>
                        <th>Address</th>
                        <th>Organs Pledged</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donorsOnly.map(donor => (
                        <tr key={donor._id}>
                          <td>
                            <div className="user-info">
                              <div className="user-avatar">
                                {donor.photo ? (
                                  <img src={`${BASE_URL}/uploads/${donor.photo}`} alt="Avatar" style={{width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover'}} />
                                ) : (
                                  <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fecaca', color: '#b91c1c'}}>
                                    {donor.firstName?.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="user-details">
                                <h4 style={{fontSize: '0.95rem'}}>{donor.firstName} {donor.lastName}</h4>
                                <p style={{fontSize: '0.85rem', color: '#64748b'}}>{donor.bloodGroup} Group</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{fontSize: '0.9rem'}}>
                              <p style={{fontWeight: '600'}}>{donor.phone}</p>
                              <p style={{color: '#64748b'}}>{donor.email}</p>
                            </div>
                          </td>
                          <td>
                            <p style={{fontSize: '0.9rem', color: '#475569'}}>{donor.address}, {donor.city}, {donor.state}</p>
                          </td>
                          <td>
                            <div className="organs-tags">
                              {Object.keys(donor.organs || {}).filter(k => donor.organs[k]).map(organ => (
                                <span key={organ} className="organ-tag" style={{padding: '0.2rem 0.5rem', fontSize: '0.75rem'}}>
                                  {organ.charAt(0).toUpperCase() + organ.slice(1)}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td><span className={`status-badge ${donor.status}`}>● {donor.status?.toUpperCase()}</span></td>
                          <td>
                            <button className="btn btn-sm" style={{color: '#dc2626', border: '1px solid #dc2626', background: 'transparent'}} onClick={() => handleDeleteUser(donor._id, 'donor')}>Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Receivers List View */}
          {dashboardTab === 'receivers' && (
            <>
              <div className="dashboard-header">
                <h1 className="dashboard-title">Receiver Registry</h1>
              </div>
              <div className="dashboard-content">
                <div className="table-wrapper">
                  <table className="request-table">
                    <thead>
                      <tr>
                        <th>Receiver Details</th>
                        <th>Contact Info</th>
                        <th>Address</th>
                        <th>Organ Needed</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receiversOnly.map(receiver => (
                        <tr key={receiver._id}>
                          <td>
                            <div className="user-info">
                              <div className="user-avatar">
                                {receiver.photo ? (
                                  <img src={`${BASE_URL}/uploads/${receiver.photo}`} alt="Avatar" style={{width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover'}} />
                                ) : (
                                  <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#d1fae5', color: '#065f46'}}>
                                    {receiver.firstName?.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="user-details">
                                <h4 style={{fontSize: '0.95rem'}}>{receiver.firstName} {receiver.lastName}</h4>
                                <p style={{fontSize: '0.85rem', color: '#64748b'}}>{receiver.bloodGroup} Group</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{fontSize: '0.9rem'}}>
                              <p style={{fontWeight: '600'}}>{receiver.phone}</p>
                              <p style={{color: '#64748b'}}>{receiver.email}</p>
                            </div>
                          </td>
                          <td>
                            <p style={{fontSize: '0.9rem', color: '#475569'}}>{receiver.address}, {receiver.city}, {receiver.state}</p>
                          </td>
                          <td>
                            <span className="organ-tag" style={{padding: '0.3rem 0.6rem', fontSize: '0.8rem'}}>
                              {receiver.organNeeded?.toUpperCase()}
                            </span>
                          </td>
                          <td><span className={`status-badge ${receiver.status}`}>● {receiver.status?.toUpperCase()}</span></td>
                          <td>
                            <button className="btn btn-sm" style={{color: '#dc2626', border: '1px solid #dc2626', background: 'transparent'}} onClick={() => handleDeleteUser(receiver._id, 'receiver')}>Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Messages View */}
          {dashboardTab === 'messages' && (
            <>
              <div className="dashboard-header">
                <h1 className="dashboard-title">Inquiry Messages</h1>
              </div>
              <div className="dashboard-content">
                {messages.length > 0 ? messages.map(msg => (
                  <div key={msg._id} className="message-card">
                    <div className="message-meta">
                      <span className="message-sender">{msg.name} ({msg.email})</span>
                      <span className="message-date">{new Date(msg.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="message-subject">{msg.subject}</div>
                    <p className="message-text">{msg.message}</p>
                  </div>
                )) : (
                  <div style={{padding: '3rem', textAlign: 'center', color: 'var(--text-light)'}}>
                    No messages received yet.
                  </div>
                )}
              </div>
            </>
          )}
          {/* Profile View */}
          {dashboardTab === 'profile' && (
            <div className="profile-card admin-profile-card">
              <div className="profile-edit-header">
                <h2 style={{color: 'var(--text-dark)'}}>Admin Profile</h2>
                <button className={`btn-icon-edit ${isEditingProfile ? 'active' : ''}`} onClick={toggleEditProfile}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
              </div>

              {isEditingProfile ? (
                <form className="admin-edit-form" onSubmit={handleProfileUpdate}>
                  <div className="edit-avatar-container">
                    <div className="user-avatar-lg">
                      {previewImage ? (
                        <img src={previewImage} alt="Preview" style={{width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover'}} />
                      ) : userData?.profilePic ? (
                        <img src={`${BASE_URL}/uploads/${userData.profilePic}`} alt="Admin" style={{width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover'}} />
                      ) : (
                        userData?.fullName?.charAt(0)
                      )}
                      <label className="avatar-edit-overlay">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                        <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                      </label>
                    </div>
                  </div>

                  <div className="form-group-admin">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={profileForm.fullName} 
                      onChange={handleEditProfileChange}
                      className="admin-input"
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Email Address (Cannot be changed)</label>
                    <input 
                      type="email" 
                      value={userData?.email} 
                      disabled 
                      className="admin-input disabled"
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>New Password</label>
                    <input 
                      type="password" 
                      name="password" 
                      placeholder="Enter new password to change"
                      value={profileForm.password} 
                      onChange={handleEditProfileChange}
                      className="admin-input"
                    />
                  </div>

                  <div className="edit-form-actions">
                    <button type="button" className="btn btn-outline" onClick={toggleEditProfile}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Updates</button>
                  </div>
                </form>
              ) : (
                <div className="profile-view-content">
                  <div className="user-avatar-lg">
                    {userData?.profilePic ? (
                      <img src={`${BASE_URL}/uploads/${userData.profilePic}`} alt="Admin" style={{width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover'}} />
                    ) : (
                      userData?.fullName?.charAt(0)
                    )}
                  </div>
                  <h2 style={{color: 'var(--text-dark)', marginBottom:'0.5rem'}}>{userData?.fullName}</h2>
                  <p style={{color: 'var(--text-light)', marginBottom: '1.5rem'}}>{userData?.email}</p>
                  <span className="type-badge admin" style={{background: '#fef2f2', color: '#b91c1c'}}>ADMINISTRATOR</span>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Verification Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Verification Details</h2>
              <button className="modal-close" onClick={() => setSelectedRequest(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="verification-grid">
                <div className="verification-photo-section">
                  <img src={`${BASE_URL}/uploads/${selectedRequest.photo}`} alt="Profile" className="verification-img" />
                  <span className={`type-badge ${selectedRequest.type}`} style={{marginTop: '1rem', display: 'inline-block'}}>{selectedRequest.type?.toUpperCase()}</span>
                </div>
                
                <div className="verification-info-section">
                  <div className="info-group-modal">
                    <label>Full Name</label>
                    <p>{selectedRequest.firstName} {selectedRequest.lastName}</p>
                  </div>
                  <div className="info-group-modal">
                    <label>Email Address</label>
                    <p>{selectedRequest.email}</p>
                  </div>
                  <div className="info-group-modal">
                    <label>Phone Number</label>
                    <p>{selectedRequest.phone}</p>
                  </div>
                  <div className="info-group-modal">
                    <label>Blood Group</label>
                    <p>{selectedRequest.bloodGroup}</p>
                  </div>
                  <div className="info-group-modal">
                    <label>Location</label>
                    <p>{selectedRequest.address}, {selectedRequest.city}, {selectedRequest.state}</p>
                  </div>
                  
                  {selectedRequest.type === 'donor' ? (
                    <>
                      <div className="info-group-modal">
                        <label>Organs Pledged</label>
                        <div className="organs-tags">
                          {Object.keys(selectedRequest.organs || {}).filter(k => selectedRequest.organs[k]).map(organ => (
                            <span key={organ} className="organ-tag">{organ.charAt(0).toUpperCase() + organ.slice(1)}</span>
                          ))}
                        </div>
                      </div>
                      <div className="info-group-modal">
                        <label>Witness Name</label>
                        <p>{selectedRequest.witnessName} ({selectedRequest.witnessRelation})</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="info-group-modal">
                        <label>Organ Needed</label>
                        <p>{selectedRequest.organNeeded?.toUpperCase()}</p>
                      </div>
                      <div className="info-group-modal">
                        <label>Urgency Level</label>
                        <p className={`urgency-${selectedRequest.urgency}`}>{selectedRequest.urgency?.toUpperCase()}</p>
                      </div>
                    </>
                  )}
                  
                  <div className="info-group-modal">
                    <label>Medical Details</label>
                    <p>Hospital: {selectedRequest.hospitalName}</p>
                    <p>Doctor: {selectedRequest.doctorInCharge}</p>
                  </div>

                  <div className="verification-docs">
                    <label>Verification Documents</label>
                    <div style={{marginTop: '0.5rem'}}>
                      {selectedRequest.type === 'donor' ? (
                        <a href={`${BASE_URL}/uploads/${selectedRequest.witnessPhoto}`} target="_blank" rel="noreferrer" className="doc-link">
                          View Witness Photo
                        </a>
                      ) : (
                        <a href={`${BASE_URL}/uploads/${selectedRequest.identityCard}`} target="_blank" rel="noreferrer" className="doc-link">
                          View Identity Card
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => {
                handleStatusChange(selectedRequest._id, selectedRequest.type, 'rejected');
                setSelectedRequest(null);
              }} style={{borderColor: '#dc2626', color: '#dc2626'}}>Decline Request</button>
              
              <button className="btn btn-primary" onClick={() => {
                handleStatusChange(selectedRequest._id, selectedRequest.type, 'approved');
                setSelectedRequest(null);
              }}>Approve Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
