import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Input, ConfirmationModal, Modal } from '../../components/common';
import { adminService } from '../../services/adminService';
import { Search, Plus, Store, MapPin, Phone, Edit, Trash2, ShieldCheck, ShieldAlert, ChevronLeft, ChevronRight, X, Eye } from 'lucide-react';
import { useLoading } from '../../context/LoadingContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const VendorsPage = () => {
    const { setIsLoading } = useLoading();
    const [vendors, setVendors] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentVendorId, setCurrentVendorId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [vendorToDelete, setVendorToDelete] = useState(null);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingVendor, setViewingVendor] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        storeName: '',
        category: 'Grocery',
        phone: '',
        town: '',
        address: '',
        image: '',
        items: []
    });

    const categories = ['Sweets & Snacks', 'Fruits & Veg', 'Grocery', 'Restaurant', 'Pharmacy', 'Meat', 'Dhaba', 'Fast Food', 'Dairy'];

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

    const handleCreateVendor = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            let result;
            if (isEditMode) {
                result = await adminService.updateVendor(currentVendorId, formData);
            } else {
                result = await adminService.createVendor(formData);
            }

            if (result.success) {
                toast.success(isEditMode ? 'Merchant profile updated successfully' : 'New merchant registered successfully');
                setIsAddModalOpen(false);
                resetForm();
                fetchVendors();
            } else {
                toast.error(result.message || `Failed to ${isEditMode ? 'update' : 'create'} merchant`);
            }
        } catch (error) {
            toast.error('Network error. Please check your connection.');
            console.error(`${isEditMode ? 'Update' : 'Create'} vendor failed:`, error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (vendor) => {
        setFormData({
            name: vendor.name,
            storeName: vendor.storeName,
            category: vendor.category,
            phone: vendor.phone,
            town: vendor.town,
            address: vendor.address || '',
            image: vendor.image || '',
            items: vendor.items || []
        });
        setCurrentVendorId(vendor._id);
        setIsEditMode(true);
        setIsAddModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            storeName: '',
            category: 'Grocery',
            phone: '',
            town: '',
            address: '',
            image: '',
            items: []
        });
        setIsEditMode(false);
        setCurrentVendorId(null);
    };

    const handleAddItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { name: '', price: '', image: '', unit: 'kg' }]
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleRemoveItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

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
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-none uppercase tracking-tighter">Merchant Registry</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-widest uppercase mt-2 italic">Hyperlocal Partner Management</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="SEARCH VENDORS, TOWNS..."
                            className="bg-white dark:bg-slate-900 border-none rounded-2xl py-4 pl-12 pr-6 text-xs font-black tracking-widest w-full md:w-80 shadow-xl shadow-slate-200/50 dark:shadow-none focus:ring-2 ring-primary-500 transition-all uppercase"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => {
                        resetForm();
                        setIsAddModalOpen(true);
                    }} className="font-black text-[10px] tracking-[0.2em] py-4 px-8 shadow-xl shadow-primary-900/20">
                        <Plus size={16} className="mr-2" /> ADD VENDOR
                    </Button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-6 bg-white dark:bg-slate-900 border-none shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center text-primary-600"><Store size={24} /></div>
                    <div>
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
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2 italic">Try a different search or add a new merchant</p>
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
                                                <div>
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
                                        <td className="px-10 py-7">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-lg shadow-primary-500/30" />
                                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] italic">{vendor.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-7">
                                            <div className="flex items-center gap-2.5 text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                                <MapPin size={14} className="text-primary-500" />
                                                {vendor.town}
                                            </div>
                                        </td>
                                        <td className="px-10 py-7">
                                            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest leading-none">
                                                <Phone size={14} className="text-slate-300 dark:text-slate-700" />
                                                {vendor.phone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-7">
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
                                                    onClick={() => {
                                                        setViewingVendor(vendor);
                                                        setIsViewModalOpen(true);
                                                    }}
                                                >
                                                    <Eye size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-10 h-10 p-0 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                                                    onClick={() => handleEditClick(vendor)}
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

            {/* Add Vendor Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm cursor-pointer" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 max-h-[90vh] overflow-y-auto border dark:border-slate-800 no-scrollbar">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-600/40">
                                    <Store size={24} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">{isEditMode ? 'Update Shop' : 'Register Shop'}</h2>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">{isEditMode ? 'Modify existing merchant details' : 'Add new merchant to the network'}</p>
                                </div>
                            </div>

                            <form className="space-y-6" onSubmit={handleCreateVendor}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="OWNER NAME"
                                        placeholder="Full Name"
                                        className="h-14 font-bold"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    <Input
                                        label="STORE NAME"
                                        placeholder="Business Name"
                                        className="h-14 font-bold"
                                        required
                                        value={formData.storeName}
                                        onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                                    />
                                </div>

                                <Input
                                    label="IMAGE URL"
                                    placeholder="https://images.unsplash.com/..."
                                    className="h-14 font-bold"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">CATEGORY</label>
                                        <select
                                            className="w-full h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 text-xs font-black tracking-widest text-slate-900 dark:text-white focus:ring-2 ring-primary-500 transition-all uppercase outline-none"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>
                                    <Input
                                        label="PHONE NUMBER"
                                        placeholder="10 Digits"
                                        className="h-14 font-bold"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">SHOP INVENTORY (ITEMS & PRICES)</label>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="text-[9px] font-black uppercase text-primary-600 dark:text-primary-400 p-0 h-auto"
                                            onClick={handleAddItem}
                                        >
                                            <Plus size={12} className="mr-1" /> Add New Item
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {formData.items && formData.items.map((item, index) => (
                                            <div key={index} className="flex gap-4 items-center animate-fade-in group">
                                                <div className="flex-1 space-y-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <input
                                                            placeholder="Item Name"
                                                            className="w-full h-11 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 text-[11px] font-bold text-slate-900 dark:text-white focus:ring-2 ring-primary-500 transition-all uppercase outline-none shadow-inner"
                                                            value={item.name}
                                                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                        />
                                                        <input
                                                            placeholder="Price"
                                                            type="number"
                                                            className="w-full h-11 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 text-[11px] font-bold text-slate-900 dark:text-white focus:ring-2 ring-primary-500 transition-all uppercase outline-none shadow-inner"
                                                            value={item.price}
                                                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <input
                                                            placeholder="Item Image URL"
                                                            className="w-full h-11 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 text-[11px] font-bold text-slate-900 dark:text-white focus:ring-2 ring-primary-500 transition-all uppercase outline-none shadow-inner"
                                                            value={item.image}
                                                            onChange={(e) => handleItemChange(index, 'image', e.target.value)}
                                                        />
                                                        <select
                                                            className="w-full h-11 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 text-[11px] font-black tracking-widest text-slate-900 dark:text-white focus:ring-2 ring-primary-500 transition-all uppercase outline-none shadow-inner"
                                                            value={item.unit}
                                                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                                        >
                                                            {['kg', 'full plate', 'half plate', 'litre', '100gm', '250gm', '500gm'].map(u => (
                                                                <option key={u} value={u}>{u}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    className="w-10 h-10 p-0 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                                    onClick={() => handleRemoveItem(index)}
                                                >
                                                    <X size={14} />
                                                </Button>
                                            </div>
                                        ))}

                                        {formData.items.length === 0 && (
                                            <div className="text-center py-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">No items listed. Start adding inventory.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Input
                                    label="TOWN / VILLAGE"
                                    placeholder="Location Name"
                                    className="h-14 font-bold"
                                    required
                                    value={formData.town}
                                    onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                                />

                                <div className="pt-6 grid grid-cols-2 gap-4">
                                    <Button variant="outline" className="py-4 font-black text-[10px] tracking-widest bg-slate-50 dark:bg-slate-800 border-none rounded-2xl hover:bg-slate-100" type="button" onClick={() => setIsAddModalOpen(false)}>DISCARD</Button>
                                    <Button className="py-4 font-black text-[10px] tracking-widest rounded-2xl shadow-lg shadow-primary-900/20 shadow-primary-900/40" type="submit">{isEditMode ? 'UPDATE MERCHANT' : 'ONBOARD MERCHANT'}</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteVendor}
                title="Confirm Termination"
                message="Are you absolutely sure you want to remove this merchant? This operation is permanent and data cannot be recovered."
                confirmText="TERMINATE MERCHANT"
            />
            {/* Items View Modal */}
            <AnimatePresence>
                {isViewModalOpen && viewingVendor && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsViewModalOpen(false)} className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm cursor-pointer" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl p-0 overflow-hidden border dark:border-slate-800">
                            {/* Modal Header/Image */}
                            <div className="h-48 relative overflow-hidden group">
                                <img
                                    src={viewingVendor.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    alt={viewingVendor.storeName}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                                <div className="absolute bottom-6 left-8 right-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge className="bg-primary-500 text-white border-none font-black text-[9px] uppercase tracking-widest">{viewingVendor.category}</Badge>
                                        <Badge className="bg-slate-900/60 backdrop-blur-md text-slate-400 border-none font-black text-[9px] tracking-tighter uppercase">{viewingVendor.shopId}</Badge>
                                    </div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none italic">{viewingVendor.storeName}</h2>
                                    <div className="flex items-center gap-4 text-white/60 text-[10px] font-bold uppercase tracking-widest mt-3">
                                        <span className="flex items-center gap-1.5"><MapPin size={12} className="text-primary-400" /> {viewingVendor.town}</span>
                                        <span className="flex items-center gap-1.5"><Phone size={12} className="text-primary-400" /> {viewingVendor.phone}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="absolute top-6 right-6 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center text-white transition-all transform hover:rotate-90"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Inventory List */}
                            <div className="p-8 max-h-[50vh] overflow-y-auto no-scrollbar">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Shop Inventory</h3>
                                    <span className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em]">{viewingVendor.items?.length || 0} Products</span>
                                </div>

                                <div className="space-y-4">
                                    {viewingVendor.items && viewingVendor.items.length > 0 ? (
                                        viewingVendor.items.map((item, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors border-2 border-transparent hover:border-primary-100 dark:hover:border-primary-900/30 group">
                                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white dark:bg-slate-700 shadow-sm border dark:border-slate-800 shrink-0">
                                                    <img src={item.image || viewingVendor.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight truncate group-hover:text-primary-800 dark:group-hover:text-primary-400 transition-colors">{item.name}</h4>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.unit || 'Standard'}</p>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase italic">₹</span>
                                                    <span className="text-sm font-black text-slate-900 dark:text-white italic">{item.price}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                                            <Store size={32} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">No inventory listed for this shop</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t dark:border-slate-800">
                                <Button
                                    fullWidth
                                    onClick={() => {
                                        setIsViewModalOpen(false);
                                        handleEditClick(viewingVendor);
                                    }}
                                    className="py-4 font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary-900/20"
                                >
                                    Modify Inventory
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VendorsPage;
