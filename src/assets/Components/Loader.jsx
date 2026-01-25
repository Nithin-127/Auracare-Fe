import React from 'react';
import './Loader.css';

const Loader = () => {
    return (
        <div className="loader-overlay">
            <div className="loader-content">
                <div className="loader-heart">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </div>
                <h2 className="loader-text">AuraCare</h2>
                <div className="loader-bar-container">
                    <div className="loader-bar-progress"></div>
                </div>
                <p className="loader-status">Initializing Health Services...</p>
            </div>
        </div>
    );
};

export default Loader;
