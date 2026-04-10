import React, { useState } from 'react';
import { Card, Badge, Button } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Package, Phone, CheckCircle2, Navigation, CircleDot, AlertCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const DeliveryDashboard = () => {
    const { user } = useAuth();
    const [isOnline, setIsOnline] = useState(true);

    const activeDeliveries = [
        {
            id: '#DEL-502',
            shop: 'Gopal Grocery Store',
            customer: 'Brajesh Singh',
            address: 'House No 45, Rampur',
            status: 'At Shop',
            items: 3,
            distance: '1.2 km'
        }
    ];

    if (user?.status === 'PENDING') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 uppercase tracking-tight">
                <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/20 rounded-[2.5rem] flex items-center justify-center text-primary-800 dark:text-primary-400 shadow-xl border-2 border-primary-100 dark:border-primary-800 animate-bounce">
                    <ShieldAlert size={48} />
                </div>
                <div className="space-y-4 max-w-lg">
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white leading-tight underline decoration-primary-500 decoration-8 underline-offset-8">Onboarding Verification</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-lg leading-relaxed">
                        Hello, <span className="text-primary-800 dark:text-primary-400 font-black">{user.name}</span>! Your profile as a <span className="text-secondary font-black">Delivery Partner</span> is being verified.
                    </p>
                    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-50 dark:border-slate-800 shadow-sm inline-block">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 font-sans">Vehicle Profile</p>
                        <p className="text-xl font-black text-slate-800 dark:text-white">{user.vehicleType || 'Not Specified'}</p>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">We will notify you via SMS once you are active.</p>
                    <p className="text-[9px] font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-full">Background verification in progress</p>
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
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white leading-tight">Verification Declined</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-lg leading-relaxed">
                        We regret to inform you that your delivery partner application has been declined.
                    </p>
                </div>
                <div className="space-y-4">
                    <p className="text-sm font-bold text-slate-400 max-w-xs mx-auto">Please contact our logistics support team for more information.</p>
                    <Button className="bg-red-600 text-white rounded-2xl">Contact Support</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Online/Offline Toggle Header */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${isOnline ? 'bg-emerald-500' : 'bg-slate-400 shadow-none'}`}>
                        {isOnline ? <CheckCircle2 size={30} /> : <CircleDot size={30} />}
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Hello, {user?.name?.split(' ')[0]}!</h1>
                        <p className="text-slate-500 font-bold">{isOnline ? 'You are currently Online' : 'You are currently Offline'}</p>
                    </div>
                </div>
                <div className="flex items-center p-1 bg-slate-100 rounded-2xl w-fit">
                    <button
                        onClick={() => setIsOnline(true)}
                        className={`px-6 py-2 rounded-xl font-black text-sm transition-all ${isOnline ? 'bg-white shadow-lg text-emerald-600' : 'text-slate-400'}`}
                    >
                        ONLINE
                    </button>
                    <button
                        onClick={() => setIsOnline(false)}
                        className={`px-6 py-2 rounded-xl font-black text-sm transition-all ${!isOnline ? 'bg-white shadow-lg text-red-600' : 'text-slate-400'}`}
                    >
                        OFFLINE
                    </button>
                </div>
            </div>

            {/* Earnings Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="p-5 bg-primary-900 text-white border-none shadow-lg shadow-primary-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary-300">Today Earnings</p>
                    <p className="text-2xl font-black mt-1">₹450</p>
                </Card>
                <Card className="p-5 bg-white border-none shadow-lg">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Orders Done</p>
                    <p className="text-2xl font-black mt-1 text-slate-800">08</p>
                </Card>
            </div>

            {/* Active Task */}
            {isOnline ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        Active Assignment <Badge variant="info" className="ml-2">1</Badge>
                    </h2>

                    {activeDeliveries.map(del => (
                        <Card key={del.id} className="p-0 overflow-hidden border-none shadow-2xl">
                            <div className="bg-primary-600 p-4 text-white flex justify-between items-center">
                                <span className="font-black tracking-widest">{del.id}</span>
                                <Badge variant="info" className="bg-white/20 text-white border-none">{del.status}</Badge>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border-2 border-emerald-200">
                                            <Package size={16} />
                                        </div>
                                        <div className="w-0.5 h-12 border-l-2 border-dashed border-slate-200 my-1"></div>
                                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center border-2 border-primary-200">
                                            <MapPin size={16} />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-6">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Pickup Location</p>
                                            <p className="font-black text-slate-800">{del.shop}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Drop Location</p>
                                            <p className="font-black text-slate-800">{del.address}</p>
                                            <p className="text-xs font-bold text-slate-500 mt-0.5">Customer: {del.customer}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button variant="secondary" className="flex-1 flex items-center gap-2 bg-slate-50">
                                        <Phone size={18} /> Call
                                    </Button>
                                    <Button className="flex-1 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700">
                                        <Navigation size={18} /> Navigate
                                    </Button>
                                </div>
                                <Button className="w-full py-4 text-lg font-black rounded-2xl shadow-xl">
                                    Confirm Pickup
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                        <AlertCircle size={40} />
                    </div>
                    <div>
                        <p className="text-slate-900 font-black text-xl">You are Offline</p>
                        <p className="text-slate-500 font-medium max-w-xs">Switch to Online mode to start receiving delivery assignments.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryDashboard;
