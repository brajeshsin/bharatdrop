import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Card, Button, Badge } from '../../components/common';
import { Save, Plus, Trash2, Image as ImageIcon, Layout, Clock, Type, AlignLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const HeroSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        images: [''],
        title: '',
        subtitle: '',
        description: '',
        deliveryDuration: '',
        isActive: true
    });

    useEffect(() => {
        fetchHeroContent();
    }, []);

    const fetchHeroContent = async () => {
        setLoading(true);
        try {
            const res = await adminService.getHeroContent();
            if (res.success) {
                setFormData(res.data);
            }
        } catch (error) {
            toast.error('Failed to fetch hero settings');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (index, value) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const addImageField = () => {
        setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
    };

    const removeImageField = (index) => {
        if (formData.images.length === 1) {
            toast.error('At least one image is required');
            return;
        }
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await adminService.updateHeroContent(formData);
            if (res.success) {
                toast.success('Hero settings updated successfully');
                setFormData(res.data);
            } else {
                toast.error(res.message || 'Update failed');
            }
        } catch (error) {
            toast.error('Connection error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-primary-100 border-t-primary-800 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Hero Section Settings</h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">Manage your customer-facing hero banner</p>
                </div>
                <Button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="bg-primary-800 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-2 shadow-xl hover:bg-primary-900 transition-all border-none"
                >
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                    {saving ? 'SAVING...' : 'SAVE CHANGES'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Text Content */}
                <Card className="lg:col-span-2 p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-800">
                            <Type size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Main Content</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hero Title</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:border-primary-800 outline-none transition-all"
                                placeholder="Enter hero title..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hero Subtitle</label>
                            <input
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:border-primary-800 outline-none transition-all"
                                placeholder="Enter hero subtitle..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hero Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:border-primary-800 outline-none transition-all resize-none"
                                placeholder="Enter hero description..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Delivery Duration Label</label>
                            <div className="relative">
                                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    name="deliveryDuration"
                                    value={formData.deliveryDuration}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-5 py-4 font-bold text-slate-800 focus:border-primary-800 outline-none transition-all"
                                    placeholder="e.g. 30 Mins"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Hero Images */}
                <div className="space-y-8">
                    <Card className="p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                                    <ImageIcon size={20} />
                                </div>
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Hero Images</h2>
                            </div>
                            <Button
                                onClick={addImageField}
                                className="w-10 h-10 p-0 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 border-none transition-all"
                            >
                                <Plus size={18} />
                            </Button>
                        </div>

                        <p className="text-xs font-bold text-slate-400 italic">Add Unsplash or direct image URLs to show in the hero carousel.</p>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {formData.images.map((img, index) => (
                                <div key={index} className="space-y-2 animate-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Image #{index + 1}</label>
                                        <button
                                            onClick={() => removeImageField(index)}
                                            className="text-red-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="relative group">
                                        <input
                                            value={img}
                                            onChange={(e) => handleImageChange(index, e.target.value)}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:border-primary-800 outline-none transition-all pr-12"
                                            placeholder="https://images.unsplash.com/..."
                                        />
                                        {img && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg overflow-hidden border border-slate-200">
                                                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Preview (Small) */}
                    {formData.images[0] && (
                        <div className="relative rounded-[2rem] overflow-hidden aspect-video shadow-2xl border-4 border-white group">
                            <img src={formData.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Hero Preview" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                                <h4 className="text-white font-black text-lg uppercase leading-none truncate">{formData.title || 'Enter Title'}</h4>
                                <p className="text-white/70 font-bold text-[10px] uppercase tracking-widest mt-1">{formData.deliveryDuration || 'Delivery Time'}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HeroSettings;
