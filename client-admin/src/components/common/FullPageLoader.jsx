import React from 'react';

const FullPageLoader = ({ message = 'INITIALIZING BHARATDROP...' }) => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
            <div className="flex flex-col items-center gap-6 p-10 rounded-3xl bg-slate-900/50 border border-white/5 shadow-2xl">
                {/* Animated Rings */}
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-primary-500/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-primary-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-4 border-indigo-500/10 rounded-full"></div>
                    <div className="absolute inset-2 border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>

                    {/* Central Pulsing Dot */}
                    <div className="absolute inset-[30px] bg-primary-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                </div>

                {/* Text with Shimmer Effect */}
                <div className="flex flex-col items-center gap-2">
                    <p className="font-black text-[10px] text-slate-400 uppercase tracking-[0.4em] animate-pulse">
                        {message}
                    </p>
                    <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-primary-500 to-transparent"></div>
                </div>
            </div>
        </div>
    );
};

export default FullPageLoader;
