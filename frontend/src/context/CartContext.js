import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const { user } = useAuth();

  const fetchCounts = async () => {
    try {
      if (user) {
        const [cartRes, wishRes] = await Promise.all([
          api.get('/cart'),
          api.get('/wishlist')
        ]);
        setCartCount(cartRes.data.items?.length || 0);
        setWishlistCount(wishRes.data.items?.length || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [user]);

  return (
    <CartContext.Provider value={{ cartCount, wishlistCount, setCartCount, setWishlistCount, fetchCounts }}>
      {children}
    </CartContext.Provider>
  );
};
