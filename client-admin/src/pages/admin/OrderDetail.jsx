import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Badge, Button, cn } from '../../components/common';
import { adminService } from '../../services/adminService';
import {
    ChevronLeft, Package, MapPin, Store, Users,
    Clock, Printer, Phone, Mail, CreditCard,
    CheckCircle2, AlertCircle, Trash2
} from 'lucide-react';
import { useLoading } from '../../context/LoadingContext';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';




const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { setIsLoading } = useLoading();
    const [orders, setOrders] = useState([]);
    const [isGrouped, setIsGrouped] = useState(false);

    const queryParams = new URLSearchParams(location.search);
    const groupId = queryParams.get('groupId');

    const fetchOrderDetails = async () => {
        setIsLoading(true);
        try {
            if (groupId) {
                const data = await adminService.getOrdersByGroupId(groupId);
                if (data && data.length > 0) {
                    setOrders(data);
                    setIsGrouped(true);
                } else {
                    toast.error('Transaction group not found');
                    navigate('/admin/orders');
                }
            } else {
                const data = await adminService.getOrderById(id);
                if (data) {
                    setOrders([data]);
                    setIsGrouped(false);
                } else {
                    toast.error('Order not found');
                    navigate('/admin/orders');
                }
            }
        } catch (error) {
            toast.error('Failed to load order details');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const response = await adminService.updateOrderStatus(orderId, newStatus);
            if (response.success) {
                toast.success(`Order marked as ${newStatus}`);
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
            } else {
                toast.error(response.message || 'Update failed');
            }
        } catch (error) {
            toast.error('Connection error');
        }
    };

    const handlePaymentUpdate = async (orderId, newStatus) => {
        try {
            const response = await adminService.updatePaymentStatus(orderId, newStatus);
            if (response.success) {
                toast.success(`Payment marked as ${newStatus}`);
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, paymentStatus: newStatus } : o));
            } else {
                toast.error(response.message || 'Update failed');
            }
        } catch (error) {
            toast.error('Connection error');
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'DELIVERED': return 'delivered';
            case 'CANCELLED': return 'cancelled';
            case 'READY': return 'info';
            case 'PICKED': return 'info';
            case 'ACCEPTED': return 'accepted';
            case 'PENDING': return 'pending';
            default: return 'default';
        }
    };

    if (!orders || orders.length === 0) return null;
    const baseOrder = orders[0]; // Primary order for customer/address info

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header with Back Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-xl text-slate-400 hover:text-primary-800 dark:hover:text-primary-400 transition-all hover:scale-110 active:scale-95"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-widest uppercase italic">
                                {isGrouped ? `Transaction #${baseOrder.groupId}` : `Order #${baseOrder.orderId}`}
                            </h2>
                            <Badge variant={getStatusVariant(baseOrder.status)} className="px-4 py-1.5 font-black text-[10px] uppercase tracking-widest">
                                {isGrouped ? (orders.every(o => o.status === baseOrder.status) ? baseOrder.status : 'MIXED') : baseOrder.status}
                            </Badge>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">
                            {orders.length} Shop(s) • {baseOrder.createdAt ? new Date(baseOrder.createdAt).toLocaleString() : 'Date N/A'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="font-black text-[10px] tracking-[0.2em] py-4 px-6 rounded-2xl bg-white dark:bg-slate-900 border-none shadow-lg">
                        <Printer size={16} className="mr-2" /> PRINT INVOICE
                    </Button>
                    <Button className="font-black text-[10px] tracking-[0.2em] py-4 px-6 rounded-2xl shadow-xl shadow-primary-900/20">
                        SUPPORT TICKET
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Order Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Status Management Bar */}
                    <Card className="p-8 border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem]">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 italic text-center">Update Transaction State (All Shops)</p>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                            {['PENDING', 'ACCEPTED', 'READY', 'PICKED', 'DELIVERED', 'CANCELLED'].map((stat) => {
                                const baseStatus = baseOrder.status;
                                const isTerminal = baseStatus === 'DELIVERED' || baseStatus === 'CANCELLED';
                                const isActive = orders.every(o => o.status === stat);

                                return (
                                    <button
                                        key={stat}
                                        onClick={() => orders.forEach(o => handleStatusUpdate(o._id, stat))}
                                        disabled={isActive}
                                        className={cn(
                                            "flex flex-col items-center gap-3 p-4 rounded-3xl border-2 transition-all group",
                                            isActive
                                                ? "bg-primary-800 border-primary-800 text-white shadow-xl shadow-primary-900/40 scale-105"
                                                : isTerminal
                                                    ? "bg-slate-50 dark:bg-slate-800/20 border-transparent text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50"
                                                    : "bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-400 hover:border-slate-200 dark:hover:border-slate-700 active:scale-95"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                            isActive ? "bg-white/20" : "bg-white dark:bg-slate-700 group-hover:scale-110 shadow-sm"
                                        )}>
                                            {stat === 'DELIVERED' ? <CheckCircle2 size={18} /> :
                                                stat === 'CANCELLED' ? <AlertCircle size={18} /> : <Clock size={18} />}
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest">{stat}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Order Items Grouped by Shop */}
                    {orders.map((subOrder, sidx) => (
                        <Card key={subOrder._id} className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                            <div className="p-8 border-b border-slate-50 dark:border-slate-800/50 flex items-center justify-between bg-primary-50/30 dark:bg-primary-900/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary-800 text-white flex items-center justify-center shadow-lg transform -rotate-3 italic font-black">{sidx + 1}</div>
                                    <div>
                                        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm italic">{subOrder.vendor?.name || 'Direct Shop'}</h3>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Order ID: {subOrder.orderId}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant={getStatusVariant(subOrder.status)} className="px-3 py-1 font-black text-[8px] uppercase tracking-widest">
                                        {subOrder.status}
                                    </Badge>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{(subOrder.items || []).length} Item(s)</span>
                                </div>
                            </div>
                            <div className="p-0">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 dark:bg-slate-800/30">
                                        <tr>
                                            <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Product</th>
                                            <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest italic text-center">Qty</th>
                                            <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest italic text-right">Price</th>
                                            <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest italic text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                                        {(subOrder.items || []).map((item, idx) => (
                                            <tr key={idx} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all font-medium">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 p-1 group-hover:scale-110 transition-transform shadow-sm">
                                                            <img src={item.image} alt="" className="w-full h-full object-cover rounded-xl" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-xs">{item.name || 'Unnamed Product'}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Per Unit: ₹{item.price || 0}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className="font-black text-slate-900 dark:text-white text-xs">{item.quantity || 0} {item.unit || 'units'}</span>
                                                </td>
                                                <td className="px-8 py-6 text-right font-black text-slate-500 dark:text-slate-400 text-xs">₹{item.price || 0}</td>
                                                <td className="px-8 py-6 text-right font-black text-slate-900 dark:text-white text-sm">₹{(item.price || 0) * (item.quantity || 0)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-8 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                <div className="w-full max-w-xs space-y-2">
                                    <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        <span>Shop Total</span>
                                        <span className="text-slate-900 dark:text-white">₹{subOrder.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {/* Transaction Summary */}
                    <Card className="p-10 border-none shadow-2xl bg-primary-900 dark:bg-slate-900 rounded-[3rem] text-white">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center text-white shadow-inner"><Package size={32} /></div>
                                <div>
                                    <h4 className="text-xl font-black uppercase tracking-tighter leading-none italic">Transaction Total</h4>
                                    <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mt-2 italic">Combined across {orders.length} vendor(s)</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-4xl md:text-6xl font-black text-secondary italic tracking-tighter">₹{orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}</span>
                                <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mt-2 italic">Inclusive of all delivery fees</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    {/* Customer Identity */}
                    <Card className="p-8 border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 dark:bg-primary-900/10 rounded-bl-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-800 dark:text-primary-400 shadow-sm border border-primary-100/50">
                                    <Users size={20} />
                                </div>
                                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] text-[11px] italic">End Customer</h4>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tighter mb-1">{baseOrder.customer?.name || 'Unknown'}</p>
                                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                                        <Phone size={12} /> {baseOrder.customer?.mobile || 'N/A'}
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-slate-50 dark:border-slate-800 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="text-slate-400 mt-1 shrink-0" size={16} />
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Delivery Co-ordinates</p>
                                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed uppercase tracking-wide">
                                                {baseOrder.deliveryAddress?.address || 'No Address'}, {baseOrder.deliveryAddress?.village || ''} - {baseOrder.deliveryAddress?.pincode || ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Merchant Details */}
                    <Card className="p-8 border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 dark:bg-amber-900/10 rounded-bl-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm border border-amber-100/50">
                                    <Store size={20} />
                                </div>
                                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] text-[11px] italic">Merchant Profile</h4>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {orders.map(o => (
                                    <Badge key={o._id} className="bg-slate-50 dark:bg-slate-800 text-slate-400 border-none px-4 py-2 font-black text-[9px] uppercase tracking-widest">{o.vendor?.name}</Badge>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Payment Matrix */}
                    <Card className="p-8 border-none shadow-2xl bg-primary-900 dark:bg-slate-900 rounded-[3rem] text-white relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white shadow-inner">
                                    <CreditCard size={20} />
                                </div>
                                <h4 className="font-black uppercase tracking-[0.2em] text-[11px] opacity-60 italic">Payment Matrix</h4>
                            </div>
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[9px] font-black opacity-40 uppercase tracking-widest mb-1 italic">Settlement Mode</p>
                                        <p className="text-xl font-black uppercase italic tracking-widest">{baseOrder.paymentMethod}</p>
                                    </div>
                                    <Badge
                                        variant={orders.every(o => o.paymentStatus === 'COMPLETED') ? 'success' : 'warning'}
                                        className="border-none py-1.5 px-4 font-black text-[9px] tracking-widest uppercase shadow-lg"
                                    >
                                        {orders.every(o => o.paymentStatus === 'COMPLETED') ? 'PAID' : (orders.some(o => o.paymentStatus === 'COMPLETED') ? 'PARTIAL' : baseOrder.paymentStatus)}
                                    </Badge>
                                </div>

                                {orders.some(o => o.paymentStatus !== 'COMPLETED') && (
                                    <button
                                        onClick={() => orders.forEach(o => handlePaymentUpdate(o._id, 'COMPLETED'))}
                                        className="w-full py-4 bg-white text-primary-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-secondary transition-all active:scale-95 shadow-xl"
                                    >
                                        Mark Transaction as Paid
                                    </button>
                                )}

                                {baseOrder.paymentMethod === 'upi' && baseOrder.upiDetails && (
                                    <div className="pt-6 border-t border-white/10 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">Ref Code</span>
                                            <span className="text-[11px] font-black tracking-widest font-mono">{baseOrder.upiDetails.refNumber}</span>
                                        </div>
                                        {baseOrder.upiDetails.screenshot && (
                                            <a
                                                href={baseOrder.upiDetails.screenshot}
                                                target="_blank" rel="noopener noreferrer"
                                                className="block w-full py-3 bg-white/10 hover:bg-white/20 transition-all rounded-xl text-center text-[9px] font-black uppercase tracking-[0.2em] border border-white/5"
                                            >
                                                Audit Screenshot
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Risk Audit */}
                    <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-[2rem] flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-red-600 shadow-sm"><Trash2 size={18} /></div>
                        <div>
                            <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-0.5">Termination Zone</p>
                            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest cursor-pointer hover:underline">Flag as Refund/Fraud</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
