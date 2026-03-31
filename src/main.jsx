import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CartProvider } from "./context/CartContext.jsx";
import "./index.css";
import App from "./App.jsx";
import axios from "axios";

// ĐÂY LÀ ĐỘNG CƠ CỐT LÕI CỦA BẢO MẬT JWT DÀNH CHO FRONTEND
// Bất cứ khi nào React gửi lệnh gọi API đi, nó sẽ tự động chèn Thẻ Bài (Token) vào Hành Lý (Header)
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // OAuth2 Standard
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </StrictMode>,
);
