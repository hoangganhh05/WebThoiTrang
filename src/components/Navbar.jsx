import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

const Navbar = () => {
  const navigate = useNavigate();

  // Đọc trực tiếp từ localStorage khi khởi tạo State
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Lắng nghe sự kiện login từ LoginPage để cập nhật UI ngay lập tức
  useEffect(() => {
    const handleAuthChange = () => {
      const savedUser = localStorage.getItem("user");
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };

    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [adminOpen, setAdminOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const adminRef = React.useRef(null);
  const profileRef = React.useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (adminRef.current && !adminRef.current.contains(e.target)) {
        setAdminOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.dispatchEvent(new Event("authChange"));
    window.showToast?.("Hẹn gặp lại!", "info");
    setShowLogoutConfirm(false);
    navigate("/login");
  };

  // Hàm xử lý khi nhấn Enter hoặc nút Tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault(); // Ngăn load lại trang
    if (searchTerm.trim()) {
      console.log("Đang tìm kiếm:", searchTerm);
      navigate(`/?keyword=${searchTerm.trim()}`);
    } else {
      navigate(`/`);
    }
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center", // Thêm alignItems để căn giữa các phần tử theo chiều dọc
        padding: "1rem",
        background: "#333",
        color: "#fff",
      }}
    >
      {/* 1. BÊN TRÁI: Logo */}
      <Link
        to="/"
        style={{ color: "#fff", textDecoration: "none", fontSize: "24px", display: "flex", alignItems: "center", gap: "12px" }}
      >
        <div style={{
          width: "40px", height: "40px",
          background: "linear-gradient(135deg, var(--primary-color), #b05020)",
          borderRadius: "10px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: "900", fontSize: "22px", color: "#fff",
          boxShadow: "0 4px 10px rgba(224, 123, 57, 0.5)",
          fontFamily: "'Playfair Display', serif"
        }}>
          S
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ fontWeight: "800", letterSpacing: "1px", lineHeight: "1", fontFamily: "'Playfair Display', serif" }}>S-Style</span>
          <span style={{ color: "var(--primary-color)", fontWeight: "500", fontSize: "11px", letterSpacing: "3px", lineHeight: "1.4", textTransform: "uppercase" }}>Thời Trang</span>
        </div>
      </Link>

      {/* 2. Ở GIỮA: Thanh tìm kiếm */}
      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          flex: 1,
          margin: "0 20px",
        }}
      >
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            display: "flex",
            flex: 1,
            padding: "6px 12px",
            borderRadius: "4px 0 0 4px",
            border: "none",
            outline: "none",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "6px 12px",
            background: "#f0ad4e",
            color: "#fff",
            border: "none",
            borderRadius: "0 4px 4px 0",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Tìm
        </button>
      </form>

      {/* 3. BÊN PHẢI: Menu và User */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Link
          to="/"
          style={{ margin: "0 10px", color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}
        >
          <span>👕</span> Sản phẩm
        </Link>
        <Link
          to="/cart"
          style={{ margin: "0 10px", color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}
        >
          <span>🛒</span> Giỏ hàng
        </Link>

        {user ? (
          <>
            <div 
              ref={profileRef}
              style={{ position: "relative", marginLeft: "15px" }}
            >
              <div 
                onClick={() => setProfileOpen(!profileOpen)}
                title={user.username} 
                style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "3px", background: profileOpen ? "rgba(255,255,255,0.15)" : "transparent", borderRadius: "50%", cursor: "pointer", transition: "all 0.3s" }}
              >
                <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg, var(--primary-color), #b05020)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "16px", color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>

              {profileOpen && (
                <div
                  style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#1e293b", border: "1px solid #334155", borderRadius: "14px", padding: "8px", minWidth: "180px", boxShadow: "0 20px 40px rgba(0,0,0,0.4)", zIndex: 9999 }}
                >
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 14px", color: "#fff", textDecoration: "none", fontWeight: "600", fontSize: "14px", borderRadius: "10px", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: "18px" }}>👤</span>
                    Hồ sơ của tôi
                  </Link>

                  <div
                    onClick={() => { setProfileOpen(false); setShowLogoutConfirm(true); }}
                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 14px", color: "#ef4444", textDecoration: "none", fontWeight: "600", fontSize: "14px", borderRadius: "10px", transition: "background 0.15s", cursor: "pointer", marginTop: "5px", borderTop: "1px solid #334155" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: "18px" }}>🚪</span>
                    Đăng xuất
                  </div>
                </div>
              )}
            </div>
            {user.role === "ADMIN" && (
              <div
                ref={adminRef}
                style={{ position: "relative", marginLeft: "15px" }}
              >
                {/* Nút bấm Admin — Click để toggle */}
                <div
                  onClick={() => setAdminOpen(prev => !prev)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: adminOpen ? "rgba(255,77,77,0.25)" : "rgba(255,77,77,0.15)", border: "1px solid rgba(255,77,77,0.3)", borderRadius: "10px", cursor: "pointer", color: "#ff6b6b", fontWeight: "bold", fontSize: "14px", userSelect: "none", transition: "background 0.2s ease" }}
                >
                  <span>⚙️ Admin</span>
                  <span style={{ fontSize: "10px", opacity: 0.7, transition: "transform 0.25s", transform: adminOpen ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block" }}>▼</span>
                </div>

                {/* Dropdown menu — dùng React state, không bao giờ bị mất */}
                {adminOpen && (
                  <div
                    className="admin-dropdown"
                    style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#1e293b", border: "1px solid #334155", borderRadius: "14px", padding: "8px", minWidth: "210px", boxShadow: "0 20px 40px rgba(0,0,0,0.4)", zIndex: 9999 }}
                  >
                    {[
                      { to: "/admin/stats",      icon: "📊", label: "Thống Kê Doanh Thu", color: "#f59e0b" },
                      { to: "/admin/orders",     icon: "📦", label: "Quản lý Đơn Hàng",   color: "#3b82f6" },
                      { to: "/admin",            icon: "👕", label: "Quản lý Sản Phẩm",   color: "#ff4d4d" },
                      { to: "/admin/categories", icon: "🏷️", label: "Quản lý Danh Mục",   color: "#10b981" },
                    ].map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setAdminOpen(false)}
                        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 14px", color: item.color, textDecoration: "none", fontWeight: "600", fontSize: "14px", borderRadius: "10px", transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <span style={{ fontSize: "18px" }}>{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <Link
            to="/login"
            style={{
              marginLeft: "15px",
              border: "1px solid var(--primary-color)",
              background: "var(--primary-color)",
              color: "#fff",
              padding: "8px 20px",
              borderRadius: "20px",
              textDecoration: "none",
              fontWeight: "600",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            Đăng nhập
          </Link>
        )}

        {/* Lưu ý: Bạn đang có 1 link Admin bị thừa ở đây khi chưa đăng nhập, tôi vẫn giữ nguyên theo code gốc của bạn */}
        {/* <Link to="/admin" style={{ margin: "0 10px", color: "#ff4d4d" }}>
          Admin
        </Link> */}
      </div>

      {/* CUSTOM LOGOUT CONFIRM MODAL SIÊU ĐẸP */}
      {showLogoutConfirm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease" }}>
          <div style={{ background: "var(--card-bg)", padding: "30px", borderRadius: "16px", width: "90%", maxWidth: "400px", boxShadow: "var(--shadow-lg)", textAlign: "center", color: "var(--text-primary)", animation: "popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
            <div style={{ fontSize: "40px", marginBottom: "15px", animation: "float-up 0.5s ease" }}>🚪</div>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "22px", fontWeight: "800", color: "#1e293b" }}>Xác nhận đăng xuất</h3>
            <p style={{ margin: "0 0 25px 0", color: "#64748b", fontSize: "15px", lineHeight: "1.5" }}>
              Bạn có chắc chắn muốn rời khỏi hệ thống <b style={{ color: "var(--primary-color)" }}>S-Style</b> không? Hãy quay lại sớm nhé!
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                style={{ flex: 1, padding: "12px", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", borderRadius: "10px", fontWeight: "bold", fontSize: "15px" }}
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleLogout}
                style={{ flex: 1, padding: "12px", background: "var(--danger-color)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "bold", fontSize: "15px", boxShadow: "0 4px 10px rgba(217, 79, 61, 0.3)" }}
              >
                Thoát ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
