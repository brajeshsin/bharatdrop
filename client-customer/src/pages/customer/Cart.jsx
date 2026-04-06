import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { ArrowLeft, MapPin, CreditCard, ChevronRight, Truck, ShieldCheck, ShoppingBag, ArrowRight, QrCode, Camera, CheckCircle2, AlertTriangle, Plus, Minus, Trash2, Search } from 'lucide-react';
import { Button, Card, Badge, cn } from '../../components/common';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { orderService } from '../../services/orderService';
import { toast } from 'react-hot-toast';

const CartPage = () => {
    const { cart, addToCart, removeFromCart, deleteFromCart, clearCart, refreshCart } = useCart();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { state } = useLocation();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [conflictMessage, setConflictMessage] = useState("");

    const [shop] = useState(() => {
        if (state?.shop) return state.shop;
        const savedShop = localStorage.getItem('bd_last_shop');
        return savedShop ? JSON.parse(savedShop) : null;
    });

    // Payment States
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [refNumber, setRefNumber] = useState("");
    const [isScreenshotUploaded, setIsScreenshotUploaded] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [screenshotPreview, setScreenshotPreview] = useState(null);
    const [availableMethods, setAvailableMethods] = useState([]);
    const [isLoadingMethods, setIsLoadingMethods] = useState(true);
    const [animationData, setAnimationData] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchMethods = async () => {
            try {
                const response = await orderService.getPaymentMethods();
                if (response.success) {
                    setAvailableMethods(response.data);
                    // Auto-select if only one method
                    if (response.data.length === 1) {
                        setPaymentMethod(response.data[0].code);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch payment methods:', error);
            } finally {
                setIsLoadingMethods(false);
            }
        };
        fetchMethods();

        // Fetch Lottie Animation Data
        const fetchAnimation = async () => {
            try {
                const response = await fetch("https://lottie.host/82df092b-8a7c-48c6-9467-31737e6f8821/0v5vE6r1hQ.json");
                const data = await response.json();
                setAnimationData(data);
            } catch (error) {
                console.error('Failed to fetch Lottie animation:', error);
            }
        };
        fetchAnimation();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsUploading(true);
            const url = URL.createObjectURL(file);
            // Simulate a smooth upload delay
            setTimeout(() => {
                setScreenshotPreview(url);
                setIsScreenshotUploaded(true);
                setIsUploading(false);
            }, 1000);
        }
    };

    const shopsInCart = Object.values(cart).map(shopData => ({
        ...shopData,
        items: Object.values(shopData.items).map(item => ({
            ...item,
            qty: item.quantity
        }))
    }));

    const subtotal = shopsInCart.reduce((acc, shop) =>
        acc + shop.items.reduce((sAcc, item) => sAcc + (item.price * item.qty), 0), 0
    );
    const deliveryFee = shopsInCart.length > 0 ? 20 : 0; // Or per shop if needed
    const total = subtotal + deliveryFee;

    if (shopsInCart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] py-20 animate-fade-in relative overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center text-center px-6"
                >
                    {/* Premium 3D Illustration - Lottie Animation */}
                    <div className="relative mb-8 max-w-[320px] w-full aspect-square flex items-center justify-center">
                        {animationData ? (
                            <Lottie
                                animationData={animationData}
                                loop={true}
                                autoplay={true}
                                style={{ width: '100%', height: '100%' }}
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-50 dark:bg-slate-800/50 animate-pulse rounded-full flex items-center justify-center">
                                <ShoppingBag className="text-slate-200 dark:text-slate-700" size={48} />
                            </div>
                        )}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1/2 h-4 bg-slate-200/50 dark:bg-slate-800/30 blur-xl rounded-full"></div>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-tight mb-4">
                        {t('cart.empty_bag')}
                    </h2>

                    <p className="max-w-xs text-sm font-bold text-slate-400 dark:text-slate-500 leading-relaxed mb-12">
                        {t('cart.empty_message')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <Button
                            onClick={() => navigate('/home')}
                            className="bg-primary-800 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary-800/20 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <ShoppingBag size={16} />
                            {t('cart.start_shopping')}
                        </Button>
                        <button
                            onClick={() => navigate('/ordershistory')}
                            className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-primary-200 transition-all text-[10px]"
                        >
                            {t('cart.view_history')}
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const handlePlaceOrder = async () => {
        // Validation: Check for out-of-stock items before placing order
        const outOfStockItems = shopsInCart.flatMap(s => s.items).filter(i => i.isOutOfStock);
        if (outOfStockItems.length > 0) {
            setConflictMessage(`Some items in your bag are out of stock. Please remove them or find alternatives before placing your order.`);
            setShowConflictModal(true);
            return;
        }

        setIsUploading(true); // Reuse as loading state
        try {
            const orderData = {
                shops: shopsInCart,
                paymentMethod,
                deliveryAddress: {
                    address: 'House No. 45, Rampur Village, Near Post Office',
                    village: 'Rampur',
                    landmark: 'Post Office',
                    pincode: '229124'
                },
                upiDetails: paymentMethod === 'upi' ? {
                    refNumber,
                    screenshot: screenshotPreview
                } : undefined
            };

            const response = await orderService.createOrder(orderData);

            if (response.success) {
                toast.success('Orders placed successfully!');
                clearCart();
                navigate(`/ordershistory/track/${response.orders[0]._id}`, {
                    state: {
                        id: response.orders[0]._id,
                        orderId: response.orders[0].orderId,
                        total,
                        shops: shopsInCart,
                        paymentMethod,
                        refNumber,
                        isNewOrder: true,
                        orderDbId: response.orders[0]._id
                    }
                });
            } else {
                const msg = response.message || 'Failed to place order';

                // If it's a price or stock conflict, show the specialized modal
                if (msg.toLowerCase().includes('refresh your cart') || msg.toLowerCase().includes('out of stock')) {
                    setConflictMessage(msg);
                    setShowConflictModal(true);
                } else {
                    toast.error(msg);
                }
            }
        } catch (error) {
            toast.error('Connection error. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const hasOutOfStockItems = shopsInCart.some(shop => shop.items.some(item => item.isOutOfStock));
    const isOrderEnabled = !hasOutOfStockItems && (paymentMethod === 'cod' || (paymentMethod === 'upi' && refNumber.length === 12 && isScreenshotUploaded));

    return (
        <div className="w-full space-y-12 pb-32 animate-fade-in">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-14 h-14 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary-800 hover:border-primary-100 transition-all shadow-xl shadow-slate-100/50 dark:shadow-none active:scale-90 flex-shrink-0"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic leading-none">Your Bag</h2>
                        <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5 opacity-70">Review items & Checkout</p>
                    </div>
                </div>

                <button
                    onClick={async () => {
                        setIsRefreshing(true);
                        await refreshCart();
                        setTimeout(() => {
                            setIsRefreshing(false);
                            toast.success("Prices Synced");
                        }, 800);
                    }}
                    disabled={isRefreshing}
                    className={cn(
                        "flex items-center justify-center gap-3 px-8 py-4 rounded-[1.5rem] bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 transition-all shadow-xl shadow-slate-100/50 dark:shadow-none active:scale-95 disabled:opacity-50 group hover:border-emerald-100 w-full sm:w-auto",
                        isRefreshing ? "animate-pulse" : ""
                    )}
                >
                    <div className={cn("w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]", isRefreshing ? "animate-ping" : "")} />
                    <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-[0.15em] group-hover:text-emerald-600 transition-colors">
                        {isRefreshing ? 'Syncing...' : 'Sync Prices'}
                    </span>
                </button>
            </div>

            {/* Delivery Context */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] md:rounded-[3rem] border-2 border-slate-50 dark:border-slate-800 p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 md:gap-8 hover:shadow-2xl hover:border-primary-100/30 transition-all cursor-pointer shadow-xl shadow-slate-100/30 dark:shadow-none relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full sm:w-3 h-3 sm:h-full bg-primary-800"></div>
                <div className="p-5 bg-primary-50 dark:bg-primary-900/40 text-primary-800 dark:text-primary-400 rounded-3xl shadow-inner group-hover:scale-110 transition-transform">
                    <MapPin size={36} fill="currentColor" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <p className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-2 leading-none">Primary Delivery Hub</p>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none mb-1">Home Address</h3>
                    <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-bold mt-2 leading-relaxed max-w-md mx-auto sm:mx-0">House No. 45, Rampur Village, Near Post Office</p>
                </div>
                <ChevronRight size={32} className="text-slate-200 dark:text-slate-700 md:group-hover:text-primary-800 transition-all md:group-hover:translate-x-2 hidden sm:block" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
                <div className="lg:col-span-7 space-y-12">
                    {/* Multi-Shop Order List */}
                    <div className="space-y-12">
                        {shopsInCart.map(shopGroup => (
                            <section key={shopGroup.id} className="space-y-6 md:space-y-8">
                                <div className="flex flex-col md:flex-row md:items-end justify-between px-3 gap-4">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border-2 border-white dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none flex-shrink-0">
                                            <img src={shopGroup.image} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <h2 className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] leading-none mb-1">Items in bag</h2>
                                            <p className="text-sm md:text-lg font-black text-primary-800 dark:text-primary-400 uppercase tracking-tight line-clamp-1">From {shopGroup.name}</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-primary-50 dark:bg-primary-900/20 text-primary-800 border-none font-black px-5 py-2 text-[10px] md:text-xs leading-none uppercase tracking-[0.15em] rounded-xl self-start md:self-auto">{shopGroup.items.length} ITEMS</Badge>
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] md:rounded-[3rem] border-2 border-slate-50 dark:border-slate-800 overflow-hidden shadow-xl shadow-slate-100/30 dark:shadow-none divide-y-2 divide-slate-50 dark:divide-slate-800">
                                    {shopGroup.items.map(item => (
                                        <div key={item.id} className={cn(
                                            "p-5 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 md:gap-10 group relative transition-colors",
                                            item.isOutOfStock ? "bg-rose-50/20 dark:bg-rose-950/5" : "hover:bg-slate-50/30 dark:hover:bg-slate-800/20"
                                        )}>
                                            {item.isOutOfStock && (
                                                <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
                                            )}

                                            <div className="flex items-center gap-5 md:gap-7 min-w-0 flex-1 w-full">
                                                <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-inner flex-shrink-0 relative group/img">
                                                    <img src={item.image} className={cn(
                                                        "w-full h-full object-cover transition-all duration-700",
                                                        item.isOutOfStock ? "grayscale opacity-40" : "grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-110"
                                                    )} alt="" />
                                                    {!item.isOutOfStock && <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                                                </div>
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <span className={cn(
                                                        "font-black uppercase tracking-tight text-lg md:text-xl leading-tight truncate mb-1",
                                                        item.isOutOfStock ? "text-slate-300 dark:text-slate-600" : "text-slate-800 dark:text-white"
                                                    )}>{item.name}</span>
                                                    {item.isOutOfStock ? (
                                                        <span className="text-[10px] md:text-xs font-black text-rose-500 uppercase tracking-[0.15em] flex items-center gap-1.5 mt-1 bg-rose-50 dark:bg-rose-500/10 px-3 py-1 rounded-full w-fit">
                                                            <AlertTriangle size={12} /> Out of Stock
                                                        </span>
                                                    ) : (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[11px] md:text-sm font-black text-primary-800 dark:text-primary-400 uppercase tracking-widest">₹{item.price}</span>
                                                            {item.unit && <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">/ {item.unit}</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                                {item.isOutOfStock ? (
                                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                                        <button
                                                            onClick={() => navigate(`/home/search?q=${encodeURIComponent(item.name)}`)}
                                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest text-primary-800 hover:border-primary-800 hover:bg-primary-50 transition-all shadow-sm"
                                                        >
                                                            <Search size={14} /> Find Others
                                                        </button>
                                                        <button
                                                            onClick={() => deleteFromCart(item.id, shopGroup.id)}
                                                            className="p-3.5 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between sm:justify-end gap-6 md:gap-10 w-full sm:w-auto">
                                                        <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-2xl p-1.5 border-2 border-slate-100 dark:border-slate-700/50 shadow-inner">
                                                            <button
                                                                onClick={() => removeFromCart(item.id, shopGroup.id)}
                                                                className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center text-slate-400 hover:text-primary-800 hover:bg-white dark:hover:bg-slate-900 rounded-xl transition-all active:scale-75"
                                                            >
                                                                <Minus size={18} />
                                                            </button>
                                                            <span className="w-10 md:w-12 text-center font-black text-slate-800 dark:text-white text-sm md:text-base">{item.qty}</span>
                                                            <button
                                                                onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, image: item.image, unit: item.unit }, { id: shopGroup.id, name: shopGroup.name, image: shopGroup.image })}
                                                                className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center text-slate-400 hover:text-primary-800 hover:bg-white dark:hover:bg-slate-900 rounded-xl transition-all active:scale-75"
                                                            >
                                                                <Plus size={18} />
                                                            </button>
                                                        </div>
                                                        <div className="flex flex-col items-end min-w-[5rem] md:min-w-[7rem]">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-60">Item Total</span>
                                                            <span className="font-black text-slate-900 dark:text-white text-xl md:text-2xl tracking-tighter">₹{item.price * item.qty}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* Payment Method Selection */}
                    <section className="space-y-6 md:space-y-8">
                        <div className="px-3">
                            <h2 className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-1">Secure Checkout</h2>
                            <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Choose Payment Method</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {isLoadingMethods ? (
                                <div className="col-span-full py-12 md:py-16 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/30 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-800 border-t-transparent mb-5" />
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Securing Payment Gateways...</p>
                                </div>
                            ) : availableMethods.length === 0 ? (
                                <div className="col-span-full py-12 md:py-16 flex flex-col items-center justify-center bg-rose-50 dark:bg-rose-900/10 rounded-[2.5rem] border-2 border-dashed border-rose-100 dark:border-rose-900/30 text-rose-500">
                                    <ShieldCheck size={40} className="mb-4 opacity-40" />
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-center px-6">No payment methods available.<br />Please contact support.</p>
                                </div>
                            ) : (
                                availableMethods.map((method) => (
                                    <button
                                        key={method._id}
                                        onClick={() => setPaymentMethod(method.code)}
                                        className={cn(
                                            "p-6 md:p-8 rounded-[2.5rem] border-2 text-left transition-all relative overflow-hidden group shadow-xl shadow-slate-100/30 dark:shadow-none active:scale-[0.98]",
                                            paymentMethod === method.code
                                                ? "border-primary-800 bg-primary-50/50 dark:bg-primary-900/20"
                                                : "border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary-100/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-5 md:gap-6 relative z-10">
                                            <div className={cn(
                                                "w-14 h-14 md:w-16 md:h-16 rounded-3xl flex items-center justify-center transition-all duration-500",
                                                paymentMethod === method.code ? "bg-primary-800 text-white scale-110 shadow-lg shadow-primary-800/30" : "bg-slate-50 dark:bg-slate-800 text-slate-400"
                                            )}>
                                                {method.code === 'cod' ? <Truck size={28} /> : <QrCode size={28} />}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={cn("font-black text-lg md:text-xl uppercase tracking-tight mb-0.5 transition-colors", paymentMethod === method.code ? "text-primary-900 dark:text-white" : "text-slate-600 dark:text-slate-400")}>{method.name}</h4>
                                                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">{method.description}</p>
                                            </div>
                                        </div>
                                        {paymentMethod === method.code && (
                                            <motion.div layoutId="active-payment" className="absolute -top-1 -right-1 p-4 text-primary-800">
                                                <CheckCircle2 size={24} fill="currentColor" className="text-white" />
                                            </motion.div>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>

                        <AnimatePresence>
                            {paymentMethod === 'upi' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="relative"
                                >
                                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] md:rounded-[3rem] border-2 border-primary-200 dark:border-primary-900/40 p-6 md:p-10 space-y-8 md:space-y-10 shadow-2xl shadow-primary-100/20 dark:shadow-none mt-6">
                                        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-start">
                                            {/* QR Code Container */}
                                            <div className="flex flex-col items-center gap-4 flex-shrink-0 w-full lg:w-auto">
                                                <div className="w-[85vw] max-w-[220px] xs:w-56 xs:h-56 md:w-64 md:h-64 bg-white dark:bg-white rounded-[2.5rem] p-6 flex flex-col items-center justify-center border-4 border-slate-50 shadow-inner group/qr relative overflow-hidden aspect-square">
                                                    <div className="absolute inset-0 bg-primary-800 opacity-0 group-hover/qr:opacity-5 transition-opacity pointer-events-none"></div>
                                                    <QrCode size={96} className="text-primary-800 mb-4 scale-125 md:scale-150" strokeWidth={1} />
                                                    <Badge className="bg-primary-800 text-white border-none font-black text-[9px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">SCAN TO PAY</Badge>
                                                </div>
                                                <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.4em] opacity-30 mt-2 text-center">BHARATDROP UPI</p>
                                            </div>

                                            <div className="flex-1 space-y-8 w-full">
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center px-1">
                                                        <label className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Transaction ID / UTR</label>
                                                        <span className={cn(
                                                            "text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full",
                                                            refNumber.length === 12 ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-400 dark:bg-slate-800/50"
                                                        )}>
                                                            {refNumber.length} / 12
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="ENTER 12-DIGIT REFERENCE"
                                                        value={refNumber}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                                                            setRefNumber(val);
                                                        }}
                                                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700/50 rounded-2xl md:rounded-3xl px-8 py-5 md:py-6 font-black uppercase tracking-[0.2em] text-sm md:text-base focus:border-primary-800 focus:bg-white dark:focus:bg-slate-800 shadow-inner transition-all outline-none text-slate-800 dark:text-white"
                                                    />
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] px-1">Upload Receipt</label>

                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        onChange={handleFileChange}
                                                        accept="image/*"
                                                        className="hidden"
                                                    />

                                                    <button
                                                        onClick={() => fileInputRef.current?.click()}
                                                        disabled={isUploading}
                                                        className={cn(
                                                            "w-full py-5 md:py-6 rounded-2xl md:rounded-3xl border-2 border-dashed flex items-center justify-center gap-4 transition-all font-black text-xs md:text-sm uppercase tracking-[0.2em] shadow-sm",
                                                            isScreenshotUploaded
                                                                ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                                                                : "bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-primary-800 hover:text-primary-800"
                                                        )}
                                                    >
                                                        {isUploading ? (
                                                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-800 border-t-transparent" />
                                                        ) : isScreenshotUploaded ? (
                                                            <><CheckCircle2 size={24} className="scale-110" /> Screenshot Attached</>
                                                        ) : (
                                                            <><Camera size={24} className="opacity-50" /> Add Payment Proof</>
                                                        )}
                                                    </button>

                                                    <AnimatePresence>
                                                        {screenshotPreview && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                className="relative aspect-video rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl group mt-4"
                                                            >
                                                                <img src={screenshotPreview} className="w-full h-full object-cover" alt="Payment Proof" />
                                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                                    <button
                                                                        onClick={() => fileInputRef.current?.click()}
                                                                        className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-90 transition-all"
                                                                    >
                                                                        Update Image
                                                                    </button>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 md:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                                            <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <AlertTriangle size={20} />
                                            </div>
                                            <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic">
                                                Note: Verification can take up to 30 mins during peak hours. Order will be confirmed post-verification.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>
                </div>

                {/* Billing Summary */}
                <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32">
                    <div className="bg-primary-900 text-white rounded-[3rem] p-8 md:p-10 shadow-2xl shadow-primary-900/40 space-y-8 border-2 border-white/10 relative overflow-hidden group/summary">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl transition-transform group-hover/summary:scale-150 duration-700"></div>

                        <div className="space-y-5 relative z-10">
                            <div className="flex justify-between text-[11px] md:text-xs font-black uppercase tracking-[0.2em] text-primary-300/80">
                                <span>Subtotal</span>
                                <span className="text-white">₹{subtotal}</span>
                            </div>
                            <div className="flex justify-between text-[11px] md:text-xs font-black uppercase tracking-[0.2em] text-primary-300/80">
                                <div className="flex items-center gap-2">
                                    <span>Village Fee</span>
                                    <div className="w-2.5 h-2.5 bg-secondary rounded-full shadow-[0_0_8px_rgba(255,255,255,0.3)]"></div>
                                </div>
                                <span className="text-white">₹{deliveryFee}</span>
                            </div>
                        </div>

                        <div className="h-px bg-white/10 mx-[-2rem] md:mx-[-2.5rem]"></div>

                        <div className="flex justify-between items-end relative z-10">
                            <div className="flex flex-col">
                                <span className="text-[10px] md:text-xs font-black text-primary-400 uppercase tracking-[0.3em] leading-none mb-3">Total Amount</span>
                                <span className="text-4xl md:text-5xl font-black tracking-tighter">₹{total}</span>
                            </div>
                            <div className="bg-secondary p-5 md:p-6 rounded-[2rem] text-primary-900 shadow-2xl shadow-black/40 -rotate-6 mb-1 group-hover/summary:rotate-0 transition-transform duration-500">
                                <CreditCard size={32} fill="currentColor" />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-50 dark:border-slate-800 flex gap-5 items-center shadow-xl shadow-slate-100/30 dark:shadow-none group hover:border-emerald-100 transition-colors">
                        <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={28} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] md:text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-0.5">Secure Protocol</p>
                            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase leading-relaxed tracking-wide">BharatDrop Quality & Safety verified.</p>
                        </div>
                    </div>

                    {/* Final Action Button */}
                    <div className="pt-4 space-y-6">
                        <Button
                            onClick={handlePlaceOrder}
                            disabled={!isOrderEnabled}
                            className={cn(
                                "w-full rounded-[2.5rem] py-3 md:py-3 text-[10px] md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.4em] flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-5 transition-all shadow-2xl overflow-hidden group relative",
                                isOrderEnabled
                                    ? "bg-primary-800 text-white shadow-primary-800/40 hover:scale-[1.02] active:scale-[0.98]"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-60 grayscale"
                            )}
                        >
                            <span className="relative z-10">Confirm & Place Order</span>
                            <div className={cn(
                                "w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 relative z-10",
                                isOrderEnabled ? "bg-white/10 group-hover:bg-secondary group-hover:text-primary-900 group-hover:rotate-[360deg]" : "bg-slate-200 dark:bg-slate-700"
                            )}>
                                <ArrowRight size={20} strokeWidth={4} />
                            </div>
                            {isOrderEnabled && (
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            )}
                        </Button>
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                                {!paymentMethod ? "Select payment method to continue" :
                                    (paymentMethod === 'upi' && (!refNumber || !isScreenshotUploaded)) ? "Complete UPI verification" :
                                        "Finalizing your secure checkout"}
                            </p>
                            <div className="flex gap-1.5 opacity-20">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Conflict Resolution Modal */}
            <AnimatePresence>
                {showConflictModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowConflictModal(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 text-center"
                        >
                            <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/30 rounded-3xl flex items-center justify-center text-amber-500 mx-auto mb-8 shadow-inner border border-amber-100 dark:border-amber-900/50">
                                <AlertTriangle size={40} />
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic mb-4">Inventory Conflict</h3>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed mb-10">
                                {conflictMessage}
                            </p>

                            <div className="space-y-4">
                                <Button
                                    variant="primary"
                                    className="w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary-900/20"
                                    onClick={async () => {
                                        setIsRefreshing(true);
                                        setShowConflictModal(false);
                                        await refreshCart();
                                        setTimeout(() => {
                                            setIsRefreshing(false);
                                            toast.success("Bag Reconciled");
                                        }, 800);
                                    }}
                                >
                                    Sync & Review Bag
                                </Button>
                                <button
                                    onClick={() => setShowConflictModal(false)}
                                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CartPage;
