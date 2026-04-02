import React, { createContext, useContext, useState, useEffect } from 'react';
import { SHOPS, PRODUCTS } from '../services/mockData';
import { vendorService } from '../services/vendorService';

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
            const shopId = shop._id || shop.id;

            if (!newCart[shopId]) {
                newCart[shopId] = {
                    id: shopId,
                    name: shop.storeName || shop.name,
                    image: shop.image,
                    items: {}
                };
            } else {
                newCart[shopId] = { ...newCart[shopId] };
            }

            const currentShopItems = { ...newCart[shopId].items };
            newCart[shopId].items = {
                ...currentShopItems,
                [product.id]: {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image || shop.image,
                    unit: product.unit || '',
                    quantity: (currentShopItems[product.id]?.quantity || 0) + 1
                }
            };

            return newCart;
        });
    };

    const removeFromCart = (productId, shopId) => {
        setCart(prev => {
            if (!prev[shopId]) return prev;

            const newCart = { ...prev };
            newCart[shopId] = { ...newCart[shopId] };
            newCart[shopId].items = { ...newCart[shopId].items };

            if (newCart[shopId].items[productId]?.quantity > 1) {
                newCart[shopId].items[productId] = {
                    ...newCart[shopId].items[productId],
                    quantity: newCart[shopId].items[productId].quantity - 1
                };
            } else {
                delete newCart[shopId].items[productId];
                if (Object.keys(newCart[shopId].items).length === 0) {
                    delete newCart[shopId];
                }
            }
            return newCart;
        });
    };

    const deleteFromCart = (productId, shopId) => {
        setCart(prev => {
            if (!prev[shopId]) return prev;

            const newCart = { ...prev };
            newCart[shopId] = { ...newCart[shopId] };
            newCart[shopId].items = { ...newCart[shopId].items };

            delete newCart[shopId].items[productId];

            if (Object.keys(newCart[shopId].items).length === 0) {
                delete newCart[shopId];
            }
            return newCart;
        });
    };

    const clearCart = () => {
        setCart({});
    };

    const refreshCart = async () => {
        const shopIds = Object.keys(cart);
        if (shopIds.length === 0) return;

        const updatedCart = { ...cart };
        let hasChanges = false;

        for (const shopId of shopIds) {
            const freshVendor = await vendorService.getVendorById(shopId);
            if (!freshVendor) continue;

            updatedCart[shopId] = { ...updatedCart[shopId] };
            updatedCart[shopId].items = { ...updatedCart[shopId].items };

            // Update items from this shop
            Object.keys(updatedCart[shopId].items).forEach(productId => {
                const item = updatedCart[shopId].items[productId];
                const freshItem = freshVendor.items.find(i => i.name === item.name);

                if (freshItem) {
                    if (item.price !== freshItem.price || item.isOutOfStock !== freshItem.isOutOfStock) {
                        updatedCart[shopId].items[productId] = {
                            ...item,
                            price: freshItem.price,
                            isOutOfStock: freshItem.isOutOfStock
                        };
                        hasChanges = true;
                    }
                }
            });
        }

        if (hasChanges) {
            setCart(updatedCart);
        }
    };

    const cartTotal = Object.values(cart).reduce((total, shopData) => {
        return total + Object.values(shopData.items).reduce((shopTotal, product) => {
            return shopTotal + (product.price * product.quantity);
        }, 0);
    }, 0);

    const itemCount = Object.values(cart).reduce((total, shopData) => {
        return total + Object.values(shopData.items).reduce((a, product) => a + product.quantity, 0);
    }, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, deleteFromCart, clearCart, cartTotal, itemCount, refreshCart }}>
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
