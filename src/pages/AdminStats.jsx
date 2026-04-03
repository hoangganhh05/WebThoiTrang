import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// Vẽ biểu đồ bằng Canvas API thuần túy (không cần thư viện)
const DonutChart = ({ data, title }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const radius = Math.min(W, H) / 2 - 20;
    const innerRadius = radius * 0.55;

    ctx.clearRect(0, 0, W, H);
    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return;

    const colors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#06b6d4"];
    let startAngle = -Math.PI / 2;

    data.forEach((item, i) => {
      const slice = (item.value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();

      // Inner shadow effect
      ctx.beginPath();
      ctx.arc(cx, cy, innerRadius, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff";
      ctx.fill();

      startAngle += slice;
    });

    // Center text
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(total.toLocaleString(), cx, cy - 5);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px sans-serif";
    ctx.fillText("tổng", cx, cy + 15);
  }, [data]);

  const colors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#06b6d4"];
  const total = data?.reduce((s, d) => s + d.value, 0) || 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "15px" }}>
      <h4 style={{ margin: 0, color: "#1e293b", fontSize: "16px", fontWeight: "700" }}>{title}</h4>
      <canvas ref={canvasRef} width={200} height={200} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
        {data?.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#475569" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: colors[i % colors.length], flexShrink: 0 }}></div>
            <span>{item.label}</span>
            <span style={{ color: colors[i % colors.length], fontWeight: "bold" }}>
              ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BarChart = ({ data, title, color = "#3b82f6", unit = "" }) => {
  const max = Math.max(...(data?.map(d => d.value) || [1]), 1);
  return (
    <div>
      <h4 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "16px", fontWeight: "700" }}>{title}</h4>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: "180px" }}>
        {data?.map((item, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>
              {unit}{item.value > 0 ? item.value.toLocaleString() : ""}
            </span>
            <div
              style={{
                width: "100%",
                height: `${(item.value / max) * 140}px`,
                minHeight: item.value > 0 ? "8px" : "3px",
                background: `linear-gradient(to top, ${color}, ${color}99)`,
                borderRadius: "6px 6px 0 0",
                transition: "height 0.6s ease",
                boxShadow: `0 4px 10px ${color}40`,
                position: "relative",
                cursor: "pointer"
              }}
              title={`${item.label}: ${item.value}${unit}`}
            />
            <span style={{ fontSize: "11px", color: "#94a3b8", textAlign: "center" }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminStats = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("https://api.anhhoangg.id.vn/api/orders")
      .then(res => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  // Tính toán thống kê
  const totalRevenue = orders.filter(o => o.status === "DONE").reduce((s, o) => s + o.totalPrice, 0);
  const pending = orders.filter(o => o.status === "PENDING").length;
  const done = orders.filter(o => o.status === "DONE").length;
  const cancelled = orders.filter(o => o.status === "CANCELLED").length;

  // Biểu đồ tròn trạng thái đơn
  const statusData = [
    { label: "Đang xử lý", value: pending },
    { label: "Đã giao", value: done },
    { label: "Đã hủy", value: cancelled },
  ].filter(d => d.value > 0);

  // Thống kê sản phẩm bán chạy
  const productSales = {};
  orders.filter(o => o.status === "DONE").forEach(order => {
    order.orderItems?.forEach(item => {
      const name = item.product?.sanPham || "SP#" + item.product?.id;
      productSales[name] = (productSales[name] || 0) + item.quantity;
    });
  });
  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label: label.substring(0, 10) + (label.length > 10 ? "..." : ""), value }));

  // Doanh thu theo đơn (lấy 8 đơn gần nhất)
  const recentRevenue = orders
    .filter(o => o.status === "DONE")
    .slice(-8)
    .map(o => ({ label: "#" + o.id, value: Math.round(o.totalPrice / 1000) }));

  const statCards = [
    { label: "Tổng Doanh Thu", value: totalRevenue.toLocaleString() + "đ", icon: "💰", color: "#10b981", bg: "#ecfdf5" },
    { label: "Tổng Đơn Hàng", value: orders.length, icon: "📦", color: "#3b82f6", bg: "#eff6ff" },
    { label: "Đang Xử Lý", value: pending, icon: "⌛", color: "#f59e0b", bg: "#fffbeb" },
    { label: "Đã Giao Thành Công", value: done, icon: "✅", color: "#10b981", bg: "#ecfdf5" },
    { label: "Đơn Đã Hủy", value: cancelled, icon: "❌", color: "#ef4444", bg: "#fef2f2" },
    { label: "Tỷ Lệ Giao Thành Công", value: orders.length > 0 ? Math.round((done / orders.length) * 100) + "%" : "0%", icon: "📈", color: "#8b5cf6", bg: "#f5f3ff" },
  ];

  if (loading) return (
    <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "100px" }}>
      <div style={{ textAlign: "center", color: "#64748b" }}>
        <div style={{ fontSize: "50px", marginBottom: "15px" }}>⏳</div>
        <p>Đang tải dữ liệu thống kê...</p>
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, backgroundColor: "#f8fafc", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        <div style={{ marginBottom: "35px" }}>
          <h1 style={{ fontSize: "30px", color: "#1e293b", margin: "0 0 8px 0", fontWeight: "900", display: "flex", alignItems: "center", gap: "12px" }}>
            📊 Bảng Thống Kê Doanh Thu
          </h1>
          <p style={{ color: "#64748b", margin: 0 }}>Tổng quan hoạt động kinh doanh của cửa hàng</p>
        </div>

        {/* 6 Ô thống kê */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "35px" }}>
          {statCards.map((card, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: "16px", padding: "25px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: `1px solid var(--border-color)`, display: "flex", flexDirection: "column", gap: "10px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "-15px", right: "-15px", width: "70px", height: "70px", borderRadius: "50%", background: card.bg, opacity: 0.8 }}></div>
              <div style={{ fontSize: "30px" }}>{card.icon}</div>
              <div>
                <p style={{ margin: "0 0 4px 0", color: "#64748b", fontSize: "13px", fontWeight: "600" }}>{card.label}</p>
                <p style={{ margin: 0, color: card.color, fontSize: "24px", fontWeight: "900" }}>{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Hàng biểu đồ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "25px", marginBottom: "25px" }}>

          {/* Biểu đồ Tròn Trạng Thái */}
          <div style={{ background: "#fff", borderRadius: "16px", padding: "30px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid var(--border-color)" }}>
            {statusData.length > 0 ? (
              <DonutChart data={statusData} title="📊 Phân bổ trạng thái đơn hàng" />
            ) : (
              <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px" }}>Chưa có đơn hàng nào</div>
            )}
          </div>

          {/* Biểu đồ Cột Doanh thu */}
          <div style={{ background: "#fff", borderRadius: "16px", padding: "30px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid var(--border-color)" }}>
            {recentRevenue.length > 0 ? (
              <BarChart data={recentRevenue} title="📈 Doanh thu các đơn gần nhất (nghìn đ)" color="#3b82f6" />
            ) : (
              <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px" }}>Chưa có đơn hàng đã giao</div>
            )}
          </div>

          {/* Biểu đồ Cột Sản Phẩm Bán Chạy */}
          <div style={{ background: "#fff", borderRadius: "16px", padding: "30px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid var(--border-color)" }}>
            {topProducts.length > 0 ? (
              <BarChart data={topProducts} title="🏆 Top sản phẩm bán chạy (số lượng)" color="#8b5cf6" />
            ) : (
              <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px" }}>Chưa có dữ liệu bán hàng</div>
            )}
          </div>
        </div>

        {/* Bảng đơn gần nhất */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "30px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid var(--border-color)" }}>
          <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "18px", fontWeight: "700" }}>🕒 Đơn hàng gần đây nhất</h3>
          {orders.length === 0 ? (
            <p style={{ textAlign: "center", color: "#94a3b8" }}>Chưa có đơn hàng nào</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid var(--border-color)" }}>
                  {["Mã Đơn", "Khách hàng", "Điện thoại", "Tổng tiền", "Trạng thái"].map(h => (
                    <th key={h} style={{ padding: "12px 15px", textAlign: "left", color: "#475569", fontSize: "13px", fontWeight: "700" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(-10).reverse().map(order => (
                  <tr key={order.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 15px", fontWeight: "bold", color: "#0f172a" }}>#{order.id}</td>
                    <td style={{ padding: "12px 15px", color: "#475569" }}>{order.fullName || "Khách vãng lai"}</td>
                    <td style={{ padding: "12px 15px", color: "#64748b" }}>{order.phone || "—"}</td>
                    <td style={{ padding: "12px 15px", fontWeight: "bold", color: "#ef4444" }}>{order.totalPrice.toLocaleString()}đ</td>
                    <td style={{ padding: "12px 15px" }}>
                      <span style={{
                        padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold",
                        background: order.status === "DONE" ? "#dcfce7" : order.status === "CANCELLED" ? "#f1f5f9" : "#e0f2fe",
                        color: order.status === "DONE" ? "#166534" : order.status === "CANCELLED" ? "#64748b" : "#0369a1"
                      }}>
                        {order.status === "DONE" ? "✅ Đã giao" : order.status === "CANCELLED" ? "❌ Đã hủy" : "⌛ Đang xử lý"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminStats;
