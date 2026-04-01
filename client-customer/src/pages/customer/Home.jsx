import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, MapPin, Clock, Star, ArrowRight, ShoppingBag,
    Zap, ShieldCheck, ChevronRight, LayoutGrid, Tag,
    Truck, Phone
} from 'lucide-react';
import { Card, Badge, Button, cn } from '../../components/common';
import { CATEGORIES, BANNERS } from '../../services/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import logisticsHero from '../../assets/logistics_hero.png';
import { getAds } from '../../services/adService';
import AdBanner from '../../components/common/AdBanner';
import { vendorService } from '../../services/vendorService';

const CategoryItem = ({ cat, i, selectedCategory, setSelectedCategory }) => {
    const [imageError, setImageError] = useState(false);
    return (
        <motion.button
            key={cat.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedCategory(cat.name)}
            className="group flex-shrink-0 flex flex-col items-center gap-3"
        >
            <div className={`w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-4 transition-all duration-300 ${selectedCategory === cat.name ? 'border-primary-800 scale-110 shadow-xl' : 'border-white dark:border-slate-800 shadow-sm hover:border-primary-200'}`}>
                {imageError ? (
                    <div className={cn("w-full h-full flex items-center justify-center text-3xl font-black uppercase", cat.color || "bg-slate-100 text-slate-400")}>
                        {cat.name[0]}
                    </div>
                ) : (
                    <img
                        src={cat.image}
                        alt={cat.name}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                )}
            </div>
            <span className={`text-xs md:text-sm font-black transition-colors ${selectedCategory === cat.name ? 'text-primary-800 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400 uppercase tracking-widest'}`}>
                {cat.name}
            </span>
        </motion.button>
    );
};

const BannerCard = ({ banner }) => {
    const [imageError, setImageError] = useState(false);
    return (
        <motion.div
            className={`relative w-full h-[300px] md:h-[350px] rounded-[3rem] overflow-hidden group shadow-xl border-2 border-white/5 ${banner.color}`}
        >
            {!imageError && (
                <div className="absolute inset-0">
                    <img
                        src={banner.image}
                        alt={banner.title}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover opacity-60 mix-blend-overlay group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
            )}
            <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-center max-w-xl space-y-4">
                <Badge className="bg-white/20 backdrop-blur-md text-white border-none font-black py-2 px-5 text-[8px] uppercase tracking-[0.3em] w-fit leading-none">Flash Deal</Badge>
                <h3 className="text-3xl md:text-3xl font-black text-white leading-none tracking-tight uppercase">{banner.title}</h3>
                <p className="text-white/90 font-black text-lg uppercase tracking-tighter">{banner.subtitle}</p>
                <Button className="mt-2 bg-white text-slate-900 border-none font-black py-3 px-8 rounded-2xl text-[9px] uppercase tracking-widest w-fit shadow-2xl hover:bg-slate-100 transition-all">Claim Now</Button>
            </div>
        </motion.div>
    );
};


