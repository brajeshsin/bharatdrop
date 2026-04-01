import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const ROLES = {
    ADMIN: 'ADMIN',
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Simulate checking for existing session
        const savedUser = localStorage.getItem('vdp_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const loginAdmin = async (email, password) => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:6060/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (data.success) {
                setUser(data.user);
                localStorage.setItem('vdp_user', JSON.stringify(data.user));
                localStorage.setItem('vdp_token', data.token);
                navigate('/admin');
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('vdp_user');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loginAdmin, logout, loading, ROLES }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
