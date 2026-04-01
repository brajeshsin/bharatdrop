import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, CheckCircle2, Clock, MapPin, Phone, ShieldCheck,
    ChevronRight, User, Star, ShoppingBag, CreditCard, Truck,
    TrendingUp, ExternalLink, MessageCircle
} from 'lucide-react';
import { Button, Badge, cn } from '../../components/common';
import { orderService } from '../../services/orderService';
import { motion, AnimatePresence } from 'framer-motion';

// Immersive Animated Background
const TrackingBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50 dark:bg-[#020617]">
        <motion.div
            animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
                x: [-20, 20, -20],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-800/10 rounded-full blur-[120px]"
        />
        <motion.div
            animate={{
                scale: [1.2, 1, 1.2],
                rotate: [90, 0, 90],
                x: [20, -20, 20],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]"
        />
    </div>
);

const ConfettiParticle = ({ delay }) => {
    const colors = ['#1e3a8a', '#fbbf24', '#10b981', '#f59e0b', '#3b82f6'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 8 + 4;
    const initialX = Math.random() * 100;
    const destinationX = initialX + (Math.random() * 40 - 20);

    return (
        <motion.div
            initial={{ top: -20, left: `${initialX}%`, opacity: 1, scale: 0, rotate: 0 }}
            animate={{
                top: '120vh',
                left: `${destinationX}%`,
                opacity: [1, 1, 0],
                scale: [0, 1, 0.5],
                rotate: [0, 720],
            }}
            transition={{
                duration: Math.random() * 2 + 2,
                ease: [0.23, 1, 0.32, 1],
                delay: delay
            }}
            className="fixed pointer-events-none z-[100]"
            style={{
                width: size,
                height: size,
                backgroundColor: color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px'
            }}
        />
    );
};

const SuccessOverlay = ({ onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99] flex items-center justify-center bg-white/60 dark:bg-slate-950/80 backdrop-blur-2xl px-6"
        >
            {[...Array(40)].map((_, i) => (
                <ConfettiParticle key={i} delay={i * 0.05} />
            ))}
            <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 100 }}
                className="relative max-w-lg w-full bg-white dark:bg-slate-900 rounded-[4rem] p-12 text-center border-4 border-white dark:border-slate-800 shadow-3xl overflow-hidden"
            >
                <div className="absolute inset-0 bg-primary-800/10 blur-[80px] -z-10" />
                <div className="relative mb-10 flex justify-center">
                    <div className="w-32 h-32 bg-primary-800 rounded-[3rem] flex items-center justify-center text-white shadow-2xl relative">
                        <CheckCircle2 size={64} strokeWidth={3} />
                    </div>
                </div>
                <div className="space-y-2 mb-6 text-center">
                    <h2 className="text-5xl font-black uppercase tracking-tighter leading-none bg-gradient-to-br from-primary-800 via-primary-600 to-primary-900 bg-clip-text text-transparent">Order Placed!</h2>
                    <div className="h-1 bg-primary-800/20 rounded-full mx-auto max-w-[120px]" />
                </div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-12 leading-loose">
                    Initiating Village Protocol <br /> Partner assigned & items being packed
                </p>
                <Button onClick={onComplete} className="w-full bg-slate-950 dark:bg-white dark:text-slate-950 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-xl">
                    Track Shipment
                </Button>
            </motion.div>
        </motion.div>
    );
};

const TRACKING_STATUSES = [
    { id: 'PENDING', label: 'Order Sent', desc: 'Shops are reviewing your order' },
    { id: 'ACCEPTED', label: 'Confirmed', desc: 'All vendors have accepted & packing' },
    { id: 'READY', label: 'Ready', desc: 'Partner is arriving at shops' },
    { id: 'PICKED', label: 'On the Way', desc: 'Heading to your village' },
    { id: 'DELIVERED', label: 'Delivered', desc: 'Collected at your doorstep' }
];

const getStatusIndex = (status) => {
    if (!status) return 0;
    const normalized = status.toUpperCase();
    const index = TRACKING_STATUSES.findIndex(s => s.id === normalized);
    return index >= 0 ? index : 0;
};

