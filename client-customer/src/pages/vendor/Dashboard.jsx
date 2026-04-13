import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '../../components/common';
import { ORDER_STATUS } from '../../services/mockData';
import { vendorService } from '../../services/vendorService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, CreditCard, TrendingUp, AlertCircle, Clock, DollarSign, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const VendorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shopStatus, setShopStatus] = useState('OPEN');
    const [customFrom, setCustomFrom] = useState('09:00');
    const [customTo, setCustomTo] = useState('21:00');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    useEffect(() => {
        if (user?.status !== 'PENDING' && user?.status !== 'SUSPENDED') {
            fetchOrders();
            fetchVendorProfile();
        }
    }, [user?.status]);

    const fetchVendorProfile = async () => {
        const data = await vendorService.getMyProfile();
        if (data && data.success && data.vendor) {
            setShopStatus(data.vendor.shopStatus || 'OPEN');
            if (data.vendor.customTimings?.from) setCustomFrom(data.vendor.customTimings.from);
            if (data.vendor.customTimings?.to) setCustomTo(data.vendor.customTimings.to);
        }
    };

    const fetchOrders = async () => {
        const data = await vendorService.getVendorOrders();
        setOrders(data);
        setLoading(false);
    };

    const handleShopStatusUpdate = async (newStatus, from = customFrom, to = customTo) => {
        setIsUpdatingStatus(true);
        setShopStatus(newStatus);
        if (from) setCustomFrom(from);
        if (to) setCustomTo(to);
        
        const payload = { shopStatus: newStatus, customTimings: { from, to } };
        const result = await vendorService.updateShopStatus(payload);
        setIsUpdatingStatus(false);
        if (result && result.success) {
            toast.success('Shop status updated successfully');
        } else {
            toast.error(result?.message || 'Failed to update shop status');
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        const result = await vendorService.updateOrderStatus(orderId, newStatus);
        if (result.success !== false) {
            toast.success(`Order accepted`);
            fetchOrders();
        } else {
            toast.error(result.message || 'Failed to update order');
        }
    };

    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const todayOrders = orders.filter(o => new Date(o.createdAt || new Date()) >= todayStart).length;
    const totalEarnings = orders.filter(o => o.status !== 'CANCELLED').reduce((acc, curr) => acc + (curr.total || 0), 0);

    const stats = [
        { label: 'Today Orders', value: todayOrders.toString(), icon: Package, color: 'bg-primary-800' },
        { label: 'Total Earnings', value: `₹${totalEarnings}`, icon: DollarSign, color: 'bg-emerald-600' },
        { label: 'Rating', value: '4.8', icon: TrendingUp, color: 'bg-secondary' },
    ];

    if (user?.status === 'PENDING') {
        return (
            <div className="relative flex flex-col items-center justify-center min-h-[80vh] w-full overflow-hidden p-4">
                {/* Immersive background without boundaries */}
                <div className="absolute inset-0 pointer-events-none -z-10"></div>
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-100 dark:bg-primary-900/30 rounded-full blur-[100px] opacity-60"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] opacity-60"></div>

                <div className="w-full max-w-5xl px-6 relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col items-center w-full"
                    >
                        <div className="relative mb-12 flex justify-center">
                            <div className="absolute inset-0 bg-primary-200 dark:bg-primary-900/40 blur-3xl animate-pulse rounded-full"></div>
                            <Clock size={64} className="text-primary-400 dark:text-primary-500 relative z-10 animate-bounce" />
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-6 leading-[0.9]">
                            Account <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary">Under Review</span>
                        </h1>

                        <p className="text-xl md:text-2xl font-bold text-slate-500 dark:text-slate-400 mb-20 max-w-3xl leading-relaxed">
                            Hello, <span className="text-primary-800 dark:text-primary-400 font-black">{user.name}</span>! Your request to join as a <span className="text-slate-800 dark:text-white font-black underline decoration-secondary decoration-8 underline-offset-8">Merchant</span> is being reviewed by our team.
                        </p>

                        <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-16 md:gap-32 mb-20 relative">
                            {/* Connector line behind */}
                            <div className="absolute top-1/3 left-[20%] w-[60%] h-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent hidden md:block -z-10"></div>

                            <div className="flex flex-col items-center text-center group">
                                <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center shadow-2xl mb-6 text-primary-600 dark:text-primary-400 group-hover:-translate-y-2 transition-transform duration-300">
                                    <Package size={40} />
                                </div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Registered Store</p>
                                <p className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{user.storeName || 'My Store'}</p>
                            </div>

                            <div className="flex flex-col items-center text-center group">
                                <div className="w-24 h-24 bg-yellow-400 dark:bg-yellow-500 rounded-[2.5rem] flex items-center justify-center shadow-2xl mb-6 text-slate-900 border-4 border-white dark:border-slate-900 ring-8 ring-yellow-400/20 group-hover:-translate-y-2 transition-transform duration-300">
                                    <ShieldAlert size={40} className="animate-pulse" />
                                </div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Current Status</p>
                                <p className="text-3xl font-black text-yellow-600 dark:text-yellow-500 uppercase tracking-tight">Pending Approval</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-4 text-sm md:text-base font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 px-8 py-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800">
                            <span className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                Estimated time: <span className="text-slate-800 dark:text-white">24-48 Hours</span>
                            </span>
                            <span className="hidden md:inline text-slate-200 dark:text-slate-700 mx-4">|</span>
                            <span className="flex items-center gap-3 text-primary-600 dark:text-primary-400">
                                <span className="w-2 h-2 rounded-full bg-primary-400 animate-ping"></span>
                                Notification via Email/SMS
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (user?.status === 'SUSPENDED') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 uppercase tracking-tight">
                <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-[2.5rem] flex items-center justify-center text-red-600 shadow-xl border-2 border-red-100 dark:border-red-800">
                    <AlertCircle size={48} />
                </div>
                <div className="space-y-4 max-w-lg">
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white leading-tight">Registration Rejected</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-lg leading-relaxed">
                        We regret to inform you that your registration request for <span className="text-red-600 font-black">{user.storeName}</span> has been declined.
                    </p>
                </div>
                <div className="space-y-4">
                    <p className="text-sm font-bold text-slate-400 max-w-xs mx-auto">Please contact our support team if you believe this is a mistake or to get more details.</p>
                    <Button className="bg-red-600 text-white rounded-2xl">Contact Support</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10 uppercase tracking-tight">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-base dark:text-white leading-tight">Vendor Panel</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold">Welcome, <span className="text-primary-800 dark:text-primary-400 font-black">{user?.storeName || user?.name}</span></p>
                </div>
                <div className="flex flex-col items-end gap-2 relative">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-1 shadow-sm">
                        <select 
                            value={shopStatus} 
                            onChange={(e) => handleShopStatusUpdate(e.target.value)}
                            disabled={isUpdatingStatus}
                            className={`px-4 py-2 font-black text-[10px] tracking-widest uppercase rounded-xl outline-none transition-colors border-none cursor-pointer ${
                                shopStatus === 'OPEN' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                                shopStatus === 'CLOSED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                            }`}
                        >
                            <option value="OPEN" className="bg-white text-slate-800 dark:bg-slate-800 dark:text-white">Shop: Open</option>
                            <option value="CLOSED" className="bg-white text-slate-800 dark:bg-slate-800 dark:text-white">Shop: Closed</option>
                            <option value="CUSTOM" className="bg-white text-slate-800 dark:bg-slate-800 dark:text-white">Custom Hours</option>
                        </select>
                    </div>
                    {shopStatus === 'CUSTOM' && (
                        <div className="flex flex-col md:flex-row items-center gap-2 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-2 shadow-lg md:absolute md:top-full mt-1 md:w-[260px] md:right-0 z-50">
                            <input 
                                type="time" 
                                value={customFrom}
                                onChange={(e) => handleShopStatusUpdate('CUSTOM', e.target.value, customTo)}
                                className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white px-2 py-1.5 rounded-lg outline-none text-xs w-full font-black tracking-widest border border-slate-200 dark:border-slate-700 focus:border-primary-500"
                            />
                            <span className="text-slate-400 font-bold text-[10px]">TO</span>
                            <input 
                                type="time" 
                                value={customTo}
                                onChange={(e) => handleShopStatusUpdate('CUSTOM', customFrom, e.target.value)}
                                className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white px-2 py-1.5 rounded-lg outline-none text-xs w-full font-black tracking-widest border border-slate-200 dark:border-slate-700 focus:border-primary-500"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Stats - Simple & Bold */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card className="p-6 flex items-center gap-5 border-none shadow-md bg-white dark:bg-slate-900 border-t-4 border-primary-800">
                            <div className={`${s.color} p-4 rounded-[1.5rem] text-white shadow-lg`}>
                                <s.icon size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest leading-none">{s.label}</p>
                                <p className="text-3xl font-black text-text-base dark:text-white mt-2">{s.value}</p>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Orders List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white px-1 border-b-2 border-primary-50 dark:border-primary-900/20 pb-2">New Orders</h2>
                    {orders.length === 0 && !loading && (
                        <div className="text-center py-6 text-slate-400 font-bold uppercase tracking-widest text-xs">No orders found.</div>
                    )}
                    {orders.map((order) => (
                        <div 
                            key={order._id || order.id} 
                            onClick={() => navigate(`/merchant/orders/${order._id || order.id}`)}
                            className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 border-2 border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary-800 transition-all shadow-sm cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-800 dark:text-primary-400">
                                    <Package size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-text-base dark:text-white text-lg leading-tight uppercase tracking-tight">{order.orderId || order._id}</h3>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">{order.customer?.name} • {order.items?.length || 0} Items</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-4 md:mt-0">
                                <div className="text-right flex flex-col items-end">
                                    <p className="text-lg font-black text-text-base dark:text-white">₹{order.total || order.subtotal}</p>
                                    <Badge variant={order.status === 'PENDING' ? 'warning' : 'success'} className="text-[9px] mt-1 tracking-widest">{order.status}</Badge>
                                </div>
                                {order.status === 'PENDING' && (
                                    <Button 
                                        size="sm" 
                                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order._id || order.id, 'ACCEPTED'); }} 
                                        className="bg-primary-800 text-white rounded-xl uppercase tracking-widest text-[10px] px-6 shrink-0"
                                    >
                                        Accept
                                    </Button>
                                )}
                                {order.status === 'ACCEPTED' && (
                                    <Button 
                                        size="sm" 
                                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order._id || order.id, 'READY'); }} 
                                        className="bg-secondary text-white rounded-xl uppercase tracking-widest text-[10px] px-6 shrink-0"
                                    >
                                        Mark Ready
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Status Guide */}
                <div className="space-y-4">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white px-1 border-b-2 border-primary-50 dark:border-primary-900/20 pb-2">Shop Summary</h2>
                    <Card className="p-8 bg-primary-900 border-none text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700"></div>
                        <h3 className="text-4xl font-black leading-tight">Your shop is <span className="text-secondary">trending!</span></h3>
                        <p className="text-primary-200 mt-4 font-bold text-sm tracking-widest uppercase">Rank: #3 in Rampur Village</p>
                        <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black uppercase text-white/50 mb-1">Weekly Satisfaction</p>
                                <p className="text-2xl font-black">98%</p>
                            </div>
                            <TrendingUp size={32} className="text-secondary" />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
