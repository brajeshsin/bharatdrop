import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button } from '../../components/common';
import {
    Bike, Phone, TrendingUp, Eye, Search,
    ChevronLeft, ChevronRight, RotateCcw, Trash2
} from 'lucide-react';
import { useLoading } from '../../context/LoadingContext';
import { motion } from 'framer-motion';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';

const DeliveryPartners = () => {
    const navigate = useNavigate();
    const { setIsLoading } = useLoading();
    const [partners, setPartners] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, entriesPerPage]);

    useEffect(() => {
        const fetchPartners = async () => {
            setIsLoading(true);
            try {
                const data = await adminService.getPartners();
                setPartners(data);
            } catch (error) {
                toast.error('Logistics sync failed');
                console.error("Partners load failed:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPartners();
    }, [setIsLoading]);

    // Filtering logic
    const filteredPartners = partners.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.phone.includes(searchTerm);
        const matchesStatus = statusFilter === 'ALL' || p.status.toUpperCase() === statusFilter.toUpperCase();
        return matchesSearch && matchesStatus;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredPartners.length / entriesPerPage);
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredPartners.slice(indexOfFirstEntry, indexOfLastEntry);

    return (
        <div className="space-y-6 animate-fade-in relative pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-widest uppercase italic">Logistics Force</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Real-time delivery fleet overview</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-5 py-2.5 bg-primary-800 text-white rounded-2xl shadow-xl shadow-primary-900/20 flex items-center gap-3">
                        <Bike size={18} />
                        <span className="font-black text-sm">{partners.length} Total Partners</span>
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <Card className="p-4 border-none shadow-xl bg-white dark:bg-slate-900 rounded-[2rem] flex flex-col lg:flex-row items-center gap-4">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-800 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="SEARCH BY NAME OR PHONE..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-14 pr-6 font-black text-[11px] placeholder:text-slate-400 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 pl-4 border-l-2 border-slate-50 dark:border-slate-800">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:block">Filter</span>
                    <select
                        className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 font-black text-[11px] uppercase outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/40 dark:text-slate-200"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                    </select>
                </div>
                <div className="flex items-center gap-3 pl-4 border-l-2 border-slate-50 dark:border-slate-800">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:block">Display</span>
                    <select
                        className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 font-black text-[11px] uppercase outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/40 dark:text-slate-200"
                        value={entriesPerPage}
                        onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                    >
                        {[5, 10, 25, 50].map(v => <option key={v} value={v}>{v} Per Page</option>)}
                    </select>
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
                        RESET FILTERS
                    </button>
                )}
            </Card>

            {/* Partners Table */}
            <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50 dark:border-slate-800/50">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">S.No</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Partner</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Contact</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Earnings</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                            {currentEntries.map((partner, index) => (
                                <tr key={partner.id} className="group hover:bg-primary-50/30 dark:hover:bg-primary-900/5 transition-all">
                                    <td className="px-8 py-6">
                                        <span className="font-black text-slate-400 dark:text-slate-600 text-[10px] italic">{(indexOfFirstEntry + index + 1).toString().padStart(2, '0')}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div
                                            className="flex items-center gap-4 cursor-pointer"
                                            onClick={() => navigate(`/admin/partners/${partner.id}`)}
                                        >
                                            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-primary-800 dark:text-primary-400 group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-slate-700 transition-all shadow-sm">
                                                <Bike size={24} />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 dark:text-white tracking-widest uppercase text-sm group-hover:text-primary-800 dark:group-hover:text-primary-400 transition-colors">{partner.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">V-{partner.id}00 • {partner.zone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="font-bold text-xs text-slate-600 dark:text-slate-400 tracking-widest uppercase italic">{partner.phone}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="font-black text-slate-900 dark:text-white text-base tracking-tighter italic">₹{partner.earnings.toLocaleString()}</span>
                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">Verified</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-center">
                                            <Badge variant={partner.status === 'Online' ? 'success' : 'default'} className="px-4 py-1.5 font-black uppercase text-[9px] tracking-widest">
                                                {partner.status}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-primary-800 hover:text-white dark:hover:bg-primary-500 transition-all shadow-sm"
                                                onClick={() => navigate(`/admin/partners/${partner.id}`)}
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-900/50 transition-all shadow-sm"
                                                onClick={() => toast.error(`Termination restricted: Cannot delete ${partner.name}`)}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Numbered Pagination */}
                {totalPages > 1 && (
                    <div className="px-8 py-8 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                            Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredPartners.length)} of {filteredPartners.length} Partners
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${currentPage === 1 ? 'text-slate-200 dark:text-slate-800 cursor-not-allowed' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-primary-800 hover:text-white shadow-sm'}`}
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }).map((_, i) => {
                                    const pageNum = i + 1;
                                    if (
                                        pageNum === 1 ||
                                        pageNum === totalPages ||
                                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`min-w-[40px] h-10 px-3 rounded-xl font-black text-[11px] transition-all ${currentPage === pageNum ? 'bg-primary-800 text-white shadow-xl shadow-primary-900/20 scale-110' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm'}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    } else if (
                                        pageNum === currentPage - 2 ||
                                        pageNum === currentPage + 2
                                    ) {
                                        return <span key={pageNum} className="text-slate-300 dark:text-slate-700 px-1 font-black">...</span>;
                                    }
                                    return null;
                                })}
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

export default DeliveryPartners;