const TrackingPage = () => {
    const { state } = useLocation();
    const { id: paramId } = useParams();
    const navigate = useNavigate();
    const [showSuccess, setShowSuccess] = useState(state?.isNewOrder || false);

    const [shops, setShops] = useState(state?.shops || []);
    const [total, setTotal] = useState(state?.total || 0);
    const [liveOrder, setLiveOrder] = useState(state?.liveOrder || null);
    const [lastSyncTime, setLastSyncTime] = useState(null);
    const [currentStatus, setCurrentStatus] = useState(getStatusIndex(state?.status || 'PENDING'));

    const fetchLiveStatus = async () => {
        try {
            const orderId = paramId || state?.id;
            if (!orderId) return;

            const response = await orderService.getOrderById(orderId);
            if (response.success && response.order) {
                const order = response.order;
                setLiveOrder(order);
                setCurrentStatus(getStatusIndex(order.status));
                setLastSyncTime(new Date());

                if (shops.length === 0) {
                    setTotal(order.total);
                    setShops([{
                        name: order.vendor.name,
                        image: order.items[0]?.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop',
                        items: order.items.map(item => ({
                            _id: item._id,
                            name: item.name,
                            price: item.price,
                            qty: item.quantity,
                            image: item.image
                        }))
                    }]);
                }
            }
        } catch (error) {
            console.error("Sync Error:", error);
        }
    };

    useEffect(() => {
        fetchLiveStatus();
        const interval = setInterval(fetchLiveStatus, 5000);
        return () => clearInterval(interval);
    }, [paramId, state?.id]);

    const formatStatusTime = (index) => {
        if (!liveOrder) return '--';
        const created = new Date(liveOrder.createdAt);
        const offsets = [0, 2, 10, 15, 25];
        const time = new Date(created.getTime() + offsets[index] * 60000);
        return time.toLocaleString('en-IN', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true
        }).toUpperCase();
    };

    if (!paramId && (!shops || shops.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center py-20 relative z-10">
                <TrackingBackground />
                <ShoppingBag size={64} className="text-slate-300 mb-6" />
                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter text-2xl">No Active Order</h3>
                <Button onClick={() => navigate('/home')} className="mt-8 bg-primary-800 text-white px-10 py-4 rounded-xl">Explore Shops</Button>
            </div>
        );
    }

    return (
        <div className="relative w-full pb-32 pt-6">
            <TrackingBackground />
            <AnimatePresence>{showSuccess && <SuccessOverlay onComplete={() => setShowSuccess(false)} />}</AnimatePresence>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate(-1)} className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border-2 border-white/20 dark:border-slate-800 flex items-center justify-center shadow-xl">
                            <ArrowLeft size={24} className="text-slate-400" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking Status</span>
                                <Badge variant="primary" className="text-[8px] tracking-[0.2em]">LIVE ENGINE</Badge>
                            </div>
                            <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">
                                {TRACKING_STATUSES[currentStatus]?.label}
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                            ID: {liveOrder?.orderId || state?.orderId || 'BD-...'}
                        </p>
                        {lastSyncTime && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                                    Synced: {lastSyncTime.toLocaleTimeString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="relative mb-8">
                                <div className="w-20 h-20 bg-secondary rounded-[2rem] flex items-center justify-center text-primary-900 shadow-2xl rotate-3">
                                    <Clock size={36} strokeWidth={4} />
                                </div>
                            </div>
                            <Badge className="bg-primary-800 text-white border-none font-black text-[10px] uppercase tracking-[0.4em] mb-4">Arriving in</Badge>
                            <h2 className="text-6xl font-black leading-none mb-4">12 <span className="text-secondary text-4xl">MINS</span></h2>
                            <p className="text-primary-300 font-bold text-[10px] uppercase tracking-widest">Estimated Village Lead Time</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 p-8 shadow-xl flex items-center gap-6">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                                <User size={32} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Partner</p>
                                <h4 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Ravi Kumar</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-0.5 text-secondary"><Star size={10} fill="currentColor" /><span className="text-xs font-black text-slate-800 dark:text-white ml-1">4.9</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/60 dark:bg-slate-900/60 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 p-8 shadow-xl space-y-6">
                            <div className="flex items-center justify-between"><h3 className="text-lg font-black uppercase tracking-tighter">Order Summary</h3><ShoppingBag size={20} className="text-slate-400" /></div>
                            <div className="space-y-4">
                                {shops.map((shop, i) => (
                                    <div key={i} className="space-y-2">
                                        <p className="text-[10px] font-black text-primary-800 uppercase tracking-widest">{shop.name}</p>
                                        {shop.items.map((item, j) => (
                                            <div key={j} className="flex justify-between text-xs font-bold uppercase tracking-tight"><span className="text-slate-500">{item.qty}x {item.name}</span><span className="text-slate-800 dark:text-white">₹{item.price * item.qty}</span></div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex justify-between items-center"><span className="text-xs font-black uppercase">Total Bill</span><span className="text-xl font-black">₹{total}</span></div>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 p-12 shadow-2xl relative overflow-hidden">
                            <div className="relative space-y-12">
                                <div className="absolute left-[20px] top-6 bottom-6 w-1.5 bg-slate-100 dark:bg-slate-800 rounded-full" />
                                <motion.div
                                    animate={{ height: `${(currentStatus / (TRACKING_STATUSES.length - 1)) * 100}%` }}
                                    className="absolute left-[20px] top-6 w-1.5 bg-primary-800 rounded-full z-0"
                                />

                                {TRACKING_STATUSES.map((s, index) => {
                                    const isDone = index <= currentStatus;
                                    const isNow = index === currentStatus;
                                    return (
                                        <div key={s.id} className={cn("flex gap-8 relative z-10", isDone ? "opacity-100" : "opacity-30")}>
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", isDone ? "bg-primary-800 text-white" : "bg-slate-100 dark:bg-slate-800")}>
                                                {isDone ? <CheckCircle2 size={18} /> : <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h3 className={cn("text-lg font-black uppercase tracking-tighter", isNow ? "text-primary-800" : "text-slate-800 dark:text-white")}>{s.label}</h3>
                                                    {isDone && <span className="text-[10px] font-black text-slate-400">{formatStatusTime(index)}</span>}
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TrackingPage;
