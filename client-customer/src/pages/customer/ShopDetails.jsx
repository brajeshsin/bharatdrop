import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ArrowLeft, Star, Clock, Plus, Minus, ShoppingCart, Info, ArrowRight, Tag } from 'lucide-react';
import { Button, Badge } from '../../components/common';
import { vendorService } from '../../services/vendorService';
import { motion, AnimatePresence } from 'framer-motion';

const ProductCard = ({ product, index, cart, addToCart, removeFromCart }) => {
    const [imageError, setImageError] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-50 dark:border-slate-800 overflow-hidden hover:border-primary-800 transition-all hover:shadow-2xl hover:shadow-primary-800/10 max-w-md mx-auto sm:max-w-none w-full"
        >
            {/* Product Image Section */}
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

            {/* Product Info Section */}
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-black text-slate-800 dark:text-white text-base leading-tight uppercase tracking-tight line-clamp-2 h-10 mb-2">
                    {product.name}
                </h3>

                <div className="mt-auto pt-4 flex items-end justify-between gap-2">
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Price</p>
                        <p className="text-2xl font-black text-primary-800 dark:text-primary-400 leading-none flex items-baseline gap-1">₹{product.price}{product.unit && <span className="text-[10px] opacity-60 font-bold uppercase tracking-widest">/ {product.unit}</span>}</p>
                    </div>

                    <div className="shrink-0">
                        {cart[product.id]?.quantity ? (
                            <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-2xl p-1 gap-1 border border-slate-100 dark:border-slate-700 shadow-inner">
                                <button
                                    onClick={() => removeFromCart(product.id)}
                                    className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 text-slate-400 hover:text-red-500 rounded-xl shadow-sm hover:scale-105 active:scale-90 transition-all"
                                >
                                    <Minus size={14} strokeWidth={3} />
                                </button>
                                <span className="w-8 text-center text-sm font-black text-slate-900 dark:text-white">{cart[product.id].quantity}</span>
                                <button
                                    onClick={() => addToCart(product)}
                                    className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 text-primary-800 dark:text-white rounded-xl shadow-sm hover:scale-105 active:scale-90 transition-all font-black"
                                >
                                    <Plus size={14} strokeWidth={3} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => addToCart(product)}
                                className="h-12 px-6 bg-primary-800 text-white rounded-2xl font-black shadow-lg shadow-primary-800/10 hover:bg-primary-900 active:scale-95 transition-all text-[10px] uppercase tracking-widest flex items-center gap-2"
                            >
                                <Plus size={14} strokeWidth={3} /> ADD
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const ShopDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [shop, setShop] = useState(null);
    const [shopProducts, setShopProducts] = useState([]);
    const { cart, addToCart: contextAddToCart, removeFromCart: contextRemoveFromCart, cartTotal, itemCount } = useCart();

    // Fetch real vendor data from API
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
                setShopProducts(mappedProducts);
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

    const shopId = id; // use the URL param id directly as it matches the database _id
    const shopCartItems = shop && cart[shopId] ? cart[shopId].items : {};

    if (!shop) return <div className="p-10 text-center font-black text-slate-400">Loading shop...</div>;

    return (
        <div className="w-full space-y-16 animate-fade-in relative pb-12">
            {/* Detail info */}
            <section className="bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row gap-6 items-center">
                <div className="w-32 h-32 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white dark:border-slate-800">
                    <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-center md:text-left space-y-3">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <Badge className="bg-secondary text-primary-900 border-none font-black px-3 py-1 text-[10px] uppercase tracking-widest leading-none">Verified Partner</Badge>
                        <div className="flex items-center gap-1 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded-lg text-primary-800 dark:text-primary-400 font-black text-[10px]">
                            <Star size={12} fill="currentColor" /> {shop.rating}
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{shop.name}</h2>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-slate-400 font-bold text-xs uppercase tracking-widest">
                        <div className="flex items-center gap-1.5"><Clock size={14} className="text-primary-800" /> {shop.time}</div>
                        <div className="flex items-center gap-1.5"><Tag size={14} className="text-primary-800" /> Min. ₹99</div>
                    </div>
                </div>
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <Info size={20} className="text-primary-800 shrink-0" />
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wide max-w-[150px]">
                        Standard village delivery fee <span className="text-primary-800">₹20</span> applies.
                    </p>
                </div>
            </section>

            {/* Menu Items */}
            <div className="space-y-10">
                <div className="flex items-center justify-between px-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Available Today</h2>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Fresh picks for you</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4">
                    {shopProducts.slice(0, 12).map((product, index) => (
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

                <div className="flex justify-end pt-8 px-4">
                    <Button
                        onClick={() => navigate(`/home/shop/${id}/products`)}
                        className="group bg-white dark:bg-slate-800 text-primary-800 dark:text-primary-400 border-2 border-slate-100 dark:border-slate-800 hover:border-primary-800 rounded-[2rem] px-12 py-5 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all hover:shadow-xl active:scale-95 shadow-lg shadow-slate-200/50 dark:shadow-none"
                    >
                        See All
                        <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center group-hover:bg-primary-800 group-hover:text-white transition-all">
                            <ArrowRight size={16} strokeWidth={3} />
                        </div>
                    </Button>
                </div>
            </div>

        </div>
    );
};

export default ShopDetails;
