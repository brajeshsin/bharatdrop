import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Select } from '../../components/common';
import { adminService } from '../../services/adminService';
import {
    Search, Filter, ChevronLeft, ChevronRight, Eye,
    RotateCcw
} from 'lucide-react';
import { useLoading } from '../../context/LoadingContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
const STATUS_OPTIONS = [
    { label: 'All Status', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Ready', value: 'READY' },
    { label: 'Picked', value: 'PICKED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' }
];

const OrdersPage = () => {
    const navigate = useNavigate();
    const { setIsLoading } = useLoading();
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const data = await adminService.getOrders();
            setOrders(data);
        } catch (error) {
            toast.error('Failed to sync order logs');
            console.error("Orders load failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [setIsLoading]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, entriesPerPage]);

    // Filtering logic
    const filteredOrders = orders.filter(order => {
        const customerName = order.customer?.name || '';
        const vendorName = order.vendor?.name || '';
        const orderId = order.orderId || '';

        const matchesSearch =
            orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendorName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredOrders.length / entriesPerPage);
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredOrders.slice(indexOfFirstEntry, indexOfLastEntry);

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

    return (
        <div className="space-y-6 animate-fade-in relative pb-12 px-4 md:px-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-widest uppercase italic">Order Details</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Platform-wide transaction monitoring</p>
                </div>
                <Button
                    className="font-black text-[10px] tracking-[0.2em] py-3 px-6 shadow-xl shadow-primary-900/20 rounded-2xl"
                    onClick={fetchOrders}
                >
                    <RotateCcw size={16} className="mr-2" /> REFRESH LIVE
                </Button>
            </div>

            {/* Premium Controls Bar */}
            <Card className="p-4 border-none shadow-xl bg-white dark:bg-slate-900 rounded-[2rem] flex flex-col lg:flex-row items-center gap-4">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-800 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="SEARCH BY ID, CUSTOMER OR MERCHANT..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-14 pr-6 font-black text-[11px] placeholder:text-slate-400 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 pl-4 border-l-2 border-slate-50 dark:border-slate-800 min-w-[180px]">
                    <Select
                        options={STATUS_OPTIONS}
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(val)}
                        size="sm"
                    />
                </div>
                {(searchTerm || statusFilter !== 'ALL') && (
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('ALL');
                            setCurrentPage(1);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-red-100 dark:hover:bg-red-900/20 transition-all shadow-sm ring-2 ring-red-100 dark:ring-red-900/20"
                    >
                        <RotateCcw size={14} />
                        RESET
                    </button>
                )}
            </Card>

            {/* Orders Table */}
            <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-slate-50 dark:border-slate-800/50">
                            <tr>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">S.No</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Order Details</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Merchant & Village</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Amount</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                            {currentEntries.map((order, index) => (
                                <tr key={order._id} className="group hover:bg-primary-50/30 dark:hover:bg-primary-900/5 transition-all">
                                    <td className="px-8 py-6">
                                        <span className="font-black text-slate-400 dark:text-slate-600 text-[10px] italic">{(indexOfFirstEntry + index + 1).toString().padStart(2, '0')}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-900 dark:text-white text-sm tracking-widest">{order.orderId}</span>
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 italic">{order.customer?.name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">{order.vendor?.name || 'Direct Shop'}</span>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <Badge className="bg-slate-50 dark:bg-slate-800 text-slate-400 border-none px-2 h-4 text-[8px] font-black uppercase tracking-widest">{order.deliveryAddress?.village || 'N/A'}</Badge>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-center">
                                            <Badge
                                                variant={getStatusVariant(order.status)}
                                                className="px-4 py-1.5 font-black text-[9px] uppercase tracking-widest"
                                            >
                                                {order.status}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="font-black text-slate-900 dark:text-white text-base tracking-tighter italic">₹{(order.total || order.amount || 0).toLocaleString()}</span>
                                            <span className="text-[9px] font-black text-slate-900 dark:text-slate-500 uppercase tracking-widest">{order.paymentMethod === 'cod' ? 'COD' : 'UPI'} Pending</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/orders/${order._id}`)}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-primary-800 hover:text-white dark:hover:bg-primary-500 transition-all shadow-sm"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {currentEntries.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 italic font-black text-2xl">?</div>
                                            <p className="font-black text-slate-400 uppercase tracking-widest text-xs italic">No orders match your criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-8 py-8 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                            Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredOrders.length)} of {filteredOrders.length} Orders
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${currentPage === 1 ? 'text-slate-200 dark:text-slate-800 cursor-not-allowed' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-primary-800 hover:text-white shadow-sm'}`}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex items-center gap-1 font-black text-xs text-slate-500">
                                Page {currentPage} of {totalPages}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${currentPage === totalPages ? 'text-slate-200 dark:text-slate-800 cursor-not-allowed' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-primary-800 hover:text-white shadow-sm'}`}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default OrdersPage;
