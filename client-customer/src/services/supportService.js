import api from './api';

export const supportService = {
    createTicket: async (ticketData) => {
        try {
            const response = await api.post('/tickets', ticketData);
            return response.data;
        } catch (error) {
            console.error('Error creating ticket:', error);
            throw error;
        }
    },

    getMyTickets: async () => {
        try {
            const response = await api.get('/tickets');
            return response.data;
        } catch (error) {
            console.error('Error fetching tickets:', error);
            throw error;
        }
    },

    getTicketDetails: async (id) => {
        try {
            const response = await api.get(`/tickets/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching ticket details:', error);
            throw error;
        }
    },

    sendTicketMessage: async (id, message) => {
        try {
            const response = await api.post(`/tickets/${id}/messages`, { message });
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    sendTypingStatus: async (id, isTyping) => {
        try {
            const response = await api.post(`/tickets/${id}/typing`, { isTyping });
            return response.data;
        } catch (error) {
            console.error('Error sending typing status:', error);
            throw error;
        }
    }
};
