import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button, Input, Select, cn } from '../../components/common';
import { adminService } from '../../services/adminService';
import {
    ArrowLeft, Store, MapPin, Phone,
    Plus, X, Package, PackageX,
    ShieldCheck, LayoutGrid
} from 'lucide-react';
import { useLoading } from '../../context/LoadingContext';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const UNIT_PRESETS = ['KG', 'LITRE', 'HALF PLATE', 'FULL PLATE', '100GM', '250GM', '500GM', 'PIECE', 'PACKET'];
const CATEGORIES = ['Sweets & Snacks', 'Fruits & Veg', 'Grocery', 'Restaurant', 'Pharmacy', 'Meat', 'Dhaba', 'Fast Food', 'Dairy'];

const AddVendor = () => {
    const navigate = useNavigate();
    const { setIsLoading } = useLoading();

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

    const handleAddItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [{ name: '', price: '', image: '', stock: 99, isOutOfStock: false, unit: 'KG', isNew: true }, ...prev.items]
        }));
        toast.success("Item slot added at top");
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.storeName || !formData.phone || !formData.town) {
            toast.error("Please fill all mandatory fields");
            return;
        }

        setIsLoading(true);
        try {
            const result = await adminService.createVendor(formData);
            if (result.success) {
                toast.success('Merchant Onboarded Successfully');
                navigate('/admin/vendors');
            } else {
                toast.error(result.message || "Onboarding failed");
            }
        } catch (error) {
            toast.error('Network error. Check connection.');
            console.error("Create vendor error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 animate-fade-in">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-10 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/admin/vendors')}
                        type="button"
                        className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-primary-600 transition-all shadow-sm active:scale-90 border-none outline-none"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">New Merchant Onboarding</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 italic shadow-primary-500/10 text-left">Registration Registry Entry</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="primary" className="px-4 py-2 bg-primary-600 text-white font-black text-[10px] tracking-widest rounded-xl shadow-lg shadow-primary-900/20">
                        PENDING VERIFICATION
                    </Badge>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Left Column: Profile Details */}
                <div className="xl:col-span-2 space-y-10">
                    <Card className="p-10 bg-white dark:bg-slate-900 border-none shadow-2xl rounded-[3rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
                                <LayoutGrid size={24} />
                            </div>
                            <div>
                                <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1 text-left">Merchant Profile</h3>
                                <p className="text-[9px] font-black text-primary-600 uppercase tracking-widest leading-none text-left">Primary Identity Data</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <Input
                                    label="OWNER FULL NAME"
                                    placeholder="Enter full legal name"
                                    className="h-14 font-black text-sm rounded-2xl border-2"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <Input
                                    label="BUSINESS ENTITY NAME"
                                    placeholder="Store/Shop name"
                                    className="h-14 font-black text-sm rounded-2xl border-2"
                                    value={formData.storeName}
                                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                                    required
                                />
                                <Input
                                    label="SECURE CONTACT"
                                    placeholder="10 digit phone number"
                                    className="h-14 font-black text-sm rounded-2xl border-2"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2 px-1 text-left">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none block mb-1">MARKET CATEGORY</label>
                                    <Select
                                        label="Market Category"
                                        options={CATEGORIES}
                                        value={formData.category}
                                        onChange={(val) => setFormData({ ...formData, category: val })}
                                        size="lg"
                                    />
                                </div>
                                <Input
                                    label="TOWN / VILLAGE"
                                    placeholder="Operational location"
                                    className="h-14 font-black text-sm rounded-2xl border-2"
                                    value={formData.town}
                                    onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                                    required
                                />
                                <Input
                                    label="BRAND ASSET (IMAGE URL)"
                                    placeholder="https://..."
                                    className="h-14 font-black text-sm rounded-2xl border-2"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Inventory Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 border-2 border-slate-50 dark:border-slate-800 shadow-2xl relative">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 text-left">Initial Inventory</h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none text-left">Onboard items with pricing and units</p>
                            </div>
                            <Button
                                type="button"
                                onClick={handleAddItem}
                                className="h-14 w-14 p-0 rounded-2xl bg-slate-950 text-white hover:bg-slate-800 shadow-xl active:scale-90 flex items-center justify-center transition-all"
                            >
                                <Plus size={24} strokeWidth={3} />
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {formData.items.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="relative p-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-[3rem] border-2 border-transparent hover:border-primary-500/20 group transition-all"
                                >
                                    <div className="absolute -top-3 -left-3 px-5 py-2 bg-primary-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl z-10">
                                        NEW SLOT
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                        <div className="lg:col-span-2 space-y-4">
                                            <div className="space-y-1.5 px-1 text-left">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none block">Product Name</label>
                                                <Input
                                                    placeholder="e.g. Regular Thali"
                                                    className="h-14 text-sm font-black uppercase rounded-2xl"
                                                    value={item.name}
                                                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5 px-1 text-left">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none block">Price (₹)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">₹</span>
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            className="h-14 pl-10 text-sm font-black rounded-2xl"
                                                            value={item.price}
                                                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5 px-1 text-left">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none block mb-1">Unit Type</label>
                                                    <Select
                                                        options={UNIT_PRESETS}
                                                        value={item.unit}
                                                        onChange={(val) => handleItemChange(index, 'unit', val)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="lg:col-span-1 space-y-4 pt-1 text-left">
                                            <div className="space-y-1.5 px-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none block">Visual (URL)</label>
                                                <Input
                                                    placeholder="https://..."
                                                    className="h-14 text-[10px] font-black rounded-2xl bg-white dark:bg-slate-900"
                                                    value={item.image}
                                                    onChange={(e) => handleItemChange(index, 'image', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="lg:col-span-1 flex items-end justify-center pb-1">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                className="w-full h-14 rounded-2xl bg-red-50 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm border-none outline-none cursor-pointer"
                                            >
                                                REMOVE SLOT
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {formData.items.length === 0 && (
                                <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-800/30 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
                                    <Package size={40} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Add initial items to start catalog</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Summary & Actions */}
                <div className="space-y-8">
                    <Card className="p-8 bg-slate-950 text-white rounded-[3rem] shadow-2xl relative overflow-hidden border-none text-left">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary-600/20 rounded-full translate-y-1/2 translate-x-1/2 blur-2xl" />

                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8">Onboarding Summary</h3>

                        <div className="space-y-6">
                            <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Slots</p>
                                <p className="text-2xl font-black italic">{formData.items.length}</p>
                            </div>
                            <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Status</p>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] italic">READY TO SYNC</p>
                            </div>
                        </div>

                        <div className="mt-12 space-y-4">
                            <Button
                                type="submit"
                                className="w-full h-16 bg-white text-slate-950 hover:bg-primary-50 rounded-2xl shadow-xl shadow-white/5 font-black text-xs tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2"
                            >
                                <ShieldCheck size={20} /> ONBOARD MERCHANT
                            </Button>
                            <button
                                type="button"
                                onClick={() => navigate('/admin/vendors')}
                                className="w-full h-16 bg-transparent border-2 border-slate-800 text-slate-400 hover:text-white rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase transition-all cursor-pointer outline-none"
                            >
                                ABANDON PROCESS
                            </button>
                        </div>
                    </Card>

                    <Card className="p-8 bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl border-none">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 text-left">Visual Preview</h3>
                        <div className="aspect-square bg-slate-50 dark:bg-slate-800 rounded-3xl overflow-hidden relative group">
                            {formData.image ? (
                                <img src={formData.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Preview" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-200 dark:text-slate-700">
                                    <Store size={64} strokeWidth={1} />
                                    <p className="text-[8px] font-black uppercase tracking-widest mt-4">Asset Preview Unavailable</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </form>
        </div>
    );
};

export default AddVendor;
