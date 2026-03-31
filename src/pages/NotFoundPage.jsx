import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(5);

  // Tự động đếm ngược rồi về trang chủ
  useEffect(() => {
    if (count <= 0) { navigate("/"); return; }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, navigate]);

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "60px 20px", background: "var(--bg-color)",
      textAlign: "center", minHeight: "60vh"
    }}>
      {/* Số 404 lớn */}
      <div style={{
        fontSize: "clamp(80px, 18vw, 160px)", fontWeight: "900",
        fontFamily: "'Playfair Display', serif",
        background: "linear-gradient(135deg, var(--primary-color), #b05020)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        lineHeight: 1, marginBottom: "10px",
        filter: "drop-shadow(0 8px 24px rgba(224,123,57,0.25))"
      }}>
        404
      </div>

      <div style={{ fontSize: "50px", marginBottom: "16px" }}>🧭</div>

      <h1 style={{
        fontSize: "clamp(22px, 4vw, 32px)", margin: "0 0 14px 0",
        color: "var(--text-primary)", fontWeight: "800"
      }}>
        Trang bạn tìm không tồn tại!
      </h1>

      <p style={{
        fontSize: "16px", color: "var(--text-secondary)", maxWidth: "440px",
        lineHeight: "1.7", margin: "0 0 36px 0"
      }}>
        Có thể đường dẫn đã bị thay đổi hoặc xóa.<br />
        Tự động về Trang Chủ sau <strong style={{ color: "var(--primary-color)", fontSize: "20px" }}>{count}</strong> giây...
      </p>

      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "13px 32px", background: "var(--primary-color)", color: "#fff",
            border: "none", borderRadius: "var(--border-radius-pill)", fontWeight: "700",
            fontSize: "15px", cursor: "pointer",
            boxShadow: "0 8px 20px rgba(224,123,57,0.35)"
          }}
        >
          🏠 Về Trang Chủ
        </button>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "13px 32px", background: "transparent", color: "var(--text-secondary)",
            border: "1.5px solid var(--border-color)", borderRadius: "var(--border-radius-pill)",
            fontWeight: "600", fontSize: "15px", cursor: "pointer"
          }}
        >
          ← Quay Lại
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
