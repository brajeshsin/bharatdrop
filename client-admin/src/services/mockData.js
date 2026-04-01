export const ORDER_STATUS = {
    PLACED: 'placed',
    ACCEPTED: 'accepted',
    PICKED: 'picked',
    DELIVERED: 'delivered'
};

export const SHOPS = [
    { id: 1, name: "Gopal Grocery Store", category: "Grocery", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800", rating: 4.5, time: "20-30 min" },
    { id: 2, name: "Village Medicals", category: "Medicine", image: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=800", rating: 4.8, time: "15-25 min" },
    { id: 3, name: "Fresh Farm Dairy", category: "Dairy", image: "https://images.unsplash.com/photo-1550583724-125581f77833?auto=format&fit=crop&q=80&w=800", rating: 4.1, time: "10-20 min" },
    { id: 4, name: "Hometown Bakery", category: "Bakery", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800", rating: 4.6, time: "30-40 min" },
    { id: 5, name: "Bismillah Meat Shop", category: "Meat", image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=800", rating: 4.7, time: "25-35 min" },
    { id: 6, name: "Pure Protein Hub", category: "Meat", image: "https://images.unsplash.com/photo-1544022613-e87f73286432?auto=format&fit=crop&q=80&w=800", rating: 4.4, time: "20-30 min" },
    { id: 7, name: "Sher-e-Punjab Dhaba", category: "Dhaba", image: "https://images.unsplash.com/photo-1585933423032-b5fbd8a3bc44?auto=format&fit=crop&q=80&w=800", rating: 4.9, time: "30-45 min" },
    { id: 8, name: "Urban Bites", category: "Fast Food", image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=800", rating: 4.6, time: "20-35 min" },
];

export const PRODUCTS = [
    // Shop 1: Gopal Grocery Store (Grocery)
    { id: 101, shopId: 1, name: "Aashirvaad Atta 5kg", price: 245, category: "Grains", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400" },
    { id: 102, shopId: 1, name: "Fortune Oil 1L", price: 165, category: "Oil", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400" },
    { id: 105, shopId: 1, name: "Tata Salt 1kg", price: 25, category: "Groceries", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=400" },
    { id: 106, shopId: 1, name: "Maggi Noodles 280g", price: 48, category: "Snacks", image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&q=80&w=400" },
    { id: 107, shopId: 1, name: "Surf Excel 1kg", price: 120, category: "Cleaning", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400" },
    { id: 108, shopId: 1, name: "Bru Coffee 50g", price: 95, category: "Beverages", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=400" },
    { id: 109, shopId: 1, name: "Dettol Soap 125g", price: 45, category: "Personal Care", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400" },
    { id: 110, shopId: 1, name: "Colgate Paste 200g", price: 98, category: "Personal Care", image: "https://images.unsplash.com/photo-1559591937-e62057865261?auto=format&fit=crop&q=80&w=400" },
    { id: 111, shopId: 1, name: "Daawat Basmati 1kg", price: 155, category: "Grains", image: "https://images.unsplash.com/photo-1586201327102-33149930a708?auto=format&fit=crop&q=80&w=400" },
    { id: 112, shopId: 1, name: "Amul Butter 100g", price: 56, category: "Dairy", image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=400" },
    { id: 113, shopId: 1, name: "Red Label Tea 250g", price: 135, category: "Beverages", image: "https://images.unsplash.com/photo-1544787210-282676fcd1ef?auto=format&fit=crop&q=80&w=400" },
    { id: 114, shopId: 1, name: "Haldiram Bhujia 400g", price: 85, category: "Snacks", image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=400" },
    { id: 115, shopId: 1, name: "Britannia Biscuits", price: 40, category: "Snacks", image: "https://images.unsplash.com/photo-1553531384-397c80973a0b?auto=format&fit=crop&q=80&w=400" },
    { id: 116, shopId: 1, name: "Pepsodent Brush 2pk", price: 65, category: "Personal Care", image: "https://images.unsplash.com/photo-1607613061117-917414c0f24b?auto=format&fit=crop&q=80&w=400" },
    { id: 117, shopId: 1, name: "Kissan Jam 500g", price: 125, category: "Groceries", image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=400" },
    { id: 118, shopId: 1, name: "Lizol Floor 500ml", price: 110, category: "Cleaning", image: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=400" },

    // Shop 2: Village Medicals (Medicine)
    { id: 103, shopId: 2, name: "Paracetamol 500mg", price: 30, category: "Tablet", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400" },
    { id: 201, shopId: 2, name: "Combiflam 10pk", price: 45, category: "Tablet", image: "https://images.unsplash.com/photo-1607619056574-7b8d30236b2d?auto=format&fit=crop&q=80&w=400" },
    { id: 202, shopId: 2, name: "Vicks Vaporub 25g", price: 85, category: "Ointment", image: "https://images.unsplash.com/photo-1563306406-e66174fa3787?auto=format&fit=crop&q=80&w=400" },
    { id: 203, shopId: 2, name: "Digital Thermometer", price: 195, category: "Device", image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=400" },
    { id: 204, shopId: 2, name: "Himalaya Face Wash", price: 120, category: "Personal Care", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400" },
    { id: 205, shopId: 2, name: "Savlon Antiseptic", price: 55, category: "Cleaning", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400" },
    { id: 206, shopId: 2, name: "Vitamin C Tablets", price: 150, category: "Supplements", image: "https://images.unsplash.com/photo-1616671276441-2f0c274f8751?auto=format&fit=crop&q=80&w=400" },
    { id: 207, shopId: 2, name: "Band-Aid 10pk", price: 20, category: "Medical", image: "https://images.unsplash.com/photo-1590611380053-da6447011f45?auto=format&fit=crop&q=80&w=400" },

    // Shop 3: Fresh Farm Dairy (Dairy)
    { id: 104, shopId: 3, name: "Fresh Milk 1L", price: 60, category: "Dairy", image: "https://images.unsplash.com/photo-1563636619-e9107da5a76a?auto=format&fit=crop&q=80&w=600" },
    { id: 301, shopId: 3, name: "Paneer 200g", price: 90, category: "Dairy", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600" },
    { id: 302, shopId: 3, name: "Curd 400g", price: 45, category: "Dairy", image: "https://images.unsplash.com/photo-1464221303554-30e5fc011403?auto=format&fit=crop&q=80&w=600" },
    { id: 303, shopId: 3, name: "Ghee 500ml", price: 345, category: "Dairy", image: "https://images.unsplash.com/photo-1589985270826-4b7bf3a3b6df?auto=format&fit=crop&q=80&w=600" },
    { id: 304, shopId: 3, name: "Cheese Slices 10pk", price: 150, category: "Dairy", image: "https://images.unsplash.com/photo-1552767059-ce182ead6c1b?auto=format&fit=crop&q=80&w=600" },
    { id: 305, shopId: 3, name: "Condensed Milk", price: 140, category: "Dairy", image: "https://images.unsplash.com/photo-1559561853-08451507cbe7?auto=format&fit=crop&q=80&w=600" },

    // Shop 4: Hometown Bakery (Bakery)
    { id: 401, shopId: 4, name: "Brown Bread", price: 45, category: "Bakery", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400" },
    { id: 402, shopId: 4, name: "Butter Cookies", price: 120, category: "Bakery", image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=400" },
    { id: 403, shopId: 4, name: "Chocolate Cake 500g", price: 450, category: "Bakery", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=400" },
    { id: 404, shopId: 4, name: "Fruit Rusk", price: 65, category: "Bakery", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=400" },
    { id: 405, shopId: 4, name: "Vanilla Muffins 4pk", price: 140, category: "Bakery", image: "https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&q=80&w=400" },

    // Shop 5: Bismillah Meat Shop (Meat)
    { id: 501, shopId: 5, name: "Fresh Chicken 1kg", price: 240, category: "Meat", image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=400" },
    { id: 502, shopId: 5, name: "Mutton Curry Cut 500g", price: 380, category: "Meat", image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=400" },
    { id: 503, shopId: 5, name: "Chicken Wings 500g", price: 180, category: "Meat", image: "https://images.unsplash.com/photo-1544022613-e87f73286432?auto=format&fit=crop&q=80&w=400" },

    // Shop 6: Pure Protein Hub (Meat)
    { id: 601, shopId: 6, name: "Frozen Fish Fillet", price: 450, category: "Meat", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400" },
    { id: 602, shopId: 6, name: "Farm Fresh Eggs 12pk", price: 85, category: "Eggs", image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=400" },

    // Shop 7: Sher-e-Punjab Dhaba (Dhaba)
    { id: 701, shopId: 7, name: "Mutton Curry (Full)", price: 450, category: "Curry", image: "https://images.unsplash.com/photo-1545240175-dba23db36829?auto=format&fit=crop&q=80&w=400" },
    { id: 702, shopId: 7, name: "Butter Chicken", price: 380, category: "Curry", image: "https://images.unsplash.com/photo-1603894527134-998a83f1244e?auto=format&fit=crop&q=80&w=400" },
    { id: 703, shopId: 7, name: "Special Meat Biryani", price: 320, category: "Rice", image: "https://images.unsplash.com/photo-1589302168068-1c49911d33b9?auto=format&fit=crop&q=80&w=400" },

    // Shop 8: Urban Bites (Fast Food)
    { id: 801, shopId: 8, name: "Gourmet Chicken Burger", price: 180, category: "Burger", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400" },
    { id: 802, shopId: 8, name: "Peri Peri Fries", price: 95, category: "Snacks", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=400" },
    { id: 803, shopId: 8, name: "Cheesy Paneer Pizza", price: 280, category: "Pizza", image: "https://images.unsplash.com/photo-1566843972142-a7fcb70de55a?auto=format&fit=crop&q=80&w=400" },
];

export const CATEGORIES = ["All", "Grocery", "Medicine", "Dairy", "Bakery", "Vegetables", "Meat", "Dhaba", "Fast Food"];

export const CATEGORIES_WITH_IMAGES = [
    { name: "Grocery", image: "/images/generated/grocery.png", color: "bg-emerald-50 text-emerald-600" },
    { name: "Medicine", image: "/images/generated/medicine.png", color: "bg-red-50 text-red-600" },
    { name: "Dairy", image: "https://images.unsplash.com/photo-1628088062854-d1870b4553ad?auto=format&fit=crop&q=80&w=400", color: "bg-blue-50 text-blue-600" },
    { name: "Bakery", image: "/images/generated/bakery.png", color: "bg-orange-50 text-orange-600" },
    { name: "Vegetables", image: "/images/generated/vegetables.png", color: "bg-green-50 text-green-600" },
    { name: "Meat", image: "file:///home/brajesh-react/.gemini/antigravity/brain/e5e24a2c-8512-4f34-b555-73b95e60e68d/meat_category_icon_1774705459260.png", color: "bg-rose-50 text-rose-600" },
    { name: "Dhaba", image: "file:///home/brajesh-react/.gemini/antigravity/brain/e5e24a2c-8512-4f34-b555-73b95e60e68d/dhaba_category_icon_1774705809425.png", color: "bg-orange-50 text-orange-600" },
    { name: "Fast Food", image: "file:///home/brajesh-react/.gemini/antigravity/brain/e5e24a2c-8512-4f34-b555-73b95e60e68d/fast_food_category_icon_1774706150035.png", color: "bg-blue-50 text-blue-600" },
];

export const BANNERS = [
    { id: 1, title: "Special Sunday Deal", subtitle: "20% OFF ON DAIRY PRODUCTS", image: "https://images.unsplash.com/photo-1628088062854-d1870b4553ad?auto=format&fit=crop&q=80&w=1200", color: "bg-primary-800" },
    { id: 2, title: "Quick Medicine Hub", subtitle: "DELIVERED IN 15 MINS", image: "https://images.unsplash.com/photo-1576091160550-217359f42f8c?auto=format&fit=crop&q=80&w=1200", color: "bg-emerald-700" }
];

export const MOCK_ORDERS = [
    {
        id: "ORD-9821",
        shopName: "Gopal Grocery Store",
        date: "Today, 12:30 PM",
        total: 430,
        status: ORDER_STATUS.PLACED,
        items: [
            { name: "Aashirvaad Atta 5kg", qty: 1, price: 245 },
            { name: "Fortune Oil 1L", qty: 1, price: 165 }
        ]
    },
    {
        id: "ORD-9750",
        shopName: "Fresh Farm Dairy",
        date: "Yesterday, 06:15 PM",
        total: 180,
        status: ORDER_STATUS.DELIVERED,
        items: [
            { name: "Fresh Milk 1L", qty: 3, price: 60 }
        ]
    }
];
