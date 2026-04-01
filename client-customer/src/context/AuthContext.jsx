import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (data.success) {
                setUser(data.user);
                localStorage.setItem('vdp_user', JSON.stringify(data.user));
                localStorage.setItem('vdp_token', data.token);

                const routeMap = {
                    [ROLES.CUSTOMER]: '/home',
                    [ROLES.VENDOR]: '/merchant',
                    [ROLES.DELIVERY]: '/partner',
                };

                navigate(routeMap[data.user.role] || '/');
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: 'Server connection failed' };
        } finally {
            setLoading(false);
        }
    };

    const requestOtp = async (email, mobile, name) => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, mobile, name })
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Server connection failed' };
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async (email, otp) => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            const data = await response.json();

            if (data.success) {
                setUser(data.user);
                localStorage.setItem('vdp_user', JSON.stringify(data.user));
                localStorage.setItem('vdp_token', data.token);

                const routeMap = {
                    [ROLES.CUSTOMER]: '/home',
                    [ROLES.VENDOR]: '/merchant',
                    [ROLES.DELIVERY]: '/partner',
                };

                navigate(routeMap[data.user.role] || '/');
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: 'Server connection failed' };
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
