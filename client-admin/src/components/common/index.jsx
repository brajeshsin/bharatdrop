import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-xl', showClose = true, className }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm cursor-pointer"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className={cn(
                            "relative bg-white dark:bg-slate-900 w-full rounded-[2.5rem] shadow-2xl p-10 max-h-[90vh] overflow-y-auto border dark:border-slate-800 no-scrollbar custom-gpu-accelerate",
                            maxWidth,
                            className
                        )}
                    >
                        {(title || showClose) && (
                            <div className="flex items-center justify-between mb-8">
                                {title && <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">{title}</h2>}
                                {showClose && (
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                    >
                                        <X size={24} />
                                    </button>
                                )}
                            </div>
                        )}
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'DELETE', cancelText = 'CANCEL', variant = 'danger' }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" showClose={false}>
            <div className="text-center space-y-6 pt-2">
                <div className={cn(
                    "w-20 h-20 mx-auto rounded-[2rem] flex items-center justify-center shadow-lg",
                    variant === 'danger' ? "bg-red-50 text-red-500 shadow-red-500/10" : "bg-amber-50 text-amber-500 shadow-amber-500/10"
                )}>
                    <AlertTriangle size={40} />
                </div>

                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{title}</h3>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wide leading-relaxed uppercase italic">
                        {message}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                    <Button variant="outline" className="py-4 font-black tracking-widest text-[10px] bg-slate-50 border-none hover:bg-slate-100" onClick={onClose}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        className={cn(
                            "py-4 font-black tracking-widest text-[10px] rounded-2xl shadow-xl",
                            variant === 'danger' ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" : "bg-primary-600 hover:bg-primary-700 shadow-primary-600/20"
                        )}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Eye, EyeOff } from 'lucide-react';

export const cn = (...inputs) => {
    return twMerge(clsx(inputs));
};

export const Button = ({ className, variant = 'primary', size = 'md', children, ...props }) => {
    const variants = {
        primary: 'bg-primary-800 text-white hover:bg-primary-900 shadow-sm active:scale-95',
        secondary: 'bg-secondary text-text-base hover:bg-[#e6c75c] shadow-sm active:scale-95',
        outline: 'bg-transparent text-primary-800 border-2 border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-900/10 dark:text-primary-400 dark:border-primary-400',
        ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
        danger: 'bg-red-600 text-white hover:bg-red-700',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-5 py-3 text-sm font-bold',
        lg: 'px-8 py-4 text-base font-bold',
    };

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center rounded-2xl transition-all focus:outline-none focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/20 disabled:opacity-50 disabled:pointer-events-none tracking-wide',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

export const Card = ({ className, children, ...props }) => (
    <div className={cn('bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-4', className)} {...props}>
        {children}
    </div>
);

export const Input = ({ className, label, error, type = 'text', ...props }) => {
    const [show, setShow] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className="w-full space-y-1.5 relative">
            {label && <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-widest">{label}</label>}
            <div className="relative">
                <input
                    type={isPassword ? (show ? 'text' : 'password') : type}
                    className={cn(
                        'w-full px-5 py-3.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-text-base dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/20 focus:border-primary-800 dark:focus:border-primary-600 transition-all text-lg font-black',
                        error && 'border-red-500 focus:ring-red-100',
                        isPassword && 'pr-14',
                        className
                    )}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShow(!show)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary-800 dark:hover:text-primary-400 transition-colors"
                    >
                        {show ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
            {error && <p className="text-xs text-red-500 ml-1 font-bold">{error}</p>}
        </div>
    );
};

export const Badge = ({ children, variant = 'default', className }) => {
    const variants = {
        default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        primary: 'bg-primary-800 text-white dark:bg-primary-900 dark:text-white',
        // New specific status variants
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        accepted: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return (
        <span className={cn('px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest', variants[variant], className)}>
            {children}
        </span>
    );
};
