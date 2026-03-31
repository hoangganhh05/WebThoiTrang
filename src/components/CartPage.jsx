import { useCart } from "../context/CartContext";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, totalPrice, setCartItems } = useCart();

  const handleCheckout = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Vui lòng đăng nhập để tiến hành đặt hàng!");
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="cart-page-wrapper" style={{ flex: 1, backgroundColor: "#f8fafc", padding: "40px 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <h2 style={{ fontSize: "28px", color: "#1e293b", marginBottom: "30px", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px" }}>
          <span>🛒</span> Giỏ hàng của bạn
        </h2>

        {cartItems.length === 0 ? (
          <div style={{ textAlign: "center", background: "#fff", padding: "60px 20px", borderRadius: "16px", boxShadow: "var(--shadow-md)" }}>
            <span style={{ fontSize: "60px", display: "block", marginBottom: "20px" }}>🪹</span>
            <h3 style={{ fontSize: "22px", margin: "0 0 15px 0", color: "#64748b" }}>Giỏ hàng hiện đang trống</h3>
            <p style={{ color: "#94a3b8", marginBottom: "30px" }}>Bạn chưa chọn được sản phẩm nào yêu thích sao?</p>
            <Link to="/" style={{ display: "inline-block", background: "var(--primary-color)", color: "#fff", padding: "12px 30px", borderRadius: "30px", fontWeight: "600", boxShadow: "0 4px 15px rgba(59,130,246,0.3)" }}>
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "30px", flexWrap: "wrap", alignItems: "flex-start" }}>
            
            {/* Cột trái: Danh sách sản phẩm */}
            <div style={{ flex: "1 1 600px", background: "#fff", borderRadius: "16px", padding: "25px", boxShadow: "var(--shadow-sm)" }}>
              <h3 style={{ fontSize: "18px", borderBottom: "1px solid var(--border-color)", paddingBottom: "15px", margin: "0 0 20px 0" }}>
                Số lượng sản phẩm: <span style={{ color: "var(--primary-color)" }}>{cartItems.length}</span>
              </h3>
              
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "20px" }}>
                {cartItems.map((item) => (
                  <li key={item.id} style={{ display: "flex", gap: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "20px" }}>
                    {/* Ảnh sản phẩm */}
                    <div style={{ width: "120px", height: "120px", background: "#f1f5f9", borderRadius: "12px", overflow: "hidden", flexShrink: 0 }}>
                      <img
                        src={item.imageUrl && item.imageUrl.startsWith("/") ? `http://localhost:8080${item.imageUrl}` : (item.imageUrl || "https://via.placeholder.com/120?text=No+Image")}
                        alt={item.sanPham}
                        style={{ width: "100%", height: "100%", objectFit: "contain", background: "#fff" }}
                      />
                    </div>
                    {/* Thông tin sản phẩm */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <h4 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#1e293b", maxWidth: "80%" }}>{item.sanPham}</h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.1)", border: "none", padding: "5px 10px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}
                          title="Xóa khỏi giỏ hàng"
                        >
                          X
                        </button>
                      </div>
                      <p style={{ margin: "0 0 auto 0", color: "#64748b", fontSize: "14px" }}>Đơn giá: {(item.price || 0).toLocaleString()}đ</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div style={{ background: "#f1f5f9", padding: "6px 15px", borderRadius: "20px", fontSize: "14px", fontWeight: "600" }}>
                          Số lượng: {item.quantity}
                        </div>
                        <p style={{ margin: 0, fontWeight: "800", color: "#0f172a", fontSize: "18px" }}>
                          {(item.price * item.quantity).toLocaleString()}đ
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cột phải: Khung hóa đơn thanh toán */}
            <div style={{ flex: "0 1 380px", background: "#fff", borderRadius: "16px", padding: "30px", boxShadow: "var(--shadow-lg)", position: "sticky", top: "100px" }}>
              <h3 style={{ margin: "0 0 25px 0", fontSize: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "15px" }}>
                Tóm tắt đơn hàng
              </h3>
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", color: "#64748b" }}>
                <span>Tạm tính ({cartItems.length} sp)</span>
                <span style={{ fontWeight: "600", color: "#1e293b" }}>{totalPrice.toLocaleString()}đ</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", color: "#64748b" }}>
                <span>Tiết kiệm (Khuyến mãi)</span>
                <span style={{ fontWeight: "600", color: "var(--success-color)" }}>0đ</span>
              </div>
              
              <div style={{ borderTop: "1px dashed var(--border-color)", margin: "20px 0" }}></div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <span style={{ fontSize: "16px", fontWeight: "600" }}>Tổng tiền:</span>
                <span style={{ fontSize: "26px", fontWeight: "900", color: "#ef4444" }}>
                  {totalPrice.toLocaleString()}đ
                </span>
              </div>

              <button
                onClick={handleCheckout}
                style={{
                  width: "100%", padding: "16px", background: "var(--success-color)", color: "#fff", border: "none", borderRadius: "12px",
                  fontSize: "16px", fontWeight: "800", cursor: "pointer", textTransform: "uppercase", letterSpacing: "1px",
                  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)"
                }}
              >
                TIẾN HÀNH THANH TOÁN
              </button>
              
              <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center", color: "#94a3b8", fontSize: "13px" }}>
                <span>🛡️ Thanh toán bảo mật</span>
                <span>•</span>
                <span>Giao hàng thu tiền (COD)</span>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
