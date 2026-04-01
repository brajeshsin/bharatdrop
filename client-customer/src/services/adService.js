export const getAds = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/ads');
        const data = await response.json();
        return data.ads || [];
    } catch (error) {
        console.error('Error fetching ads:', error);
        return [];
    }
};
