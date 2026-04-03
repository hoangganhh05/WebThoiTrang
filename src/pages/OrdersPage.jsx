import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null); // Trạng thái dùng để xác nhận hủy đơn
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchOrders = () => {
    setLoading(true);
    axios.get(`https://api.anhhoangg.id.vn/api/orders/user/${user.id}`)
      .then(res => setOrders(res.data))
      .catch(err => console.error("Lỗi khi tải đơn hàng:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    try {
      await axios.put(`https://api.anhhoangg.id.vn/api/orders/${orderId}/status?status=CANCELLED`);
      window.showToast?.("Đã hủy đơn hàng thành công!", "success");
      fetchOrders();
      setCancelingId(null);
    } catch (err) {
      window.showToast?.("Lỗi khi hủy đơn hàng: " + err, "error");
    }
  };

  if (!user) return null;

  // Lọc đi các đơn đã Hủy để không hiện ra màn hình nữa
  const activeOrders = orders.filter(order => order.status !== "CANCELLED");

  return (
    <div style={{ flex: 1, backgroundColor: "#f8fafc", padding: "50px 20px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "28px", color: "#1e293b", marginBottom: "30px", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px" }}>
          <span>📦</span> Lịch sử Đơn hàng
        </h2>

        {loading ? (
          <p style={{ textAlign: "center", color: "#64748b" }}>Đang tải danh sách đơn hàng...</p>
        ) : activeOrders.length === 0 ? (
           <div style={{ textAlign: "center", background: "#fff", padding: "50px", borderRadius: "16px", boxShadow: "var(--shadow-sm)" }}>
             <span style={{ fontSize: "50px", display: "block", marginBottom: "20px" }}>📭</span>
             <h3 style={{ margin: "0 0 10px 0", color: "#64748b" }}>Bạn chưa có đơn hàng nào hoặc đơn đã bị hủy</h3>
             <button onClick={() => navigate("/")} style={{ background: "var(--primary-color)", color: "#fff", border: "none", padding: "10px 25px", borderRadius: "20px", marginTop: "15px", cursor: "pointer", fontWeight: "bold" }}>Mua sắm ngay</button>
           </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {activeOrders.map(order => (
              <div key={order.id} style={{ 
                background: "#fff", borderRadius: "16px", padding: "25px", boxShadow: "var(--shadow-sm)", 
                borderLeft: `6px solid ${order.status === 'DONE' ? 'var(--success-color)' : order.status === 'CANCELLED' ? '#cbd5e1' : 'var(--primary-color)'}`,
                opacity: order.status === 'CANCELLED' ? 0.7 : 1
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--border-color)", paddingBottom: "15px", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 5px 0", fontSize: "16px", color: "#64748b" }}>Đơn hàng <span style={{ color: "#0f172a", fontWeight: "900", textDecoration: order.status === 'CANCELLED' ? 'line-through' : 'none' }}>#{order.id}</span></h3>
                    <span style={{ fontSize: "13px", color: "#94a3b8" }}>Người nhận: {order.fullName || "Khách hàng"} - {order.phone || "Không có SĐT"}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
                    <span style={{ 
                      background: order.status === "DONE" ? "#dcfce7" : order.status === "CANCELLED" ? "#f1f5f9" : "#e0f2fe", 
                      color: order.status === "DONE" ? "#166534" : order.status === "CANCELLED" ? "#64748b" : "#0369a1", 
                      padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" 
                    }}>
                      {order.status === "DONE" ? "✅ ĐÃ GIAO XONG" : order.status === "CANCELLED" ? "❌ ĐÃ HỦY" : "⌛ ĐANG XỬ LÝ"}
                    </span>
                    
                    {order.status === "PENDING" && (
                      <button 
                        onClick={() => {
                          if (cancelingId === order.id) {
                            handleCancelOrder(order.id);
                          } else {
                            setCancelingId(order.id);
                            window.showToast?.("Hãy bấm lần nữa để chắc chắn hủy đơn!", "info");
                            setTimeout(() => setCancelingId(null), 3000); // Tự reset sau 3s
                          }
                        }}
                        style={{ padding: "6px 14px", background: cancelingId === order.id ? "#ef4444" : "#fef2f2", color: cancelingId === order.id ? "#fff" : "#ef4444", border: cancelingId === order.id ? "1px solid #ef4444" : "1px solid #fecaca", borderRadius: "8px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", transition: "0.2s" }}
                      >
                        {cancelingId === order.id ? "XÁC NHẬN CHẮC CHẮN HỦY?" : "Hủy Đơn Hàng"}
                      </button>
                    )}
                    
                    <p style={{ margin: "5px 0 0 0", color: order.status === 'CANCELLED' ? "#94a3b8" : "#ef4444", fontWeight: "900", fontSize: "20px" }}>{order.totalPrice.toLocaleString()}đ</p>
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "10px" }}>
                  <p style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#475569" }}><strong>Địa chỉ nhận:</strong> {order.address || "Nhận tại cửa hàng"}</p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {order.orderItems?.map(item => (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                         <div style={{ width: "40px", height: "40px", background: "#e2e8f0", borderRadius: "6px", overflow: "hidden" }}>
                           {item.product?.imageUrl && (
                              <img src={item.product.imageUrl.startsWith("/") ? `https://api.anhhoangg.id.vn${item.product.imageUrl}` : item.product.imageUrl} alt={item.product?.sanPham} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                           )}
                         </div>
                         <div style={{ flex: 1 }}>
                           <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{item.product?.sanPham || "Sản phẩm vừa bị xóa"}</p>
                           <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Số lượng: {item.quantity} x {item.price.toLocaleString()}đ</p>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
