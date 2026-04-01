import React from 'react';
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
    const [show, setShow] = React.useState(false);
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
    };
    return (
        <span className={cn('px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest', variants[variant], className)}>
            {children}
        </span>
    );
};
