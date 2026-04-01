import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ArrowLeft, Search, ShoppingCart, Plus, Minus, ArrowRight } from 'lucide-react';
import { Button, Badge } from '../../components/common';
import { vendorService } from '../../services/vendorService';
import { motion, AnimatePresence } from 'framer-motion';

const ProductCard = ({ product, index, cart, addToCart, removeFromCart }) => {
    const [imageError, setImageError] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02 }}
            className="group flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-50 dark:border-slate-800 overflow-hidden hover:border-primary-800 transition-all hover:shadow-2xl hover:shadow-primary-800/10 max-w-md mx-auto sm:max-w-none w-full"
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-50 dark:bg-slate-800">
                {imageError ? (
                    <div className="w-full h-full flex items-center justify-center bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400 text-6xl font-black uppercase">
                        {product.name[0]}
                    </div>
                ) : (
                    <img
                        src={product.image}
                        alt={product.name}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                )}
                <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-white border-none px-3 py-1 text-[8px] font-black uppercase tracking-widest shadow-sm">
                        {product.category}
                    </Badge>
                </div>
            </div>
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-black text-slate-800 dark:text-white text-base leading-tight uppercase tracking-tight line-clamp-2 h-10 mb-2">{product.name}</h3>
                <div className="mt-auto pt-4 flex items-end justify-between gap-2">
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Price</p>
                        <p className="text-2xl font-black text-primary-800 dark:text-primary-400 leading-none flex items-baseline gap-1">₹{product.price}{product.unit && <span className="text-[10px] opacity-60 font-bold uppercase tracking-widest">/ {product.unit}</span>}</p>
                    </div>
                    <div className="shrink-0">
                        {cart[product.id]?.quantity ? (
                            <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-2xl p-1 gap-1 border border-slate-100 dark:border-slate-700 shadow-inner">
                                <button onClick={() => removeFromCart(product.id)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 text-slate-400 hover:text-red-500 rounded-xl shadow-sm hover:scale-105 transition-all">
                                    <Minus size={14} strokeWidth={3} />
                                </button>
                                <span className="w-8 text-center text-sm font-black text-slate-900 dark:text-white">{cart[product.id].quantity}</span>
                                <button onClick={() => addToCart(product)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 text-primary-800 dark:text-white rounded-xl shadow-sm hover:scale-105 transition-all">
                                    <Plus size={14} strokeWidth={3} />
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => addToCart(product)} className="h-12 px-6 bg-primary-800 text-white rounded-2xl font-black shadow-lg hover:bg-primary-900 active:scale-95 transition-all text-[10px] uppercase tracking-widest flex items-center gap-2">
                                <Plus size={14} strokeWidth={3} /> ADD
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const AllProducts = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [shop, setShop] = useState(() => {
        const savedShop = localStorage.getItem('bd_last_shop');
        return savedShop ? JSON.parse(savedShop) : null;
    });
    const [allProducts, setAllProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { cart, addToCart: contextAddToCart, removeFromCart: contextRemoveFromCart, cartTotal, itemCount } = useCart();

    useEffect(() => {
        const fetchShopDetails = async () => {
            const data = await vendorService.getVendorById(id);
            if (data) {
                setShop(data);
                // Map vendor items into the product format expected by the UI
                const mappedProducts = (data.items || []).map((item, index) => ({
                    id: `${data._id}-item-${index}`,
                    name: item.name,
                    price: item.price,
                    image: item.image || data.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
                    category: data.category,
                    shopId: data._id,
                    unit: item.unit
                }));
                setAllProducts(mappedProducts);
                localStorage.setItem('bd_last_shop', JSON.stringify(data));
            }
        };

        if (id) {
            fetchShopDetails();
        }
    }, [id]);

    const addToCart = (product) => {
        contextAddToCart(product, shop);
    };

    const removeFromCart = (productId) => {
        contextRemoveFromCart(productId, id);
    };

    const shopCartItems = id && cart[id] ? cart[id].items : {};
    const filteredProducts = allProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!shop) return <div className="p-10 text-center font-black text-slate-400 uppercase tracking-widest">Loading bazaar...</div>;

    return (
        <div className="w-full space-y-12 animate-fade-in relative pb-32">
            {/* Header / Back */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 border-slate-50 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-primary-800 hover:text-white transition-all shadow-sm active:scale-90"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-primary-50 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400 border-none font-black px-2 py-0.5 text-[8px] uppercase tracking-[0.2em]">{shop.category}</Badge>
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                            All Products <span className="text-primary-800">@{shop.storeName || shop.name}</span>
                        </h1>
                    </div>
                </div>

                <div className="relative group min-w-[300px]">
                    <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-800 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2rem] text-sm font-black text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary-800 transition-all shadow-inner"
                    />
                </div>
            </header>

            {/* Grid */}
            <div className="space-y-8">
                <div className="flex items-center justify-between px-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Showing {filteredProducts.length} Results</p>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 mx-8"></div>
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4">
                        {filteredProducts.map((product, index) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                index={index}
                                cart={shopCartItems}
                                addToCart={addToCart}
                                removeFromCart={removeFromCart}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <p className="font-black text-slate-400 uppercase tracking-widest">No products found for your search.</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default AllProducts;
