import api from './api';

export const heroService = {
    getHeroContent: async () => {
        try {
            const response = await api.get('/hero');
            return response.data.success ? response.data.data : null;
        } catch (error) {
            console.error('Error fetching hero content:', error);
            return null;
        }
    }
};
