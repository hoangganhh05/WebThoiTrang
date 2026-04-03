import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

// 1. Khởi tạo Context
const CartContext = createContext();

// 2. Tạo Provider để bọc toàn bộ ứng dụng
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);

  // Lấy user đăng nhập hiện tại
  const getUser = () => JSON.parse(localStorage.getItem("user"));
  
  // Lấy Token để đính kèm vào Header xác thực (Vượt chốt bảo vệ Spring Security)
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  // Khởi tạo hoặc Load giỏ hàng
  const loadCart = async () => {
    const user = getUser();
    if (user && user.id) {
      try {
        setLoadingCart(true);
        // GET có kèm Header bảo mật Token
        const res = await axios.get(`https://api.anhhoangg.id.vn/api/cart/${user.id}`, getAuthHeader());
        const dbItems = res.data.items.map(dbItem => ({
            ...dbItem,
            id: dbItem.productId, 
            cartItemId: dbItem.id 
        }));
        setCartItems(dbItems || []);
      } catch (error) {
        console.error("Lỗi fetch cart từ DB:", error);
      } finally {
        setLoadingCart(false);
      }
    } else {
      const saved = localStorage.getItem("cart_guest");
      setCartItems(saved ? JSON.parse(saved) : []);
    }
  };

  useEffect(() => {
    loadCart();
    const handleAuthChange = () => {
      loadCart();
    };

    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, []);

  useEffect(() => {
    if (!getUser()) {
      localStorage.setItem("cart_guest", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = async (product) => {
    const user = getUser();
    if (user && user.id) {
      try {
        const itemRequest = {
          productId: product.id,
          sanPham: product.sanPham,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: 1
        };
        // POST đính kèm Header
        await axios.post(`https://api.anhhoangg.id.vn/api/cart/${user.id}/add`, itemRequest, getAuthHeader());
        loadCart(); 
      } catch (err) {
        console.error("Lỗi thêm Sản phẩm vào DB:", err);
      }
    } else {
      setCartItems((prevItems) => {
        const isExist = prevItems.find((item) => item.id === product.id);
        if (isExist) {
          return prevItems.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prevItems, { ...product, quantity: 1 }];
      });
    }
  };

  const removeFromCart = async (productId) => {
    const user = getUser();
    if (user && user.id) {
      try {
        // DELETE đính kèm Header
        await axios.delete(`https://api.anhhoangg.id.vn/api/cart/${user.id}/remove/${productId}`, getAuthHeader());
        loadCart();
      } catch (err) {
        console.error("Lỗi xóa SP trên DB:", err);
      }
    } else {
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    }
  };

  const updateQuantity = async (productId, amount) => {
    const user = getUser();
    if (user && user.id) {
      try {
        // PUT đính kèm Header
        await axios.put(`https://api.anhhoangg.id.vn/api/cart/${user.id}/update/${productId}?amount=${amount}`, null, getAuthHeader());
        loadCart();
      } catch (err) {
        console.error("Lỗi cập nhật số lượng SP trên DB:", err);
      }
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
        )
      );
    }
  };

  const clearCart = async () => {
    const user = getUser();
    if (user && user.id) {
      try {
        // DELETE đính kèm Header
        await axios.delete(`https://api.anhhoangg.id.vn/api/cart/${user.id}/clear`, getAuthHeader());
        setCartItems([]);
      } catch (err) {
        console.error("Lỗi clear giỏ hàng trên DB:", err);
      }
    } else {
      setCartItems([]);
    }
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        setCartItems,
        removeFromCart,
        updateQuantity,
        cartCount,
        totalPrice,
        clearCart,
        loadingCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};
