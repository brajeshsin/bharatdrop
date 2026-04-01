import React from 'react';
import { motion } from 'framer-motion';

const AdBanner = ({ ads }) => {
    if (!ads || ads.length === 0) return null;

    return (
        <div className="relative w-full h-[200px] lg:h-[400px] overflow-hidden rounded-[2rem] shadow-2xl">
            <div className="absolute inset-0 flex transition-transform duration-500">
                {ads.map((ad, index) => (
                    <motion.div
                        key={ad._id || index}
                        className="min-w-full h-full relative"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <img
                            src={ad.imageUrl}
                            alt={ad.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 lg:p-16">
                            <h2 className="text-3xl lg:text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">
                                {ad.title}
                            </h2>
                            {ad.link && (
                                <a
                                    href={ad.link}
                                    className="inline-block w-fit bg-secondary text-black font-black px-8 py-3 rounded-xl text-sm uppercase tracking-widest hover:scale-105 transition-transform"
                                >
                                    Explore Now
                                </a>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Dots for pagination if multiple ads */}
            {ads.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {ads.map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-secondary' : 'bg-white/30'}`}></div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdBanner;
