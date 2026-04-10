// Mock data for Admin Dashboard
export const ADMIN_STATS = {
    totalOrders: 1254,
    totalRevenue: 452890,
    activeVendors: 42,
    activeDeliveries: 15,
};

export const ORDERS = Array.from({ length: 50 }, (_, i) => ({
    id: `#BD-${1000 + i}`,
    customer: ['Brajesh Singh', 'Arjun Kumar', 'Meena Devi', 'Sanjay Gupta', 'Priya Sharma'][i % 5],
    vendor: ['Gopal Kirana', 'Shanti Sweets', 'Village Meds', 'Kisan Tools'][i % 4],
    amount: 150 + (i * 25),
    status: ['DELIVERED', 'PICKED', 'ACCEPTED', 'CANCELLED'][i % 4],
    location: ['Rampur', 'Sitapur', 'Gopalganj', 'Vikaspur'][i % 4],
    date: '2024-03-27'
}));

export const VENDORS = [
    { id: 1, name: 'Gopal Sweets', category: 'Sweets & Snacks', town: 'Rampur', status: 'Active', phone: '9876543210' },
    { id: 2, name: 'Organic Farms', category: 'Fruits & Veg', town: 'Bicholi', status: 'Active', phone: '9876543211' },
    { id: 3, name: 'Kirana Store', category: 'Grocery', town: 'Rampur', status: 'Inactive', phone: '9876543212' },
];

export const CUSTOMERS = [
    { id: 1, name: 'Rahul Sharma', phone: '9988776655', village: 'Rampur', totalOrders: 12 },
    { id: 2, name: 'Sneha Patel', phone: '9988776656', village: 'Bicholi', totalOrders: 5 },
    { id: 3, name: 'Amit Verma', phone: '9988776657', village: 'Rampur', totalOrders: 8 },
];

export const DELIVERY_PARTNERS = Array.from({ length: 50 }, (_, i) => {
    const firstNames = ['Vikram', 'Suresh', 'Rajesh', 'Amit', 'Deepak', 'Sanjay', 'Anil', 'Manoj', 'Rakesh', 'Prakash', 'Arun', 'Vijay', 'Sunil', 'Kishore', 'Babu'];
    const lastNames = ['Singh', 'Kumar', 'Gupta', 'Patel', 'Verma', 'Yadav', 'Mishra', 'Tiwari', 'Sharma', 'Jha', 'Reddy', 'Khan', 'Choudhary', 'Nair', 'Joshy'];
    return {
        id: i + 1,
        name: `${firstNames[i % firstNames.length]} ${lastNames[Math.floor(i / 3) % lastNames.length]}`,
        phone: `9${Math.floor(Math.random() * 900000000 + 100000000)}`,
        status: Math.random() > 0.3 ? 'Online' : 'Offline',
        earnings: Math.floor(Math.random() * 20000 + 5000),
    };
});

export const ZONES = [
    { id: 1, town: 'Rampur', villages: ['Rampur Khas', 'Pipra', 'Belwa'], distance: '0-5km' },
    { id: 2, town: 'Bicholi', villages: ['Bicholi Gram', 'Haripur'], distance: '5-10km' },
];

import api from './api';

