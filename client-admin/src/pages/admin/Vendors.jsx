import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button, Input, ConfirmationModal, Select } from '../../components/common';
import { adminService } from '../../services/adminService';
import { Search, Plus, Store, MapPin, Phone, ShieldAlert, ShieldCheck, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLoading } from '../../context/LoadingContext';
import { toast } from 'react-hot-toast';


const VendorsPage = () => {
    const navigate = useNavigate();
    const { setIsLoading } = useLoading();
    const [vendors, setVendors] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [vendorToDelete, setVendorToDelete] = useState(null);

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const result = await adminService.getVendors({
                page: currentPage,
                limit: entriesPerPage,
                search: searchTerm
            });
            setVendors(result.data);
            setPagination(result.pagination);
        } catch (error) {
            console.error("Vendors load failed:", error);
        } finally {
            setLoading(false);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchVendors();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, currentPage, entriesPerPage]);

    const handleDeleteVendor = async () => {
        if (!vendorToDelete) return;
        setIsLoading(true);
        try {
            const result = await adminService.deleteVendor(vendorToDelete);
            if (result.success) {
                toast.success('Merchant removed from registry');
                setIsDeleteModalOpen(false);
                setVendorToDelete(null);
                fetchVendors();
            } else {
                toast.error(result.message || "Failed to remove merchant");
            }
        } catch (error) {
            toast.error('Could not connect to server');
            console.error("Delete vendor failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDelete = (id) => {
        setVendorToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const toggleStatus = async (vendor) => {
        setIsLoading(true);
        try {
            const newStatus = vendor.status === 'Active' ? 'Inactive' : 'Active';
            const result = await adminService.updateVendor(vendor._id, { status: newStatus });
            if (result.success) {
                toast.success(`Merchant ${newStatus === 'Active' ? 'Enabled' : 'Disabled'} successfully`);
                fetchVendors();
            } else {
                toast.error(result.message || "Status update failed");
            }
        } catch (error) {
            toast.error('Server connection error');
            console.error("Toggle status failed:", error);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="space-y-8 animate-fade-in tracking-tight">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-none uppercase tracking-tighter text-left">Merchant Registry</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-widest uppercase mt-2 italic shadow-primary-500/10 text-left">Hyperlocal Partner Management</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="SEARCH VENDORS, TOWNS..."
                            className="bg-white dark:bg-slate-900 border-none rounded-2xl py-4 pl-12 pr-6 text-xs font-black tracking-widest w-full md:w-80 shadow-xl shadow-slate-200/50 dark:shadow-none focus:ring-2 ring-primary-500 transition-all uppercase outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => navigate('/admin/vendors/new')} className="font-black text-[10px] tracking-[0.2em] py-4 px-8 shadow-xl shadow-primary-900/20">
                        <Plus size={16} className="mr-2" /> ADD VENDOR
                    </Button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-6 bg-white dark:bg-slate-900 border-none shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center text-primary-600 shadow-inner"><Store size={24} /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Shops</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{pagination.total || 0}</p>
                    </div>
                </Card>
            </div>

            {/* Table of Vendors */}
            <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden p-0 mb-10">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center w-20">#</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Merchant Details</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Shop ID</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Category</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Town/Village</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contact</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="8" className="px-10 py-10">
                                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : vendors.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="py-24 text-center">
                                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                                            <Store size={40} />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-300 dark:text-slate-700 uppercase tracking-tighter">No Merchants Registered</h3>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2 italic">Try a different search or onboard a new merchant</p>
                                    </td>
                                </tr>
                            ) : (
                                vendors.map((vendor, index) => (
                                    <tr key={vendor._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-300 group">
                                        <td className="px-6 py-7 text-center">
                                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-600">
                                                {(currentPage - 1) * entriesPerPage + (index + 1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-7 text-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center text-primary-800 dark:text-primary-400 shadow-inner group-hover:scale-110 transition-transform duration-300">
                                                    <Store size={24} />
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">{vendor.storeName}</h3>
                                                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">Owner: {vendor.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-7 text-center">
                                            <Badge variant="primary" className="bg-slate-900 text-white dark:bg-white dark:text-black font-black px-3 py-1 tracking-tighter text-[10px] rounded-lg">
                                                {vendor.shopId || 'PENDING'}
                                            </Badge>
                                        </td>
                                        <td className="px-10 py-7 text-left">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-lg shadow-primary-500/30" />
                                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] italic">{vendor.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-7 text-left">
                                            <div className="flex items-center gap-2.5 text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                                <MapPin size={14} className="text-primary-500" />
                                                {vendor.town}
                                            </div>
                                        </td>
                                        <td className="px-10 py-7 text-left">
                                            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest leading-none">
                                                <Phone size={14} className="text-slate-300 dark:text-slate-700" />
                                                {vendor.phone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-7 text-left">
                                            <Badge variant={vendor.status === 'Active' ? 'success' : 'error'} className="font-black px-4 py-1.5 tracking-widest text-[9px] rounded-xl shadow-sm">
                                                {vendor.status}
                                            </Badge>
                                        </td>
                                        <td className="px-10 py-7 text-right">
                                            <div className="flex items-center justify-end gap-2 pr-2">
                                                <Button
                                                    variant="ghost"
                                                    className="w-10 h-10 p-0 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all shadow-sm"
                                                    onClick={() => toggleStatus(vendor)}
                                                >
                                                    {vendor.status === 'Active' ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-10 h-10 p-0 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                    onClick={() => navigate(`/admin/vendors/${vendor._id}`, { state: { isEdit: false } })}
                                                >
                                                    <Eye size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-10 h-10 p-0 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                                                    onClick={() => navigate(`/admin/vendors/${vendor._id}`, { state: { isEdit: true } })}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-10 h-10 p-0 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                    onClick={() => confirmDelete(vendor._id)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>


            {/* Pagination */}
            {!loading && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12 pb-10">
                    <Button
                        variant="outline"
                        className="w-10 h-10 p-0 rounded-xl border-none bg-white dark:bg-slate-900 shadow-sm disabled:opacity-30"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={16} />
                    </Button>
                    <div className="flex items-center mx-4 gap-1">
                        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-10 h-10 rounded-xl text-[10px] font-black tracking-widest transition-all ${currentPage === page
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/30'
                                    : 'bg-white dark:bg-slate-900 text-slate-400 hover:bg-slate-50'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        className="w-10 h-10 p-0 rounded-xl border-none bg-white dark:bg-slate-900 shadow-sm disabled:opacity-30"
                        onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                        disabled={currentPage === pagination.pages}
                    >
                        <ChevronRight size={16} />
                    </Button>
                </div>
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteVendor}
                title="Confirm Termination"
                message="Are you absolutely sure you want to remove this merchant? This operation is permanent and data cannot be recovered."
                confirmText="TERMINATE MERCHANT"
            />
        </div>
    );
};

export default VendorsPage;
