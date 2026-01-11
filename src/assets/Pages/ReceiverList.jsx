import React, { useState, useEffect, useContext } from 'react';
import { getApprovedReceiversAPI } from '../services/Appapi';
import { BASE_URL } from '../services/Baseurl';
import { AuthContext } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Aura.css'; // Reusing established premium styles

const ReceiverList = () => {
  const { userData, isAuthorized } = useContext(AuthContext);
  const navigate = useNavigate();
  const [receivers, setReceivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    if (!isAuthorized || userData?.role !== 'donor') {
        if (userData?.role !== 'admin') {
            toast.warning("Access restricted to registered donors.");
            navigate('/');
            return;
        }
    }
    fetchApprovedReceivers();
  }, [isAuthorized, userData, navigate]);

  const fetchApprovedReceivers = async () => {
    try {
      const result = await getApprovedReceiversAPI();
      if (result.status === 200) {
        setReceivers(result.data);
      }
    } catch (error) {
      console.error("Error fetching approved receivers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReceivers = receivers
    .filter(receiver => {
      const matchesSearch = !searchTerm || receiver.organNeeded?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesUrgency = urgencyFilter === 'all' || receiver.urgency === urgencyFilter;
      return matchesSearch && matchesUrgency;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="aura-page">
      <div className="aura-header-bg" style={{background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'}}>
        <div className="container">
          <h1 className="aura-title">Hope Registry</h1>
          <p className="aura-subtitle">
            Below are individuals currently awaiting organ transplants. 
            As a registered donor, your selfless decision can transform these lives.
          </p>
        </div>
      </div>

      <div className="container section-padding">
        <div className="discovery-controls">
          <div className="search-box">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
             <input 
               type="text" 
               placeholder="Search by organ needed..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <div className="filter-group">
            <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)} className="sort-select">
              <option value="all">All Urgency</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Priority</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
            </select>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="sort-select">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
             <div className="loader"></div>
             <p>Loading Hope Registry...</p>
          </div>
        ) : filteredReceivers.length > 0 ? (
          <div className="donors-grid">
            {filteredReceivers.map((receiver) => (
              <div key={receiver._id} className="donor-card-premium">
                <div className="donor-card-header">
                  <div className="donor-avatar-wrapper">
                    <img 
                      src={receiver.photo ? `${BASE_URL}/uploads/${receiver.photo}` : "https://via.placeholder.com/150"} 
                      alt={receiver.firstName} 
                      className="donor-avatar" 
                    />
                    <div className="donor-verified-badge" style={{backgroundColor: '#3b82f6'}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    </div>
                  </div>
                  <div className="donor-meta">
                    <h3>{receiver.firstName} {receiver.lastName}</h3>
                    <p className="donor-location">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      {receiver.city}, {receiver.state}
                    </p>
                  </div>
                </div>

                <div className="donor-card-body">
                  <div className="donor-info-row">
                    <span className="info-label">Organ Needed</span>
                    <span className="info-value" style={{color: '#1e3a8a', fontWeight: '700'}}>{receiver.organNeeded?.toUpperCase()}</span>
                  </div>

                  <div className="donor-info-row">
                    <span className="info-label">Blood Group</span>
                    <span className="info-value blood-group">{receiver.bloodGroup}</span>
                  </div>
                  
                  <div className="organs-pledged" style={{marginTop: '1.5rem'}}>
                    <p className="pledged-title">Urgency Level</p>
                    <div className="organs-tags">
                        <span className={`organ-tag urgency-${receiver.urgency}`}>
                            {receiver.urgency?.charAt(0).toUpperCase() + receiver.urgency?.slice(1)}
                        </span>
                    </div>
                  </div>
                </div>

                <div className="donor-card-footer">
                   <button className="btn-contact-donor" style={{background: 'var(--text-dark)'}}>Express Interest</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
             <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
             <p>No pending recipient requests at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiverList;
