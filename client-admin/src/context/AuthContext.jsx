import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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
        const savedUser = sessionStorage.getItem('vdp_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const loginAdmin = async (email, password) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            const data = response.data;

            if (data.success) {
                setUser(data.user);
                sessionStorage.setItem('vdp_user', JSON.stringify(data.user));
                sessionStorage.setItem('vdp_token', data.token);
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
        sessionStorage.removeItem('vdp_user');
        sessionStorage.removeItem('vdp_token');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loginAdmin, logout, loading, ROLES }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