const CustomerHome = () => {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [ads, setAds] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingVendors, setLoadingVendors] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAds = async () => {
            const data = await getAds();
            setAds(data);
        };
        const fetchCategories = async () => {
            const data = await vendorService.getCategories();
            if (data && data.length > 0) {
                setCategories(data);
            }
        };
        fetchAds();
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchVendors = async () => {
            setLoadingVendors(true);
            const data = await vendorService.getVendors({ category: selectedCategory });
            setVendors(data);
            setLoadingVendors(false);
        };
        fetchVendors();
    }, [selectedCategory]);

    const filteredShops = vendors.filter(shop => {
        const matchesSearch = shop.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shop.town.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="min-h-screen bg-transparent transition-colors duration-500 overflow-x-hidden">
            {/* Header is now provided by MainLayout */}

            <main className="w-full px-6 md:px-12 lg:px-16 space-y-20 py-24 md:py-32">

                {/* Hero Section */}
                <section className="relative rounded-[3rem] overflow-hidden bg-primary-900 group shadow-2xl shadow-primary-900/20">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-primary-900/80 to-transparent z-10"></div>
                    <motion.img
                        src="https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=1200"
                        alt="Village Delivery"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
                        animate={{
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <div className="relative z-20 p-8 md:p-16 space-y-6 max-w-2xl">
                        <Badge className="bg-secondary text-primary-900 border-none font-black py-2 px-4 text-xs uppercase tracking-widest leading-none">Hyperlocal Village Hub</Badge>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tight">
                            TOWN'S BEST BAZAAR <br />
                            <span className="text-secondary italic">AT YOUR DOORSTEP.</span>
                        </h1>
                        <p className="text-primary-100 font-bold text-lg md:text-xl max-w-lg leading-relaxed">
                            Order fresh groceries, medicines, and daily needs from town vendors directly to your village within 30 minutes.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Button className="py-4 px-8 text-lg font-black bg-white text-primary-900 border-none shadow-xl shadow-black/20 hover:bg-primary-800 hover:text-white transition-all">ORDER NOW</Button>
                            <div className="flex items-center gap-3 text-white font-black text-xs uppercase tracking-[0.2em] bg-black/20 backdrop-blur-md px-6 rounded-2xl">
                                <Zap className="text-secondary" size={18} fill="currentColor" /> Express Delivery
                            </div>
                        </div>
                    </div>
                </section>

                {/* Categories - Swiggy Style */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none">What's on your mind?</h2>
                        <button className="text-primary-800 dark:text-primary-400 font-black text-xs uppercase tracking-widest flex items-center gap-1 group">
                            Explore All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                    <div className="flex gap-6 md:gap-10 overflow-x-auto pb-4 pt-4 no-scrollbar">
                        {categories.map((cat, i) => (
                            <CategoryItem
                                key={cat.name}
                                cat={cat}
                                i={i}
                                selectedCategory={selectedCategory}
                                setSelectedCategory={setSelectedCategory}
                            />
                        ))}
                    </div>
                </section>

                {/* Shop Listings */}
                <section className="space-y-8 pb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none">Top Shops in Town</h2>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Verified Partners Serving Your Village</p>
                        </div>
                        <div className="flex gap-2">
                            {["Ratings 4.5+", "Under 20 Mins", "Hot Deals"].map(filter => (
                                <button key={filter} className="px-5 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary-800 transition-colors dark:text-white">
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        <AnimatePresence mode="popLayout">
                            {loadingVendors ? (
                                [1, 2, 4, 5].map(i => <div key={i} className="h-80 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse" />)
                            ) : filteredShops.map((shop, index) => (
                                <motion.div
                                    key={shop._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                >
                                    <div
                                        className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-50 dark:border-slate-800 hover:border-primary-800 dark:hover:border-primary-500 transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-2xl relative"
                                        onClick={() => navigate(`/home/shop/${shop._id}`)}
                                    >
                                        <div className="relative h-56">
                                            <img src={shop.image} alt={shop.storeName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                                                <div className="bg-secondary px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-black text-xs shadow-lg">
                                                    <Star size={14} fill="currentColor" className="text-primary-800" />
                                                    4.5
                                                </div>
                                            </div>

                                            <div className="absolute bottom-6 left-6 right-6">
                                                <Badge className="bg-white/95 dark:bg-primary-800 text-primary-900 dark:text-white border-none font-black px-4 py-1.5 text-xs uppercase tracking-widest backdrop-blur-sm mb-3 leading-none">
                                                    {shop.category}
                                                </Badge>
                                                <h3 className="text-2xl font-black text-white leading-tight uppercase tracking-tight group-hover:text-secondary transition-colors truncate">{shop.storeName}</h3>
                                                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-1 italic">{shop.town}</p>
                                            </div>
                                        </div>

                                        <div className="p-6 flex items-center justify-between border-t-2 border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                                            <div className="flex items-center gap-2">
                                                <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center text-primary-800 dark:text-primary-400 shadow-sm border border-primary-200/50">
                                                    <Clock size={16} strokeWidth={3} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Delivery</span>
                                                    <span className="text-sm font-black text-slate-800 dark:text-white uppercase leading-none mt-1 whitespace-nowrap">25-30 MIN</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary shadow-sm border border-secondary/20">
                                                    <Tag size={16} />
                                                </div>
                                                <div className="flex flex-col text-right">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Min Order</span>
                                                    <span className="text-sm font-black text-slate-800 dark:text-white uppercase leading-none mt-1">₹99</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </section>

                <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-16 border-2 border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50 dark:bg-primary-900/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                        <div className="space-y-8">
                            <div className="space-y-3 font-black">
                                <span className="text-primary-800 dark:text-primary-400 uppercase tracking-[0.3em] text-xs">How we operate</span>
                                <h2 className="text-4xl md:text-5xl text-slate-800 dark:text-white leading-[0.9] tracking-tighter uppercase">Town Freshness <br /><span className="text-primary-800 dark:text-primary-500">to Village Hubs.</span></h2>
                            </div>
                            <div className="space-y-6">
                                {[
                                    { icon: Truck, title: "Modern Logistics", desc: "Our partners use specialized routes to reach your village faster than anyone else." },
                                    { icon: ShieldCheck, title: "Owner Verified", desc: "Every shop on BharatDrop is physically verified by our local town agents." },
                                    { icon: Phone, title: "Local Support", desc: "Speak with our village coordinators anytime you need help with an order." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-12 h-12 bg-primary-800 text-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 flex-shrink-0">
                                            <item.icon size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">{item.title}</h4>
                                            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative p-6">
                            <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-[3rem] overflow-hidden border-8 border-white dark:border-slate-800 shadow-2xl rotate-3">
                                <img src={logisticsHero} className="w-full h-full object-cover" alt="Logistics" />
                            </div>
                            <div className="absolute -bottom-4 -left-4 bg-secondary p-6 rounded-3xl shadow-2xl -rotate-6 border-4 border-white dark:border-slate-900 max-w-[200px]">
                                <p className="text-primary-900 font-black text-xl leading-none tracking-tighter uppercase">50+ Villages <br /> <span className="text-xs tracking-widest font-bold uppercase">Connected</span></p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default CustomerHome;
