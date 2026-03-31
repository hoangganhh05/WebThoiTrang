import React, { createContext, useState, useContext, useEffect } from "react";

// 1. Khởi tạo Context
const CartContext = createContext();

// 2. Tạo Provider để bọc toàn bộ ứng dụng
export const CartProvider = ({ children }) => {
  // Tạo khóa lưu trữ riêng rẽ dựa trên user đang đăng nhập
  const getCartKey = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user && user.username ? `cart_${user.username}` : "cart_guest";
  };

  // Khởi tạo giỏ hàng từ localStorage của riêng user đó
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem(getCartKey());
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Lắng nghe sự kiện login/logout để ngay lập tức switch giỏ hàng sang user mới
  useEffect(() => {
    const handleAuthChange = () => {
      const savedCart = localStorage.getItem(getCartKey());
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    };

    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, []);

  // Lưu giỏ hàng vào localStorage chuyên biệt của user đó mỗi khi có thay đổi
  useEffect(() => {
    localStorage.setItem(getCartKey(), JSON.stringify(cartItems));
  }, [cartItems]);

  // Hàm thêm sản phẩm vào giỏ
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const isExist = prevItems.find((item) => item.id === product.id);
      if (isExist) {
        // Nếu đã có, tăng số lượng lên 1
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      // Nếu chưa có, thêm mới với số lượng mặc định là 1
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  // Hàm xóa sản phẩm khỏi giỏ
  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId),
    );
  };

  // Hàm cập nhật số lượng (tăng/giảm trực tiếp)
  const updateQuantity = (productId, amount) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + amount) }
          : item,
      ),
    );
  };

  // Tính tổng số lượng món đồ trong giỏ (để hiện số trên Navbar)
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Tính tổng tiền
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  // Hàm làm trống giỏ hàng (sau khi đặt hàng thành công)
  const clearCart = () => {
    setCartItems([]);
  };

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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// 3. Custom hook để sử dụng Context nhanh hơn ở các trang khác
export const useCart = () => {
  return useContext(CartContext);
};
