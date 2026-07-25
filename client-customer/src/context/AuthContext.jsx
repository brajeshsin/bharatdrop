import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const ROLES = {
    CUSTOMER: 'CUSTOMER',
    VENDOR: 'VENDOR',
    DELIVERY: 'DELIVERY',
    ADMIN: 'ADMIN',
    SELLER: 'SELLER',
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('vdp_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [selectedTown, setSelectedTown] = useState(() => {
        return localStorage.getItem('vdp_selected_town') || 'Rampur Village';
    });

    const changeTown = (town) => {
        setSelectedTown(town);
        localStorage.setItem('vdp_selected_town', town);
    };

    useEffect(() => {
        const initAuth = async () => {
            const savedUser = localStorage.getItem('vdp_user');
            const token = localStorage.getItem('vdp_token');

            if (token) {
                try {
                    // Try to refresh user data from server to get latest status/role
                    const response = await api.get('/auth/me');
                    if (response.data.success) {
                        setUser(response.data.user);
                        localStorage.setItem('vdp_user', JSON.stringify(response.data.user));
                    } else if (savedUser) {
                        setUser(JSON.parse(savedUser));
                    }
                } catch (error) {
                    console.error("Auth refresh failed:", error);
                    if (savedUser) setUser(JSON.parse(savedUser));
                    // If 401, token is invalid, but we'll let existing logic handle it or just clear
                    if (error.response?.status === 401) {
                        logout();
                    }
                }
            } else if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
            setLoading(false);
        };

        initAuth();
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
                    [ROLES.SELLER]: '/merchant',
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

    const updateUserStatus = async (status) => {
        try {
            const response = await api.patch('/auth/status', { status });
            if (response.data.success) {
                const updatedUser = { ...user, status: response.data.status };
                setUser(updatedUser);
                localStorage.setItem('vdp_user', JSON.stringify(updatedUser));
                return { success: true, status: response.data.status };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            console.error("Failed to update status:", error);
            return { success: false, message: error.response?.data?.message || 'Server connection failed' };
        }
    };

    const updateUserDocuments = async (docData) => {
        try {
            const response = await api.patch('/auth/documents', docData);
            if (response.data.success) {
                const updatedUser = response.data.user;
                setUser(updatedUser);
                localStorage.setItem('vdp_user', JSON.stringify(updatedUser));
                return { success: true, user: updatedUser };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            console.error("Failed to update documents:", error);
            return { success: false, message: error.response?.data?.message || 'Server connection failed' };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, requestOtp, verifyOtp, loading, ROLES, selectedTown, changeTown, updateUserStatus, updateUserDocuments }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
