import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    const { setIsLoading } = useLoading();
    const [order, setOrder] = useState(null);

    const fetchOrderDetails = async () => {
        setIsLoading(true);
        try {
            const data = await adminService.getOrderById(id);
            if (data) {
                setOrder(data);
            } else {
                toast.error('Order not found');
                navigate('/admin/orders');
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

    const handleStatusUpdate = async (newStatus) => {
        try {
            const response = await adminService.updateOrderStatus(order._id, newStatus);
            if (response.success) {
                toast.success(`Order marked as ${newStatus}`);
                setOrder({ ...order, status: newStatus });
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

    if (!order) return null;

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
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-widest uppercase italic">Order #{order.orderId}</h2>
                            <Badge variant={getStatusVariant(order.status)} className="px-4 py-1.5 font-black text-[10px] uppercase tracking-widest">
                                {order.status}
                            </Badge>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">
                            Transaction ID: {order._id} • {new Date(order.createdAt).toLocaleString()}
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
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 italic text-center">Manage Transaction State</p>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                            {['PENDING', 'ACCEPTED', 'READY', 'PICKED', 'DELIVERED', 'CANCELLED'].map((stat) => {
                                const isTerminal = order.status === 'DELIVERED' || order.status === 'CANCELLED';
                                const isActive = order.status === stat;

                                return (
                                    <button
                                        key={stat}
                                        onClick={() => handleStatusUpdate(stat)}
                                        disabled={isTerminal || isActive}
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

                    {/* Order Items */}
                    <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm italic">Items Purchased</h3>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{order.items.length} Product(s)</span>
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
                                    {order.items.map((item, idx) => (
                                        <tr key={idx} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all font-medium">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 p-1 group-hover:scale-110 transition-transform shadow-sm">
                                                        <img src={item.image} alt="" className="w-full h-full object-cover rounded-xl" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-xs">{item.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Per Unit: ₹{item.price}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="font-black text-slate-900 dark:text-white text-xs">{item.quantity} {item.unit || 'units'}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-slate-500 dark:text-slate-400 text-xs">₹{item.price}</td>
                                            <td className="px-8 py-6 text-right font-black text-slate-900 dark:text-white text-sm">₹{item.price * item.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-10 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <div className="w-full max-w-xs space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span>₹{order.total}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <span>Platform Fee</span>
                                    <span>₹0.00</span>
                                </div>
                                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-end">
                                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Grand Total</span>
                                    <span className="text-3xl font-black text-primary-800 dark:text-primary-400 italic tracking-tighter">₹{order.total.toLocaleString()}</span>
                                </div>
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
                                    <p className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tighter mb-1">{order.customer.name}</p>
                                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                                        <Phone size={12} /> {order.customer.mobile}
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-slate-50 dark:border-slate-800 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="text-slate-400 mt-1 shrink-0" size={16} />
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Delivery Co-ordinates</p>
                                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed uppercase tracking-wide">
                                                {order.deliveryAddress.address}, {order.deliveryAddress.village} - {order.deliveryAddress.pincode}
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
                            <p className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tighter mb-4">{order.vendor.name}</p>
                            <Badge className="bg-slate-50 dark:bg-slate-800 text-slate-400 border-none px-4 py-2 font-black text-[9px] uppercase tracking-widest">Premium Vendor</Badge>
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
                                        <p className="text-xl font-black uppercase italic tracking-widest">{order.paymentMethod}</p>
                                    </div>
                                    <Badge className="bg-white/10 text-white border-none py-1.5 px-4 font-black text-[9px] tracking-widest uppercase">{order.paymentStatus}</Badge>
                                </div>
                                {order.paymentMethod === 'upi' && order.upiDetails && (
                                    <div className="pt-6 border-t border-white/10 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">Ref Code</span>
                                            <span className="text-[11px] font-black tracking-widest">{order.upiDetails.refNumber}</span>
                                        </div>
                                        {order.upiDetails.screenshot && (
                                            <a
                                                href={order.upiDetails.screenshot}
                                                target="_blank" rel="noopener noreferrer"
                                                className="block w-full py-3 bg-white/10 hover:bg-white/20 transition-all rounded-xl text-center text-[9px] font-black uppercase tracking-[0.2em]"
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
