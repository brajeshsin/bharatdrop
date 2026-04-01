import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, MoreVertical } from 'lucide-react';
import { Card, Button, Input, Badge } from '../../components/common';
import { PRODUCTS } from '../../services/mockData';
import { motion } from 'framer-motion';

const ProductManagement = () => {
    // Mock products for Shop ID 1
    const [myProducts, setMyProducts] = useState(PRODUCTS.filter(p => p.shopId === 1));
    const [searchTerm, setSearchTerm] = useState("");

    const filteredProducts = myProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Product Management</h1>
                    <p className="text-slate-500 font-medium">Manage your shop's inventory and pricing</p>
                </div>
                <Button className="flex items-center gap-2 px-6">
                    <Plus size={20} /> Add New Product
                </Button>
            </div>

            {/* toolbar */}
            <Card className="p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="secondary" className="flex-1 md:flex-none flex items-center gap-2">
                        <Filter size={18} /> Filter
                    </Button>
                    <Badge variant="info" className="flex items-center px-4">Total: {myProducts.length}</Badge>
                </div>
            </Card>

            {/* Product Table/Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, i) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Card className="group overflow-hidden border-slate-100 hover:border-primary-200 transition-all shadow-sm hover:shadow-xl">
                            <div className="relative h-48">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-3 right-3 flex gap-1">
                                    <button className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-slate-600 hover:text-primary-600 shadow-sm transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-slate-600 hover:text-red-600 shadow-sm transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{product.name}</h3>
                                    <Badge variant="success">In Stock</Badge>
                                </div>
                                <p className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-widest">{product.category}</p>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <span className="text-2xl font-black text-slate-900">₹{product.price}</span>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <span className="text-xs font-bold uppercase">Stock:</span>
                                        <span className="font-black text-slate-700">45</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ProductManagement;
