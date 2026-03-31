import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchCategories = () => {
    setLoading(true);
    axios.get("http://localhost:8080/api/categories")
      .then(res => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) {
      window.showToast?.("Vui lòng nhập tên danh mục!", "error");
      return;
    }
    try {
      await axios.post("http://localhost:8080/api/categories", { name: newName.trim() });
      setNewName("");
      fetchCategories();
      window.showToast?.(`Đã thêm danh mục "${newName.trim()}" thành công! 🎉`, "success");
    } catch (err) {
      window.showToast?.("Lỗi thêm danh mục: " + err.message, "error");
    }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) {
      window.showToast?.("Tên danh mục không được để trống!", "error");
      return;
    }
    try {
      await axios.put(`http://localhost:8080/api/categories/${id}`, { name: editName.trim() });
      setEditingId(null);
      fetchCategories();
      window.showToast?.("Đã cập nhật tên danh mục!", "success");
    } catch (err) {
      window.showToast?.("Lỗi cập nhật: " + err.message, "error");
    }
  };

  const handleDelete = async (id) => {
    if (deletingId === id) {
      try {
        await axios.delete(`http://localhost:8080/api/categories/${id}`);
        setDeletingId(null);
        fetchCategories();
        window.showToast?.("Đã xóa danh mục!", "success");
      } catch (err) {
        window.showToast?.("Lỗi xóa! Danh mục này có thể đang được dùng bởi sản phẩm.", "error");
        setDeletingId(null);
      }
    } else {
      setDeletingId(id);
      window.showToast?.("Bấm lần nữa để xác nhận xóa danh mục này!", "info");
      setTimeout(() => setDeletingId(null), 3000);
    }
  };

  return (
    <div style={{ flex: 1, backgroundColor: "#f8fafc", padding: "40px 20px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        <h1 style={{ fontSize: "28px", color: "#1e293b", margin: "0 0 8px 0", fontWeight: "900", display: "flex", alignItems: "center", gap: "10px" }}>
          🏷️ Quản lý Danh mục
        </h1>
        <p style={{ color: "#64748b", marginBottom: "30px" }}>Thêm, sửa, xóa danh mục sản phẩm của cửa hàng.</p>

        {/* Form thêm mới */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "30px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid var(--border-color)", marginBottom: "30px" }}>
          <h3 style={{ margin: "0 0 20px 0", color: "var(--primary-color)", fontSize: "18px", fontWeight: "700" }}>
            ✨ Thêm danh mục mới
          </h3>
          <div style={{ display: "flex", gap: "12px" }}>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              placeholder="Ví dụ: Áo khoác, Quần jeans, Phụ kiện..."
              style={{ flex: 1, padding: "14px 16px", border: "1.5px solid var(--border-color)", borderRadius: "10px", fontSize: "15px", outline: "none", backgroundColor: "#f8fafc" }}
            />
            <button
              onClick={handleAdd}
              style={{ padding: "14px 28px", background: "var(--primary-color)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)", whiteSpace: "nowrap" }}
            >
              ➕ Thêm
            </button>
          </div>
        </div>

        {/* Danh sách danh mục */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "30px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, color: "#1e293b", fontSize: "18px", fontWeight: "700" }}>
              Danh sách hiện có
            </h3>
            <span style={{ background: "rgba(59,130,246,0.1)", color: "var(--primary-color)", padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "bold" }}>
              {categories.length} danh mục
            </span>
          </div>

          {loading ? (
            <p style={{ textAlign: "center", color: "#94a3b8" }}>Đang tải...</p>
          ) : categories.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>📂</div>
              <p>Chưa có danh mục nào. Hãy thêm mới!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {categories.map(cat => (
                <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", border: "1px solid var(--border-color)", borderRadius: "12px", background: editingId === cat.id ? "#eff6ff" : "#fafafa", transition: "0.2s" }}>
                  
                  {/* Badge số thứ tự */}
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, var(--primary-color), #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "13px", fontWeight: "bold", flexShrink: 0 }}>
                    {cat.id}
                  </div>

                  {/* Tên danh mục / Input khi chỉnh sửa */}
                  {editingId === cat.id ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleUpdate(cat.id); if (e.key === "Escape") setEditingId(null); }}
                      style={{ flex: 1, padding: "8px 12px", border: "2px solid var(--primary-color)", borderRadius: "8px", fontSize: "15px", outline: "none" }}
                    />
                  ) : (
                    <span style={{ flex: 1, fontSize: "15px", fontWeight: "600", color: "#1e293b" }}>
                      🏷️ {cat.name}
                    </span>
                  )}

                  {/* Nút hành động */}
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    {editingId === cat.id ? (
                      <>
                        <button onClick={() => handleUpdate(cat.id)} style={{ padding: "7px 16px", background: "var(--success-color)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
                          ✔ Lưu
                        </button>
                        <button onClick={() => setEditingId(null)} style={{ padding: "7px 16px", background: "#f1f5f9", color: "#64748b", border: "1px solid var(--border-color)", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
                          Hủy
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                          style={{ padding: "7px 14px", background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          style={{ padding: "7px 14px", background: deletingId === cat.id ? "#ef4444" : "#fef2f2", color: deletingId === cat.id ? "#fff" : "#ef4444", border: deletingId === cat.id ? "1px solid #ef4444" : "1px solid #fecaca", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px", transition: "0.2s" }}
                        >
                          {deletingId === cat.id ? "⚠ Xác nhận?" : "🗑 Xóa"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminCategories;
