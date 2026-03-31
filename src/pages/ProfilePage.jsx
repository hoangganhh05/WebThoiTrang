import React from "react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  if (!user) {
    navigate("/login");
    return null;
  }

  const isAdmin = user.role === "ADMIN";

  return (
    <div style={{ flex: 1, padding: "60px 20px", background: "var(--bg-color)" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto", background: "#fff", borderRadius: "20px", padding: "44px", boxShadow: "var(--shadow-lg)", border: "1px solid var(--border-color)" }}>

        {/* AVATAR */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "36px" }}>
          <div style={{
            width: "96px", height: "96px", borderRadius: "50%",
            background: "linear-gradient(135deg, var(--primary-color), #b05020)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: "900", fontSize: "38px", color: "#fff",
            boxShadow: "0 10px 25px rgba(224, 123, 57, 0.4)", marginBottom: "16px",
            fontFamily: "'Playfair Display', serif"
          }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ fontSize: "26px", margin: "0 0 8px 0", color: "var(--text-primary)", fontWeight: "800" }}>{user.username}</h2>
          <span style={{
            background: isAdmin ? "#7c3aed" : "var(--primary-color)",
            color: "#fff", padding: "4px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "700", letterSpacing: "0.5px"
          }}>
            {isAdmin ? "⚙️ Admin" : "👤 Thành Viên"}
          </span>
        </div>

        {/* THÔNG TIN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "36px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-secondary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", margin: "0 0 6px 0" }}>
            Thông tin tài khoản
          </h3>

          {[
            { icon: "🆔", label: "ID TÀI KHOẢN", value: `#${user.id}` },
            { icon: "👤", label: "TÊN ĐĂNG NHẬP", value: user.username },
            { icon: "🔑", label: "PHÂN QUYỀN", value: user.role },
          ].map(row => (
            <div key={row.label} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", background: "var(--bg-color)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
              <span style={{ fontSize: "22px" }}>{row.icon}</span>
              <div>
                <p style={{ margin: "0 0 3px 0", fontSize: "11px", color: "var(--text-muted)", fontWeight: "700", letterSpacing: "0.5px" }}>{row.label}</p>
                <p style={{ margin: 0, fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>{row.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* NÚT HÀNH ĐỘNG */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/")}
            style={{ padding: "12px 26px", background: "var(--bg-color)", color: "var(--text-primary)", border: "1.5px solid var(--border-color)", borderRadius: "12px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}
          >
            🏠 Trang Chủ
          </button>

          <button
            onClick={() => navigate("/orders")}
            style={{ padding: "12px 26px", background: "var(--primary-color)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 15px rgba(224, 123, 57, 0.35)" }}
          >
            📦 Đơn Hàng Của Tôi
          </button>

          {/* Nút Admin — chỉ hiện với ADMIN, không bị trống */}
          {isAdmin && (
            <>
              <button
                onClick={() => navigate("/admin/stats")}
                style={{ padding: "12px 26px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 15px rgba(124, 58, 237, 0.3)" }}
              >
                📊 Thống Kê
              </button>
              <button
                onClick={() => navigate("/admin")}
                style={{ padding: "12px 26px", background: "var(--danger-color)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 15px rgba(217, 79, 61, 0.3)" }}
              >
                ⚙️ Quản Trị
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
