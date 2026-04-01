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

// Admin API Simulation
export const adminService = {
    getStats: () => new Promise(resolve => setTimeout(() => resolve(ADMIN_STATS), 500)),
    getOrders: () => new Promise(resolve => setTimeout(() => resolve(ORDERS), 500)),
    getVendors: () => new Promise(resolve => setTimeout(() => resolve(VENDORS), 500)),
    getCustomers: () => new Promise(resolve => setTimeout(() => resolve(CUSTOMERS), 500)),
    getPartners: () => new Promise(resolve => setTimeout(() => resolve(DELIVERY_PARTNERS), 500)),
    getPartnerById: (id) => new Promise(resolve => setTimeout(() => {
        resolve(DELIVERY_PARTNERS.find(p => p.id === Number(id)));
    }, 500)),
    getZones: () => new Promise(resolve => setTimeout(() => resolve(ZONES), 500)),
};
