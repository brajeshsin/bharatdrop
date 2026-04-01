import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, MapPin, Phone, Shield, Bell, CreditCard, ChevronRight, Camera, Check, X } from 'lucide-react';
import { Button, Card, Badge, Input } from '../../components/common';

const CustomerProfile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || 'Member Name',
        email: user?.email || 'user@example.com',
        phone: '+91 999 888 7777',
        address: 'Rampur Village, Hub A'
    });

    const handleSave = () => {
        // Mock save logic
        setIsEditing(false);
    };

    const sections = [
        {
            title: "Account Settings",
            items: [
                { icon: User, label: "Personal Information", desc: "Change your name and avatar", path: "/profile/edit", value: formData.name, field: 'name' },
                { icon: Mail, label: "Email Address", desc: formData.email, path: "/profile/email", value: formData.email, field: 'email' },
                { icon: Phone, label: "Phone Number", desc: formData.phone, path: "/profile/phone", value: formData.phone, field: 'phone' }
            ]
        },
        {
            title: "Delivery & Security",
            items: [
                { icon: MapPin, label: "Saved Addresses", desc: formData.address, path: "/profile/addresses", value: formData.address, field: 'address' },
                { icon: Shield, label: "Privacy & Security", desc: "Password and data settings", path: "/profile/security" },
                { icon: Bell, label: "Notifications", desc: "App, SMS and Email alerts", path: "/profile/notifications" }
            ]
        },
        {
            title: "Payments & Orders",
            items: [
                { icon: CreditCard, label: "Payment Methods", desc: "UPI, Cards and Wallets", path: "/profile/payments" },
                { icon: Bell, label: "Order History", desc: "View and track your past orders", path: "/ordershistory" }
            ]
        }
    ];

    return (
        <div className="w-full space-y-12 pb-12 animate-fade-in relative">
            {/* Header / Hero */}
            <header className="relative py-12 px-8 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-50 dark:border-slate-800 shadow-sm overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 dark:bg-primary-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary-100 transition-colors duration-700"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar with Camera Overlay */}
                    <div className="relative group/avatar">
                        <div className="w-32 h-32 bg-primary-800 text-white rounded-[2.5rem] flex items-center justify-center text-4xl font-black shadow-2xl ring-4 ring-white dark:ring-slate-800 overflow-hidden transform group-hover/avatar:scale-105 transition-all duration-500">
                            {formData.name.charAt(0) || 'U'}
                        </div>
                        <button className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-xl hover:bg-primary-800 hover:text-white transition-all border-2 border-slate-50 dark:border-slate-800 opacity-0 group-hover/avatar:opacity-100 translate-y-2 group-hover/avatar:translate-y-0 active:scale-90">
                            <Camera size={18} />
                        </button>
                    </div>

                    <div className="text-center md:text-left space-y-2">
                        <Badge variant="success" className="mb-2">Verified Member</Badge>
                        {isEditing ? (
                            <div className="space-y-4 pt-4">
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter your name"
                                    className="max-w-md bg-white/50 border-primary-500"
                                />
                                <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                    <MapPin size={12} fill="currentColor" /> {formData.address}
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none">{formData.name}</h1>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center md:justify-start gap-2">
                                    <MapPin size={12} fill="currentColor" /> {formData.address}
                                </p>
                            </>
                        )}
                    </div>

                    <div className="flex-1 md:text-right w-full md:w-auto mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                        {isEditing ? (
                            <div className="flex gap-3 justify-end">
                                <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-xs font-black gap-2">
                                    <X size={16} /> CANCEL
                                </Button>
                                <Button onClick={handleSave} className="text-xs font-black gap-2 bg-emerald-600 hover:bg-emerald-700">
                                    <Check size={16} /> SAVE CHANGES
                                </Button>
                            </div>
                        ) : (
                            <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full md:w-auto text-xs font-black px-10">EDIT PROFILE</Button>
                        )}
                    </div>
                </div>
            </header>

            {/* Editing Form or Settings Sections */}
            {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Card className="p-8 space-y-6">
                        <h3 className="font-black text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-4">Contact Information</h3>
                        <Input
                            label="Email Address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <Input
                            label="Phone Number"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </Card>
                    <Card className="p-8 space-y-6">
                        <h3 className="font-black text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-4">Location Settings</h3>
                        <Input
                            label="Primary Village"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </Card>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {sections.map((section, sIdx) => (
                        <div key={sIdx} className="space-y-6">
                            <h2 className="text-lg font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-4">{section.title}</h2>
                            <div className="space-y-4">
                                {section.items.map((item, iIdx) => (
                                    <Card key={iIdx} className="hover:border-primary-800 hover:shadow-xl transition-all cursor-pointer group p-6 flex items-center justify-between gap-6 border-2 border-slate-50 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400 rounded-2xl flex items-center justify-center group-hover:bg-primary-800 group-hover:text-white transition-all shadow-inner">
                                                <item.icon size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-sm leading-none mb-1">{item.label}</h3>
                                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">{item.desc}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-300 dark:text-slate-700 group-hover:text-primary-800 group-hover:translate-x-1 transition-all" />
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Actions / Log Out */}
            <div className="pt-12 text-center md:text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-4">BharatDrop v1.0.2 Stable</p>
                <div className="flex flex-col md:flex-row gap-4 justify-end">
                    <Button variant="ghost" className="text-xs font-black text-slate-400 dark:text-slate-500 hover:text-primary-800">Terms of Service</Button>
                    <Button variant="ghost" className="text-xs font-black text-slate-400 dark:text-slate-500 hover:text-primary-800">Privacy Policy</Button>
                    <div className="w-full md:w-px h-px md:h-10 bg-slate-100 dark:bg-slate-800 mx-2"></div>
                    <Button variant="outline" className="text-xs font-black text-red-600 border-red-100 hover:bg-red-50 dark:hover:bg-red-900/10 dark:border-red-900/30">DEACTIVATE ACCOUNT</Button>
                </div>
            </div>
        </div>
    );
};

export default CustomerProfile;
