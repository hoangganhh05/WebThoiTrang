import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminStats from "./pages/AdminStats";
import AdminCategories from "./pages/AdminCategories";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import About from "./pages/About";
import Footer from "./pages/Footer";
import ProfilePage from "./pages/ProfilePage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import NotFoundPage from "./pages/NotFoundPage";
import { CartProvider } from "./context/CartContext";
import CartPage from "./components/CartPage";
import { useState, useEffect } from "react";

// --- HỆ THỐNG TOAST THÔNG BÁO XỊN XÒ ---
const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Tạo một hàm showToast chuẩn mực toàn cục (không cần đè alert nữa)
    window.showToast = (msg, type = "success") => {
      window.dispatchEvent(new CustomEvent('showToast', { detail: { message: msg, type: type } }));
    };

    // VẪN giữ lại một hàm alert cũ để back-up nếu nơi khác lỡ gọi
    window.alert = (msg, type = "info") => {
      let autoType = type;
      if (msg.toLowerCase().includes("lỗi") || msg.toLowerCase().includes("thất bại")) autoType = "error";
      else if (msg.toLowerCase().includes("thành công")) autoType = "success";
      window.dispatchEvent(new CustomEvent('showToast', { detail: { message: msg, type: autoType } }));
    };

    const handleToast = (e) => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { id, ...e.detail }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3500);
    };

    window.addEventListener('showToast', handleToast);
    return () => window.removeEventListener('showToast', handleToast);
  }, []);

  return (
    <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 99999, display: "flex", flexDirection: "column", gap: "15px", pointerEvents: "none" }}>
      {toasts.map(t => (
        <div key={t.id} style={{ 
          background: t.type === 'error' ? '#ef4444' : t.type === 'success' ? '#10b981' : '#3b82f6', 
          color: '#fff', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', 
          display: 'flex', alignItems: 'center', gap: '12px', animation: 'slideInToast 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          minWidth: "280px"
        }}>
          <span style={{ fontSize: "20px" }}>{t.type === 'error' ? '❌' : t.type === 'success' ? '✅' : '🔔'}</span>
          <span style={{ fontWeight: "600", fontSize: "15px", textShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>{t.message}</span>
        </div>
      ))}
    </div>
  );
};
// ----------------------------------------


// Component bảo vệ route Admin: chỉ cho ADMIN truy cập
const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "ADMIN") {
    alert("Bạn không có quyền truy cập trang này!");
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <ToastContainer />
      <Navbar />
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/stats"
          element={
            <AdminRoute>
              <AdminStats />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <AdminRoute>
              <AdminCategories />
            </AdminRoute>
          }
        />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;

