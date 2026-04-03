import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axios from "axios";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, totalPrice, setCartItems, clearCart } = useCart();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isBank, setIsBank] = useState(false);
  const [bankOrderData, setBankOrderData] = useState(null);
  const [successOrderData, setSuccessOrderData] = useState(null);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    fullName: user ? user.username : "",
    phone: "",
    address: "",
    note: "",
    paymentMethod: "COD"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  if (cartItems.length === 0 && !isSuccess && !isBank) {
    navigate("/cart");
    return null;
  }

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0); // Số tiền được giảm
  const [couponStatus, setCouponStatus] = useState(null); // 'success' | 'error' | null

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === "SALE2026") {
      const amount = totalPrice * 0.2;
      setDiscount(amount);
      setCouponStatus("success");
      window.showToast?.("Đã áp dụng mã SALE2026 giảm 20%! 🎁", "success");
    } else {
      setDiscount(0);
      setCouponStatus("error");
      window.showToast?.("Mã giảm giá không hợp lệ!", "error");
    }
  };

  const finalTotal = totalPrice - discount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      user: { id: user.id },
      totalPrice: finalTotal,
      status: "PENDING",
      fullName: formData.fullName,
      address: formData.address,
      phone: formData.phone,
      note: formData.note + (discount > 0 ? ` (Mã giảm giá: ${couponCode})` : ""),
      orderItems: cartItems.map((item) => ({
        product: { id: item.id },
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      const res = await axios.post("http://localhost:8080/api/orders", orderData);
      
      // Phân tích kết quả trả về từ Backend để lấy Order ID
      const responseText = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
      const match = responseText.match(/\d+/);
      const orderId = match ? match[0] : Math.floor(Math.random() * 100000);
      
      // LƯU LẠI TOÀN BỘ DỮ LIỆU ĐƠN HÀNG TRƯỚC KHI XÓA GIỎ
      setSuccessOrderData({ id: orderId, amount: finalTotal });
      
      // Xóa giỏ hàng
      await clearCart();
      
      if (formData.paymentMethod === "BANK") {
        setBankOrderData({ id: orderId, amount: finalTotal });
        setIsBank(true);
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      alert("Lỗi: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  // MÀN HÌNH MÃ QR NGÂN HÀNG (Dùng finalTotal)
  if (isBank && bankOrderData) {
    const qrUrl = `https://img.vietqr.io/image/vietinbank-108880291667-compact2.jpg?amount=${bankOrderData.amount}&addInfo=Thanh toan don hang ${bankOrderData.id}&accountName=CAO HOANG ANH`;
    
    return (
      <div style={{ flex: 1, backgroundColor: "#f8fafc", padding: "60px 20px", display: "flex", justifyContent: "center" }}>
        <div style={{ background: "#fff", padding: "40px", borderRadius: "20px", textAlign: "center", maxWidth: "450px", width: "100%", boxShadow: "0 20px 50px rgba(0,0,0,0.1)", border: "1px solid var(--border-color)" }}>
          <h2 style={{ fontSize: "24px", color: "#1e293b", margin: "0 0 10px 0", fontWeight: "800" }}>Quét Mã Thanh Toán</h2>
          <p style={{ color: "#64748b", fontSize: "15px", marginBottom: "30px" }}>Đơn hàng <strong>#{bankOrderData.id}</strong> đã được lưu. Vui lòng quét mã bên dưới bằng App Ngân Hàng của bạn.</p>
          
          <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "2px dashed #cbd5e1", marginBottom: "30px" }}>
            <img src={qrUrl} alt="VietQR" style={{ width: "100%", borderRadius: "10px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }} />
          </div>

          <div style={{ background: "rgba(59, 130, 246, 0.1)", padding: "15px", borderRadius: "10px", textAlign: "left", marginBottom: "30px" }}>
            <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#475569" }}>Tên chủ TK: <strong>CAO HOANG ANH</strong></p>
            <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#475569" }}>Số tài khoản: <strong style={{ color: "var(--primary-color)", fontSize: "16px" }}>108880291667</strong></p>
            <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#475569" }}>Ngân hàng: <strong>VietinBank</strong></p>
            <p style={{ margin: "0", fontSize: "14px", color: "#475569" }}>Số tiền: <strong style={{ color: "#ef4444", fontSize: "16px" }}>{bankOrderData.amount.toLocaleString()}đ</strong></p>
          </div>

          <button 
            onClick={() => navigate("/orders")}
            style={{ width: "100%", padding: "16px", background: "var(--primary-color)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 10px 20px rgba(59, 130, 246, 0.3)" }}
          >
            TÔI ĐÃ CHUYỂN KHOẢN XONG
          </button>
          <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "15px" }}>* Admin sẽ xác nhận và giao hàng ngay sau khi nhận được tiền.</p>
        </div>
      </div>
    );
  }

  // MÀN HÌNH THÀNH CÔNG COD / THANH TOÁN XONG
  if (isSuccess) {
    return (
      <div style={{ flex: 1, backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 20px", position: "relative", overflow: "hidden" }}>
        
        {/* Bong bóng trang trí */}
        <div style={{ position: "absolute", top: "-50px", left: "10%", width: "200px", height: "200px", background: "rgba(224, 123, 57, 0.05)", borderRadius: "50%", zIndex: 0 }}></div>
        <div style={{ position: "absolute", bottom: "-50px", right: "5%", width: "300px", height: "300px", background: "rgba(124, 58, 237, 0.03)", borderRadius: "50%", zIndex: 0 }}></div>

        <div className="animate-pop-in" style={{ background: "#fff", padding: "60px", borderRadius: "32px", textAlign: "center", maxWidth: "600px", boxShadow: "0 30px 100px rgba(0,0,0,0.08)", border: "1px solid var(--border-color)", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "100px", marginBottom: "30px", filter: "drop-shadow(0 10px 20px rgba(224, 123, 57, 0.2))" }}>🎊</div>
          
          <h2 style={{ color: "var(--text-primary)", fontSize: "36px", marginBottom: "15px", fontWeight: "900", fontFamily: "'Playfair Display', serif" }}>
            Đặt hàng thành công!
          </h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: "1.8", marginBottom: "40px", fontSize: "17px" }}>
            Tuyệt vời! Đơn hàng của bạn đã được hệ thống ghi nhận.<br/>
            Chúng tôi sẽ sớm liên hệ để xác nhận và giao hàng đến cho bạn.
          </p>

          <div style={{ background: "var(--bg-color)", padding: "25px", borderRadius: "20px", marginBottom: "40px", textAlign: "left", border: "1.5px dashed var(--border-color)" }}>
             <h4 style={{ margin: "0 0 15px 0", fontSize: "15px", color: "var(--text-primary)" }}>Mã đơn hàng: <span style={{ color: "var(--primary-color)" }}>#ORD-{successOrderData?.id}</span></h4>
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <span>Phương thức:</span>
                <span style={{ fontWeight: "700" }}>{formData.paymentMethod === "COD" ? "Thanh toán khi nhận hàng" : "Chuyển khoản QR"}</span>
             </div>
             <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "var(--text-secondary)" }}>
                <span>Tổng thanh toán:</span>
                <span style={{ fontWeight: "900", color: "var(--danger-color)", fontSize: "18px" }}>{successOrderData?.amount?.toLocaleString() || 0}đ</span>
             </div>
          </div>

          <div className="animate-float-up" style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
            <button 
              onClick={() => navigate("/orders")}
              style={{ padding: "16px 35px", background: "var(--primary-color)", color: "#fff", border: "none", borderRadius: "16px", fontSize: "16px", fontWeight: "800", cursor: "pointer", boxShadow: "0 10px 25px rgba(224, 123, 57, 0.35)" }}
            >
              Xem đơn hàng của tôi 📦
            </button>
            <button 
              onClick={() => navigate("/")}
              style={{ padding: "16px 30px", background: "#fff", color: "var(--text-primary)", border: "1.5px solid var(--border-color)", borderRadius: "16px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}
            >
              Tiếp tục mua sắm
            </button>
          </div>
          
          <p style={{ marginTop: "30px", fontSize: "13px", color: "var(--text-muted)" }}>
             Mọi thắc mắc vui lòng liên hệ hotline: <strong>1900 8888</strong>
          </p>
        </div>
      </div>
    );
  }

  // MÀN HÌNH CHỌN PHƯƠNG THỨC THANH TOÁN
  return (
    <div style={{ flex: 1, backgroundColor: "#f8fafc", padding: "40px 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <h2 style={{ fontSize: "28px", color: "#1e293b", marginBottom: "30px", fontWeight: "900", display: "flex", alignItems: "center", gap: "10px" }}>
          <span>💳</span> Thông tin thanh toán
        </h2>

        <div style={{ display: "flex", gap: "30px", flexWrap: "wrap", alignItems: "flex-start" }}>
          
          <div style={{ flex: "1 1 600px", background: "#fff", borderRadius: "16px", padding: "30px", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-color)" }}>
            <h3 style={{ fontSize: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "15px", margin: "0 0 25px 0" }}>
              Chi tiết giao hàng
            </h3>
            
            <form id="checkout-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#475569" }}>Họ tên người nhận *</label>
                  <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="VD: Nguyễn Văn A" style={{ width: "100%", padding: "12px 15px", border: "1px solid var(--border-color)", borderRadius: "10px", outline: "none", fontSize: "15px", backgroundColor: "#f8fafc" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#475569" }}>Số điện thoại *</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="VD: 0912 345 678" style={{ width: "100%", padding: "12px 15px", border: "1px solid var(--border-color)", borderRadius: "10px", outline: "none", fontSize: "15px", backgroundColor: "#f8fafc" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#475569" }}>Địa chỉ giao hàng *</label>
                <textarea required name="address" value={formData.address} onChange={handleChange} rows="3" placeholder="Ghi rõ số nhà, tên đường, phường/xã..." style={{ width: "100%", padding: "12px 15px", border: "1px solid var(--border-color)", borderRadius: "10px", outline: "none", fontSize: "15px", resize: "vertical", backgroundColor: "#f8fafc" }}></textarea>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#475569" }}>Ghi chú đơn hàng</label>
                <input type="text" name="note" value={formData.note} onChange={handleChange} placeholder="VD: Giao giờ hành chính, gọi trước khi đến..." style={{ width: "100%", padding: "12px 15px", border: "1px solid var(--border-color)", borderRadius: "10px", outline: "none", fontSize: "15px", backgroundColor: "#f8fafc" }} />
              </div>

              <div style={{ marginTop: "10px" }}>
                <label style={{ display: "block", marginBottom: "15px", fontWeight: "600", fontSize: "16px", color: "#1e293b" }}>Chọn phương thức thanh toán:</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "18px", border: formData.paymentMethod === "COD" ? "2px solid var(--primary-color)" : "1px solid var(--border-color)", borderRadius: "12px", background: formData.paymentMethod === "COD" ? "rgba(59, 130, 246, 0.05)" : "#fff", cursor: "pointer", transition: "0.2s" }}>
                    <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === "COD"} onChange={handleChange} style={{ width: "20px", height: "20px", accentColor: "var(--primary-color)" }} />
                    <span style={{ fontWeight: "600", fontSize: "15px" }}>🚚 Thanh toán tiền mặt khi nhận hàng (COD)</span>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "18px", border: formData.paymentMethod === "BANK" ? "2px solid var(--primary-color)" : "1px solid var(--border-color)", borderRadius: "12px", background: formData.paymentMethod === "BANK" ? "rgba(59, 130, 246, 0.05)" : "#fff", cursor: "pointer", transition: "0.2s" }}>
                    <input type="radio" name="paymentMethod" value="BANK" checked={formData.paymentMethod === "BANK"} onChange={handleChange} style={{ width: "20px", height: "20px", accentColor: "var(--primary-color)" }} />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: "600", fontSize: "15px" }}>🏦 Chuyển khoản QR (VietinBank)</span>
                      <span style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>Quét mã tự động điền thông tin nhanh chóng 24/7.</span>
                    </div>
                    <img src="https://img.vietqr.io/image/vietinbank-108880291667-compact.png?amount=10000" alt="Vietinbank" style={{ width: "40px", height: "40px", objectFit: "cover", marginLeft: "auto", borderRadius: "5px" }}/>
                  </label>
                </div>
              </div>
            </form>
          </div>

          <div style={{ flex: "0 1 400px", background: "#fff", borderRadius: "16px", padding: "30px", boxShadow: "var(--shadow-lg)", position: "sticky", top: "100px", border: "1px solid var(--border-color)" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "15px" }}>
              Tóm tắt đơn hàng
            </h3>
            
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px 0", display: "flex", flexDirection: "column", gap: "15px", maxHeight: "300px", overflowY: "auto" }}>
              {cartItems.map((item) => (
                <li key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                   <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                     <div style={{ width: "50px", height: "50px", background: "#f1f5f9", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                        <img src={item.imageUrl && item.imageUrl.startsWith("/") ? `http://localhost:8080${item.imageUrl}` : (item.imageUrl || "https://via.placeholder.com/50?text=No+Image")} alt={item.sanPham} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                     </div>
                     <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", display: "-webkit-box" }}>{item.sanPham}</span>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>SL: {item.quantity}</span>
                     </div>
                   </div>
                   <div style={{ fontWeight: "600", fontSize: "14px" }}>
                     {(item.price * item.quantity).toLocaleString()}đ
                   </div>
                </li>
              ))}
            </ul>

            <div style={{ borderTop: "1px dashed var(--border-color)", margin: "20px 0" }}></div>

            {/* MÃ GIẢM GIÁ */}
            <div style={{ marginBottom: "20px" }}>
               <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "700", color: "var(--text-secondary)" }}>🎟️ Mã giảm giá</label>
               <div style={{ display: "flex", gap: "10px" }}>
                 <input 
                  type="text" 
                  value={couponCode} 
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    setCouponStatus(null);
                  }}
                  placeholder="SALE2026, ..." 
                  style={{ flex: 1, padding: "10px", borderRadius: "10px", border: couponStatus === "error" ? "1px solid var(--danger-color)" : "1px solid var(--border-color)", outline: "none", textTransform: "uppercase", fontSize: "14px" }}
                 />
                 <button 
                  type="button"
                  onClick={handleApplyCoupon}
                  style={{ padding: "8px 15px", background: "var(--text-primary)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}
                 >
                   Áp dụng
                 </button>
               </div>
               {couponStatus === "success" && <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "var(--success-color)", fontWeight: "600" }}>✓ Đã áp dụng mã giảm giá 20%</p>}
               {couponStatus === "error" && <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "var(--danger-color)", fontWeight: "600" }}>✕ Mã giảm giá không đúng</p>}
            </div>

            <div style={{ borderTop: "1px dashed var(--border-color)", margin: "20px 0" }}></div>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", color: "#64748b" }}>
              <span>Tạm tính</span>
              <span style={{ fontWeight: "600", color: "#1e293b" }}>{totalPrice.toLocaleString()}đ</span>
            </div>
            {discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", color: "var(--danger-color)" }}>
                <span>Giảm giá (20%)</span>
                <span style={{ fontWeight: "600" }}>-{discount.toLocaleString()}đ</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", color: "#64748b" }}>
              <span>Phí giao hàng</span>
              <span style={{ fontWeight: "600", color: "var(--success-color)" }}>Miễn phí</span>
            </div>
            
            <div style={{ borderTop: "1px dashed var(--border-color)", margin: "20px 0" }}></div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
              <span style={{ fontSize: "16px", fontWeight: "600" }}>TỔNG TIỀN</span>
              <span style={{ fontSize: "28px", fontWeight: "900", color: "#ef4444" }}>
                {finalTotal.toLocaleString()}đ
              </span>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              style={{
                width: "100%", padding: "18px", background: loading ? "#94a3b8" : "var(--primary-color)", color: "#fff", border: "none", borderRadius: "12px",
                fontSize: "16px", fontWeight: "900", cursor: loading ? "not-allowed" : "pointer", textTransform: "uppercase", letterSpacing: "1px",
                boxShadow: loading ? "none" : "0 10px 20px rgba(59, 130, 246, 0.3)", transition: "0.2s"
              }}
            >
              {loading ? "ĐANG TIẾN HÀNH..." : (formData.paymentMethod === "BANK" ? "QUÉT MÃ THANH TOÁN" : "ĐẶT HÀNG (COD)")}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
