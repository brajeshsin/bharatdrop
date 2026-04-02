import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { ArrowLeft, MapPin, CreditCard, ChevronRight, Truck, ShieldCheck, ShoppingBag, ArrowRight, QrCode, Camera, CheckCircle2, AlertTriangle, Plus, Minus, Trash2, Search } from 'lucide-react';
import { Button, Card, Badge, cn } from '../../components/common';
import { motion, AnimatePresence } from 'framer-motion';
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
                    {/* Premium 3D Illustration */}
                    <div className="relative mb-8 max-w-[280px] w-full aspect-square">
                        <motion.img
                            src="/assets/empty_cart.png"
                            alt="Empty Bag"
                            className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(30,58,138,0.15)]"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                        />
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
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary-800 transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic leading-none">Your Bag</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Review items & Checkout</p>
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
                        "flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 transition-all shadow-sm active:scale-95 disabled:opacity-50",
                        isRefreshing ? "animate-pulse" : ""
                    )}
                >
                    <div className={cn("w-2 h-2 rounded-full bg-emerald-500", isRefreshing ? "animate-ping" : "")} />
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                        {isRefreshing ? 'Syncing...' : 'Sync Prices'}
                    </span>
                </button>
            </div>

            {/* Delivery Context */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-50 dark:border-slate-800 p-8 flex items-center gap-6 hover:shadow-xl transition-all cursor-pointer shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-3 h-full bg-primary-800"></div>
                <div className="p-4 bg-primary-50 dark:bg-primary-900/40 text-primary-800 dark:text-primary-400 rounded-3xl shadow-inner">
                    <MapPin size={32} fill="currentColor" />
                </div>
                <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-1.5">Primary Delivery Hub</p>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Home Address</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-1 leading-relaxed">House No. 45, Rampur Village, Near Post Office</p>
                </div>
                <ChevronRight size={28} className="text-slate-200 dark:text-slate-700 group-hover:text-primary-800 transition-colors" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-7 gap-10 items-start">
                <div className="lg:col-span-4 space-y-10">
                    {/* Multi-Shop Order List */}
                    <div className="space-y-12">
                        {shopsInCart.map(shopGroup => (
                            <section key={shopGroup.id} className="space-y-6">
                                <div className="flex flex-col md:flex-row md:items-end justify-between px-2 gap-2">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                                            <img src={shopGroup.image} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className="space-y-1">
                                            <h2 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] leading-none">Items in bag</h2>
                                            <p className="text-xs font-black text-primary-800 dark:text-primary-400 uppercase tracking-tight line-clamp-1">From {shopGroup.name}</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-primary-50 dark:bg-primary-900/20 text-primary-800 border-none font-black px-4 py-1.5 text-[10px] leading-none uppercase tracking-widest">{shopGroup.items.length} ITEMS</Badge>
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-50 dark:border-slate-800 overflow-hidden shadow-sm divide-y-2 divide-slate-50 dark:divide-slate-800">
                                    {shopGroup.items.map(item => (
                                        <div key={item.id} className={cn(
                                            "p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group relative overflow-hidden",
                                            item.isOutOfStock ? "bg-rose-50/50 dark:bg-rose-950/10" : ""
                                        )}>
                                            {item.isOutOfStock && (
                                                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                                            )}

                                            <div className="flex items-center gap-5 min-w-0 flex-1">
                                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
                                                    <img src={item.image} className={cn(
                                                        "w-full h-full object-cover transition-all",
                                                        item.isOutOfStock ? "grayscale opacity-40" : "grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100"
                                                    )} alt="" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className={cn(
                                                        "font-black uppercase tracking-tight text-lg leading-tight truncate",
                                                        item.isOutOfStock ? "text-slate-400" : "text-slate-800 dark:text-white"
                                                    )}>{item.name}</span>
                                                    {item.isOutOfStock ? (
                                                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1 flex items-center gap-1">
                                                            <AlertTriangle size={10} /> Out of Stock
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-black text-primary-800 dark:text-primary-400 uppercase tracking-widest mt-1">₹{item.price}{item.unit && <span className="opacity-60 ml-0.5">/ {item.unit}</span>}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-6 w-full sm:w-auto justify-between">
                                                {item.isOutOfStock ? (
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => navigate(`/home/search?q=${encodeURIComponent(item.name)}`)}
                                                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary-800 hover:border-primary-800 transition-all"
                                                        >
                                                            <Search size={12} /> Find Others
                                                        </button>
                                                        <button
                                                            onClick={() => deleteFromCart(item.id, shopGroup.id)}
                                                            className="p-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-xl p-1 border border-slate-100 dark:border-slate-700">
                                                            <button
                                                                onClick={() => removeFromCart(item.id, shopGroup.id)}
                                                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary-800 hover:bg-white dark:hover:bg-slate-900 rounded-lg transition-all"
                                                            >
                                                                <Minus size={14} />
                                                            </button>
                                                            <span className="w-8 text-center font-black text-slate-800 dark:text-white text-xs">{item.qty}</span>
                                                            <button
                                                                onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, image: item.image, unit: item.unit }, { id: shopGroup.id, name: shopGroup.name, image: shopGroup.image })}
                                                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary-800 hover:bg-white dark:hover:bg-slate-900 rounded-lg transition-all"
                                                            >
                                                                <Plus size={14} />
                                                            </button>
                                                        </div>
                                                        <span className="font-black text-slate-900 dark:text-white text-lg min-w-[4rem] text-right">₹{item.price * item.qty}</span>
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
                    <section className="space-y-6">
                        <div className="px-2">
                            <h2 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Choose Payment Method</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isLoadingMethods ? (
                                <div className="col-span-full py-10 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-800 border-t-transparent mb-4" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Securing Payment Gateways...</p>
                                </div>
                            ) : availableMethods.length === 0 ? (
                                <div className="col-span-full py-10 flex flex-col items-center justify-center bg-rose-50 dark:bg-rose-900/10 rounded-[2rem] border-2 border-dashed border-rose-200 dark:border-rose-900/30 text-rose-500">
                                    <ShieldCheck size={32} className="mb-3 opacity-50" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-center">No payment methods available.<br />Please contact support.</p>
                                </div>
                            ) : (
                                availableMethods.map((method) => (
                                    <button
                                        key={method._id}
                                        onClick={() => setPaymentMethod(method.code)}
                                        className={cn(
                                            "p-6 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden group",
                                            paymentMethod === method.code
                                                ? "border-primary-800 bg-primary-50 dark:bg-primary-900/20 shadow-xl"
                                                : "border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary-200"
                                        )}
                                    >
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                                paymentMethod === method.code ? "bg-primary-800 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-400"
                                            )}>
                                                {method.code === 'cod' ? <Truck size={24} /> : <QrCode size={24} />}
                                            </div>
                                            <div>
                                                <h4 className={cn("font-black uppercase tracking-tight", paymentMethod === method.code ? "text-primary-900 dark:text-white" : "text-slate-500")}>{method.name}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{method.description}</p>
                                            </div>
                                        </div>
                                        {paymentMethod === method.code && (
                                            <motion.div layoutId="active-payment" className="absolute top-4 right-4 text-primary-800">
                                                <CheckCircle2 size={24} fill="currentColor" className="text-white" />
                                            </motion.div>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>

                        {/* UPI Verification Flow */}
                        <AnimatePresence>
                            {paymentMethod === 'upi' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-primary-100 dark:border-primary-900/30 p-8 space-y-8 shadow-sm mt-4">
                                        <div className="flex flex-col md:flex-row gap-8 items-center">
                                            {/* QR Code Placeholder */}
                                            <div className="w-48 h-48 bg-slate-50 dark:bg-slate-800 rounded-3xl p-4 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                                                <QrCode size={64} className="text-primary-800 mb-2" />
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Scan to Pay<br />bharatdrop@upi</p>
                                            </div>

                                            <div className="flex-1 space-y-6 w-full">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center ml-1">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reference Number</label>
                                                        <span className={cn("text-[8px] font-black uppercase tracking-widest", refNumber.length === 12 ? "text-emerald-500" : "text-slate-400")}>
                                                            {refNumber.length}/12 Digits
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter 12-digit UTR/Ref"
                                                        value={refNumber}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                                                            setRefNumber(val);
                                                        }}
                                                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 font-black uppercase tracking-widest text-sm focus:border-primary-800 transition-all outline-none text-slate-800 dark:text-white"
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Payment Proof</label>

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
                                                            "w-full py-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-all font-black text-xs uppercase tracking-widest",
                                                            isScreenshotUploaded
                                                                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 text-emerald-600"
                                                                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-primary-800"
                                                        )}
                                                    >
                                                        {isUploading ? (
                                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-800 border-t-transparent" />
                                                        ) : isScreenshotUploaded ? (
                                                            <><CheckCircle2 size={18} /> Screenshot Verified</>
                                                        ) : (
                                                            <><Camera size={18} /> Upload Screenshot</>
                                                        )}
                                                    </button>

                                                    <AnimatePresence>
                                                        {screenshotPreview && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                className="relative aspect-[4/3] rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl group mt-2"
                                                            >
                                                                <img src={screenshotPreview} className="w-full h-full object-cover" alt="Payment Proof" />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <button
                                                                        onClick={() => fileInputRef.current?.click()}
                                                                        className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-[8px] uppercase tracking-widest"
                                                                    >
                                                                        Change Image
                                                                    </button>
                                                                </div>
                                                                <div className="absolute top-4 left-4">
                                                                    <Badge className="bg-emerald-500 text-white border-none font-black text-[8px] uppercase tracking-widest px-3">Captured</Badge>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center bg-slate-50 dark:bg-slate-800/50 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                                            Tip: Check your UPI app for the "Transaction ID" or "UTR Number"
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>
                </div>

                {/* Billing Summary */}
                <div className="lg:col-span-3 space-y-8 lg:sticky lg:top-32">
                    <div className="bg-primary-900 text-white rounded-[2.5rem] p-8 shadow-2xl shadow-primary-900/30 space-y-6 border-2 border-white/10">
                        <div className="space-y-4">
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest text-primary-300">
                                <span>Subtotal</span>
                                <span>₹{subtotal}</span>
                            </div>
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest text-primary-300">
                                <div className="flex items-center gap-1.5">
                                    <span>Village Fee</span>
                                    <div className="w-3 h-3 bg-secondary rounded-full"></div>
                                </div>
                                <span>₹{deliveryFee}</span>
                            </div>
                        </div>
                        <div className="h-px bg-white/10 mx-[-2rem]"></div>
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest leading-none mb-2">Total Amount</span>
                                <span className="text-4xl font-black tracking-tighter">₹{total}</span>
                            </div>
                            <div className="bg-secondary p-4 rounded-3xl text-primary-900 shadow-xl shadow-black/20 -rotate-3 mb-1">
                                <CreditCard size={28} fill="currentColor" />
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-50 dark:border-slate-800 flex gap-4 items-center shadow-sm">
                        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
                            <ShieldCheck size={24} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase leading-relaxed tracking-wide">Safe BharatDrop Protocol active. Quality checked.</p>
                    </div>

                    {/* Final Action Button */}
                    <div className="pt-4">
                        <Button
                            onClick={handlePlaceOrder}
                            disabled={!isOrderEnabled}
                            className={cn(
                                "w-full rounded-[2.5rem] py-8 text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all shadow-2xl overflow-hidden group relative",
                                isOrderEnabled
                                    ? "bg-primary-800 text-white shadow-primary-800/30 hover:scale-[1.02] active:scale-95"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-50 grayscale"
                            )}
                        >
                            Confirm & Place Order
                            <div className={cn(
                                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                                isOrderEnabled ? "bg-white/10 group-hover:bg-secondary group-hover:text-primary-900" : "bg-slate-200 dark:bg-slate-700"
                            )}>
                                <ArrowRight size={18} strokeWidth={4} />
                            </div>
                        </Button>
                        <p className="text-center mt-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            {!paymentMethod ? "Select payment method to continue" :
                                (paymentMethod === 'upi' && (!refNumber || !isScreenshotUploaded)) ? "Complete UPI verification" :
                                    "Ready to secure your order"}
                        </p>
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
