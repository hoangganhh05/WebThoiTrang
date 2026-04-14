import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../api/api";

const ProductCard = ({ product, addToCart }) => {
  const navigate = useNavigate();

  const name = product.sanPham || product.name || "Sản phẩm không tên";
  const price = typeof product.price === "number" ? product.price : 0;
  const stock = typeof product.quantity === "number" ? product.quantity : 0;
  const categoryName = product.category?.name || "Chưa phân loại";

  const rawUrl = product.imageUrl || "";
  const imageUrl = rawUrl && rawUrl.startsWith("/")
    ? `${BASE_URL}${rawUrl}`
    : rawUrl;

  return (
    <div
      style={{
        border: "1px solid var(--border-color)",
        borderRadius: "var(--border-radius)",
        textAlign: "center",
        backgroundColor: "#fff",
        boxShadow: "var(--shadow-sm)",
        // Spring easing: nhanh lên rồi hơi overshoot — cảm giác "sống"
        transition: "transform 0.38s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.38s cubic-bezier(0.22,1,0.36,1)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden"
      }}
      onMouseOver={e => {
        e.currentTarget.style.transform = "translateY(-7px) scale(1.01)";
        e.currentTarget.style.boxShadow = "0 16px 40px rgba(44,36,32,0.13)";
        // Zoom ảnh vào
        const img = e.currentTarget.querySelector("img");
        if (img) img.style.transform = "scale(1.07)";
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
        const img = e.currentTarget.querySelector("img");
        if (img) img.style.transform = "scale(1)";
      }}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Ảnh sản phẩm */}
      <div style={{ position: "relative", width: "100%", height: "210px", background: "#f5f2ef", borderRadius: "calc(var(--border-radius) - 2px) calc(var(--border-radius) - 2px) 0 0", overflow: "hidden" }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              backgroundColor: "#f5f2ef",
              // Zoom ảnh mượt theo spring
              transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)"
            }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "13px" }}>
            🖼️ Chưa có ảnh
          </div>
        )}

        {/* Badge hết hàng */}
        {stock <= 0 && (
          <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(217, 79, 61, 0.9)", color: "#fff", padding: "4px 10px", borderRadius: "var(--border-radius-pill)", fontSize: "11px", fontWeight: "700", backdropFilter: "blur(4px)", letterSpacing: "0.5px" }}>
            HẾT HÀNG
          </div>
        )}

        {/* Badge danh mục */}
        <div style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)", padding: "3px 10px", borderRadius: "var(--border-radius-pill)", fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", letterSpacing: "0.3px" }}>
          {categoryName}
        </div>
      </div>

      {/* Thông tin */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1 }}>
        <h3 style={{ margin: "0 0 6px 0", fontSize: "15px", color: "var(--text-primary)", fontWeight: "700", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", display: "-webkit-box", minHeight: "38px", textAlign: "left", lineHeight: "1.4" }}>
          {name}
        </h3>

        <p style={{ fontWeight: "800", color: "var(--danger-color)", fontSize: "18px", margin: "8px 0 0 0", textAlign: "left" }}>
          {price.toLocaleString()}đ
        </p>

        <div style={{ flex: 1 }} />

        <button
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
          }}
          disabled={stock <= 0}
          style={{
            marginTop: "14px",
            background: stock > 0 ? "var(--primary-color)" : "#c5bdb8",
            color: "white",
            border: "none",
            padding: "11px",
            width: "100%",
            cursor: stock > 0 ? "pointer" : "not-allowed",
            borderRadius: "var(--border-radius-sm)",
            fontWeight: "700",
            fontSize: "13.5px",
            boxShadow: stock > 0 ? "0 4px 12px rgba(224, 123, 57, 0.3)" : "none",
            letterSpacing: "0.3px",
          }}
        >
          {stock > 0 ? "🛒 Thêm vào giỏ" : "Tạm hết hàng"}
        </button>
      </div>
    </div>
  );
};
export default ProductCard;
