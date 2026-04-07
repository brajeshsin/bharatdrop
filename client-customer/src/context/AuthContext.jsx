import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const ROLES = {
    CUSTOMER: 'CUSTOMER',
    VENDOR: 'VENDOR',
    DELIVERY: 'DELIVERY',
    ADMIN: 'ADMIN',
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const savedUser = localStorage.getItem('vdp_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            const data = response.data;

            if (data.success) {
                setUser(data.user);
                localStorage.setItem('vdp_user', JSON.stringify(data.user));
                localStorage.setItem('vdp_token', data.token);

                // Navigation handled by VerifyOtp component via role in navigation state
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Server connection failed' };
        } finally {
            setLoading(false);
        }
    };

    const requestOtp = async (email, mobile, name, role = 'CUSTOMER', metadata = {}) => {
        try {
            const response = await api.post('/auth/request-otp', {
                email,
                mobile,
                name,
                role,
                ...metadata
            });
            return response.data;
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Server connection failed' };
        }
    };

    const verifyOtp = async (email, otp, mobile) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/verify-otp', { email, otp, mobile });
            const data = response.data;

            if (data.success) {
                setUser(data.user);
                localStorage.setItem('vdp_user', JSON.stringify(data.user));
                localStorage.setItem('vdp_token', data.token);

                const routeMap = {
                    [ROLES.CUSTOMER]: '/home',
                    [ROLES.VENDOR]: '/merchant',
                    [ROLES.DELIVERY]: '/partner',
                };

                const target = routeMap[data.user.role] || '/home';
                console.log('Auth success, role:', data.user.role, 'navigating to:', target);
                navigate(target, { replace: true });
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Server connection failed' };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('vdp_user');
        localStorage.removeItem('vdp_token');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, requestOtp, verifyOtp, loading, ROLES }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
