export default function Footer() {
  return (
    <footer style={{ background: "#0f172a", color: "#94a3b8", padding: "60px 3rem 20px", marginTop: "auto", borderTop: "1px solid #1e293b", fontFamily: "var(--font-family)", zIndex: 10 }}>
      <div style={{ maxWidth: "1800px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "40px", paddingBottom: "40px", borderBottom: "1px solid #1e293b" }}>

          <div style={{ flex: "1 1 300px" }}>
            <h2 style={{ color: "#fff", margin: "0 0 15px 0", fontSize: "26px", display: "flex", alignItems: "center", gap: "12px", fontWeight: "900" }}>
              <div style={{
                width: "40px", height: "40px",
                background: "linear-gradient(135deg, var(--primary-color), #8b5cf6)",
                borderRadius: "10px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: "900", fontSize: "22px", color: "#fff",
                boxShadow: "0 4px 10px rgba(59, 130, 246, 0.4)"
              }}>
                S
              </div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <span style={{ fontWeight: "800", letterSpacing: "1px", lineHeight: "1", fontSize: "20px" }}>SHOP</span>
                <span style={{ color: "var(--primary-color)", fontWeight: "600", fontSize: "12px", letterSpacing: "2px", lineHeight: "1.2" }}>THỜITRANG</span>
              </div>
            </h2>
            <p style={{ margin: "0 0 20px 0", lineHeight: "1.7", fontSize: "15px" }}>
              Tiên phong xu hướng thời trang hiện đại. Mang đến cho bạn những bộ trang phục tự tin, thoải mái và đẳng cấp nhất, cho mọi khoảnh khắc trong cuộc sống.
            </p>
            <div style={{ display: "flex", gap: "15px" }}>
              <span title="Facebook" style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", transition: "0.3s", ":hover": { background: "var(--primary-color)" } }}><a href="https://www.facebook.com/hoang.anh.20112005" target="_blank">f</a></span>
              <span title="Instagram" style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", transition: "0.3s" }}>ig</span>
              <span title="Twitter" style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", transition: "0.3s" }}>X</span>
            </div>
          </div>

          <div style={{ flex: "1 1 150px" }}>
            <h3 style={{ color: "#fff", fontSize: "18px", marginBottom: "20px" }}>DỊCH VỤ</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px", fontSize: "15px" }}>
              <li><a href="#" style={{ color: "#94a3b8", textDecoration: "none", transition: "0.2s" }}>Điều khoản sử dụng</a></li>
              <li><a href="#" style={{ color: "#94a3b8", textDecoration: "none", transition: "0.2s" }}>Chính sách bảo mật</a></li>
              <li><a href="#" style={{ color: "#94a3b8", textDecoration: "none", transition: "0.2s" }}>Chính sách đổi trả</a></li>
              <li><a href="#" style={{ color: "#94a3b8", textDecoration: "none", transition: "0.2s" }}>Hướng dẫn mua hàng</a></li>
            </ul>
          </div>

          <div style={{ flex: "1 1 200px" }}>
            <h3 style={{ color: "#fff", fontSize: "18px", marginBottom: "20px" }}>LIÊN HỆ</h3>
            <p style={{ margin: "0 0 12px 0", fontSize: "15px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <span>📍</span> Đường Z 115, Quyết Thắng, Thái Nguyên
            </p>
            <p style={{ margin: "0 0 12px 0", fontSize: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span>📞</span> 0123 456 789
            </p>
            <p style={{ margin: "0 0 12px 0", fontSize: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span>📧</span> hoanganh05@gmail.com
            </p>
          </div>

        </div>

        <div style={{ textAlign: "center", paddingTop: "25px", fontSize: "14px", color: "#64748b" }}>
          &copy; {new Date().getFullYear()} Shop Thời Trang. All rights reserved. Designed with ❤️ by You.
        </div>
      </div>
    </footer>
  );
}
