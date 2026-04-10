import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, X, Upload, Save, Package, Tag, ArrowRight, MoreVertical, ShieldAlert } from 'lucide-react';
import { Card, Button, Input, Badge } from '../../components/common';
import { PRODUCTS, CATEGORIES } from '../../services/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { vendorService } from '../../services/vendorService';
import { toast } from 'react-hot-toast';

const ProductManagement = () => {
    const { user } = useAuth();
    const [myProducts, setMyProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isIdModalOpen, setIsIdModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.status === 'ACTIVE') {
                setLoading(true);
                const result = await vendorService.getMyProfile();
                if (result.success) {
                    setMyProducts(result.vendor.items || []);
                } else {
                    toast.error(result.message);
                }
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user?.status]);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: CATEGORIES[1],
        unit: 'KG',
        stock: '99',
        isOutOfStock: false,
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'
    });

    // Block access if pending
    if (user?.status === 'PENDING') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 uppercase tracking-tight">
                <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/20 rounded-[2.5rem] flex items-center justify-center text-primary-800 dark:text-primary-400 shadow-xl border-2 border-primary-100 dark:border-primary-800 animate-pulse">
                    <ShieldAlert size={48} />
                </div>
                <div className="space-y-4 max-w-lg">
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white leading-tight underline decoration-primary-500 decoration-8 underline-offset-8">Inventory Locked</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-lg leading-relaxed">
                        Your store <span className="text-primary-800 dark:text-primary-400 font-black">{user.storeName || 'My Store'}</span> is currently under verification.
                    </p>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">You will be able to manage your products once your account is approved.</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Status: Pending Admin Approval</p>
                </div>
            </div>
        );
    }

    const filteredProducts = myProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                price: product.price,
                category: product.category,
                unit: product.unit || 'KG',
                stock: product.stock || '99',
                isOutOfStock: product.isOutOfStock || false,
                image: product.image
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                price: '',
                category: CATEGORIES[1],
                unit: 'KG',
                stock: '99',
                isOutOfStock: false,
                image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'
            });
        }
        setIsIdModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.price) return;

        let updatedProducts;
        if (editingProduct) {
            updatedProducts = myProducts.map(p =>
                p.name === editingProduct.name ? { ...p, ...formData, price: Number(formData.price) } : p
            );
        } else {
            const newProduct = {
                ...formData,
                price: Number(formData.price),
                stock: Number(formData.stock),
                isOutOfStock: false
            };
            updatedProducts = [newProduct, ...myProducts];
        }

        const result = await vendorService.updateInventory(updatedProducts);
        if (result.success) {
            setMyProducts(updatedProducts);
            toast.success(editingProduct ? "Product updated" : "Product added");
            setIsIdModalOpen(false);
        } else {
            toast.error(result.message);
        }
    };

    const handleDelete = async (targetName) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            const updatedProducts = myProducts.filter(p => p.name !== targetName);
            const result = await vendorService.updateInventory(updatedProducts);
            if (result.success) {
                setMyProducts(updatedProducts);
                toast.success("Product deleted");
            } else {
                toast.error(result.message);
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20 uppercase tracking-tight">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary-800 dark:text-primary-400 font-black text-[10px] tracking-[0.3em] uppercase">
                        <Package size={12} /> Inventory Management
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white leading-none">Stock Control</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-widest leading-none mt-2">Manage your shop's items, pricing and availability</p>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-3 px-8 py-5 bg-primary-800 text-white rounded-[2rem] shadow-xl hover:shadow-primary-900/20 active:scale-95 transition-all text-xs font-black tracking-widest"
                >
                    <Plus size={20} strokeWidth={3} /> ADD NEW ITEM
                </Button>
            </div>

            {/* toolbar */}
            <Card className="p-2 flex flex-col md:flex-row gap-2 items-center bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[2.5rem] shadow-sm">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-800 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search your inventory..."
                        className="w-full pl-16 pr-6 py-5 bg-transparent rounded-[2rem] focus:outline-none text-sm font-black text-slate-800 dark:text-white placeholder:text-slate-400 transition-all uppercase tracking-widest"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto p-1">
                    <Button variant="outline" className="flex-1 md:flex-none flex items-center gap-2 rounded-2xl border-slate-100 dark:border-slate-800 text-slate-500 text-[10px]">
                        <Filter size={16} /> FILTERS
                    </Button>
                    <div className="px-6 flex items-center bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400 rounded-2xl text-[10px] font-black tracking-widest">
                        ITEMS: {myProducts.length}
                    </div>
                </div>
            </Card>

            {/* Product Table/Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                <AnimatePresence mode='popLayout'>
                    {loading ? (
                        [1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
                        ))
                    ) : filteredProducts.length === 0 ? (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                <Package size={40} />
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No products found</p>
                            <Button onClick={() => handleOpenModal()} variant="outline" className="text-[10px] rounded-xl px-6">ADD YOUR FIRST ITEM</Button>
                        </div>
                    ) : filteredProducts.map((product, i) => (
                        <motion.div
                            key={product.name}
                            layout
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                        >
                            <Card className="group overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 hover:border-primary-800 transition-all shadow-sm hover:shadow-xl rounded-3xl p-0 relative">
                                <div className="relative h-40 overflow-hidden bg-slate-100 dark:bg-slate-800">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                        <div className="flex gap-2 w-full">
                                            <Button onClick={() => handleOpenModal(product)} className="flex-1 bg-white text-slate-900 py-2 rounded-xl font-black text-[9px] tracking-widest">EDIT</Button>
                                            <Button onClick={() => handleDelete(product.name)} className="bg-red-600 text-white py-2 px-3 rounded-xl font-black text-[9px] tracking-widest"><Trash2 size={14} /></Button>
                                        </div>
                                    </div>
                                    <div className="absolute top-3 left-3">
                                        <Badge variant="primary" className="bg-primary-800 text-white border-none shadow-lg py-1 px-2 rounded-lg text-[8px]">{product.category}</Badge>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="mb-3">
                                        <h3 className="font-black text-slate-800 dark:text-white text-sm leading-tight uppercase tracking-tight line-clamp-1">{product.name}</h3>
                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{product.unit || 'Standard'}</p>
                                            <p className="text-base font-black text-primary-800 dark:text-primary-400 leading-none">₹{product.price}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${Number(product.stock || 45) > 10 ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
                                            <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{product.stock || '45'} IN STOCK</span>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); /* future menu */ }} className="text-slate-300 hover:text-primary-800 transition-colors">
                                            <MoreVertical size={14} />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isIdModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsIdModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden relative border-2 border-slate-50 dark:border-slate-800"
                        >
                            <div className="p-8 md:p-10">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-black text-slate-800 dark:text-white leading-none uppercase tracking-tighter">{editingProduct ? 'Edit Item' : 'New Item'}</h2>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Provide accurate details for your customers</p>
                                    </div>
                                    <button onClick={() => setIsIdModalOpen(false)} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 transition-all text-slate-400 hover:text-red-500">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    {/* Product Identity */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Product Identity</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Special Chicken Biryani"
                                            className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-800 rounded-[2rem] text-sm font-black text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all uppercase tracking-widest"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    {/* Pricing & Unit */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Pricing & Unit</label>
                                        <div className="flex gap-3">
                                            <div className="flex-1 relative group">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-800 dark:text-primary-400 font-black text-lg">₹</span>
                                                <input
                                                    type="number"
                                                    placeholder="0.00"
                                                    className="w-full pl-12 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-800 rounded-[2rem] text-sm font-black text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all tracking-widest"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex-1 relative group">
                                                <select
                                                    className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-800 rounded-[2rem] text-sm font-black text-slate-800 dark:text-white appearance-none focus:outline-none transition-all uppercase tracking-widest cursor-pointer"
                                                    value={formData.unit}
                                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                                >
                                                    {['KG', 'LITRE', 'HALF PLATE', 'FULL PLATE', '100GM', 'PIECE', 'PACKET'].map(u => (
                                                        <option key={u} value={u} className="bg-white dark:bg-slate-900">{u}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-primary-800 transition-colors">
                                                    <ArrowRight size={16} className="rotate-90" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visual URL */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Product Visual (URL)</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                placeholder="https://images.unsplash.com/..."
                                                className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-800 rounded-[2rem] text-sm font-black text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all tracking-widest"
                                                value={formData.image}
                                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Stock & Availability */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Stock Level</label>
                                            <input
                                                type="number"
                                                placeholder="99"
                                                className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-800 rounded-[2rem] text-sm font-black text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all tracking-widest"
                                                value={formData.stock}
                                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Availability</label>
                                            <Button
                                                onClick={() => setFormData({ ...formData, isOutOfStock: !formData.isOutOfStock })}
                                                className={`w-full py-5 rounded-[2rem] font-black text-[10px] tracking-[0.2em] transition-all border-2 ${!formData.isOutOfStock
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                                                        : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                                                    }`}
                                            >
                                                {!formData.isOutOfStock ? 'AVAILABLE' : 'OUT OF STOCK'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 flex gap-4">
                                    <Button
                                        onClick={() => setIsIdModalOpen(false)}
                                        variant="outline"
                                        className="flex-1 py-5 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 font-black tracking-widest text-xs"
                                    >
                                        CANCEL
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        className="flex-1 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] shadow-xl font-black tracking-widest text-xs flex items-center justify-center gap-2"
                                    >
                                        {editingProduct ? 'UPDATE' : 'SAVE ITEM'} <Save size={18} />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductManagement;
