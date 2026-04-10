import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, Store, Users, Bike, MapPin,
    CreditCard, BarChart3, Settings, Menu, X, Search, Bell,
    LogOut, User, ChevronLeft, ChevronRight, Sun, Moon, ShieldCheck, UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../common';
import SmoothScroll from '../common/SmoothScroll';

const AdminLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const menuItems = [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Orders', path: '/admin/orders', icon: Package },
        { label: 'Approvals', path: '/admin/pending-approvals', icon: UserCheck },
        { label: 'Vendors', path: '/admin/vendors', icon: Store },
        { label: 'Customers', path: '/admin/customers', icon: Users },
        { label: 'Partners', path: '/admin/partners', icon: Bike },
        { label: 'Zones', path: '/admin/zones', icon: MapPin },
        { label: 'Payments', path: '/admin/payments', icon: CreditCard },
        { label: 'Payment Methods', path: '/admin/payment-methods', icon: ShieldCheck },
        { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
        { label: 'Settings', path: '/admin/settings', icon: Settings },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-slate-900 dark:bg-black text-slate-300 transition-colors duration-500">
            {/* Logo area */}
            <div className={`p-6 flex items-center gap-3 border-b border-white/5 dark:border-white/10 h-20`}>
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary-900/50">
                    <span className="text-white font-black text-xl">B</span>
                </div>
                {!collapsed && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
                        <span className="font-black text-white text-lg tracking-tight leading-none uppercase">Bharat<span className="text-primary-400">Drop</span></span>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Admin Hub</span>
                    </motion.div>
                )}
            </div>

            {/* Menu items */}
            <nav className="flex-1 py-6 space-y-1 overflow-y-auto px-3 scrollbar-hide">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/admin'}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) => `
                            flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-sm transition-all group relative
                            ${isActive
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/40'
                                : 'hover:bg-white/5 dark:hover:bg-white/10 hover:text-white'
                            }
                        `}
                    >
                        <item.icon size={20} className={collapsed ? "mx-auto" : ""} />
                        {!collapsed && <span>{item.label}</span>}
                        {collapsed && (
                            <div className="absolute left-16 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                {item.label}
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-white/5 space-y-4">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex w-full items-center gap-4 px-4 py-3 hover:bg-white/5 rounded-xl text-slate-400 transition-colors"
                >
                    {collapsed ? <ChevronRight size={20} className="mx-auto" /> : <><ChevronLeft size={20} /> <span className="text-xs font-black uppercase tracking-widest">Collapse Sidebar</span></>}
                </button>

                <button
                    onClick={logout}
                    className="flex w-full items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-bold text-sm"
                >
                    <LogOut size={20} className={collapsed ? "mx-auto" : ""} />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <SmoothScroll>
            <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-500">
                {/* Desktop Sidebar */}
                <aside className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
                    <SidebarContent />
                </aside>

                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <div className="lg:hidden fixed inset-0 z-[60] flex">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
                            />
                            <motion.div
                                initial={{ x: -260 }}
                                animate={{ x: 0 }}
                                exit={{ x: -260 }}
                                className="relative w-64 h-full"
                            >
                                <SidebarContent />
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
                    {/* Top Navbar */}
                    <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                            >
                                <Menu size={24} />
                            </button>
                            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 border border-slate-200 dark:border-slate-700 group focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                                <Search size={18} className="text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search everything..."
                                    className="bg-transparent border-none focus:ring-0 text-sm ml-3 w-64 font-medium dark:text-slate-200"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleTheme}
                                className="p-2.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                                title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                            >
                                {theme === 'dark' ? <Sun size={20} className="text-secondary" /> : <Moon size={20} />}
                            </button>
                            <button className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl relative">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                            </button>
                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-black text-slate-900 dark:text-white leading-none">Admin Owner</p>
                                    <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mt-1">Super Admin</p>
                                </div>
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 font-bold border-2 border-white dark:border-slate-700 shadow-sm ring-2 ring-primary-50 dark:ring-primary-900/20">
                                    <User size={20} />
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="p-8 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-5rem)]">
                        <Outlet />
                    </main>
                </div>
            </div>
        </SmoothScroll>
    );
};

export default AdminLayout;
