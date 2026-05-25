import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { Card, Badge, Button, Input, Select } from '../../components/common';
import { 
    MessageSquare, Search, RefreshCw, Filter, LifeBuoy, 
    Clock, CheckCircle, ChevronRight, User, AlertOctagon 
} from 'lucide-react';
import toast from 'react-hot-toast';

const SupportTickets = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [priorityFilter, setPriorityFilter] = useState('ALL');
    const [roleFilter, setRoleFilter] = useState('ALL');

    useEffect(() => {
        fetchTickets();
    }, [statusFilter, priorityFilter, roleFilter]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter !== 'ALL') params.status = statusFilter;
            if (priorityFilter !== 'ALL') params.priority = priorityFilter;
            if (roleFilter !== 'ALL') params.role = roleFilter;
            if (search.trim()) params.search = search.trim();

            const data = await adminService.getTickets(params);
            setTickets(data);
        } catch (error) {
            toast.error('Failed to load support tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchTickets();
    };

    // Calculate quick stats
    const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'OPEN').length,
        inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
        resolved: tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length
    };

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
        <div className="space-y-8 animate-fade-in pb-10 uppercase tracking-tight">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white leading-tight">Support Tickets</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold">Manage and reply to customer, vendor, and partner support tickets</p>
                </div>
                <Button 
                    onClick={fetchTickets}
                    variant="outline"
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest border-2 py-3.5 px-6 rounded-2xl"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 flex items-center gap-5 border-none shadow-md bg-white dark:bg-slate-900 border-t-4 border-slate-500">
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-[1.5rem] text-slate-600 dark:text-slate-300">
                        <LifeBuoy size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Tickets</p>
                        <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.total}</p>
                    </div>
                </Card>

                <Card className="p-6 flex items-center gap-5 border-none shadow-md bg-white dark:bg-slate-900 border-t-4 border-amber-500">
                    <div className="bg-amber-100 dark:bg-amber-950/20 p-4 rounded-[1.5rem] text-amber-600 dark:text-amber-400">
                        <AlertOctagon size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">Open Tickets</p>
                        <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.open}</p>
                    </div>
                </Card>

                <Card className="p-6 flex items-center gap-5 border-none shadow-md bg-white dark:bg-slate-900 border-t-4 border-blue-500">
                    <div className="bg-blue-100 dark:bg-blue-950/20 p-4 rounded-[1.5rem] text-blue-600 dark:text-blue-400">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none">In Progress</p>
                        <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.inProgress}</p>
                    </div>
                </Card>

                <Card className="p-6 flex items-center gap-5 border-none shadow-md bg-white dark:bg-slate-900 border-t-4 border-emerald-500">
                    <div className="bg-emerald-100 dark:bg-emerald-950/20 p-4 rounded-[1.5rem] text-emerald-600 dark:text-emerald-400">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Resolved / Closed</p>
                        <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.resolved}</p>
                    </div>
                </Card>
            </div>

            {/* Filter Bar */}
            <Card className="p-6 border-2 border-slate-50 dark:border-slate-800/80 shadow-sm bg-white dark:bg-slate-900 rounded-[2rem]">
                <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                    {/* Search */}
                    <div className="lg:col-span-4 space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Tickets</label>
                        <div className="relative">
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by subject, message or name..."
                                className="w-full pr-12 font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 px-5"
                            />
                            <button 
                                type="submit"
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary-800 dark:hover:text-primary-400 transition-colors"
                            >
                                <Search size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="lg:col-span-2">
                        <Select
                            label="Status"
                            options={[
                                { value: 'ALL', label: 'All Statuses' },
                                { value: 'OPEN', label: 'Open' },
                                { value: 'IN_PROGRESS', label: 'In Progress' },
                                { value: 'RESOLVED', label: 'Resolved' },
                                { value: 'CLOSED', label: 'Closed' }
                            ]}
                            value={statusFilter}
                            onChange={setStatusFilter}
                        />
                    </div>

                    {/* Priority */}
                    <div className="lg:col-span-2">
                        <Select
                            label="Priority"
                            options={[
                                { value: 'ALL', label: 'All Priorities' },
                                { value: 'HIGH', label: 'High' },
                                { value: 'MEDIUM', label: 'Medium' },
                                { value: 'LOW', label: 'Low' }
                            ]}
                            value={priorityFilter}
                            onChange={setPriorityFilter}
                        />
                    </div>

                    {/* Role */}
                    <div className="lg:col-span-2">
                        <Select
                            label="Role"
                            options={[
                                { value: 'ALL', label: 'All Roles' },
                                { value: 'CUSTOMER', label: 'Customers' },
                                { value: 'VENDOR', label: 'Vendors' },
                                { value: 'DELIVERY', label: 'Deliveries' }
                            ]}
                            value={roleFilter}
                            onChange={setRoleFilter}
                        />
                    </div>

                    {/* Submit Filter Button */}
                    <div className="lg:col-span-2">
                        <Button 
                            type="submit"
                            className="w-full py-4 text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary-900/10"
                        >
                            Apply Filters
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Tickets Table / List */}
            <Card className="p-0 border-2 border-slate-50 dark:border-slate-800/80 shadow-md bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-50 dark:border-slate-800 text-left bg-slate-50/50 dark:bg-slate-950/30">
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket ID</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Creator</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category / Subject</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Created Date</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-20 text-center">
                                        <RefreshCw className="animate-spin text-primary-600 mx-auto mb-4" size={32} />
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Tickets...</p>
                                    </td>
                                </tr>
                            ) : tickets.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-20 text-center">
                                        <LifeBuoy className="text-slate-300 dark:text-slate-700 mx-auto mb-4" size={40} />
                                        <p className="text-sm font-black text-slate-500 uppercase tracking-widest">No support tickets found</p>
                                    </td>
                                </tr>
                            ) : (
                                tickets.map((ticket) => (
                                    <tr 
                                        key={ticket._id}
                                        onClick={() => navigate(`/admin/tickets/${ticket._id}`)}
                                        className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/30 dark:hover:bg-slate-950/20 cursor-pointer group transition-colors"
                                    >
                                        <td className="p-6 font-black text-slate-400 text-xs">
                                            #{ticket._id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-black text-xs uppercase shadow-sm">
                                                    {ticket.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 dark:text-white text-xs leading-none mb-1.5">{ticket.name}</p>
                                                    <Badge variant={getRoleBadgeVariant(ticket.role)} className="text-[7px] py-0.5 px-1">{ticket.role}</Badge>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 max-w-[300px]">
                                            <p className="text-xs font-black text-slate-800 dark:text-white uppercase truncate">{ticket.subject}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">{ticket.category}</p>
                                        </td>
                                        <td className="p-6">
                                            <Badge variant={getPriorityBadgeVariant(ticket.priority)}>{ticket.priority}</Badge>
                                        </td>
                                        <td className="p-6">
                                            <Badge variant={getStatusBadgeVariant(ticket.status)}>{ticket.status}</Badge>
                                        </td>
                                        <td className="p-6 text-xs font-black text-slate-500 dark:text-slate-400">
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-6 text-right">
                                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 group-hover:text-primary-800 rounded-xl transition-all inline-flex items-center justify-center">
                                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default SupportTickets;
