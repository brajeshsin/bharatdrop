import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { 
    MapPin, Package, Phone, CheckCircle2, Navigation, 
    CircleDot, AlertCircle, ShieldAlert, TrendingUp, 
    Clock, ShieldCheck, UserCheck, Award, ArrowRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const DeliveryDashboard = () => {
    const navigate = useNavigate();
    const { user, updateUserStatus, updateUserDocuments } = useAuth();
    const [isOnline, setIsOnline] = useState(user?.status === 'ACTIVE');
    const [earnings, setEarnings] = useState(450);
    const [ordersDone, setOrdersDone] = useState(8);

    // Document Form State
    const [dlNumber, setDlNumber] = useState('');
    const [aadhaarNumber, setAadhaarNumber] = useState('');
    const [dlImage, setDlImage] = useState('');
    const [aadhaarImage, setAadhaarImage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [validationError, setValidationError] = useState('');

    // Keep isOnline in sync if user status changes
    useEffect(() => {
        setIsOnline(user?.status === 'ACTIVE');
    }, [user?.status]);

    const activeDeliveries = [
        {
            id: '#DEL-502',
            shop: 'Gopal Grocery Store',
            customer: 'Brajesh Singh',
            phone: '9876543210',
            address: 'House No 45, Rampur',
            status: 'At Shop',
            items: 3,
            distance: '1.2 km',
            earnings: 50
        }
    ];

    // Handle Active Assignment Lifecycle
    const handleNextStep = (id) => {
        toast.success(
            activeDeliveries[0].status === 'At Shop' 
                ? 'Items picked up! Head to the delivery location.' 
                : 'Order delivered successfully!'
        );
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            if (type === 'DL') {
                setDlImage(reader.result);
                toast.success('Driving Licence image selected');
            } else {
                setAadhaarImage(reader.result);
                toast.success('Aadhaar card image selected');
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSubmitDocs = async (e) => {
        e.preventDefault();
        setValidationError('');

        if (!dlNumber.trim() || dlNumber.trim().length < 6) {
            setValidationError('Please enter a valid Driving Licence Number');
            return;
        }
        if (!aadhaarNumber.trim() || aadhaarNumber.trim().length !== 12 || !/^\d+$/.test(aadhaarNumber)) {
            setValidationError('Please enter a valid 12-digit Aadhaar Number');
            return;
        }
        if (!dlImage) {
            setValidationError('Please upload a photo of your Driving Licence');
            return;
        }
        if (!aadhaarImage) {
            setValidationError('Please upload a photo of your Aadhaar Card');
            return;
        }

        setIsUploading(true);
        const res = await updateUserDocuments({
            drivingLicenceNo: dlNumber,
            drivingLicenceImage: dlImage,
            aadhaarNo: aadhaarNumber,
            aadhaarImage: aadhaarImage
        });

        setIsUploading(false);
        if (res.success) {
            toast.success('Documents submitted successfully! Moving to compliance review.');
        } else {
            toast.error(res.message || 'Submission failed');
        }
    };

    // 1. Document Upload Screen
    if (!user?.drivingLicenceNo || !user?.aadhaarNo) {
        return (
            <div className="min-h-[85vh] flex items-center justify-center py-8 px-4 animate-fade-in uppercase tracking-tight">
                <div className="w-full max-w-lg space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-primary-800/10 dark:bg-primary-400/10 rounded-[2rem] flex items-center justify-center text-primary-800 dark:text-primary-400 mx-auto border border-primary-800/20 shadow-inner">
                            <ShieldCheck size={36} />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">Document Verification</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] sm:text-xs tracking-wider leading-relaxed">
                            Hello, <span className="text-primary-800 dark:text-primary-400 font-black">{user?.name}</span>! Upload your identity documents to activate your delivery account.
                        </p>
                    </div>

                    {/* Upload Form */}
                    <form onSubmit={handleSubmitDocs} className="space-y-6">
                        <Card className="p-6 sm:p-8 border-none bg-white dark:bg-slate-900 shadow-2xl rounded-[2.5rem] space-y-6">
                            {/* Driving Licence Segment */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Driving Licence Details</label>
                                <input
                                    type="text"
                                    placeholder="Enter DL Number (e.g., DL-1420110000000)"
                                    value={dlNumber}
                                    onChange={(e) => setDlNumber(e.target.value)}
                                    className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black text-sm uppercase tracking-wider outline-none focus:ring-2 ring-primary-500 transition-all placeholder:text-slate-400"
                                />
                                
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="dl-file-input"
                                        className="hidden"
                                        onChange={(e) => handleFileChange(e, 'DL')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('dl-file-input').click()}
                                        className="h-12 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-2xl flex items-center justify-center font-black text-[10px] tracking-widest text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 transition-all uppercase"
                                    >
                                        📷 Upload DL Photo
                                    </button>
                                    <div className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center overflow-hidden border border-slate-200/50 dark:border-slate-850">
                                        {dlImage ? (
                                            <img src={dlImage} alt="DL Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[8px] font-bold text-slate-400">No Photo Uploaded</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Aadhaar Card Segment */}
                            <div className="space-y-3 pt-4 border-t border-dashed border-slate-100 dark:border-slate-800">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Aadhaar Card Details</label>
                                <input
                                    type="text"
                                    placeholder="Enter 12-Digit Aadhaar Number"
                                    value={aadhaarNumber}
                                    onChange={(e) => setAadhaarNumber(e.target.value)}
                                    maxLength={12}
                                    className="w-full h-12 px-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black text-sm uppercase tracking-wider outline-none focus:ring-2 ring-primary-500 transition-all placeholder:text-slate-400"
                                />

                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="aadhaar-file-input"
                                        className="hidden"
                                        onChange={(e) => handleFileChange(e, 'Aadhaar')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('aadhaar-file-input').click()}
                                        className="h-12 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-2xl flex items-center justify-center font-black text-[10px] tracking-widest text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 transition-all uppercase"
                                    >
                                        📷 Upload Aadhaar
                                    </button>
                                    <div className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center overflow-hidden border border-slate-200/50 dark:border-slate-850">
                                        {aadhaarImage ? (
                                            <img src={aadhaarImage} alt="Aadhaar Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[8px] font-bold text-slate-400">No Photo Uploaded</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {validationError && (
                                <p className="text-red-500 font-black text-[9px] uppercase tracking-widest text-center">{validationError}</p>
                            )}

                            <Button
                                type="submit"
                                loading={isUploading}
                                className="w-full py-5 text-xs font-black tracking-widest uppercase rounded-2xl bg-primary-800 hover:bg-primary-900 shadow-xl shadow-primary-900/20"
                            >
                                Submit Identity Documents
                            </Button>
                        </Card>
                    </form>
                </div>
            </div>
        );
    }

    // 2. Onboarding Verification Pending Page
    if (user?.status === 'PENDING') {
        return (
            <div className="min-h-[80vh] flex items-center justify-center py-6 px-4 animate-fade-in">
                <div className="w-full max-w-xl space-y-6">
                    {/* Header Banner */}
                    <div className="text-center space-y-3">
                        <div className="relative inline-flex items-center justify-center">
                            <div className="w-20 h-20 bg-primary-800/10 dark:bg-primary-400/10 rounded-[2rem] flex items-center justify-center text-primary-800 dark:text-primary-400 border border-primary-800/20 dark:border-primary-400/20 shadow-inner">
                                <ShieldCheck size={40} className="animate-pulse" />
                            </div>
                            <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                            Verification Pending
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold max-w-md mx-auto text-[10px] sm:text-xs uppercase tracking-wider leading-relaxed">
                            Hello, <span className="text-primary-800 dark:text-primary-400 font-black">{user?.name || 'Partner'}</span>! Our verification team is currently reviewing your registration documents.
                        </p>
                    </div>

                    {/* Progress Checklist */}
                    <Card className="p-6 border-none bg-white dark:bg-slate-900 shadow-2xl rounded-[2.5rem] space-y-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-36 h-36 bg-primary-800/5 -mr-18 -mt-18 rounded-full"></div>
                        <h2 className="text-[10px] sm:text-xs font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] italic mb-4">Verification Tracker</h2>
                        
                        <div className="space-y-5 relative z-10">
                            {/* Step 1 */}
                            <div className="flex gap-3.5">
                                <div className="flex flex-col items-center">
                                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                                        <CheckCircle2 size={14} />
                                    </div>
                                    <div className="w-0.5 h-8 bg-emerald-500"></div>
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 dark:text-white text-[10px] sm:text-xs uppercase tracking-widest">Profile Registered</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Details submitted & account initialized</p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex gap-3.5">
                                <div className="flex flex-col items-center">
                                    <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg animate-pulse">
                                        <Clock size={14} />
                                    </div>
                                    <div className="w-0.5 h-8 border-l-2 border-dashed border-slate-200 dark:border-slate-800"></div>
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 dark:text-white text-[10px] sm:text-xs uppercase tracking-widest">Document Verification</h3>
                                    <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mt-0.5">Auditing DL & vehicle documents</p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex gap-3.5">
                                <div className="flex flex-col items-center">
                                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                                        <UserCheck size={14} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-400 dark:text-slate-655 text-[10px] sm:text-xs uppercase tracking-widest">Hub Activation</h3>
                                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-655 uppercase tracking-widest mt-0.5">Kit collection & final activation</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Meta Card Details */}
                    <div className="grid grid-cols-2 gap-3.5">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col justify-between">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registered Hub</span>
                            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter mt-1">{user?.town || 'Unspecified'}</span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col justify-between">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vehicle Profile</span>
                            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter mt-1">{user?.vehicleType || 'Not Provided'}</span>
                        </div>
                    </div>

                    {/* Developer Simulator Button */}
                    <div className="pt-5 border-t border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center gap-2.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Developer Sandbox Simulator</p>
                        <Button 
                            onClick={async () => {
                                const res = await updateUserStatus('ACTIVE');
                                if (res.success) {
                                    toast.success('Account approved in database!');
                                } else {
                                    toast.error(res.message || 'Verification update failed');
                                }
                            }} 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-black text-[10px] sm:text-xs px-6 py-2.5 tracking-widest uppercase shadow-xl shadow-emerald-900/20 hover:scale-105 transition-transform"
                        >
                            Approve Account & Enter Portal
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Onboarding Verification Declined/Suspended Page
    if (user?.status === 'SUSPENDED') {
        return (
            <div className="min-h-[80vh] flex items-center justify-center py-6 px-4 animate-fade-in">
                <div className="w-full max-w-sm text-center space-y-6 uppercase tracking-tight">
                    <div className="relative inline-flex items-center justify-center">
                        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-[2rem] flex items-center justify-center text-red-600 shadow-xl border border-red-200 dark:border-red-900/30">
                            <ShieldAlert size={40} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic">Verification Declined</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-xs leading-relaxed max-w-xs mx-auto">
                            We regret to inform you that your delivery partner application has been declined due to compliance issues.
                        </p>
                    </div>
                    <Card className="p-4 border-none bg-slate-50 dark:bg-slate-900 shadow-lg rounded-2xl">
                        <p className="text-[9px] font-black text-slate-400 tracking-widest mb-1">Audit Status</p>
                        <p className="text-[10px] font-black text-red-600">Document verification failed</p>
                    </Card>
                    <div className="flex flex-col gap-2.5">
                        <Button 
                            onClick={() => navigate('/partner/support')} 
                            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[10px] sm:text-xs tracking-widest shadow-xl shadow-red-900/25 transition-all hover:scale-[1.02]"
                        >
                            Contact Support Desk
                        </Button>
                        <button 
                            onClick={async () => {
                                const res = await updateUserStatus('ACTIVE');
                                if (res.success) {
                                    toast.success('Account approved!');
                                }
                            }}
                            className="text-[9px] font-black text-slate-400 hover:text-slate-650 hover:underline tracking-widest"
                        >
                            Simulator Override (Activate)
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in pb-20 max-w-2xl mx-auto px-1.5 sm:px-4">
            {/* Header with Online/Offline Glowing Slider */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-slate-50 dark:border-slate-850 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-28 h-28 sm:w-36 sm:h-36 bg-primary-800/5 -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 rounded-full group-hover:scale-110 transition-transform duration-700"></div>

                <div className="flex items-center gap-3.5 relative z-10">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[2rem] flex items-center justify-center text-white transition-all duration-500 shadow-2xl ${isOnline ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-slate-400 dark:bg-slate-800 shadow-none'}`}>
                        {isOnline ? <CheckCircle2 size={24} className="sm:w-8 sm:h-8" /> : <CircleDot size={24} className="sm:w-8 sm:h-8" />}
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-black text-slate-955 dark:text-white uppercase tracking-tighter italic">Hello, {user?.name?.split(' ')[0]}!</h1>
                        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">{isOnline ? 'You are active & ready' : 'You are currently offline'}</p>
                    </div>
                </div>

                <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full sm:w-fit relative z-10 border border-slate-200/20">
                    <button
                        onClick={async () => {
                            const res = await updateUserStatus('ACTIVE');
                            if (res.success) {
                                setIsOnline(true);
                                toast.success("You are now Online");
                            } else {
                                toast.error(res.message || "Failed to update status");
                            }
                        }}
                        className={`flex-1 sm:flex-initial px-4 sm:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[11px] tracking-widest uppercase transition-all duration-300 ${isOnline ? 'bg-white dark:bg-slate-900 shadow-xl text-emerald-600 dark:text-emerald-455' : 'text-slate-400 dark:text-slate-500'}`}
                    >
                        ONLINE
                    </button>
                    <button
                        onClick={async () => {
                            const res = await updateUserStatus('OFFLINE');
                            if (res.success) {
                                setIsOnline(false);
                                toast("Offline: No assignments will be sent", { icon: '📴' });
                            } else {
                                toast.error(res.message || "Failed to update status");
                            }
                        }}
                        className={`flex-1 sm:flex-initial px-4 sm:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[11px] tracking-widest uppercase transition-all duration-300 ${!isOnline ? 'bg-white dark:bg-slate-900 shadow-xl text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}
                    >
                        OFFLINE
                    </button>
                </div>
            </div>

            {/* Premium Stat Cards */}
            <div className="grid grid-cols-2 gap-3.5 sm:gap-6">
                <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary-900 to-primary-800 border-none shadow-2xl relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 -mr-12 -mt-12 rounded-full group-hover:scale-120 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary-300">Today Earnings</span>
                        <div className="p-1.5 bg-white/10 rounded-lg text-white">
                            <TrendingUp size={14} />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-4xl font-black tracking-tighter text-white italic">₹{earnings}</p>
                    <span className="text-[8px] font-bold text-primary-300 uppercase tracking-widest mt-1.5 block">Verified payout</span>
                </Card>
                
                <Card className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-none shadow-2xl relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary-800/5 -mr-12 -mt-12 rounded-full group-hover:scale-120 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Orders Done</span>
                        <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-555 dark:text-slate-400">
                            <Award size={14} />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-4xl font-black tracking-tighter text-slate-900 dark:text-white italic">{ordersDone.toString().padStart(2, '0')}</p>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 block">Target: 15 orders</span>
                </Card>
            </div>

            {/* Active Assignment Section */}
            {isOnline ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-widest italic flex items-center gap-2">
                            Active Assignment
                        </h2>
                        {activeDeliveries.length > 0 && (
                            <Badge variant="info" className="px-3 py-1 font-black text-[8px] sm:text-[9px] tracking-widest uppercase">
                                IN PROGRESS
                            </Badge>
                        )}
                    </div>

                    <AnimatePresence mode="popLayout">
                        {activeDeliveries.length > 0 ? (
                            activeDeliveries.map(del => (
                                <motion.div
                                    key={del.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[3rem]">
                                        {/* Task ID Header */}
                                        <div className="bg-primary-900 p-5 sm:p-6 text-white flex justify-between items-center">
                                            <div>
                                                <span className="font-black text-base sm:text-lg tracking-widest">{del.id}</span>
                                                <p className="text-[8px] sm:text-[9px] font-bold text-primary-300 uppercase tracking-widest mt-0.5">{del.distance} • {del.items} Items</p>
                                            </div>
                                            <Badge variant="info" className="bg-white/10 text-white border-none px-3 py-1 font-black text-[8px] sm:text-[9px] tracking-widest uppercase">
                                                {del.status}
                                            </Badge>
                                        </div>

                                        <div className="p-5 sm:p-8 space-y-6 sm:space-y-8">
                                            {/* Stepper Route Timeline */}
                                            <div className="flex gap-4 sm:gap-5 relative">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-[1rem] sm:rounded-[1.2rem] flex items-center justify-center border transition-all ${del.status === 'At Shop' ? 'bg-emerald-500 text-white border-emerald-455 ring-4 ring-emerald-100 dark:ring-emerald-950/30' : 'bg-emerald-100 text-emerald-600 border-emerald-200'}`}>
                                                        <Package size={15} />
                                                    </div>
                                                    <div className={`w-0.5 h-12 sm:h-16 border-l-2 border-dashed my-1 transition-colors ${del.status !== 'At Shop' ? 'border-emerald-500' : 'border-slate-200 dark:border-slate-800'}`}></div>
                                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-[1rem] sm:rounded-[1.2rem] flex items-center justify-center border transition-all ${del.status === 'On the Way' ? 'bg-primary-800 text-white border-primary-600 ring-4 ring-primary-100 dark:ring-primary-950/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-800'}`}>
                                                        <MapPin size={15} />
                                                    </div>
                                                </div>
                                                <div className="flex-1 space-y-6 sm:space-y-10 pt-0.5">
                                                    <div>
                                                        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Pickup Location</p>
                                                        <p className="font-black text-slate-900 dark:text-white text-sm sm:text-base mt-0.5">{del.shop}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Drop Location</p>
                                                        <p className="font-black text-slate-900 dark:text-white text-sm sm:text-base mt-0.5">{del.address}</p>
                                                        <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1.5">Customer: <span className="text-slate-700 dark:text-slate-300 font-extrabold">{del.customer}</span></p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="space-y-3 pt-5 border-t border-slate-50 dark:border-slate-855">
                                                <div className="flex gap-3">
                                                    <a 
                                                        href={`tel:${del.phone}`}
                                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[9px] sm:text-[10px] tracking-widest uppercase bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 transition-all border border-slate-100/50 dark:border-transparent"
                                                    >
                                                        <Phone size={14} /> Call
                                                    </a>
                                                    <Button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[9px] sm:text-[10px] tracking-widest uppercase bg-primary-800 hover:bg-primary-900 text-white shadow-lg">
                                                        <Navigation size={14} /> Navigate
                                                    </Button>
                                                </div>

                                                <Button 
                                                    onClick={() => handleNextStep(del.id)}
                                                    className="w-full py-4 text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                                                >
                                                    {del.status === 'At Shop' ? 'Confirm Pickup' : 'Confirm Delivery'}
                                                    <ArrowRight size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-12 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] text-center"
                            >
                                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-350 mb-3 animate-bounce">
                                    <Clock size={22} />
                                </div>
                                <h4 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-widest">Waiting for Orders...</h4>
                                <p className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-widest mt-1 px-4 max-w-xs">New assignments will show up automatically when nearby shops place orders.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-855">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                        <AlertCircle size={32} />
                    </div>
                    <div>
                        <p className="text-slate-900 dark:text-white font-black text-lg uppercase tracking-tighter italic">You are Offline</p>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest mt-1.5 max-w-xs mx-auto leading-relaxed px-4">Switch to Online mode to start receiving active delivery assignments.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryDashboard;
