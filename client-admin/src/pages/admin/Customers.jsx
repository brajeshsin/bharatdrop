import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Select } from '../../components/common';
import { adminService } from '../../services/adminService';
import {
    Search, UserMinus, UserCheck, Phone, MapPin,
    ExternalLink, ChevronLeft, ChevronRight, RotateCcw
} from 'lucide-react';
import { useLoading } from '../../context/LoadingContext';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
const PAGE_SIZE_OPTIONS = [
    { label: '10 Per Page', value: 10 },
    { label: '25 Per Page', value: 25 },
    { label: '50 Per Page', value: 50 },
    { label: '100 Per Page', value: 100 }
];

const CustomersPage = () => {
    const { setIsLoading } = useLoading();
    const [customers, setCustomers] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    const fetchCustomers = async () => {
        setIsLoading(true);
        setLoading(true);
        try {
            const result = await adminService.getCustomers({
                page: currentPage,
                limit: entriesPerPage,
                search: searchTerm
            });
            setCustomers(result.data);
            setPagination(result.pagination);
        } catch (error) {
            toast.error('Failed to load customers');
            console.error("Customers load failed:", error);
        } finally {
            setLoading(false);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchCustomers();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [currentPage, entriesPerPage, searchTerm]);

    return (
        <div className="space-y-8 animate-fade-in uppercase tracking-tight">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-none">Customer Registry</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-widest uppercase mt-2">Active platform users</p>
                </div>
            </div>

            {/* Premium Controls Bar */}
            <Card className="p-4 border-none shadow-xl bg-white dark:bg-slate-900 rounded-[2.2rem] flex flex-col lg:flex-row items-center gap-4">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-800 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="SEARCH BY NAME, EMAIL OR MOBILE..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-14 pr-6 font-black text-[11px] placeholder:text-slate-400 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
                <div className="flex items-center gap-3 pl-4 border-l-2 border-slate-50 dark:border-slate-800 min-w-[160px]">
                    <Select
                        options={PAGE_SIZE_OPTIONS}
                        value={entriesPerPage}
                        onChange={(val) => {
                            setEntriesPerPage(Number(val));
                            setCurrentPage(1);
                        }}
                        size="sm"
                    />
                </div>
                {searchTerm && (
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setCurrentPage(1);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-red-100 dark:hover:bg-red-900/20 transition-all shadow-sm ring-2 ring-red-100 dark:ring-red-900/20"
                    >
                        <RotateCcw size={14} />
                        RESET
                    </button>
                )}
            </Card>

            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-bold text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Name & Email</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mobile</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Township</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Orders</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {loading ? (
                                [1, 2, 3].map(i => <tr key={i}><td colSpan="5" className="px-10 py-8 animate-pulse bg-slate-50/50 dark:bg-slate-800/10 h-20"></td></tr>)
                            ) : customers.length > 0 ? (
                                customers.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center text-primary-800 dark:text-primary-400 font-black">
                                                    {c.name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 dark:text-white text-sm tracking-tighter">{c.name}</p>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 lowercase">{c.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} className="text-slate-300 dark:text-slate-600" />
                                                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{c.mobile}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-slate-300 dark:text-slate-600" />
                                                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{c.town}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-900 dark:text-white">{c.totalOrders} Orders</span>
                                                <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[8px] uppercase mt-1 w-fit">Active</Badge>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-[9px] font-black px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400"
                                                onClick={() => toast.error(`Action restricted: Cannot block ${c.name}`)}
                                            >
                                                BLOCK
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 italic font-black text-2xl">?</div>
                                            <p className="font-black text-slate-400 uppercase tracking-widest text-xs italic">No customers match your criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Numbered Pagination */}
                {pagination.pages > 1 && (
                    <div className="px-8 py-8 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                            Showing {(currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, pagination.total)} of {pagination.total} Customers
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
                                {Array.from({ length: pagination.pages }).map((_, i) => {
                                    const pageNum = i + 1;
                                    if (
                                        pageNum === 1 ||
                                        pageNum === pagination.pages ||
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
                                onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                                disabled={currentPage === pagination.pages}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${currentPage === pagination.pages ? 'text-slate-200 dark:text-slate-800 cursor-not-allowed' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-primary-800 hover:text-white shadow-sm'}`}
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

export default CustomersPage;
