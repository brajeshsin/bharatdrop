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
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12 mt-4 px-4 sm:px-0 uppercase tracking-tight">
            {/* Header / Nav */}
            <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-full shadow-sm border-2 border-slate-100 dark:border-slate-800 sticky top-4 z-50 transition-all">
                <button
                    onClick={() => navigate('/merchant')}
                    className="flex items-center gap-2 text-slate-500 hover:text-primary-800 dark:hover:text-primary-400 font-black text-xs tracking-[0.2em] transition-colors pl-2 pr-6 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full group"
                >
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                    </div>
                    <span>DASHBOARD</span>
                </button>
                <div className={`px-8 py-3 rounded-full font-black text-xs tracking-[0.2em] shadow-lg ring-4 ring-slate-50 dark:ring-slate-900 ${getStatusColor(order.status)}`}>
                    {order.status}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Order Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 border-t-[12px] border-primary-800 shadow-2xl relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-primary-100/40 to-transparent dark:from-primary-900/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-secondary/10 to-transparent rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl pointer-events-none"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b-2 border-slate-100 dark:border-slate-800">
                            <div>
                                <p className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                                    ORDER INVOICE
                                </p>
                                <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none mb-4">
                                    {order.orderId || order._id}
                                </h1>
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 tracking-widest">
                                    <Clock size={14} />
                                    <span>Placed on {new Date(order.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl min-w-[200px] text-center shadow-inner border-2 border-slate-100 dark:border-slate-700">
                                <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 mb-2">Total Amount</p>
                                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-primary-500 dark:from-primary-400 dark:to-primary-300">
                                    ₹{order.total || order.subtotal}
                                </p>
                            </div>
                        </div>

                        <div className="pt-10">
                            <h2 className="text-sm font-black text-slate-800 dark:text-white tracking-[0.2em] mb-8 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                    <Package size={20} /> 
                                </div>
                                ORDERED ITEMS <Badge className="ml-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none">{order.items?.length || 0}</Badge>
                            </h2>
                            <div className="space-y-6">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="group flex flex-col sm:flex-row sm:items-center gap-6 p-6 rounded-[2rem] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                        
                                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 shrink-0 shadow-inner">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-contain rounded-xl mix-blend-multiply dark:mix-blend-normal" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Package size={28} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between h-full relative z-10">
                                            <div>
                                                <h3 className="text-sm md:text-base font-black text-slate-800 dark:text-white leading-relaxed mb-3 line-clamp-2 pr-4">{item.name}</h3>
                                            </div>
                                            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                                                <p className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg tracking-widest">
                                                    Qty: <span className="text-slate-800 dark:text-white text-sm ml-1">{item.quantity}</span>
                                                    {item.unit && <span className="ml-1 text-slate-500 lowercase">{item.unit}</span>}
                                                </p>
                                                <p className="text-2xl font-black text-slate-800 dark:text-white">
                                                    <span className="text-xs text-slate-400 mr-1">₹</span>{item.price * item.quantity}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar details */}
                <div className="space-y-8">
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
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border-2 border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-800/50 rounded-full -translate-y-16 translate-x-16 pointer-events-none"></div>
                        <h2 className="text-[10px] font-black text-slate-400 tracking-[0.3em] mb-8 pb-4 border-b-2 border-slate-50 dark:border-slate-800 flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                            CUSTOMER DETAILS
                        </h2>
                        <div className="space-y-6 relative z-10">
                            <div>
                                <p className="text-[9px] font-black tracking-widest text-primary-600 dark:text-primary-400 mb-1">CUSTOMER NAME</p>
                                <p className="text-xl font-black text-slate-800 dark:text-white leading-none">{order.customer?.name || 'Guest User'}</p>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                                <div className="w-12 h-12 bg-white dark:bg-slate-900 shadow-sm text-slate-500 rounded-xl flex items-center justify-center shrink-0">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black tracking-widest text-slate-400 mb-1">CONTACT NUMBER</p>
                                    <p className="text-sm font-black text-slate-800 dark:text-white tracking-widest">{order.customer?.mobile || 'N/A'}</p>
                                </div>
                            </div>
                            {order.deliveryAddress && (
                                <div className="flex items-start gap-4 bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-900 shadow-sm text-secondary rounded-xl flex items-center justify-center shrink-0">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black tracking-widest text-slate-400 mb-1">DELIVERY DESTINATION</p>
                                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed capitalize">
                                            {order.deliveryAddress.address}
                                            {order.deliveryAddress.village ? `, ${order.deliveryAddress.village}` : ''}
                                            {order.deliveryAddress.landmark ? ` (${order.deliveryAddress.landmark})` : ''}
                                            {order.deliveryAddress.pincode ? ` - ${order.deliveryAddress.pincode}` : ''}
                                        </p>
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
