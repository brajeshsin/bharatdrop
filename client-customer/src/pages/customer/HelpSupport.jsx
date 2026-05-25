import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { supportService } from '../../services/supportService';
import { orderService } from '../../services/orderService';
import { vendorService } from '../../services/vendorService';
import { Button, Card, Badge, Input } from '../../components/common';
import { 
    MessageSquare, Plus, Send, ChevronRight, AlertCircle, 
    CheckCircle2, Clock, LifeBuoy, Calendar, Hash, Tag, 
    ChevronLeft, Loader, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const HelpSupport = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const chatEndRef = useRef(null);

    // List & Detail States
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [replyLoading, setReplyLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'open', 'closed'

    // Typing Indicator state & refs
    const isTypingSentRef = useRef(false);
    const typingTimeoutRef = useRef(null);

    // Ticket Creation States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [recentOrders, setRecentOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [formData, setFormData] = useState({
        category: '',
        subject: '',
        description: '',
        priority: 'MEDIUM',
        orderId: ''
    });
    const [createLoading, setCreateLoading] = useState(false);

    // Categories based on role
    const getCategories = () => {
        switch (user?.role) {
            case 'VENDOR':
                return [
                    'Shop Visibility & Status',
                    'Payment / Payout Delay',
                    'Product / Inventory Upload',
                    'App / Technical Glitch',
                    'Other Inquiry'
                ];
            case 'DELIVERY':
                return [
                    'Route & Navigation Issues',
                    'Payouts & Daily Earnings',
                    'Order Pickup & Drop Coordination',
                    'App crash / GPS Failure',
                    'Other Support'
                ];
            default: // CUSTOMER
                return [
                    'Order Delay / Status Check',
                    'Refund & Payment Issue',
                    'Missing or Damaged Items',
                    'Promo Code / Discounts',
                    'Technical Support / App Bug',
                    'General Feedback'
                ];
        }
    };

    const categories = getCategories();

    // Ref to avoid stale closures in the polling interval
    const selectedTicketRef = useRef(selectedTicket);
    useEffect(() => {
        selectedTicketRef.current = selectedTicket;
    }, [selectedTicket]);

    useEffect(() => {
        fetchTickets(); // Initial load
        fetchRecentOrders();

        const interval = setInterval(async () => {
            const currentSelected = selectedTicketRef.current;
            if (currentSelected?._id) {
                try {
                    const res = await supportService.getTicketDetails(currentSelected._id);
                    if (res?.success && res.ticket) {
                        setSelectedTicket(prev => {
                            // Check if messages count, status, or typing indicators have changed to prevent unnecessary resets
                            if (
                                !prev || 
                                prev.messages?.length !== res.ticket.messages?.length || 
                                prev.status !== res.ticket.status ||
                                prev.adminTyping !== res.ticket.adminTyping ||
                                prev.userTyping !== res.ticket.userTyping
                            ) {
                                return res.ticket;
                            }
                            return prev;
                        });
                        // Sync tickets list state as well
                        setTickets(prev => prev.map(t => t._id === res.ticket._id ? res.ticket : t));
                    }
                } catch (error) {
                    console.error('Failed to poll selected ticket details:', error);
                }
            } else {
                // If no ticket is selected, we can optionally poll the list
                fetchTickets(true);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Scroll to bottom of chat when messages change
    useEffect(() => {
        if (selectedTicket) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedTicket?.messages]);

    const fetchTickets = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await supportService.getMyTickets();
            if (data?.success) {
                setTickets(data.tickets);
                // Update selected ticket details if it is currently open
                if (selectedTicket) {
                    const updated = data.tickets.find(t => t._id === selectedTicket._id);
                    if (updated) setSelectedTicket(updated);
                }
            }
        } catch (error) {
            toast.error('Failed to load tickets');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentOrders = async () => {
        if (user?.role === 'DELIVERY') return;
        setOrdersLoading(true);
        try {
            if (user?.role === 'VENDOR') {
                const data = await vendorService.getVendorOrders();
                setRecentOrders(data || []);
            } else {
                const data = await orderService.getMyOrders();
                setRecentOrders(data?.orders || []);
            }
        } catch (error) {
            console.error('Failed to fetch recent orders', error);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        if (!formData.category || !formData.subject || !formData.description) {
            toast.error('Please fill in all required fields');
            return;
        }

        setCreateLoading(true);
        try {
            const res = await supportService.createTicket(formData);
            if (res?.success) {
                toast.success('Ticket created successfully!');
                setIsCreateModalOpen(false);
                setFormData({
                    category: '',
                    subject: '',
                    description: '',
                    priority: 'MEDIUM',
                    orderId: ''
                });
                fetchTickets();
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to create support ticket');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedTicket) return;

        setReplyLoading(true);
        try {
            // Instantly clear local typing status on send
            if (isTypingSentRef.current) {
                isTypingSentRef.current = false;
                supportService.sendTypingStatus(selectedTicket._id, false).catch(() => {});
            }
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

            const res = await supportService.sendTicketMessage(selectedTicket._id, replyText);
            if (res?.success && res.ticket) {
                setReplyText('');
                setSelectedTicket(res.ticket);
                // Sync tickets list state as well
                setTickets(prev => prev.map(t => t._id === res.ticket._id ? res.ticket : t));
            }
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setReplyLoading(false);
        }
    };

    // Cleanup typing status when ticket selection changes or page unmounts
    useEffect(() => {
        return () => {
            if (selectedTicketRef.current?._id && isTypingSentRef.current) {
                supportService.sendTypingStatus(selectedTicketRef.current._id, false).catch(() => {});
                isTypingSentRef.current = false;
            }
        };
    }, [selectedTicket?._id]);

    const handleUserTyping = (e) => {
        setReplyText(e.target.value);

        if (!selectedTicket?._id) return;

        // If typing hasn't been sent to backend yet, send it
        if (!isTypingSentRef.current) {
            isTypingSentRef.current = true;
            supportService.sendTypingStatus(selectedTicket._id, true).catch(() => {});
        }

        // Reset the inactivity timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            if (selectedTicketRef.current?._id) {
                supportService.sendTypingStatus(selectedTicketRef.current._id, false).catch(() => {});
            }
            isTypingSentRef.current = false;
        }, 2000);
    };

    const isAdminTyping = selectedTicket?.adminTyping && 
        (new Date() - new Date(selectedTicket.typingLastUpdatedAt) < 6000);

    const filteredTickets = tickets.filter(ticket => {
        if (activeTab === 'open') return ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED';
        if (activeTab === 'closed') return ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';
        return true;
    });

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'OPEN': return 'warning';
            case 'IN_PROGRESS': return 'info';
            case 'RESOLVED': return 'success';
            case 'CLOSED': return 'default';
            default: return 'default';
        }
    };

    const getPriorityBadgeVariant = (priority) => {
        switch (priority) {
            case 'HIGH': return 'error';
            case 'MEDIUM': return 'warning';
            case 'LOW': return 'default';
            default: return 'default';
        }
    };

    return (
        <div className="w-full space-y-8 pb-12 animate-fade-in relative tracking-tight">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 mt-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white uppercase leading-none tracking-tighter">Help & Support</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 uppercase text-xs tracking-widest">
                        Submit issues, track tickets, and message support agents.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        variant="outline"
                        onClick={() => fetchTickets()}
                        className="py-3 px-4 border-2 border-slate-200 hover:border-primary-800 dark:border-slate-800 dark:hover:border-primary-400"
                        title="Refresh Tickets"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin text-primary-800 dark:text-primary-400" : ""} />
                    </Button>
                    <Button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="text-xs font-black uppercase tracking-widest gap-2 py-3 px-6 shadow-lg shadow-primary-900/10 rounded-2xl"
                    >
                        <Plus size={16} strokeWidth={3} /> Create Ticket
                    </Button>
                </div>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Panel: Tickets List (4 cols or full on mobile if no ticket selected) */}
                <div className={`lg:col-span-5 space-y-6 ${selectedTicket ? 'hidden lg:block' : 'block'}`}>
                    {/* Tabs */}
                    <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
                        {['all', 'open', 'closed'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                    activeTab === tab
                                        ? 'bg-white dark:bg-slate-800 text-primary-800 dark:text-white shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Tickets Stream */}
                    <div className="space-y-4 max-h-[650px] overflow-y-auto pr-1">
                        {loading ? (
                            <div className="text-center py-20">
                                <Loader className="animate-spin text-primary-800 dark:text-primary-400 mx-auto mb-4" size={32} />
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Tickets...</p>
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <Card className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
                                <LifeBuoy size={40} className="text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                                <p className="text-sm font-black text-slate-500 uppercase tracking-widest">No tickets found</p>
                                <p className="text-xs text-slate-400 mt-2 font-semibold">If you have any issues, feel free to create a support ticket.</p>
                            </Card>
                        ) : (
                            filteredTickets.map((ticket) => (
                                <div
                                    key={ticket._id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex flex-col gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm hover:shadow-md ${
                                        selectedTicket?._id === ticket._id
                                            ? 'border-primary-800 dark:border-primary-400 ring-2 ring-primary-50 dark:ring-primary-950/20'
                                            : 'border-slate-100 dark:border-slate-800 hover:border-primary-800/40 dark:hover:border-primary-400/40'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <Badge variant={getStatusBadgeVariant(ticket.status)}>{ticket.status}</Badge>
                                        <Badge variant={getPriorityBadgeVariant(ticket.priority)} className="text-[8px]">{ticket.priority} priority</Badge>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800 dark:text-white text-md uppercase leading-tight truncate">{ticket.subject}</h3>
                                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{ticket.category}</p>
                                    </div>
                                    <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                        <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1"><MessageSquare size={12} /> {ticket.messages?.length || 0} replies</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Panel: Detail Chat View (7 cols) */}
                <div className={`lg:col-span-7 ${!selectedTicket ? 'hidden lg:flex' : 'block'}`}>
                    {selectedTicket ? (
                        <Card className="flex flex-col h-[720px] p-0 border-2 border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                            {/* Chat Header */}
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/30">
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setSelectedTicket(null)}
                                        className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="font-black text-lg text-slate-800 dark:text-white uppercase leading-none truncate max-w-[250px] md:max-w-[400px]">{selectedTicket.subject}</h2>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">ID: #{selectedTicket._id.slice(-6).toUpperCase()}</span>
                                            <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{selectedTicket.category}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                    <Badge variant={getStatusBadgeVariant(selectedTicket.status)}>{selectedTicket.status}</Badge>
                                    {selectedTicket.orderId && (
                                        <span className="text-[9px] font-black text-primary-800 dark:text-primary-400 uppercase tracking-widest">
                                            Order: #{selectedTicket.orderId.slice(-6).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Chat Messages Timeline */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20 dark:bg-slate-950/10">
                                
                                {/* Initial Ticket Description Box */}
                                <div className="p-6 rounded-[2rem] bg-primary-50/30 dark:bg-primary-950/5 border-2 border-primary-50/50 dark:border-primary-950/10 space-y-3">
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="text-xs font-black uppercase text-primary-800 dark:text-primary-400 tracking-wider">Original Issue Description</span>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                                        {selectedTicket.description}
                                    </p>
                                </div>

                                {/* Replies timeline */}
                                {selectedTicket.messages?.map((msg, idx) => {
                                    const isAdmin = msg.sender === 'ADMIN';
                                    return (
                                        <div key={idx} className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'} space-y-1`}>
                                            <div className="flex items-center gap-2 px-1 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                                <span>{isAdmin ? 'Support Agent' : 'You'}</span>
                                                <span>•</span>
                                                <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div 
                                                className={`max-w-[80%] p-4.5 rounded-[2rem] shadow-sm font-semibold text-sm leading-relaxed ${
                                                    isAdmin 
                                                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-tl-none border border-slate-100 dark:border-slate-700/60' 
                                                        : 'bg-primary-800 text-white rounded-tr-none'
                                                }`}
                                            >
                                                {msg.message}
                                            </div>
                                        </div>
                                    );
                                })}
                                {isAdminTyping && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-[2.5rem] w-fit text-xs font-semibold animate-pulse border border-slate-200/50 dark:border-slate-700/50">
                                        <div className="flex gap-1 items-center shrink-0">
                                            <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                        <span className="ml-1 uppercase text-[8px] font-black tracking-widest text-slate-400">Support Agent is typing...</span>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Chat Reply Footer */}
                            {selectedTicket.status === 'CLOSED' ? (
                                <div className="p-6 text-center bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 text-xs font-black text-slate-400 uppercase tracking-widest">
                                    This ticket has been closed. Create a new ticket if the issue persists.
                                </div>
                            ) : (
                                <form onSubmit={handleSendReply} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-3 items-center">
                                    <input
                                        type="text"
                                        placeholder="Type your reply here..."
                                        value={replyText}
                                        onChange={handleUserTyping}
                                        className="flex-1 px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary-800 transition-all font-bold text-sm"
                                    />
                                    <Button 
                                        type="submit"
                                        disabled={!replyText.trim() || replyLoading}
                                        className="p-4 rounded-2xl shrink-0"
                                    >
                                        {replyLoading ? <Loader size={18} className="animate-spin text-white" /> : <Send size={18} />}
                                    </Button>
                                </form>
                            )}

                        </Card>
                    ) : (
                        <div className="w-full h-[600px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8 bg-white/30 dark:bg-slate-900/10">
                            <div className="w-20 h-20 bg-primary-50 dark:bg-primary-950/20 text-primary-800 dark:text-primary-400 rounded-[2rem] flex items-center justify-center mb-6">
                                <MessageSquare size={36} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase">No Ticket Selected</h3>
                            <p className="text-sm font-semibold text-slate-400 max-w-sm mt-2">
                                Select a ticket from the sidebar to view details and chat with our customer support agents.
                            </p>
                        </div>
                    )}
                </div>

            </div>

            {/* Create Ticket Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCreateModalOpen(false)}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] grid place-items-center p-4 sm:p-6 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-2xl border-2 border-slate-50 dark:border-slate-800 relative"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase leading-none tracking-tight">Create Support Ticket</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Let us know how we can help you.</p>
                                </div>
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
                                >
                                    <ChevronLeft size={20} className="rotate-180" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTicket} className="space-y-6">
                                {/* Category Dropdown */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Category *</label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white focus:outline-none focus:border-primary-800 transition-all font-bold text-sm uppercase tracking-wide cursor-pointer"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Order dropdown (only if role allows & has orders) */}
                                {user?.role !== 'DELIVERY' && recentOrders.length > 0 && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Related Order (Optional)</label>
                                        <select
                                            value={formData.orderId}
                                            onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white focus:outline-none focus:border-primary-800 transition-all font-bold text-sm uppercase tracking-wide cursor-pointer"
                                        >
                                            <option value="">Select Related Order</option>
                                            {recentOrders.map((ord) => (
                                                <option key={ord._id || ord.id} value={ord._id || ord.id}>
                                                    ID: {(ord.orderId || ord._id || ord.id).slice(-8).toUpperCase()} (₹{ord.total || ord.subtotal || 0} • {ord.status})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Priority Selector */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Priority Level</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['LOW', 'MEDIUM', 'HIGH'].map((prio) => (
                                            <button
                                                key={prio}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, priority: prio })}
                                                className={`py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all ${
                                                    formData.priority === prio
                                                        ? prio === 'HIGH' 
                                                            ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400'
                                                            : prio === 'MEDIUM'
                                                                ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                                : 'border-slate-500 bg-slate-500/10 text-slate-600 dark:text-slate-400'
                                                        : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                                                }`}
                                            >
                                                {prio}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Subject */}
                                <Input
                                    label="Subject *"
                                    required
                                    placeholder="Brief summary of the issue"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                />

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Detailed Description *</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="Explain the issue in detail so we can assist you better..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary-800 transition-all font-semibold text-sm leading-relaxed"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="flex-1 py-4 uppercase text-xs font-black tracking-widest rounded-2xl"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        loading={createLoading}
                                        className="flex-1 py-4 uppercase text-xs font-black tracking-widest rounded-2xl shadow-xl shadow-primary-900/10"
                                    >
                                        Submit Ticket
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HelpSupport;