// Admin API Simulation & Real Endpoints
export const adminService = {
    getStats: () => new Promise(resolve => setTimeout(() => resolve(ADMIN_STATS), 500)),
    getOrders: async () => {
        try {
            const response = await api.get('/orders');
            return response.data.success ? response.data.orders : [];
        } catch (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
    },
    getOrderById: async (id) => {
        try {
            const response = await api.get(`/orders/${id}`);
            return response.data.success ? response.data.order : null;
        } catch (error) {
            console.error('Error fetching order details:', error);
            return null;
        }
    },
    getOrdersByGroupId: async (groupId) => {
        try {
            const response = await api.get(`/orders/group/${groupId}`);
            return response.data.success ? response.data.orders : [];
        } catch (error) {
            console.error('Error fetching grouped orders:', error);
            return [];
        }
    },
    updateOrderStatus: async (id, status) => {
        try {
            const response = await api.patch(`/orders/${id}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Error updating order status:', error);
            return { success: false, message: 'Server connection failed' };
        }
    },
    getVendors: async (params = {}) => {
        try {
            const { page = 1, limit = 10, search = '' } = params;
            const response = await api.get('/vendors', { params: { page, limit, search } });
            return response.data.success ? response.data : { data: [], pagination: {} };
        } catch (error) {
            console.error('Error fetching vendors:', error);
            return { data: [], pagination: {} };
        }
    },
    getVendorById: async (id) => {
        try {
            const response = await api.get(`/vendors/${id}`);
            return response.data.success ? response.data.data : null;
        } catch (error) {
            console.error('Error fetching vendor:', error);
            return null;
        }
    },
    getCustomers: async (params = {}) => {
        try {
            const { page = 1, limit = 10, search = '' } = params;
            const response = await api.get('/customers', { params: { page, limit, search } });
            return response.data.success ? response.data : { data: [], pagination: {} };
        } catch (error) {
            console.error('Error fetching customers:', error);
            return { data: [], pagination: {} };
        }
    },
    createVendor: async (vendorData) => {
        try {
            const response = await api.post('/vendors', vendorData);
            return response.data;
        } catch (error) {
            console.error('Error creating vendor:', error);
            return { success: false, message: 'Server connection failed' };
        }
    },
    updateVendor: async (id, vendorData) => {
        try {
            const response = await api.put(`/vendors/${id}`, vendorData);
            return response.data;
        } catch (error) {
            console.error('Error updating vendor:', error);
            return { success: false, message: 'Server connection failed' };
        }
    },
    deleteVendor: async (id) => {
        try {
            const response = await api.delete(`/vendors/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting vendor:', error);
            return { success: false, message: 'Server connection failed' };
        }
    },
    updatePaymentStatus: async (id, paymentStatus) => {
        try {
            const response = await api.patch(`/orders/${id}/payment`, { paymentStatus });
            return response.data;
        } catch (error) {
            console.error('Error updating payment status:', error);
            return { success: false, message: 'Server connection failed' };
        }
    },
    getPartners: () => new Promise(resolve => setTimeout(() => resolve(DELIVERY_PARTNERS), 500)),
    getPartnerById: (id) => new Promise(resolve => setTimeout(() => {
        resolve(DELIVERY_PARTNERS.find(p => p.id === Number(id)));
    }, 500)),
    getZones: () => new Promise(resolve => setTimeout(() => resolve(ZONES), 500)),
    getPaymentMethods: async () => {
        try {
            const response = await api.get('/payments');
            return response.data;
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            return { success: false, message: 'Server connection failed' };
        }
    },
    togglePaymentMethod: async (id) => {
        try {
            const response = await api.patch(`/payments/${id}/toggle`);
            return response.data;
        } catch (error) {
            console.error('Error toggling payment method:', error);
            return { success: false, message: 'Server connection failed' };
        }
    },
    toggleItemStock: async (vendorId, itemName) => {
        try {
            const response = await api.patch(`/vendors/${vendorId}/items/${itemName}/toggle-stock`);
            return response.data;
        } catch (error) {
            console.error('Error toggling item stock:', error);
            return { success: false, message: 'Server connection failed' };
        }
    },
    getPendingRegistrations: async () => {
        try {
            const response = await api.get('/customers/pending');
            return response.data.success ? response.data.data : [];
        } catch (error) {
            console.error('Error fetching pending registrations:', error);
            return [];
        }
    },
    approveRegistration: async (id) => {
        try {
            const response = await api.post(`/customers/${id}/approve`);
            return response.data;
        } catch (error) {
            console.error('Error approving registration:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Server connection failed'
            };
        }
    },
    rejectRegistration: async (id) => {
        try {
            const response = await api.post(`/customers/${id}/reject`);
            return response.data;
        } catch (error) {
            console.error('Error rejecting registration:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Server connection failed'
            };
        }
    },
};
