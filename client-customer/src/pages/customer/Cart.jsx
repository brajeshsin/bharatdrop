import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ArrowLeft, MapPin, CreditCard, ChevronRight, Truck, ShieldCheck, ShoppingBag, ArrowRight, QrCode, Camera, CheckCircle2 } from 'lucide-react';
import { Button, Card, Badge, cn } from '../../components/common';
import { motion, AnimatePresence } from 'framer-motion';
import { orderService } from '../../services/orderService';
import { toast } from 'react-hot-toast';

const CartPage = () => {
    const { cart, clearCart } = useCart();
    const navigate = useNavigate();
    const { state } = useLocation();

    const [shop] = useState(() => {
        if (state?.shop) return state.shop;
        const savedShop = localStorage.getItem('bd_last_shop');
        return savedShop ? JSON.parse(savedShop) : null;
    });

    // Payment States
    const [paymentMethod, setPaymentMethod] = useState(null); // 'cod' or 'upi'
    const [refNumber, setRefNumber] = useState("");
    const [isScreenshotUploaded, setIsScreenshotUploaded] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [screenshotPreview, setScreenshotPreview] = useState(null);
    const fileInputRef = useRef(null);

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
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in relative z-10">
                <div className="w-20 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl flex items-center justify-center text-slate-300 mb-8 shadow-2xl border border-white/20">
                    <ShoppingBag size={40} />
                </div>
                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter text-2xl mb-3">Your Bag is Empty</h3>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-10">Explore the Bazaar to find treasures</p>
                <Button onClick={() => navigate('/home')} className="bg-primary-800 text-white px-10 py-6 rounded-2xl shadow-xl hover:scale-105 transition-all">Start Shopping</Button>
            </div>
        );
    }

    const handlePlaceOrder = async () => {
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
                // Navigate to the first order for tracking
                navigate(`/ordershistory/track/${response.order._id}`, {
                    state: {
                        id: response.order._id,
                        orderId: response.order.orderId,
                        total,
                        shops: shopsInCart,
                        paymentMethod,
                        refNumber,
                        isNewOrder: true,
                        orderId: response.orders[0].orderId,
                        orderDbId: response.orders[0]._id
                    }
                });
            } else {
                toast.error(response.message || 'Failed to place order');
            }
        } catch (error) {
            toast.error('Connection error. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const isOrderEnabled = paymentMethod === 'cod' || (paymentMethod === 'upi' && refNumber.length === 12 && isScreenshotUploaded);

    return (
        <div className="w-full space-y-12 pb-32 animate-fade-in">
            {/* Header Area */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary-800 transition-all shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Checkout</h1>
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
                                        <div key={item.id} className="p-6 flex justify-between items-center group">
                                            <div className="flex items-center gap-5 min-w-0">
                                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-inner">
                                                    <img src={item.image} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt="" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-lg leading-tight">{item.name}</span>
                                                    <span className="text-[10px] font-black text-primary-800 dark:text-primary-400 uppercase tracking-widest mt-1">{item.qty} × ₹{item.price}{item.unit && <span className="opacity-60 ml-0.5">/ {item.unit}</span>}</span>
                                                </div>
                                            </div>
                                            <span className="font-black text-slate-900 dark:text-white text-lg">₹{item.price * item.qty}</span>
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
                            {/* COD Option */}
                            <button
                                onClick={() => setPaymentMethod('cod')}
                                className={cn(
                                    "p-6 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden group",
                                    paymentMethod === 'cod'
                                        ? "border-primary-800 bg-primary-50 dark:bg-primary-900/20 shadow-xl"
                                        : "border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary-200"
                                )}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                        paymentMethod === 'cod' ? "bg-primary-800 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-400"
                                    )}>
                                        <Truck size={24} />
                                    </div>
                                    <div>
                                        <h4 className={cn("font-black uppercase tracking-tight", paymentMethod === 'cod' ? "text-primary-900 dark:text-white" : "text-slate-500")}>Cash on Delivery</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pay at your doorstep</p>
                                    </div>
                                </div>
                                {paymentMethod === 'cod' && (
                                    <motion.div layoutId="active-payment" className="absolute top-4 right-4 text-primary-800">
                                        <CheckCircle2 size={24} fill="currentColor" className="text-white" />
                                    </motion.div>
                                )}
                            </button>

                            {/* UPI Option */}
                            <button
                                onClick={() => setPaymentMethod('upi')}
                                className={cn(
                                    "p-6 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden group",
                                    paymentMethod === 'upi'
                                        ? "border-primary-800 bg-primary-50 dark:bg-primary-900/20 shadow-xl"
                                        : "border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary-200"
                                )}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                        paymentMethod === 'upi' ? "bg-primary-800 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-400"
                                    )}>
                                        <QrCode size={24} />
                                    </div>
                                    <div>
                                        <h4 className={cn("font-black uppercase tracking-tight", paymentMethod === 'upi' ? "text-primary-900 dark:text-white" : "text-slate-500")}>UPI Payment</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instant online transfer</p>
                                    </div>
                                </div>
                                {paymentMethod === 'upi' && (
                                    <motion.div layoutId="active-payment" className="absolute top-4 right-4 text-primary-800">
                                        <CheckCircle2 size={24} fill="currentColor" className="text-white" />
                                    </motion.div>
                                )}
                            </button>
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
        </div>
    );
};

export default CartPage;
