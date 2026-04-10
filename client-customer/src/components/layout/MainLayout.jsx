import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, ROLES } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, Search, ShoppingBag, User,
    ArrowLeft, ArrowRight, Bell, ChevronDown, MapPin,
    LogOut, Settings, LayoutDashboard, Globe,
    ChevronRight, X, Truck, Phone, Mail,
    MessageSquare, Send, Sun, Moon
} from 'lucide-react';
import { Button } from '../../components/common';
import { SHOPS, PRODUCTS } from '../../services/mockData';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { id: paramsId } = useParams();
    const { cart, cartTotal, itemCount } = useCart();
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useTheme();

    const getRolePath = (role) => {
        switch (role) {
            case ROLES.CUSTOMER: return '/home';
            case ROLES.VENDOR: return '/merchant';
            case ROLES.DELIVERY: return '/partner';
            default: return '/login';
        }
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const isHome = location.pathname === '/home';
    const isOrders = location.pathname === '/ordershistory';
    const isProfile = location.pathname === '/home/profile';
    const isHubPage = isHome || isOrders || isProfile || location.pathname === '/merchant' || location.pathname === '/partner' || location.pathname === '/admin';

    const [isScrolled, setIsScrolled] = useState(false);
    const [selectedVillage, setSelectedVillage] = useState('Rampur Village');
    const [tempSelectedVillage, setTempSelectedVillage] = useState('Rampur Village');
    const [locationSearchQuery, setLocationSearchQuery] = useState('');
    const [isVillagePickerOpen, setIsVillagePickerOpen] = useState(false);
    const [globalSearchQuery, setGlobalSearchQuery] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);

    // Missing Village Picker State Logic
    const villages = [
        'Rampur Village',
        'Dhanikhera Town',
        'Bhagwant Nagar',
        'Sumerpur Hub',
        'Bighapur Area',
        'Unnao Central'
    ];

    const filteredVillages = villages.filter(v =>
        v.toLowerCase().includes(locationSearchQuery.toLowerCase())
    );

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isVillagePickerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isVillagePickerOpen]);

    // Get page title for detail pages
    const getPageTitle = () => {
        if (location.pathname.includes('/shop/')) {
            // Robust path-based ID extraction for parent layouts
            const pathParts = location.pathname.split('/');
            const shopIdIndex = pathParts.indexOf('shop') + 1;
            const shopId = shopIdIndex > 0 ? parseInt(pathParts[shopIdIndex]) : null;

            const shop = SHOPS.find(s => s.id === shopId);
            return shop ? shop.name : t('header.shop_details');
        }
        if (location.pathname === '/home/cart') return t('header.your_order');
        if (location.pathname.includes('/ordershistory/track')) return t('header.track_order');
        return '';
    };

    const navItems = getNavItems(user?.role);

    function getNavItems(role) {
        switch (role) {
            case ROLES.CUSTOMER:
                return [
                    { label: t('header.browse'), path: '/home', icon: Home },
                    { label: t('header.orders'), path: '/ordershistory', icon: ShoppingBag },
                    { label: t('header.profile'), path: '/home/profile', icon: User },
                ];
            case ROLES.VENDOR:
                const vendorItems = [
                    { label: 'Dashboard', path: '/merchant', icon: LayoutDashboard },
                    { label: 'Inventory', path: '/merchant/products', icon: ShoppingBag },
                    { label: 'Orders', path: '/merchant/orders', icon: Truck },
                ];
                // Hide sensitive links if pending
                if (user?.status === 'PENDING') {
                    return vendorItems.filter(item => item.label === 'Dashboard');
                }
                return vendorItems;
            case ROLES.DELIVERY:
                return [
                    { label: 'Deliveries', path: '/partner', icon: Truck },
                    { label: 'Earnings', path: '/partner/history', icon: ShoppingBag },
                    { label: 'Profile', path: '/partner/profile', icon: User },
                ];
            default:
                return [];
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-500 font-sans overflow-x-hidden">
            {/* Premium Smart Header */}
            <header className={`fixed top-0 left-0 right-0 z-[70] transition-all duration-500 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-sm border-b border-slate-100 dark:border-slate-800 py-4`}>
                <div className="w-full px-6 md:px-12 lg:px-16 flex items-center justify-between gap-4">

                    {/* Left Section: Back Button or Logo */}
                    <div className="flex items-center gap-4">
                        {!isHubPage ? (
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2.5 bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 rounded-2xl hover:border-primary-800 transition-all shadow-sm active:scale-90"
                            >
                                <ArrowLeft size={22} className="text-primary-800 dark:text-primary-400" />
                            </button>
                        ) : (
                            <Link to={getRolePath(user?.role)} className="flex items-center gap-3 group">
                                <div className="w-10 h-10 bg-primary-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                                    <span className="text-white font-black text-xl">B</span>
                                </div>
                                <div className="hidden lg:block">
                                    <h1 className="text-lg font-black text-slate-800 dark:text-white leading-none tracking-tight">Bharat<span className="text-primary-800 dark:text-primary-400">Drop</span></h1>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                                        {user?.role === ROLES.CUSTOMER ? t('header.logistics_hub') : `${user?.role} PORTAL`}
                                    </p>
                                </div>
                            </Link>
                        )}

                        {/* Breadcrumb or Title for detail pages */}
                        {!isHubPage && (
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t('header.delivery_title')}</span>
                                <h1 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none truncate max-w-[150px] md:max-w-none">{getPageTitle()}</h1>
                            </div>
                        )}

                        {/* Location for Customer Home */}
                        {isHome && user?.role === ROLES.CUSTOMER && (
                            <div
                                onClick={() => setIsVillagePickerOpen(true)}
                                className="hidden md:flex flex-col cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 p-2 px-3 rounded-2xl transition-all group border-2 border-transparent hover:border-primary-800/20 active:scale-95 shadow-sm hover:shadow-md"
                            >
                                <div className="flex items-center gap-1.5 text-primary-700 dark:text-primary-400 font-black uppercase text-[10px] tracking-[0.2em] leading-none mb-1">
                                    <MapPin size={10} fill="currentColor" /> {selectedVillage}
                                </div>
                                <div className="flex items-center gap-1 font-black text-slate-800 dark:text-white group-hover:text-primary-800 transition-colors text-[13px] leading-none">
                                    {t('header.switch_village')} <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Desktop Center: Search Bar (Customer Only) */}
                    {user?.role === ROLES.CUSTOMER && (
                        <div className="hidden lg:flex flex-1 max-w-md relative group mx-4 h-12">
                            <input
                                type="text"
                                placeholder={t('header.search_placeholder')}
                                value={globalSearchQuery}
                                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        navigate(`/home/search?q=${globalSearchQuery}`);
                                        setIsSearchActive(false);
                                    }
                                }}
                                className="w-full pl-6 pr-14 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-black text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary-800 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-all shadow-sm h-full"
                            />
                            <button
                                onClick={() => {
                                    if (globalSearchQuery.trim()) {
                                        navigate(`/home/search?q=${globalSearchQuery}`);
                                        setIsSearchActive(false);
                                    }
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary-800 text-white rounded-xl hover:bg-primary-900 transition-all shadow-lg active:scale-90"
                            >
                                <Search size={18} />
                            </button>
                        </div>
                    )}

                    {/* Desktop Center: Navigation (only for top-level pages and if search is not taking up space) */}
                    {isHubPage && !isSearchActive && (
                        <nav className="hidden xl:flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-100 dark:border-slate-800/50 mr-4">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${isActive
                                            ? 'bg-white dark:bg-slate-700 text-primary-800 dark:text-white shadow-sm'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-primary-800 dark:hover:text-primary-400 hover:bg-white/50 dark:hover:bg-slate-800'}`}
                                    >
                                        <item.icon size={14} strokeWidth={isActive ? 3 : 2} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    )}

                    {/* Right Section: Actions */}
                    <div className="flex items-center gap-2">
                        {/* Language Switcher */}
                        <div className="hidden sm:flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-100 dark:border-slate-800/50 mr-2">
                            <button
                                onClick={() => changeLanguage('en')}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${i18n.language === 'en' ? 'bg-white dark:bg-slate-700 text-primary-800 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => changeLanguage('hi')}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${i18n.language === 'hi' ? 'bg-white dark:bg-slate-700 text-primary-800 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            >
                                HI
                            </button>
                        </div>

                        <button className="hidden sm:flex p-2.5 text-slate-400 hover:text-primary-800 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 text-slate-400 hover:text-primary-800 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all group/theme"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {theme === 'dark' ? (
                                <Sun size={20} className="group-hover/theme:rotate-90 transition-transform duration-500" />
                            ) : (
                                <Moon size={20} className="group-hover/theme:-rotate-12 transition-transform duration-500" />
                            )}
                        </button>

                        {/* Global Search Button for Mobile (Customer Only) */}
                        {user?.role === ROLES.CUSTOMER && (
                            <button
                                onClick={() => setIsSearchActive(true)}
                                className="lg:hidden p-2.5 text-slate-400 hover:text-primary-800 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                            >
                                <Search size={22} />
                            </button>
                        )}

                        {user?.role === ROLES.CUSTOMER && (
                            <button
                                onClick={() => navigate('/home/cart')}
                                className="p-2.5 text-slate-400 hover:text-primary-800 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all relative group/cart"
                            >
                                <ShoppingBag size={22} className="group-hover/cart:scale-110 transition-transform" />
                                {itemCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary-800 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-lg" >
                                        {itemCount}
                                    </span>
                                )}
                            </button>
                        )}

                        <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 mx-2 hidden sm:block"></div>

                        <div className="flex items-center gap-3 pl-2 group cursor-pointer relative">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-transparent group-hover:border-primary-800 transition-all flex items-center justify-center overflow-hidden shadow-inner">
                                <span className="font-black text-primary-800 dark:text-primary-400">{user?.name?.charAt(0)}</span>
                            </div>

                            {/* Simple Dropdown Trigger */}
                            <div className="hidden lg:flex flex-col items-start leading-none gap-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user?.role}</span>
                                <div className="flex items-center gap-1 font-black text-sm text-slate-800 dark:text-white">
                                    {user?.name} <ChevronDown size={14} className="text-slate-400 group-hover:rotate-180 transition-transform duration-300" />
                                </div>
                            </div>

                            <button
                                onClick={logout}
                                className="absolute -bottom-14 right-0 bg-white dark:bg-slate-800 shadow-2xl rounded-2xl p-4 border border-slate-100 dark:border-slate-700 opacity-0 scale-90 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto transition-all flex items-center gap-3 text-xs font-black text-red-600 min-w-[160px] active:scale-95"
                            >
                                <LogOut size={16} /> {t('header.sign_out')}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Spacing Adjuster */}
            <main className={`flex-1 transition-all duration-500 ${isHome ? 'pt-0' : 'pt-24 pb-20 md:pb-8'}`}>
                <div className="w-full px-6 md:px-12 lg:px-16">
                    <Outlet />
                </div>

                {/* Global Float Cart Summary - Visible on all shopping routes */}
                <AnimatePresence>
                    {itemCount > 0 && !location.pathname.includes('/cart') && !location.pathname.includes('/tracking') && (
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:w-[400px] z-[60]"
                        >
                            <div className="bg-primary-900 text-white p-6 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(46,125,50,0.5)] flex items-center justify-between border-2 border-white/10 backdrop-blur-md">
                                <div className="flex items-center gap-4">
                                    <div className="bg-secondary p-3.5 rounded-2xl text-primary-900 relative shadow-xl rotate-3">
                                        <ShoppingBag size={24} fill="currentColor" />
                                        <span className="absolute -top-2 -right-2 bg-primary-800 text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-white">
                                            {itemCount}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-primary-300 uppercase tracking-widest mb-1">Your Bag</p>
                                        <p className="text-2xl font-black">₹{cartTotal}</p>
                                    </div>
                                </div>
                                <button
                                    className="bg-white text-primary-900 px-10 py-4 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all text-xs tracking-widest uppercase flex items-center gap-2"
                                    onClick={() => navigate('/home/cart')}
                                >
                                    PROCEED <ArrowRight size={18} strokeWidth={3} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Mobile Adaptive Nav */}
            <nav className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 fixed bottom-0 left-0 right-0 flex items-center justify-around py-3 px-6 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-[2.5rem]">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-primary-800 dark:text-white scale-110' : 'text-slate-400'}`}
                        >
                            <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary-50 dark:bg-primary-900/30' : ''} relative`}>
                                <item.icon size={22} strokeWidth={isActive ? 3 : 2} />
                                {item.label === 'Orders' && itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-800 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md">
                                        {itemCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Premium Fluid Footer (Customer Only) */}
            {user?.role === ROLES.CUSTOMER && (
                <footer className="bg-slate-900 text-white pt-20 pb-10 mt-10 w-full relative z-40">
                    <div className="w-full px-6 md:px-12 lg:px-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-white/10 pb-16">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg ring-4 ring-white/10">B</div>
                                <h3 className="text-3xl font-black uppercase tracking-tighter">Bharat<span className="text-secondary">Drop</span></h3>
                            </div>
                            <p className="text-slate-400 font-bold text-sm leading-relaxed uppercase tracking-wide">{t('footer.tagline')}</p>
                            <div className="flex gap-4">
                                {[Globe, Send, MessageSquare].map((Icon, i) => (
                                    <button key={i} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-primary-600 transition-colors shadow-inner">
                                        <Icon size={18} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h4 className="font-black text-xs uppercase tracking-[0.3em] text-secondary">{t('footer.quick_links')}</h4>
                            <ul className="space-y-4 text-slate-400 font-bold text-sm uppercase tracking-widest">
                                <li className="hover:text-white cursor-pointer transition-colors">{t('footer.vendor_login')}</li>
                                <li className="hover:text-white cursor-pointer transition-colors">{t('footer.partner_with_us')}</li>
                                <li className="hover:text-white cursor-pointer transition-colors">{t('footer.about_story')}</li>
                                <li className="hover:text-white cursor-pointer transition-colors">{t('footer.impact_report')}</li>
                            </ul>
                        </div>

                        <div className="space-y-8">
                            <h4 className="font-black text-xs uppercase tracking-[0.3em] text-secondary">{t('footer.service_areas')}</h4>
                            <ul className="space-y-4 text-slate-400 font-bold text-sm uppercase tracking-widest">
                                <li className="hover:text-white cursor-pointer transition-colors">Dhanikhera Town Areas</li>
                                <li className="hover:text-white cursor-pointer transition-colors">Bhagwant Nagar Town Areas</li>
                                <li className="hover:text-white cursor-pointer transition-colors">Village Cluster A</li>
                                <li className="hover:text-white cursor-pointer transition-colors">Town-Central Hub</li>
                            </ul>
                        </div>

                        <div className="space-y-8">
                            <h4 className="font-black text-xs uppercase tracking-[0.3em] text-secondary">{t('footer.support')}</h4>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{t('footer.whatsapp_us')}</p>
                                        <p className="text-sm font-black uppercase tracking-tight">+91 999 888 777</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-12 h-12 bg-primary-50/10 text-primary-500 rounded-2xl flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all shadow-inner">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{t('footer.email_support')}</p>
                                        <p className="text-sm font-black uppercase tracking-tight">care@bharatdrop.in</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full px-6 md:px-12 lg:px-16 mt-10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">{t('footer.copyright')}</p>
                        <div className="flex gap-8 text-slate-500 font-black text-[10px] uppercase tracking-widest">
                            <span className="hover:text-white cursor-pointer transition-colors">{t('footer.privacy')}</span>
                            <span className="hover:text-white cursor-pointer transition-colors">{t('footer.terms')}</span>
                            <span className="hover:text-white cursor-pointer transition-colors">{t('footer.compliance')}</span>
                        </div>
                    </div>
                </footer>
            )}

            {/* Global Search Overlay for Mobile and desktop backdrop (No Blur as requested) */}
            <AnimatePresence>
                {isSearchActive && (
                    <>
                        <div
                            onClick={() => {
                                setIsSearchActive(false);
                                setGlobalSearchQuery('');
                            }}
                            className="fixed inset-0 bg-transparent z-[65]"
                        />
                        {/* Mobile Specific Search UI */}
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="lg:hidden w-full bg-white dark:bg-slate-900 p-6 pt-20 border-b-2 border-slate-100 dark:border-slate-800 shadow-2xl z-[70] fixed top-0"
                        >
                            <div className="relative group flex gap-3">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder={t('header.search_placeholder')}
                                        autoFocus
                                        value={globalSearchQuery}
                                        onChange={(e) => setGlobalSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && setIsSearchActive(true)}
                                        className="w-full pl-6 pr-12 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2rem] text-sm font-black text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary-800 transition-all shadow-inner"
                                    />
                                    {globalSearchQuery && (
                                        <button
                                            onClick={() => setGlobalSearchQuery('')}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        if (globalSearchQuery.trim()) {
                                            navigate(`/home/search?q=${globalSearchQuery}`);
                                            setIsSearchActive(false);
                                        }
                                    }}
                                    className="p-5 bg-primary-800 text-white rounded-[2rem] shadow-xl shadow-primary-900/20 active:scale-95 transition-all"
                                >
                                    <Search size={22} />
                                </button>
                            </div>

                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Village Picker Modal - Rendered at root level to ensures correct stacking context */}
            <AnimatePresence>
                {isVillagePickerOpen && (
                    <motion.div
                        key="village-picker-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            setIsVillagePickerOpen(false);
                            setLocationSearchQuery('');
                        }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] grid place-items-center p-6 sm:p-12 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-10 shadow-2xl border-2 border-slate-50 dark:border-slate-800 relative"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">{t('header.nearby_villages')}</h2>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('header.select_hub')}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsVillagePickerOpen(false);
                                        setLocationSearchQuery('');
                                    }}
                                    className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
                                >
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            {/* Search Field */}
                            <div className="relative mb-8 group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-800 transition-colors pointer-events-none">
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder={t('header.search_village')}
                                    value={locationSearchQuery}
                                    onChange={(e) => setLocationSearchQuery(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2rem] text-sm font-black text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary-800 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-all shadow-inner"
                                />
                            </div>

                            <div
                                className="grid grid-cols-1 gap-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 hover:scrollbar-thumb-primary-800/30 transition-colors"
                                data-lenis-prevent
                            >
                                {filteredVillages.length > 0 ? filteredVillages.map((village) => (
                                    <button
                                        key={village}
                                        onClick={() => setTempSelectedVillage(village)}
                                        className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all group ${tempSelectedVillage === village
                                            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-800 text-primary-800 dark:text-primary-400'
                                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 hover:border-primary-800/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl transition-all ${tempSelectedVillage === village ? 'bg-primary-800 text-white' : 'bg-white dark:bg-slate-700 text-slate-400 group-hover:text-primary-800'
                                                }`}>
                                                <MapPin size={18} />
                                            </div>
                                            <span className="font-black uppercase tracking-tight text-sm">{village}</span>
                                        </div>
                                        {tempSelectedVillage === village && <div className="w-2.5 h-2.5 bg-primary-800 rounded-full shadow-[0_0_10px_rgba(30,34,55,0.5)]" />}
                                        <ChevronRight size={16} className={`transition-all ${tempSelectedVillage === village ? 'opacity-0' : 'opacity-10 dark:opacity-30 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                                    </button>
                                )) : (
                                    <div className="p-10 text-center space-y-4">
                                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                                            <Search size={24} className="text-slate-300" />
                                        </div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('header.no_village_found', { query: locationSearchQuery })}</p>
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={() => {
                                    setSelectedVillage(tempSelectedVillage);
                                    setIsVillagePickerOpen(false);
                                    setLocationSearchQuery('');
                                }}
                                className="w-full mt-10 py-5 text-xs font-black tracking-[0.2em] bg-slate-900 dark:bg-white dark:text-slate-900 shadow-xl"
                                disabled={!tempSelectedVillage}
                            >
                                {t('header.confirm_selection')}
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MainLayout;
