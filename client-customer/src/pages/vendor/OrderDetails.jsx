import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Badge } from '../../components/common';
import { vendorService } from '../../services/vendorService';
import { toast } from 'react-hot-toast';
import { useLoading } from '../../context/LoadingContext';
import { ArrowLeft, MapPin, Phone, Package, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const VendorOrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setIsLoading } = useLoading();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchOrderDetails = async () => {
        try {
            const data = await vendorService.getVendorOrderById(id);
            if (data) {
                setOrder(data);
            } else {
                toast.error("Order not found");
                navigate('/merchant');
            }
        } catch (error) {
            toast.error("Error loading order details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const handleUpdateStatus = async (newStatus) => {
        setIsLoading(true);
        const result = await vendorService.updateOrderStatus(order._id || order.id, newStatus);
        setIsLoading(false);
        if (result.success !== false) {
            toast.success(`Order marked as ${newStatus}`);
            fetchOrderDetails(); // refresh details
        } else {
            toast.error(result.message || 'Failed to update status');
        }
    };

    if (loading) return null; // Let the layout loader handle it
    if (!order) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-500 text-yellow-50';
            case 'ACCEPTED': return 'bg-blue-500 text-blue-50';
            case 'READY':
            case 'READY_FOR_PICKUP': return 'bg-purple-500 text-purple-50';
            case 'PICKED': return 'bg-orange-500 text-orange-50';
            case 'DELIVERED': return 'bg-emerald-500 text-emerald-50';
            case 'CANCELLED': return 'bg-red-500 text-red-50';
            default: return 'bg-slate-500 text-slate-50';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10 uppercase tracking-tight">
            {/* Header / Nav */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border-2 border-slate-50 dark:border-slate-800">
                <button
                    onClick={() => navigate('/merchant')}
                    className="flex items-center gap-2 text-slate-500 hover:text-primary-800 dark:hover:text-primary-400 font-black text-[10px] tracking-widest transition-colors px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full"
                >
                    <ArrowLeft size={16} /> BACK TO DASHBOARD
                </button>
                <div className={`px-6 py-2 rounded-full font-black text-xs tracking-widest ${getStatusColor(order.status)}`}>
                    {order.status}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Order Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border-t-8 border-primary-800 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 dark:bg-primary-900/20 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b-2 border-slate-50 dark:border-slate-800">
                            <div>
                                <h1 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none mb-2">
                                    {order.orderId || order._id}
                                </h1>
                                <p className="text-xs font-bold text-slate-400 tracking-widest">
                                    Placed on {new Date(order.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <div className="text-left md:text-right">
                                <p className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-1">Total Amount</p>
                                <p className="text-3xl font-black text-slate-800 dark:text-white">₹{order.total || order.subtotal}</p>
                            </div>
                        </div>

                        <div className="pt-6">
                            <h2 className="text-sm font-black text-slate-400 tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Package size={16} /> ORDERED ITEMS ({order.items?.length || 0})
                            </h2>
                            <div className="space-y-4">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                                        <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl p-2 shrink-0 shadow-sm">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-contain rounded-xl" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Package size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight mb-1">{item.name}</h3>
                                                <p className="text-[10px] font-bold text-slate-400 tracking-widest">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="text-xl font-black text-primary-800 dark:text-primary-400">₹{item.price * item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar details */}
                <div className="space-y-6">
                    {/* Action Card */}
                    <div className="bg-primary-900 border-none rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden text-center group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700"></div>
                        <h2 className="text-lg font-black text-white/50 tracking-[0.2em] mb-6 relative z-10">ACTIONS</h2>
                        
                        <div className="space-y-4 relative z-10">
                            {order.status === 'PENDING' ? (
                                <>
                                    <p className="text-xs text-primary-100 font-bold mb-4">Please confirm you can fulfill this order.</p>
                                    <Button 
                                        className="w-full bg-secondary hover:bg-orange-500 text-white rounded-2xl py-6 text-sm tracking-[0.2em] font-black shadow-xl"
                                        onClick={() => handleUpdateStatus('ACCEPTED')}
                                    >
                                        ACCEPT ORDER
                                    </Button>
                                    <Button 
                                        className="w-full bg-red-500/20 hover:bg-red-500 text-red-100 rounded-2xl py-4 text-xs tracking-widest font-bold border-2 border-red-500/20"
                                        onClick={() => handleUpdateStatus('CANCELLED')}
                                    >
                                        REJECT
                                    </Button>
                                </>
                            ) : order.status === 'ACCEPTED' ? (
                                <>
                                    <p className="text-xs text-primary-100 font-bold mb-4 leading-relaxed">Pack the items and set status to Ready when it's prepared for pickup.</p>
                                    <Button 
                                        className="w-full bg-white hover:bg-primary-50 text-primary-900 rounded-2xl py-6 text-sm tracking-[0.2em] font-black shadow-xl flex items-center justify-center gap-2"
                                        onClick={() => handleUpdateStatus('READY')}
                                    >
                                        <CheckCircle size={20} className="text-primary-600" /> MARK AS READY
                                    </Button>
                                </>
                            ) : (
                                <div className="py-4">
                                    <p className="text-xs text-primary-200 font-black tracking-widest leading-loose">
                                        No actions available.<br/>Current State:<br/>
                                        <span className="text-2xl text-white mt-2 block">{order.status}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer Info Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border-2 border-slate-50 dark:border-slate-800 shadow-md">
                        <h2 className="text-sm font-black text-slate-400 tracking-[0.2em] mb-6 flex items-center gap-2">
                            CUSTOMER DETAILS
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black tracking-widest text-slate-400 mb-1">Name</p>
                                <p className="text-xl font-black text-slate-800 dark:text-white leading-none">{order.customer?.name || 'Guest User'}</p>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-2xl p-4">
                                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl flex items-center justify-center shrink-0">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black tracking-widest text-slate-400 mb-1">Contact</p>
                                    <p className="text-sm font-black text-slate-800 dark:text-white">{order.customer?.mobile || 'N/A'}</p>
                                </div>
                            </div>
                            {order.deliveryAddress && (
                                <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800 rounded-2xl p-4">
                                    <div className="w-10 h-10 bg-secondary/20 text-secondary rounded-xl flex items-center justify-center shrink-0">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black tracking-widest text-slate-400 mb-1">Dilvery To</p>
                                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300 capitalize">{order.deliveryAddress}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorOrderDetails;
