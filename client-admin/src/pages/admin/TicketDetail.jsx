import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { Card, Badge, Button, Select } from '../../components/common';
import { 
    ArrowLeft, Send, CheckCircle, Clock, AlertTriangle, 
    User, Mail, Phone, Calendar, ShieldAlert 
} from 'lucide-react';
import toast from 'react-hot-toast';

const TicketDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);
    const messagesEndRef = useRef(null);

    // Typing Indicator state & refs
    const isTypingSentRef = useRef(false);
    const typingTimeoutRef = useRef(null);
    const idRef = useRef(id);

    useEffect(() => {
        idRef.current = id;
    }, [id]);

    useEffect(() => {
        fetchTicketDetails(); // Initial load

        const interval = setInterval(() => {
            fetchTicketDetailsSilent(); // Poll silently in the background
        }, 4000);

        return () => {
            clearInterval(interval);
            if (idRef.current && isTypingSentRef.current) {
                adminService.sendTypingStatus(idRef.current, false).catch(() => {});
                isTypingSentRef.current = false;
            }
        };
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [ticket?.messages]);

    const fetchTicketDetailsSilent = async () => {
        try {
            const data = await adminService.getTicketById(id);
            if (data) {
                setTicket(data);
            }
        } catch (error) {
            console.error('Silent fetch failed:', error);
        }
    };

    const fetchTicketDetails = async () => {
        setLoading(true);
        try {
            const data = await adminService.getTicketById(id);
            if (data) {
                setTicket(data);
            } else {
                toast.error('Ticket not found');
                navigate('/admin/tickets');
            }
        } catch (error) {
            toast.error('Failed to load ticket details');
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const res = await adminService.updateTicket(id, { status: newStatus });
            if (res.success) {
                setTicket(prev => prev ? { ...prev, status: newStatus } : null);
                toast.success(`Status updated to ${newStatus}`);
            } else {
                toast.error(res.message || 'Failed to update status');
            }
        } catch (error) {
            toast.error('Connection error while updating status');
        }
    };

    const handlePriorityChange = async (newPriority) => {
        try {
            const res = await adminService.updateTicket(id, { priority: newPriority });
            if (res.success) {
                setTicket(prev => prev ? { ...prev, priority: newPriority } : null);
                toast.success(`Priority updated to ${newPriority}`);
            } else {
                toast.error(res.message || 'Failed to update priority');
            }
        } catch (error) {
            toast.error('Connection error while updating priority');
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setSubmittingReply(true);
        try {
            // Instantly clear local typing status on send
            if (isTypingSentRef.current) {
                isTypingSentRef.current = false;
                adminService.sendTypingStatus(id, false).catch(() => {});
            }
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

            // Default reply updates status to IN_PROGRESS if it was OPEN
            const targetStatus = ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status;
            const res = await adminService.replyToTicket(id, replyText.trim(), targetStatus);

            if (res.success) {
                setReplyText('');
                setTicket(res.ticket);
                toast.success('Reply sent successfully');
            } else {
                toast.error(res.message || 'Failed to send reply');
            }
        } catch (error) {
            toast.error('Connection error while sending reply');
        } finally {
            setSubmittingReply(false);
        }
    };

    const handleAdminTyping = (e) => {
        setReplyText(e.target.value);

        if (!id) return;

        // If typing hasn't been sent to backend yet, send it
        if (!isTypingSentRef.current) {
            isTypingSentRef.current = true;
            adminService.sendTypingStatus(id, true).catch(() => {});
        }

        // Reset the inactivity timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            if (idRef.current) {
                adminService.sendTypingStatus(idRef.current, false).catch(() => {});
            }
            isTypingSentRef.current = false;
        }, 2000);
    };

    const isUserTyping = ticket?.userTyping && 
        (new Date() - new Date(ticket.typingLastUpdatedAt) < 6000);

    const handleQuickResolve = async () => {
        try {
            const res = await adminService.updateTicket(id, { status: 'RESOLVED' });
            if (res.success) {
                setTicket(prev => prev ? { ...prev, status: 'RESOLVED' } : null);
                toast.success('Ticket marked as RESOLVED');
            } else {
                toast.error(res.message || 'Failed to resolve ticket');
            }
        } catch (error) {
            toast.error('Connection error while resolving ticket');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Ticket Details...</p>
            </div>
        );
    }

    if (!ticket) return null;

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

    const getRoleBadgeVariant = (role) => {
        switch (role) {
            case 'VENDOR': return 'primary';
            case 'DELIVERY': return 'info';
            case 'CUSTOMER': return 'success';
            default: return 'default';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10 uppercase tracking-tight">
            {/* Top Bar with Back Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button 
                    onClick={() => navigate('/admin/tickets')}
                    className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest transition-all"
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
                
                {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                    <Button 
                        onClick={handleQuickResolve}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-6 rounded-2xl flex items-center gap-2 text-xs"
                    >
                        <CheckCircle size={14} /> Resolve Ticket
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Panel: Conversation Thread */}
                <div className="lg:col-span-8 space-y-6 flex flex-col min-h-[65vh]">
                    {/* Ticket Subject/Header Info */}
                    <Card className="p-6 border-2 border-slate-50 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-slate-50 dark:border-slate-800 pb-4">
                            <div>
                                <span className="text-[10px] font-black text-slate-400 tracking-widest">TICKET ID: #{ticket._id.toUpperCase()}</span>
                                <h1 className="text-2xl font-black text-slate-800 dark:text-white mt-1 uppercase tracking-tight">{ticket.subject}</h1>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant={getPriorityBadgeVariant(ticket.priority)}>{ticket.priority}</Badge>
                                <Badge variant={getStatusBadgeVariant(ticket.status)}>{ticket.status}</Badge>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-black text-slate-400 tracking-widest uppercase">
                            <span>CATEGORY: <strong className="text-slate-800 dark:text-white font-black">{ticket.category}</strong></span>
                            <span>SUBMITTED: <strong className="text-slate-800 dark:text-white font-black">{new Date(ticket.createdAt).toLocaleString()}</strong></span>
                        </div>
                    </Card>

                    {/* Chat Log Window */}
                    <Card className="flex-1 p-6 border-2 border-slate-50 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-[2rem] shadow-md flex flex-col h-[50vh] overflow-y-auto custom-scrollbar">
                        <div className="flex-1 space-y-6 overflow-y-auto pr-2 no-scrollbar">
                            {ticket.messages.length === 0 ? (
                                <div className="flex gap-4 flex-row animate-fade-in">
                                    {/* Avatar */}
                                    <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-black uppercase text-white bg-slate-500 shadow-inner shrink-0">
                                        {ticket.name.charAt(0)}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className="max-w-[70%] space-y-1.5">
                                        <div className="p-4 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60">
                                            <p className="text-xs font-semibold leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 tracking-wider uppercase justify-start">
                                            <span>{ticket.name}</span>
                                            <span>•</span>
                                            <span>{new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                ticket.messages.map((msg, index) => {
                                    const isAdminMsg = msg.sender === 'ADMIN';
                                    return (
                                        <div 
                                            key={index}
                                            className={`flex gap-4 ${isAdminMsg ? "flex-row-reverse" : "flex-row"}`}
                                        >
                                            {/* Avatar */}
                                            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-black uppercase text-white shrink-0 ${isAdminMsg ? "bg-primary-800 shadow-md" : "bg-slate-500 shadow-inner"}`}>
                                                {isAdminMsg ? "A" : ticket.name.charAt(0)}
                                            </div>

                                            {/* Message Bubble */}
                                            <div className={`max-w-[70%] space-y-1.5`}>
                                                <div className={`p-4 rounded-[1.5rem] ${isAdminMsg 
                                                    ? "bg-primary-800 dark:bg-primary-700 text-white rounded-tr-none border border-primary-900/10" 
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60"}`}
                                                >
                                                    <p className="text-xs font-semibold leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                                </div>
                                                
                                                <div className={`flex items-center gap-2 text-[8px] font-black text-slate-400 tracking-wider uppercase ${isAdminMsg ? "justify-end" : "justify-start"}`}>
                                                    <span>{isAdminMsg ? "SUPPORT TEAM" : ticket.name}</span>
                                                    <span>•</span>
                                                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            {isUserTyping && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-[2.5rem] w-fit text-xs font-semibold animate-pulse border border-slate-200/50 dark:border-slate-700/50">
                                    <div className="flex gap-1 items-center shrink-0">
                                        <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    <span className="ml-1 uppercase text-[8px] font-black tracking-widest text-slate-400">{ticket.name} is typing...</span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Reply Form */}
                        <form onSubmit={handleSendReply} className="mt-6 border-t border-slate-50 dark:border-slate-800 pt-4 flex gap-3 items-end">
                            <textarea
                                value={replyText}
                                onChange={handleAdminTyping}
                                placeholder="Type a response to the ticket..."
                                className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white border-2 border-transparent focus:border-primary-500 rounded-2xl p-4 text-xs font-bold outline-none resize-none h-16 transition-all"
                                disabled={submittingReply || ticket.status === 'CLOSED'}
                            />
                            <Button 
                                type="submit"
                                disabled={submittingReply || !replyText.trim() || ticket.status === 'CLOSED'}
                                className="bg-primary-800 hover:bg-primary-900 text-white rounded-2xl p-4 shrink-0 flex items-center justify-center shadow-lg active:scale-95 transition-all"
                            >
                                <Send size={18} />
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* Right Panel: Ticket Meta, User Card & Management Controls */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Ticket Management Controls */}
                    <Card className="p-6 border-2 border-slate-50 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm space-y-6">
                        <h3 className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 pb-3">Ticket Settings</h3>
                        
                        {/* Status Select */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                            <Select
                                value={ticket.status}
                                onChange={handleStatusChange}
                                options={[
                                    { value: 'OPEN', label: 'Open' },
                                    { value: 'IN_PROGRESS', label: 'In Progress' },
                                    { value: 'RESOLVED', label: 'Resolved' },
                                    { value: 'CLOSED', label: 'Closed' }
                                ]}
                            />
                        </div>

                        {/* Priority Select */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                            <Select
                                value={ticket.priority}
                                onChange={handlePriorityChange}
                                options={[
                                    { value: 'HIGH', label: 'High' },
                                    { value: 'MEDIUM', label: 'Medium' },
                                    { value: 'LOW', label: 'Low' }
                                ]}
                            />
                        </div>
                    </Card>

                    {/* Creator User Profile Summary */}
                    <Card className="p-6 border-2 border-slate-50 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm space-y-6">
                        <div className="flex items-center gap-4 border-b border-slate-50 dark:border-slate-800 pb-4">
                            <div className="w-12 h-12 rounded-[1.2rem] bg-primary-100 text-primary-800 dark:bg-primary-950/40 dark:text-primary-400 flex items-center justify-center font-black text-lg">
                                {ticket.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 dark:text-white uppercase leading-none mb-1.5">{ticket.name}</h4>
                                <Badge variant={getRoleBadgeVariant(ticket.role)}>{ticket.role}</Badge>
                            </div>
                        </div>

                        <div className="space-y-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            <div className="flex items-center gap-3">
                                <Mail size={16} className="text-slate-400" />
                                <span className="truncate">{ticket.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone size={16} className="text-slate-400" />
                                <span>{ticket.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar size={16} className="text-slate-400" />
                                <span>Registered Creator</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TicketDetail;
