import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/orders");
      setOrders(res.data);
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng cho admin:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "PENDING" ? "DONE" : "PENDING";
    try {
      await axios.put(`http://localhost:8080/api/orders/${id}/status?status=${newStatus}`);
      alert(`Đã cập nhật đơn hàng #${id} thành ${newStatus}`);
      fetchOrders();
    } catch (error) {
      alert("Cập nhật thất bại: " + error.message);
    }
  };

  return (
    <div style={{ padding: "40px", flex: 1, backgroundColor: "#f8fafc" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "2px solid var(--border-color)", paddingBottom: "20px" }}>
          <div>
            <h1 style={{ fontSize: "28px", color: "#1e293b", margin: "0 0 10px 0" }}>Quản lý Đơn hàng</h1>
            <p style={{ margin: 0, color: "#64748b" }}>Số lượng đơn hàng hiện tại: <strong style={{ color: "var(--primary-color)" }}>{orders.length}</strong></p>
          </div>
          <button onClick={fetchOrders} style={{ padding: "10px 20px", background: "#fff", border: "1px solid var(--border-color)", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", boxShadow: "var(--shadow-sm)" }}>
            🔄 Làm mới
          </button>
        </div>

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "var(--shadow-md)", overflow: "hidden" }}>
             <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
               <thead style={{ background: "#f1f5f9", borderBottom: "2px solid var(--border-color)" }}>
                 <tr>
                   <th style={{ padding: "15px", color: "#475569" }}>Mã Đơn</th>
                   <th style={{ padding: "15px", color: "#475569" }}>Khách hàng</th>
                   <th style={{ padding: "15px", color: "#475569" }}>Liên hệ</th>
                   <th style={{ padding: "15px", color: "#475569" }}>Tổng tiền</th>
                   <th style={{ padding: "15px", color: "#475569" }}>Trạng thái</th>
                   <th style={{ padding: "15px", color: "#475569", textAlign: "center" }}>Hành động</th>
                 </tr>
               </thead>
               <tbody>
                 {orders.map(order => (
                   <tr key={order.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "15px", fontWeight: "bold", color: "#0f172a" }}>#{order.id}</td>
                      <td style={{ padding: "15px", color: "#475569" }}>{order.fullName || "Khách Vãng Lai"}</td>
                      <td style={{ padding: "15px", color: "#475569" }}>
                         {order.phone && <div style={{ fontSize: "13px" }}>📞 {order.phone}</div>}
                         {order.address && <div style={{ fontSize: "12px", color: "#94a3b8", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={order.address}>📍 {order.address}</div>}
                      </td>
                      <td style={{ padding: "15px", fontWeight: "bold", color: "#ef4444" }}>{order.totalPrice.toLocaleString()}đ</td>
                      <td style={{ padding: "15px" }}>
                        <span style={{ 
                          background: order.status === "DONE" ? "#dcfce7" : order.status === "CANCELLED" ? "#f1f5f9" : "#e0f2fe", 
                          color: order.status === "DONE" ? "#166534" : order.status === "CANCELLED" ? "#64748b" : "#0369a1", 
                          padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" 
                        }}>
                          {order.status === "DONE" ? "ĐÃ GIAO" : order.status === "CANCELLED" ? "ĐÃ HỦY" : "PENDING"}
                        </span>
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                         {order.status === "CANCELLED" ? (
                           <span style={{ fontSize: "13px", color: "#ef4444", fontWeight: "bold" }}>❌ Khách Đã Hủy</span>
                         ) : (
                           <button 
                              onClick={() => handleUpdateStatus(order.id, order.status)}
                              style={{ 
                                padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "13px",
                                background: order.status === "PENDING" ? "var(--success-color)" : "#94a3b8", color: "#fff",
                                boxShadow: order.status === "PENDING" ? "0 4px 10px rgba(16, 185, 129, 0.3)" : "none"
                              }}
                           >
                             {order.status === "PENDING" ? "✔ Duyệt Giao Hàng" : "Hoàn tác (PENDING)"}
                           </button>
                         )}
                      </td>
                   </tr>
                 ))}
                 {orders.length === 0 && (
                   <tr><td colSpan="6" style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>Chưa có đơn hàng nào trong hệ thống.</td></tr>
                 )}
               </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;