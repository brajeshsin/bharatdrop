import api from './api';

export const vendorService = {
    getVendors: async (params = {}) => {
        try {
            const { category = 'All' } = params;
            const query = category !== 'All' ? `?category=${category}` : '';
            const response = await api.get(`/vendors${query}`);
            return response.data.success ? response.data.vendors : [];
        } catch (error) {
            console.error('Error fetching vendors:', error);
            return [];
        }
    },
    getVendorById: async (id) => {
        try {
            const response = await api.get(`/vendors/${id}`);
            return response.data.success ? response.data.vendor : null;
        } catch (error) {
            console.error('Error fetching vendor by ID:', error);
            return null;
        }
    },
    getCategories: async (params = {}) => {
        try {
            const { section } = params;
            const query = section ? `?section=${section}` : '';
            const response = await api.get(`/categories${query}`);
            return response.data.success ? response.data.categories : [];
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    },
    getMyProfile: async () => {
        try {
            const response = await api.get('/vendors/me');
            return response.data;
        } catch (error) {
            console.error('Error fetching vendor profile:', error);
            return { success: false, message: 'Failed to load profile' };
        }
    },
    updateInventory: async (items) => {
        try {
            const response = await api.put('/vendors/me/inventory', { items });
            return response.data;
        } catch (error) {
            console.error('Error updating inventory:', error);
            return { success: false, message: 'Failed to update inventory' };
        }
    },
    getVendorOrders: async () => {
        try {
            const response = await api.get('/orders/vendor/orders');
            return response.data.success ? response.data.orders : [];
        } catch (error) {
            console.error('Error fetching vendor orders:', error);
            return [];
        }
    },
    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await api.patch(`/orders/vendor/orders/${orderId}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Error updating order status:', error);
            return { success: false, message: 'Failed to update order status' };
        }
    }
};
