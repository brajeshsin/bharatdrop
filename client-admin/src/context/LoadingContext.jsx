import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
            {children}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center backdrop-blur-md bg-white/30 dark:bg-slate-950/30 transition-all duration-500"
                    >
                        <div className="relative mb-8">
                            {/* Outer rotating ring */}
                            <div className="w-28 h-28 border-4 border-primary-100 dark:border-primary-900/30 border-t-primary-800 dark:border-t-primary-400 rounded-full animate-spin"></div>

                            {/* Inner pulsating logo icon */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center animate-pulse">
                                    <span className="text-primary-800 dark:text-primary-400 font-black text-3xl">B</span>
                                </div>
                            </div>
                        </div>

                        {/* Branded Text */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center"
                        >
                            <h2 className="text-4xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white">
                                Bharat<span className="text-primary-800 dark:text-primary-400">Drop</span>
                            </h2>
                            <div className="w-16 h-1.5 bg-primary-800 dark:bg-primary-400 rounded-full mt-3 animate-pulse"></div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-4">Local Commerce, Modern Tech</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </LoadingContext.Provider>
    );
};

export const useLoading = () => useContext(LoadingContext);
