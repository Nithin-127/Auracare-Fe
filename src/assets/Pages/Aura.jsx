import React, { useState, useEffect, useContext } from 'react';
import { getApprovedDonorsAPI, getMyReceiverAPI, contactDonorAPI } from '../services/Appapi';
import { BASE_URL } from '../services/Baseurl';
import { AuthContext } from '../Context/AuthContext';
import { toast } from 'react-toastify';
import LoginRequired from '../Components/LoginRequired';
import './Aura.css';

const Aura = () => {
  const { isAuthorized, userData } = useContext(AuthContext);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [receiverProfile, setReceiverProfile] = useState(null);
  
  // Search and Sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    fetchApprovedDonors();
    if (isAuthorized && userData?.role === 'receiver') {
      fetchReceiverProfile();
    }
  }, [isAuthorized, userData]);

  const fetchReceiverProfile = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const header = { "Authorization": `Bearer ${token}` };
      const result = await getMyReceiverAPI(userData._id, header);
      if (result.status === 200) {
        setReceiverProfile(result.data);
      }
    } catch (error) {
      console.error("Error fetching receiver profile:", error);
    }
  };

  const fetchApprovedDonors = async () => {
    try {
      const result = await getApprovedDonorsAPI();
      if (result.status === 200) {
        setDonors(result.data);
      }
    } catch (error) {
      console.error("Error fetching approved donors:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkMatch = (donor) => {
    if (!receiverProfile) return false;
    const needed = receiverProfile.organNeeded?.toLowerCase();
    return donor.organs && donor.organs[needed] === true;
  };

  const filteredDonors = donors
    .filter(donor => {
      if (!searchTerm) return true;
      const pledgedOrgans = Object.keys(donor.organs || {}).filter(k => donor.organs[k]);
      return pledgedOrgans.some(organ => organ.toLowerCase().includes(searchTerm.toLowerCase()));
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const handleContactDonor = async () => {
    try {
      if (!isAuthorized || userData?.role !== 'receiver') {
        toast.warning("Only registered and approved receivers can contact donors.");
        return;
      }

      if (!receiverProfile || receiverProfile.status !== 'approved') {
        toast.info("Your profile must be approved by the admin before you can contact donors.");
        return;
      }

      const token = sessionStorage.getItem("token");
      const header = { "Authorization": `Bearer ${token}` };
      const reqBody = {
        donorUserId: selectedDonor.userId,
        receiverUserId: userData._id
      };

      const result = await contactDonorAPI(reqBody, header);
      if (result.status === 201) {
        toast.success(`Contact request successfully sent to ${selectedDonor.firstName}. They will now be able to view your profile.`);
        setSelectedDonor(null);
      } else {
        toast.error(result.response?.data?.message || "Failed to send contact request.");
      }
    } catch (error) {
      console.error("Error contacting donor:", error);
      toast.error("An error occurred. Please try again later.");
    }
  };

  if (!isAuthorized) return <LoginRequired pageName="Donor List" />;

  return (
    <div className="aura-page">
      <div className="aura-header-bg">
        <div className="container">
          <h1 className="aura-title">Certified Organ Donors</h1>
          <p className="aura-subtitle">
            These courageous individuals have pledged to give the gift of life. 
            All donors listed here have been verified and approved by the AuraCare Medical Board.
          </p>
        </div>
      </div>

      <div className="container section-padding">
        <div className="discovery-controls">
          <div className="search-box">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
             <input 
               type="text" 
               placeholder="Search by organ (e.g. Heart, Liver)..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <div className="filter-group">
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="sort-select">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
             <div className="loader"></div>
             <p>Loading Donor Registry...</p>
          </div>
        ) : filteredDonors.length > 0 ? (
          <div className="donors-grid">
            {filteredDonors.map((donor) => (
              <div key={donor._id} className="donor-card-premium">
                <div className="donor-card-header">
                  <div className="donor-avatar-wrapper">
                    <img 
                      src={donor.photo ? `${BASE_URL}/uploads/${donor.photo}` : "https://via.placeholder.com/150"} 
                      alt={donor.firstName} 
                      className="donor-avatar" 
                    />
                    <div className="donor-verified-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                    </div>
                  </div>
                  <div className="donor-meta">
                    <h3>{donor.firstName} {donor.lastName}</h3>
                    <p className="donor-location">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      {donor.city}, {donor.state}
                    </p>
                  </div>
                </div>

                <div className="donor-card-body">
                  <div className="donor-info-row">
                    <span className="info-label">Blood Group</span>
                    <span className="info-value blood-group">{donor.bloodGroup}</span>
                  </div>
                  
                  <div className="organs-pledged">
                    <p className="pledged-title">Organs Pledged</p>
                    <div className="organs-tags">
                      {Object.keys(donor.organs).filter(k => donor.organs[k]).map(organ => (
                        <span key={organ} className="organ-tag">{organ.charAt(0).toUpperCase() + organ.slice(1)}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="donor-card-footer">
                   <button className="btn-contact-donor" onClick={() => setSelectedDonor(donor)}>Identify Match</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
             <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
             <p>No approved donors found at the moment.</p>
          </div>
        )}
      </div>

      {/* Donor Details Modal */}
      {selectedDonor && (
        <div className="modal-overlay" onClick={() => setSelectedDonor(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedDonor(null)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <h2 style={{marginBottom: '1rem', color: '#1e293b'}}>Donor Identity</h2>
            
            {userData?.role === 'receiver' && checkMatch(selectedDonor) && (
              <div className="match-banner">
                <div className="match-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                </div>
                It's a Match!
              </div>
            )}

            <div className="donor-details-list">
              <div className="donor-detail-item">
                <span className="donor-detail-label">Full Name</span>
                <span className="donor-detail-value">{selectedDonor.firstName} {selectedDonor.lastName}</span>
              </div>
              <div className="donor-detail-item">
                <span className="donor-detail-label">City</span>
                <span className="donor-detail-value">{selectedDonor.city}</span>
              </div>
              <div className="donor-detail-item">
                <span className="donor-detail-label">State</span>
                <span className="donor-detail-value">{selectedDonor.state}</span>
              </div>
              <div className="donor-detail-item">
                <span className="donor-detail-label">Blood Group</span>
                <span className="donor-detail-value">{selectedDonor.bloodGroup}</span>
              </div>
              <div className="donor-detail-item" style={{border: 'none'}}>
                <span className="donor-detail-label">Organs Pledged</span>
                <span className="donor-detail-value">
                  {Object.keys(selectedDonor.organs).filter(k => selectedDonor.organs[k]).map(o => o.charAt(0).toUpperCase() + o.slice(1)).join(', ')}
                </span>
              </div>
            </div>

            <div style={{marginTop: '2rem'}}>
                <button 
                  className="btn-contact-donor" 
                  onClick={handleContactDonor}
                >
                  Confirm and Contact
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Aura;
