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
    }
};
