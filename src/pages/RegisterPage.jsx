import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const RegisterPage = () => {
  const [user, setUser] = useState({
    username: "",
    password: "",
    role: "USER"
  });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/auth/register", user);
      alert("🎉 Đăng ký thành công! Hãy đăng nhập ngay.");
      navigate("/login");
    } catch (err) {
      alert("Lỗi: Tên đăng nhập đã tồn tại hoặc có lỗi xảy ra!");
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "row-reverse", background: "#f8fafc" }}>
      {/* Hình ảnh bên phải cho trang Đăng ký */}
      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "40px", backgroundImage: "url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2040&auto=format&fit=crop')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.4))" }}></div>
        <div style={{ position: "relative", zIndex: 1, maxWidth: "500px", color: "#fff", textAlign: "right" }}>
          <h1 style={{ fontSize: "50px", fontWeight: "900", lineHeight: "1.1", margin: "0 0 20px 0" }}>
            Trở Thành <br/>Thành Viên <br/><span style={{ color: "var(--warning-color)" }}>V.I.P</span>
          </h1>
          <p style={{ fontSize: "18px", opacity: 0.8, lineHeight: 1.6 }}>
            Một bước đăng ký, nghìn ưu đãi mở ra. Cú nhảy vọt vào thế giới thời trang đẳng cấp bắt đầu từ đây.
          </p>
        </div>
      </div>

      {/* Form đăng ký bên trái */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "500px", maxWidth: "100%", padding: "50px", background: "#fff", boxShadow: "20px 0 50px rgba(0,0,0,0.05)", zIndex: 2 }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ width: "60px", height: "60px", background: "linear-gradient(135deg, var(--warning-color), #f97316)", borderRadius: "15px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "30px", fontWeight: "900", margin: "0 auto 20px auto", boxShadow: "0 10px 20px rgba(245, 158, 11, 0.3)" }}>
            S
          </div>
          <h2 style={{ fontSize: "28px", color: "#1e293b", margin: "0 0 10px 0", fontWeight: "800" }}>Tạo tài khoản mới ✨</h2>
          <p style={{ color: "#64748b", margin: 0 }}>Gia nhập cộng đồng yêu thời trang ngay!</p>
        </div>

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#475569", fontSize: "14px" }}>Tên đăng nhập mới</label>
            <input
              type="text"
              placeholder="Chọn một tên dễ nhớ..."
              required
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              style={{ width: "100%", padding: "14px 16px", border: "1px solid #cbd5e1", borderRadius: "10px", backgroundColor: "#f8fafc", fontSize: "15px", transition: "0.2s" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#475569", fontSize: "14px" }}>Mật khẩu bảo mật</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu..."
              required
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              style={{ width: "100%", padding: "14px 16px", border: "1px solid #cbd5e1", borderRadius: "10px", backgroundColor: "#f8fafc", fontSize: "15px", transition: "0.2s" }}
            />
          </div>

          <button
            type="submit"
            style={{ width: "100%", padding: "16px", background: "var(--warning-color)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 15px rgba(245, 158, 11, 0.4)", transition: "0.3s", marginTop: "10px" }}
          >
            ĐĂNG KÝ NGAY
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "30px", color: "#64748b", fontSize: "15px" }}>
          Bạn đã có tài khoản? <Link to="/login" style={{ color: "var(--primary-color)", fontWeight: "bold" }}>Trở về đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
