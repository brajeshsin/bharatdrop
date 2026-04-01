export const vendorService = {
    getVendors: async (params = {}) => {
        try {
            const { category = 'All' } = params;
            const query = category !== 'All' ? `?category=${category}` : '';
            const response = await fetch(`http://localhost:5000/api/vendors${query}`);
            const data = await response.json();
            return data.success ? data.vendors : [];
        } catch (error) {
            console.error('Error fetching vendors:', error);
            return [];
        }
    },
    getVendorById: async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/vendors/${id}`);
            const data = await response.json();
            return data.success ? data.vendor : null;
        } catch (error) {
            console.error('Error fetching vendor by ID:', error);
            return null;
        }
    },
    getCategories: async (params = {}) => {
        try {
            const { section } = params;
            const query = section ? `?section=${section}` : '';
            const response = await fetch(`http://localhost:5000/api/categories${query}`);
            const data = await response.json();
            return data.success ? data.categories : [];
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }
};
