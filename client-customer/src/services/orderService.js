const API_URL = 'http://localhost:5000/api/orders';

const getHeaders = () => {
    const token = localStorage.getItem('vdp_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const orderService = {
    createOrder: async (orderData) => {
        try {
            const response = await fetch(`${API_URL}`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(orderData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    getMyOrders: async () => {
        try {
            const response = await fetch(`${API_URL}/my-orders`, {
                headers: getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    },

    getOrderById: async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                headers: getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching order details:', error);
            throw error;
        }
    },
    getPaymentMethods: async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/payments`, {
                headers: getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            throw error;
        }
    }
};
