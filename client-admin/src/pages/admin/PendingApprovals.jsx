import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, ConfirmationModal } from '../../components/common';
import { adminService } from '../../services/adminService';
import { UserCheck, UserX, Store, Truck, MapPin, Phone, Mail, Clock, ShieldAlert } from 'lucide-react';
import { useLoading } from '../../context/LoadingContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const PendingApprovals = () => {
    const { setIsLoading } = useLoading();
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchPendingRequests = async () => {
        setLoading(true);
        try {
            const data = await adminService.getPendingRegistrations();
            setPendingRequests(data);
        } catch (error) {
            console.error("Failed to fetch pending registrations:", error);
            toast.error("Failed to load registration requests");
        } finally {
            setLoading(false);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const handleAction = async () => {
        if (!selectedRequest || !actionType) return;
        setIsLoading(true);
        try {
            const result = actionType === 'approve'
                ? await adminService.approveRegistration(selectedRequest.id)
                : await adminService.rejectRegistration(selectedRequest.id);

            if (result.success) {
                toast.success(result.message);
                setIsModalOpen(false);
                setSelectedRequest(null);
                fetchPendingRequests();
            } else {
                toast.error(result.message || `Failed to ${actionType} request`);
            }
        } catch (error) {
            toast.error('Server connection error');
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = (request, type) => {
        setSelectedRequest(request);
        setActionType(type);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-fade-in tracking-tight">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-none uppercase tracking-tighter text-left">Onboarding Queue</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-widest uppercase mt-2 italic text-left">Review & Verify New Partners</p>
                </div>
                <div className="flex items-center gap-3">
                    <Card className="px-6 py-3 bg-white dark:bg-slate-900 border-none shadow-sm flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 font-black text-xs">
                            {pendingRequests.length}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Requests</p>
                    </Card>
                </div>
            </div>

            <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden p-0 mb-10">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Applicant</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Type/Role</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Store/Fleet Details</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contact & Location</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Review</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-10 py-10">
                                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : pendingRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                                            <UserCheck size={40} />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-300 dark:text-slate-700 uppercase tracking-tighter">Queue is Empty</h3>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2 italic">All partners are currently verified</p>
                                    </td>
                                </tr>
                            ) : (
                                pendingRequests.map((request) => (
                                    <tr key={request.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-300">
                                        <td className="px-8 py-7">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                                                    <span className="font-black text-lg">{request.name.charAt(0)}</span>
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">{request.name}</h3>
                                                    <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-none">Registered: {new Date(request.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <Badge
                                                variant={request.role === 'VENDOR' ? 'primary' : 'success'}
                                                className="font-black px-4 py-1.5 tracking-widest text-[9px] rounded-xl flex items-center gap-2 w-fit"
                                            >
                                                {request.role === 'VENDOR' ? <Store size={12} /> : <Truck size={12} />}
                                                {request.role}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="text-left">
                                                <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">
                                                    {request.role === 'VENDOR' ? request.storeName : `${request.vehicleType} Fleet`}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                    {request.role === 'VENDOR' ? request.businessCategory : 'Delivery Management'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase">
                                                    <Phone size={12} className="text-primary-500" /> {request.mobile}
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase truncate max-w-[200px]">
                                                    <MapPin size={12} className="text-slate-300" /> {request.address || 'Location N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <Button
                                                    variant="ghost"
                                                    className="h-10 px-4 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black tracking-widest uppercase border-2 border-transparent"
                                                    onClick={() => openModal(request, 'reject')}
                                                >
                                                    <UserX size={14} className="mr-2" /> Reject
                                                </Button>
                                                <Button
                                                    className="h-10 px-6 rounded-xl shadow-lg shadow-primary-900/20 text-[10px] font-black tracking-widest uppercase"
                                                    onClick={() => openModal(request, 'approve')}
                                                >
                                                    <UserCheck size={14} className="mr-2" /> Approve
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleAction}
                title={actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                message={actionType === 'approve'
                    ? `Are you sure you want to approve ${selectedRequest?.name}? This will grant them full access to the platform.`
                    : `Are you sure you want to reject ${selectedRequest?.name}? They will be notified of the decision.`}
                confirmText={actionType === 'approve' ? 'APPROVE PARTNER' : 'REJECT APPLICANT'}
                variant={actionType === 'approve' ? 'primary' : 'danger'}
            />
        </div>
    );
};

export default PendingApprovals;
