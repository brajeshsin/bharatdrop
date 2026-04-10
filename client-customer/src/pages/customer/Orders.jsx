import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ShoppingBag, ChevronRight, Package, Calendar,
    MapPin, Search, ChevronLeft, RotateCcw,
    HelpCircle, MoreVertical, ShoppingCart
} from 'lucide-react';
import { Button, Card, cn } from '../../components/common';
import { motion, AnimatePresence } from 'framer-motion';
import { orderService } from '../../services/orderService';
import { toast } from 'react-hot-toast';

const Orders = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [allOrders, setAllOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await orderService.getMyOrders();
                if (response.success) {
                    const mappedOrders = response.orders.map(order => ({
                        _id: order._id,
                        id: order.orderId,
                        date: new Date(order.createdAt).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        }),
                        status: order.status,
                        total: order.total,
                        shop: {
                            name: order.vendor.name,
                            location: order.deliveryAddress?.village || 'Rampur',
                            image: order.items[0]?.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop'
                        },
                        items: order.items.map(item => ({
                            name: item.name,
                            qty: item.quantity,
                            price: item.price
                        })),
                        isTrackingAvailable: order.status !== 'DELIVERED' && order.status !== 'CANCELLED'
                    }));
                    setAllOrders(mappedOrders);
                }
            } catch (error) {
                toast.error('Failed to load order history');
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // Filtering States
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const ordersPerPage = 4;

    // Filtering Logic
    const filteredOrders = useMemo(() => {
        return allOrders.filter(order => {
            const matchesSearch =
                order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesTab =
                activeTab === 'ALL' ||
                (activeTab === 'ACTIVE' && (order.status !== 'DELIVERED' && order.status !== 'CANCELLED')) ||
                (activeTab === 'COMPLETED' && order.status === 'DELIVERED') ||
                (activeTab === 'CANCELLED' && order.status === 'CANCELLED');

            return matchesSearch && matchesTab;
        });
    }, [allOrders, searchQuery, activeTab]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * ordersPerPage;
        return filteredOrders.slice(start, start + ordersPerPage);
    }, [filteredOrders, currentPage]);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'DELIVERED': return 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50';
            case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50';
            case 'ACCEPTED': return 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50';
            case 'PENDING': return 'bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/50';
            default: return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50';
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 pb-32 animate-fade-in px-4">
            {/* Minimalist Header */}
            <div className="pt-8 space-y-2">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{t('orders.title')}</h1>
                <p className="text-sm font-bold text-slate-400 dark:text-slate-500">{t('orders.subtitle')}</p>
            </div>

            {/* Zomato-style Search & Filters */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 relative group w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder={t('orders.search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-white focus:outline-none focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800/30 transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Clean Status Tabs */}
                <div className="flex items-center gap-3 overflow-hidden pb-2 no-scrollbar">
                    {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab);
                                setCurrentPage(1);
                            }}
                            className={cn(
                                "whitespace-nowrap px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border-2",
                                activeTab === tab
                                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg shadow-slate-200 dark:shadow-none"
                                    : "bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                            )}
                        >
                            {t(`orders.filter_${tab.toLowerCase()}`)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dynamic Orders Feed */}
            <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                    <div className="py-20 text-center flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary-800 border-t-transparent rounded-full animate-spin" />
                        <p className="font-black text-slate-400 uppercase tracking-widest text-xs italic">{t('orders.syncing')}</p>
                    </div>
                ) : (
                    <>
                        <AnimatePresence mode='popLayout'>
                            {paginatedOrders.map((order) => (
                                <motion.div
                                    key={order.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="relative group">
                                        {/* Ambient Shadow */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-secondary/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none" />
                                        
                                        <Card className="relative p-0 border border-white/40 dark:border-slate-800/60 rounded-[2rem] overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                                            {/* Card Header: Shop Identity */}
                                            <div className="p-6 md:p-8 flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 relative">
                                                {/* subtle background hue */}
                                                <div className="absolute top-0 right-0 w-48 h-48 bg-primary-100/50 dark:bg-primary-900/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-transform group-hover:scale-125 duration-700" />
                                                
                                                <div className="flex items-center gap-5 z-10">
                                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-slate-800 shadow-xl relative group-hover:scale-105 group-hover:rotate-3 transition-all duration-500 flex-shrink-0">
                                                        <img src={order.shop.image} className="w-full h-full object-cover" alt="" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                                        <MapPin size={12} className="absolute bottom-2 left-2 text-white drop-shadow-md" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5 mb-1">
                                                            <Calendar size={12} className="text-secondary" /> {order.date}
                                                        </p>
                                                        <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight uppercase leading-none group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary-800 group-hover:to-primary-600 transition-all">{order.shop.name}</h3>
                                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{order.shop.location}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-3 z-10">
                                                    <span className={cn(
                                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm flex items-center gap-2",
                                                        getStatusStyles(order.status)
                                                    )}>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                                        {t(`tracking.status_${order.status.toLowerCase()}`)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Card Body: Items List */}
                                            <div className="px-6 md:px-8 py-6 bg-slate-50/50 dark:bg-slate-800/30">
                                                <div className="space-y-3">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between text-sm group/item">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-500 dark:text-slate-400 group-hover/item:border-primary-500 group-hover/item:text-primary-600 transition-colors">
                                                                    {item.qty}x
                                                                </div>
                                                                <span className="font-bold text-slate-700 dark:text-slate-300 group-hover/item:text-primary-800 dark:group-hover/item:text-primary-400 transition-colors">{item.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-px bg-slate-200 dark:bg-slate-700 w-12 hidden sm:block group-hover/item:bg-primary-200 transition-colors" />
                                                                <span className="font-black text-slate-800 dark:text-white">₹{item.price * item.qty}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Card Footer: Actions & Metadata */}
                                            <div className="px-6 py-6 md:px-8 md:py-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 relative">
                                                <div className="flex flex-col items-center sm:items-start relative z-10">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-2">{t('orders.total_paid')}</p>
                                                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                                                        ₹<span className="text-primary-800 dark:text-primary-400">{order.total}</span>
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3 w-full sm:w-auto relative z-10">
                                                    {order.isTrackingAvailable ? (
                                                        <Button
                                                            onClick={() => navigate(`/ordershistory/track/${order._id}`, {
                                                                state: {
                                                                    total: order.total,
                                                                    id: order._id,
                                                                    orderId: order.id,
                                                                    shops: [{
                                                                        ...order.shop,
                                                                        items: order.items
                                                                    }]
                                                                }
                                                            })}
                                                            className="flex-1 sm:flex-none px-8 py-4 bg-gradient-to-r from-primary-800 to-primary-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary-900/20 hover:shadow-primary-900/40 hover:-translate-y-0.5 active:translate-y-0 transition-all border-none"
                                                        >
                                                            {t('orders.track_order')}
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            onClick={() => setSelectedOrder(order)}
                                                            className="flex-1 sm:flex-none px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:-translate-y-0.5 transition-all border-none"
                                                        >
                                                            {t('orders.summary')}
                                                        </Button>
                                                    )}
                                                    <button className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-emerald-500/30 text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:-translate-y-0.5 transition-all shadow-sm" title="Reorder Items">
                                                        <RotateCcw size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredOrders.length === 0 && (
                            <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-200">
                                    <ShoppingCart size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{t('orders.no_orders')}</h3>
                                    <p className="text-sm font-bold text-slate-400 max-w-xs mx-auto">{t('orders.no_orders_msg')}</p>
                                </div>
                                <Button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setActiveTab('ALL');
                                        navigate('/home');
                                    }}
                                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl"
                                >
                                    {t('orders.browse_bazaar')}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-12">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                            currentPage === 1 ? "text-slate-200 cursor-not-allowed" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        )}
                    >
                        <ChevronLeft size={20} />
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={cn(
                                "w-10 h-10 rounded-lg text-[11px] font-black transition-all",
                                currentPage === i + 1
                                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                                    : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                            currentPage === totalPages ? "text-slate-200 cursor-not-allowed" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        )}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {/* Order Summary Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedOrder(null)}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-primary-800 dark:text-primary-400 uppercase tracking-[0.3em] leading-none mb-2">{t('orders.confirmed')}</p>
                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{selectedOrder.id}</h2>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('orders.date_label')}: {selectedOrder.date}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedOrder(null)}
                                        className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-2xl transition-all active:scale-90"
                                    >
                                        <ShoppingBag size={20} />
                                    </button>
                                </div>

                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-slate-100 dark:border-slate-800/50 flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg ring-4 ring-white dark:ring-slate-800">
                                        <img src={selectedOrder.shop.image} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{t('orders.purchased_from')}</p>
                                        <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase leading-none tracking-tight">{selectedOrder.shop.name}</h3>
                                        <p className="text-xs font-bold text-primary-800 dark:text-emerald-400 mt-1 uppercase tracking-widest">{selectedOrder.shop.location}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-4 px-2">
                                        {selectedOrder.items.map((item, i) => (
                                            <div key={i} className="flex justify-between items-center group">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:bg-primary-100 transition-colors uppercase">x{item.qty}</span>
                                                    <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase truncate max-w-[200px] tracking-tight">{item.name}</span>
                                                </div>
                                                <span className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">₹{item.price * item.qty}</span>
                                            </div>
                                        ))}

                                        <div className="pt-6 mt-6 border-t-2 border-dashed border-slate-100 dark:border-slate-800 space-y-3 font-bold text-xs">
                                            <div className="flex justify-between text-xl font-black text-slate-900 dark:text-white pt-4 uppercase tracking-tighter">
                                                <span>{t('orders.grand_total')}</span>
                                                <span className="text-primary-800">₹{selectedOrder.total}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => setSelectedOrder(null)}
                                    className="w-full py-5 bg-primary-800 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-900/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    {t('orders.dismiss')}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Orders;
