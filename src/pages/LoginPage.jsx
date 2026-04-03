import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://api.anhhoangg.id.vn/api/auth/login",
        credentials,
      );

      // Backend giờ trả về { token: "...", user: {...} }
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token); // Lưu vé vào ví (localStorage)
      
      window.dispatchEvent(new Event("authChange"));

      window.showToast?.("🎉 Đăng nhập thành công!", "success");
      res.data.user.role === "ADMIN" ? navigate("/admin") : navigate("/");
    } catch (err) {
      window.showToast?.("Lỗi: Sai tài khoản hoặc mật khẩu!", "error");
    }
  };

  return (
    <div className="auth-layout" style={{ flex: 1, display: "flex", background: "#f8fafc" }}>
      {/* Hình ảnh bên trái */}
      <div className="auth-image" style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", padding: "40px", backgroundImage: "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.4))" }}></div>
        <div style={{ position: "relative", zIndex: 1, maxWidth: "500px", color: "#fff" }}>
          <h1 style={{ fontSize: "50px", fontWeight: "900", lineHeight: "1.1", margin: "0 0 20px 0" }}>
            Khám Phá <br/><span style={{ color: "var(--primary-color)" }}>Phong Cách</span> <br/>Của Bạn
          </h1>
          <p style={{ fontSize: "18px", opacity: 0.8, lineHeight: 1.6 }}>
            Đăng nhập ngay để trải nghiệm không gian mua sắm thời trang đỉnh cao cùng hàng ngàn ưu đãi độc quyền dành riêng cho bạn.
          </p>
        </div>
      </div>

      {/* Form đăng nhập bên phải */}
      <div className="auth-form" style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "500px", maxWidth: "100%", padding: "50px", background: "#fff", boxShadow: "-20px 0 50px rgba(0,0,0,0.05)", zIndex: 2 }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ width: "60px", height: "60px", background: "linear-gradient(135deg, var(--primary-color), #b05020)", borderRadius: "15px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "30px", fontWeight: "900", margin: "0 auto 20px auto", boxShadow: "0 10px 20px rgba(224, 123, 57, 0.35)", fontFamily: "'Playfair Display', serif" }}>
            S
          </div>
          <h2 style={{ fontSize: "28px", color: "#1e293b", margin: "0 0 10px 0", fontWeight: "800" }}>Chào mừng trở lại! 👋</h2>
          <p style={{ color: "#64748b", margin: 0 }}>Vui lòng nhập thông tin để đăng nhập</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#475569", fontSize: "14px" }}>Tên đăng nhập</label>
            <input
              type="text"
              placeholder="Nhập tên tài khoản..."
              required
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              style={{ width: "100%", padding: "14px 16px", border: "1px solid #cbd5e1", borderRadius: "10px", backgroundColor: "#f8fafc", fontSize: "15px", transition: "0.2s" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#475569", fontSize: "14px" }}>Mật khẩu</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                style={{ width: "100%", padding: "14px 45px 14px 16px", border: "1px solid #cbd5e1", borderRadius: "10px", backgroundColor: "#f8fafc", fontSize: "15px", transition: "0.2s" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#94a3b8", padding: "5px" }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={{ width: "100%", padding: "16px", background: "var(--primary-color)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)", transition: "0.3s", marginTop: "10px" }}
          >
            ĐĂNG NHẬP
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "30px", color: "#64748b", fontSize: "15px" }}>
          Bạn chưa có tài khoản? <Link to="/register" style={{ color: "var(--primary-color)", fontWeight: "bold" }}>Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
