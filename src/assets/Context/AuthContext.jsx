import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const AuthContextComponent = ({ children }) => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const user = JSON.parse(sessionStorage.getItem("existingUser"));
        if (token) {
            setIsAuthorized(true);
            setUserData(user);
        } else {
            setIsAuthorized(false);
            setUserData(null);
        }
    }, []);

    const login = (user, token) => {
        sessionStorage.setItem("existingUser", JSON.stringify(user));
        sessionStorage.setItem("token", token);
        setUserData(user);
        setIsAuthorized(true);
    };

    const logout = () => {
        sessionStorage.removeItem("existingUser");
        sessionStorage.removeItem("token");
        setUserData(null);
        setIsAuthorized(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthorized, setIsAuthorized, userData, setUserData, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContextComponent;
