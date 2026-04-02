import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Badge, Button, Input, ConfirmationModal, Select, cn } from '../../components/common';
import { adminService } from '../../services/adminService';
import {
    ArrowLeft, Store, MapPin, Phone, Edit, Trash2,
    ShieldCheck, ShieldAlert, X, Eye, Package,
    PackageX, Save, Plus, Trash, Image as ImageIcon,
    Hash, Tag, Map, Info, Clock, AlertCircle
} from 'lucide-react';
import { useLoading } from '../../context/LoadingContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const UNIT_PRESETS = ['KG', 'LITRE', 'HALF PLATE', 'FULL PLATE', '100GM', '250GM', '500GM', 'PIECE', 'PACKET'];

const VendorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { setIsLoading } = useLoading();

    // States
    const [vendor, setVendor] = useState(null);
    const [isEditMode, setIsEditMode] = useState(location.state?.isEdit || false);
    const [formData, setFormData] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch Vendor Data
    const fetchVendor = async () => {
        setLoading(true);
        setIsLoading(true);
        try {
            const data = await adminService.getVendorById(id);
            if (data) {
                setVendor(data);
                setFormData(data);
            } else {
                toast.error("Vendor not found");
                navigate('/admin/vendors');
            }
        } catch (error) {
            console.error("Error fetching vendor:", error);
            toast.error("Failed to load vendor details");
        } finally {
            setLoading(false);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVendor();
    }, [id]);

    // Handle Form Changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...formData.items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        setFormData(prev => ({ ...prev, items: updatedItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [{ name: '', price: '', image: '', stock: 99, isOutOfStock: false, unit: 'KG', isNew: true }, ...prev.items]
        }));
        toast.success("New item buffer created at the top");
    };

    const removeItem = (index) => {
        const updatedItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, items: updatedItems }));
    };

    const handleToggleItemStock = async (vendorId, itemName) => {
        try {
            const result = await adminService.toggleItemStock(vendorId, itemName);
            if (result.success) {
                toast.success(`${itemName} availability updated`);
                // Update both local states to keep UI in sync
                setVendor(result.data);
                if (formData && formData._id === vendorId) {
                    setFormData(result.data);
                }
            } else {
                toast.error(result.message || "Failed to update availability");
            }
        } catch (error) {
            toast.error("Connection failed");
        }
    };

    // Save Changes
    const handleSave = async () => {
        setIsLoading(true);
        try {
            const result = await adminService.updateVendor(id, formData);
            if (result.success) {
                toast.success("Merchant updated successfully");
                setVendor(result.data);
                setIsEditMode(false);
            } else {
                toast.error(result.message || "Update failed");
            }
        } catch (error) {
            toast.error("Connection failed");
        } finally {
            setIsLoading(false);
        }
    };

    // Delete Vendor
    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const result = await adminService.deleteVendor(id);
            if (result.success) {
                toast.success("Merchant terminated");
                navigate('/admin/vendors');
            } else {
                toast.error(result.message || "Termination failed");
            }
        } catch (error) {
            toast.error("Connection failed");
        } finally {
            setIsLoading(false);
            setIsDeleteModalOpen(false);
        }
    };

    if (loading || !vendor || (isEditMode && !formData)) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-primary-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Store className="text-primary-600 animate-pulse" size={24} />
                    </div>
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Syncing Intelligence</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 animate-pulse">Establishing secure handshake with merchant registry...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
            {/* Top Navigation */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/admin/vendors')}
                            className="group flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-primary-800 hover:text-white transition-all shadow-sm active:scale-90"
                        >
                            <ArrowLeft size={20} strokeWidth={2.5} />
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                                {isEditMode ? 'Modify Merchant' : 'Merchant Intelligence'}
                            </h1>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-1">
                                ID: {vendor.shopId}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {!isEditMode ? (
                            <>
                                <Button
                                    variant="primary"
                                    className="h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary-800/20"
                                    onClick={() => setIsEditMode(true)}
                                >
                                    <Edit size={16} className="mr-2" /> Edit Details
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="danger"
                                    className="h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-500/10 mr-4"
                                    onClick={() => setIsDeleteModalOpen(true)}
                                >
                                    <Trash2 size={16} className="mr-2" /> Terminate
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400"
                                    onClick={() => {
                                        setIsEditMode(false);
                                        setFormData(vendor);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    className="h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary-800/20"
                                    onClick={handleSave}
                                >
                                    <Save size={16} className="mr-2" /> Commmit Changes
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 pt-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Column: Essential Stats & Identity */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Merchant Identity Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-0 overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                            <div className="h-64 relative group">
                                <img
                                    src={isEditMode && formData ? formData.image : vendor?.image}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    alt=""
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                                <div className="absolute bottom-8 left-8 right-8">
                                    <Badge className="mb-3 bg-primary-800 text-white border-none font-black text-[9px] uppercase tracking-widest py-1.5 px-3">
                                        {vendor.category}
                                    </Badge>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none italic">{vendor.storeName}</h2>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100 dark:border-emerald-900/50">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Account Status</p>
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase italic">{vendor.status}</h4>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-800 group transition-colors hover:bg-primary-50 dark:hover:bg-primary-950/20 border-2 border-transparent hover:border-primary-100 dark:hover:border-primary-900/30">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 shadow-sm transition-colors group-hover:text-primary-800">
                                                <MapPin size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Territory</p>
                                                <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase truncate italic">{vendor.town}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-800 group transition-colors hover:bg-primary-50 dark:hover:bg-primary-950/20 border-2 border-transparent hover:border-primary-100 dark:hover:border-primary-900/30">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 shadow-sm transition-colors group-hover:text-primary-800">
                                                <Phone size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Communication</p>
                                                <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase truncate italic">{vendor.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Metadata Info */}
                        <div className="bg-slate-900 text-white rounded-[3rem] p-8 space-y-6 shadow-2xl">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="text-primary-400" size={20} />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Operational Intel</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Commission Tier</span>
                                    <span className="text-xs font-black text-primary-400 uppercase">Standard (15%)</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Inventory</span>
                                    <span className="text-xs font-black text-white uppercase">{vendor.items?.length || 0} SKUs</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Joined Date</span>
                                    <span className="text-xs font-black text-white uppercase">{new Date(vendor.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detailed Configuration & Inventory */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Detail/Edit Form */}
                        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border-2 border-slate-100 dark:border-slate-800 shadow-xl">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">Primary Configuration</h3>
                                {isEditMode && <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[9px] uppercase tracking-widest">Unsaved Changes</Badge>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><Store size={12} /> Merchant Name</label>
                                        <Input
                                            name="name"
                                            value={isEditMode && formData ? formData.name : vendor?.name}
                                            readOnly={!isEditMode}
                                            onChange={handleInputChange}
                                            className="h-14 font-black uppercase text-xs rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><Tag size={12} /> Storefront Display</label>
                                        <Input
                                            name="storeName"
                                            value={isEditMode && formData ? formData.storeName : vendor?.storeName}
                                            readOnly={!isEditMode}
                                            onChange={handleInputChange}
                                            className="h-14 font-black uppercase text-xs rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><ImageIcon size={12} /> Visual Asset URL</label>
                                        <Input
                                            name="image"
                                            value={isEditMode && formData ? formData.image : vendor?.image}
                                            readOnly={!isEditMode}
                                            onChange={handleInputChange}
                                            className="h-14 font-black text-xs rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><Hash size={12} /> External Shop ID</label>
                                        <Input
                                            name="shopId"
                                            value={isEditMode && formData ? formData.shopId : vendor?.shopId}
                                            readOnly={!isEditMode}
                                            onChange={handleInputChange}
                                            className="h-14 font-black uppercase text-xs rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none shadow-inner opacity-60"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Inventory Management Section */}
                        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border-2 border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 text-left">Modify Inventory</h3>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none text-left">Control item-level pricing, availability and stock</p>
                                </div>
                                {isEditMode && (
                                    <Button
                                        onClick={addItem}
                                        className="h-12 w-12 p-0 rounded-2xl bg-slate-950 text-white hover:bg-slate-800 shadow-xl active:scale-90 flex items-center justify-center transition-all"
                                    >
                                        <Plus size={20} strokeWidth={3} />
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-6">
                                {(isEditMode && formData ? formData.items : vendor?.items || []).map((item, index) => (
                                    <motion.div
                                        key={index}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="relative p-8 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-50 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:shadow-2xl hover:border-primary-500/20 group animate-fade-in"
                                    >
                                        {item.isNew && isEditMode && (
                                            <div className="absolute -top-3 -left-3 px-5 py-2 bg-primary-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl z-10">
                                                NEWLY ADDED
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                            {/* Product Identity */}
                                            <div className="lg:col-span-2 space-y-4">
                                                <div className="space-y-1.5 px-1">
                                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none block">Product Identity</label>
                                                    {isEditMode ? (
                                                        <Input
                                                            placeholder="e.g. Special Chicken Biryani"
                                                            className="h-14 text-sm font-black uppercase rounded-2xl"
                                                            value={item.name}
                                                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                        />
                                                    ) : (
                                                        <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight py-3 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-none">{item.name}</h4>
                                                    )}
                                                </div>
                                                <div className="space-y-1.5 px-1">
                                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none block">Pricing & Unit</label>
                                                    <div className="flex gap-4">
                                                        <div className="relative flex-[1.5]">
                                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 mb-0.5">₹</span>
                                                            <Input
                                                                type="number"
                                                                placeholder="0.00"
                                                                className="h-14 pl-10 text-sm font-black rounded-2xl"
                                                                value={item.price}
                                                                readOnly={!isEditMode}
                                                                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            {isEditMode ? (
                                                                <Select
                                                                    options={UNIT_PRESETS}
                                                                    value={item.unit}
                                                                    onChange={(val) => handleItemChange(index, 'unit', val)}
                                                                    placeholder="Unit"
                                                                />
                                                            ) : (
                                                                <div className="h-14 flex items-center px-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest border-none">
                                                                    {item.unit || 'Standard'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5 px-1 pt-2">
                                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none block">Product Visual (URL)</label>
                                                    {isEditMode ? (
                                                        <Input
                                                            placeholder="https://images.unsplash.com/..."
                                                            className="h-12 text-[10px] font-black rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border-none"
                                                            value={item.image}
                                                            onChange={(e) => handleItemChange(index, 'image', e.target.value)}
                                                        />
                                                    ) : (
                                                        <p className="text-[10px] font-black text-slate-400 truncate py-2 px-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl italic">
                                                            {item.image || 'No visual asset assigned'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Inventory Controls */}
                                            <div className="lg:col-span-1 space-y-4">
                                                <div className="space-y-1.5 px-1">
                                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none block">Stock Level</label>
                                                    <Input
                                                        type="number"
                                                        placeholder="99"
                                                        className="h-14 text-center text-sm font-black rounded-2xl"
                                                        value={item.stock}
                                                        readOnly={!isEditMode}
                                                        onChange={(e) => handleItemChange(index, 'stock', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-1.5 px-1">
                                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none block">Availability</label>
                                                    <button
                                                        onClick={() => {
                                                            if (!isEditMode) return;
                                                            handleItemChange(index, 'isOutOfStock', !item.isOutOfStock);
                                                        }}
                                                        className={cn(
                                                            "w-full h-14 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 border-2",
                                                            item.isOutOfStock
                                                                ? "bg-red-50 border-red-100 text-red-500"
                                                                : "bg-emerald-50 border-emerald-100 text-emerald-600",
                                                            !isEditMode && "cursor-default opacity-80"
                                                        )}
                                                    >
                                                        {item.isOutOfStock ? <PackageX size={18} /> : <Package size={18} />}
                                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                                            {item.isOutOfStock ? 'OUT OF STOCK' : 'AVAILABLE'}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Image & Actions */}
                                            <div className="lg:col-span-1 flex flex-col justify-between items-center py-1">
                                                <div className="w-full h-24 bg-slate-50 dark:bg-slate-800/50 rounded-2xl overflow-hidden border-2 border-dashed border-slate-100 dark:border-slate-800 relative group/img">
                                                    <img src={item.image || (isEditMode ? formData.image : vendor.image)} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                {isEditMode && (
                                                    <button
                                                        onClick={() => removeItem(index)}
                                                        className="mt-4 w-full py-3 text-[9px] font-black uppercase text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all tracking-tighter"
                                                    >
                                                        TERMINATE PRODUCT ENTRY
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {!(isEditMode && formData ? formData.items : vendor?.items)?.length && (
                                    <div className="text-center py-20 bg-slate-50 dark:bg-slate-800 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
                                        <Package size={40} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Zero Inventory Detected</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Terminate Merchant"
                message="Are you absolutely sure? This operation will permanently remove the merchant and all associated data."
                confirmText="TERMINATE NOW"
            />
        </div>
    );
};

export default VendorDetail;
