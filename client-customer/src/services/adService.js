import api from './api';

export const getAds = async () => {
    try {
        const response = await api.get('/ads');
        return response.data.ads || [];
    } catch (error) {
        console.error('Error fetching ads:', error);
        return [];
    }
};
