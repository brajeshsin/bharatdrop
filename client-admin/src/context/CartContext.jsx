import React, { createContext, useContext, useState, useEffect } from 'react';
import { SHOPS, PRODUCTS } from '../services/mockData';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('bd_cart');
        if (!savedCart) return {};
        try {
            const parsed = JSON.parse(savedCart);
            // Persistence Guard: Ensure multi-shop structure is valid
            const values = Object.values(parsed);
            if (values.length > 0 && typeof values[0] !== 'object') {
                localStorage.removeItem('bd_cart');
                return {};
            }
            return parsed;
        } catch (e) {
            return {};
        }
    });

    useEffect(() => {
        localStorage.setItem('bd_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, shop) => {
        if (!shop) return;
        setCart(prev => {
            const newCart = { ...prev };
            const shopId = shop.id;

            // Ensure shop object is cloned
            if (!newCart[shopId]) {
                newCart[shopId] = {
                    name: shop.name,
                    image: shop.image,
                    items: {}
                };
            } else {
                newCart[shopId] = { ...newCart[shopId] };
            }

            // Ensure items object is cloned
            newCart[shopId].items = { ...newCart[shopId].items };

            // Increment quantity safely
            newCart[shopId].items[product.id] = (newCart[shopId].items[product.id] || 0) + 1;

            return newCart;
        });
    };

    const removeFromCart = (productId, shopId) => {
        setCart(prev => {
            if (!prev[shopId]) return prev;

            const newCart = { ...prev };

            // Clone the shop and items objects
            newCart[shopId] = { ...newCart[shopId] };
            newCart[shopId].items = { ...newCart[shopId].items };

            if (newCart[shopId].items[productId] > 1) {
                newCart[shopId].items[productId] -= 1;
            } else {
                delete newCart[shopId].items[productId];
                if (Object.keys(newCart[shopId].items).length === 0) {
                    delete newCart[shopId];
                }
            }
            return newCart;
        });
    };

    const clearCart = () => {
        setCart({});
    };

    const cartTotal = Object.values(cart).reduce((total, shopData) => {
        return total + Object.entries(shopData.items).reduce((shopTotal, [pid, qty]) => {
            const product = PRODUCTS.find(p => p.id === parseInt(pid));
            return shopTotal + (product ? product.price * qty : 0);
        }, 0);
    }, 0);

    const itemCount = Object.values(cart).reduce((total, shopData) => {
        return total + Object.values(shopData.items).reduce((a, b) => a + b, 0);
    }, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartTotal, itemCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
