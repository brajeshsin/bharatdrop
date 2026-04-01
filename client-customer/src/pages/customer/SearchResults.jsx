import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/common';
import { Search, Store, Package, ChevronRight, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { vendorService } from '../../services/vendorService';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q') || '';

    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllVendors = async () => {
            setLoading(true);
            const data = await vendorService.getVendors();
            setVendors(data);
            setLoading(false);
        };
        fetchAllVendors();
    }, []);

    const results = useMemo(() => {
        if (!query.trim() || vendors.length === 0) return { shops: [], products: [] };

        const lowerQuery = query.toLowerCase();

        const filteredShops = vendors.filter(s =>
            (s.storeName || s.name).toLowerCase().includes(lowerQuery) ||
            s.category.toLowerCase().includes(lowerQuery) ||
            s.town.toLowerCase().includes(lowerQuery)
        );

        const filteredProducts = [];
        vendors.forEach(shop => {
            if (shop.items && Array.isArray(shop.items)) {
                shop.items.forEach((item, index) => {
                    if (item.name.toLowerCase().includes(lowerQuery)) {
                        filteredProducts.push({
                            id: `${shop._id}-item-${index}`,
                            name: item.name,
                            price: item.price,
                            category: shop.category,
                            image: item.image || shop.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
                            shopId: shop._id,
                            shopName: shop.storeName || shop.name,
                            unit: item.unit
                        });
                    }
                });
            }
        });

        return { shops: filteredShops, products: filteredProducts };
    }, [query, vendors]);

    if (!query) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-200">
                    <Search size={48} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Search BharatDrop</h2>
                <p className="text-slate-400 font-bold max-w-sm uppercase text-[10px] tracking-widest leading-loose">Enter a search term in the header to find shops and products near you.</p>
            </div>
        );
    }

    if (loading) {
        return <div className="p-20 text-center font-black text-slate-400 uppercase tracking-widest animate-pulse">Searching Bazaar...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-32 animate-fade-in px-4">
            {/* Header */}
            <div className="pt-10 space-y-3">
                <div className="flex items-center gap-3 text-[10px] font-black text-primary-800 dark:text-primary-400 uppercase tracking-[0.3em] leading-none">
                    <Search size={14} /> Global Discovery
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none flex flex-wrap items-end gap-x-4">
                    SEARCH RESULTS <span className="text-primary-800 dark:text-primary-400 opacity-30 text-2xl md:text-3xl">/</span>
                    <span className="text-primary-800 dark:text-primary-200 uppercase truncate">"{query}"</span>
                </h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Found {results.shops.length} shops and {results.products.length} products
                </p>
            </div>

            {results.shops.length === 0 && results.products.length === 0 ? (
                <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-50 dark:border-slate-800 shadow-sm space-y-8">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-200">
                        <ShoppingBag size={40} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">No results matched</h3>
                        <p className="text-xs font-bold text-slate-400 max-w-xs mx-auto uppercase tracking-widest leading-loose">We couldn't find anything matching your search. Try adjusting your query.</p>
                    </div>
                    <Button
                        onClick={() => navigate('/home')}
                        className="bg-primary-800 text-white px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary-900/20 active:scale-95 transition-all"
                    >
                        Browse All Shops
                    </Button>
                </div>
            ) : (
                <>
                    {/* Shops Results */}
                    {results.shops.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.4em] flex items-center gap-3">
                                    <Store size={16} className="text-primary-800" /> Matching Shops
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {results.shops.map((shop, i) => (
                                    <motion.div
                                        key={shop._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <Card
                                            className="group relative bg-white dark:bg-slate-900 rounded-[1.5rem] border-2 border-slate-50 dark:border-slate-800 overflow-hidden hover:border-primary-800 transition-all hover:shadow-2xl hover:shadow-primary-800/10 cursor-pointer"
                                            onClick={() => navigate(`/home/shop/${shop._id}`)}
                                        >
                                            <div className="relative aspect-[4/3] overflow-hidden bg-slate-50 dark:bg-slate-800">
                                                <img src={shop.image} alt={shop.storeName || shop.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                <Badge className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white border-white/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                                    {shop.category}
                                                </Badge>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                <div>
                                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary-800 transition-colors">{shop.storeName || shop.name}</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Village Partner Hub • {shop.town}</p>
                                                </div>
                                                <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800">
                                                    <span className="text-[10px] font-black text-primary-800 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded-lg uppercase tracking-widest">25-30 MIN</span>
                                                    <div className="flex items-center gap-1 text-slate-900 dark:text-white font-black text-xs">
                                                        VIEW SHOP <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Products Results */}
                    {results.products.length > 0 && (
                        <div className="space-y-6 pt-6">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.4em] flex items-center gap-3">
                                    <Package size={16} className="text-primary-800" /> Catalog Matches
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {results.products.map((product, i) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 + 0.2 }}
                                    >
                                        <Card
                                            className="group p-4 bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 hover:border-primary-800 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all h-full flex flex-col cursor-pointer"
                                            onClick={() => navigate(`/home/shop/${product.shopId}`)}
                                        >
                                            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 mb-4 ring-1 ring-slate-100 dark:ring-slate-800 shadow-inner">
                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                                            </div>
                                            <div className="space-y-2 flex-grow">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight leading-tight group-hover:text-primary-800 transition-colors">{product.name}</h4>
                                                    <span className="text-sm font-black text-primary-800 whitespace-nowrap">₹{product.price}{product.unit && <span className="text-[10px] opacity-60 ml-1">/ {product.unit}</span>}</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.category} • {product.shopName}</p>
                                            </div>
                                            <Button
                                                className="mt-6 w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-xl"
                                            >
                                                VIEW IN SHOP <ArrowRight size={14} />
                                            </Button>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SearchResults;
