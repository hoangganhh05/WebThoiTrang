import { useState, useEffect } from "react";
import axiosClient, { BASE_URL } from "../api/api";

const AdminDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newProduct, setNewProduct] = useState({
    sanPham: "",
    price: 0,
    quantity: 0,
    category: { id: "" },
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchProducts = () => {
    axiosClient.get("/products")
      .then((res) => {
        if (Array.isArray(res.data)) setProducts(res.data);
        else if (res.data && Array.isArray(res.data.data)) setProducts(res.data.data);
        else if (res.data && Array.isArray(res.data.content)) setProducts(res.data.content);
        else setProducts([]);
      })
      .catch((err) => alert("Lỗi tải danh sách sản phẩm: " + err));
  };

  useEffect(() => {
    fetchProducts();
    axiosClient.get("/categories")
      .then((res) => {
        if (Array.isArray(res.data)) setCategories(res.data);
        else if (res.data && Array.isArray(res.data.data)) setCategories(res.data.data);
        else if (res.data && Array.isArray(res.data.content)) setCategories(res.data.content);
        else setCategories([]); 
      })
      .catch((err) => alert("Lỗi tải danh mục: " + err));
  }, []);

  const handleSubmit = async () => {
    if (!newProduct.category?.id) {
      alert("Vui lòng chọn danh mục cho sản phẩm!");
      return;
    }
    if (!newProduct.sanPham) {
      alert("Vui lòng nhập tên sản phẩm!");
      return;
    }

    const formData = new FormData();
    formData.append("product", new Blob([JSON.stringify(newProduct)], { type: "application/json" }));
    if (imageFile) formData.append("file", imageFile);

    try {
      if (editingId) {
        await axiosClient.put(`/products/${editingId}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        alert("🎉 Cập nhật sản phẩm thành công!");
      } else {
        await axiosClient.post("/products", formData, { headers: { "Content-Type": "multipart/form-data" } });
        alert("🎉 Đã thêm sản phẩm mới thành công!");
      }

      setNewProduct({ sanPham: "", price: 0, quantity: 0, category: { id: "" }, imageUrl: "" });
      setEditingId(null);
      setImageFile(null);
      fetchProducts();
      
      const fileInput = document.getElementById("file-input");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      alert("Lỗi lưu sản phẩm: " + error.message);
    }
  };

  const handleEdit = (product) => {
    setNewProduct({
      sanPham: product.sanPham,
      price: product.price,
      quantity: product.quantity,
      category: { id: product.category?.id || "" },
      imageUrl: product.imageUrl || "",
    });
    setEditingId(product.id);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Cảnh báo: Bạn có thực sự muốn xóa sản phẩm này?")) return;
    try {
      await axiosClient.delete(`/products/${id}`);
      alert("🎉 Đã xóa sản phẩm khỏi hệ thống!");
      fetchProducts();
    } catch (error) {
      alert("Lỗi khi xóa: " + error.message);
    }
  };

  return (
    <div className="admin-container" style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <div style={{ maxWidth: "1600px", margin: "0 auto", boxSizing: "border-box" }}>
        
        <h1 style={{ fontSize: "28px", color: "#1e293b", margin: "0 0 30px 0", borderBottom: "2px solid var(--border-color)", paddingBottom: "15px" }}>
          <span style={{ marginRight: "10px" }}>👕</span> Quản lý Tồn kho & Sản phẩm
        </h1>

        {/* Form Panel Xịn Xò */}
        <div className="admin-card" style={{ background: "#fff", borderRadius: "16px", boxShadow: "var(--shadow-md)", marginBottom: "40px", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "25px" }}>
             <h3 style={{ margin: 0, color: "var(--primary-color)", fontSize: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
               {editingId ? "✏️ Chỉnh sửa thông tin sản phẩm" : "✨ Thêm sản phẩm mới"}
             </h3>
             {editingId && (
               <span style={{ background: "rgba(59, 130, 246, 0.1)", color: "var(--primary-color)", padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>Đang chỉnh sửa ID: #{editingId}</span>
             )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#475569", fontSize: "14px" }}>Tên sản phẩm *</label>
              <input style={{ width: "100%" }} placeholder="Ví dụ: Áo thun nam dạo phố" value={newProduct.sanPham} onChange={(e) => setNewProduct({ ...newProduct, sanPham: e.target.value })} />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#475569", fontSize: "14px" }}>Danh mục *</label>
              <select style={{ width: "100%" }} value={newProduct.category?.id || ""} onChange={(e) => setNewProduct({ ...newProduct, category: { id: parseInt(e.target.value) } })}>
                <option value="">-- Chọn danh mục --</option>
                {categories?.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#475569", fontSize: "14px" }}>Giá bán (VNĐ) *</label>
              <input style={{ width: "100%" }} type="number" placeholder="Ví dụ: 250000" min={0} value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })} />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#475569", fontSize: "14px" }}>Số lượng tồn kho *</label>
              <input style={{ width: "100%" }} type="number" placeholder="Ví dụ: 100" min={0} value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 0 })} />
            </div>
          </div>

          <div style={{ marginTop: "25px", borderTop: "1px dashed var(--border-color)", paddingTop: "25px", display: "flex", flexWrap: "wrap", gap: "30px", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: "300px" }}>
              <label style={{ display: "block", marginBottom: "15px", fontWeight: "600", color: "#475569", fontSize: "14px" }}>Hình ảnh sản phẩm</label>
              <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                 <div style={{ position: "relative", width: "100px", height: "100px", borderRadius: "12px", border: "2px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#f8fafc" }}>
                   {(imageFile || newProduct.imageUrl) ? (
                     <img src={imageFile ? URL.createObjectURL(imageFile) : (newProduct.imageUrl?.startsWith("/") ? `${BASE_URL}${newProduct.imageUrl}` : newProduct.imageUrl)} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "contain", background: "#fff" }} />
                   ) : (
                     <span style={{ fontSize: "24px", color: "#cbd5e1" }}>🖼️</span>
                   )}
                 </div>
                 <div style={{ flex: 1 }}>
                   <input id="file-input" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} style={{ padding: "8px", border: "1px solid var(--border-color)", borderRadius: "8px", width: "100%", background: "#fff", cursor: "pointer" }} />
                   <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>Chấp nhận .JPG, .PNG, .WEBP (Tối đa 5MB)</p>
                 </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "15px", alignItems: "flex-end", height: "100px" }}>
              {editingId && (
                <button onClick={() => { setEditingId(null); setNewProduct({ sanPham: "", price: 0, quantity: 0, category: { id: "" }, imageUrl: "" }); setImageFile(null); const fi = document.getElementById("file-input"); if(fi) fi.value = ""; }} style={{ padding: "14px 24px", background: "#f1f5f9", color: "#475569", border: "1px solid var(--border-color)", borderRadius: "10px", fontWeight: "bold", fontSize: "15px" }}>
                  Hủy Bỏ
                </button>
              )}
              <button onClick={handleSubmit} style={{ padding: "14px 40px", background: "var(--primary-color)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "bold", fontSize: "15px", boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)" }}>
                {editingId ? "💾 LƯU CẬP NHẬT" : "➕ TẠO SẢN PHẨM"}
              </button>
            </div>
          </div>
        </div>

        {/* Danh Sách Grid */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
           <h3 style={{ margin: 0, color: "#1e293b", fontSize: "20px" }}>Danh sách ({products.length} sản phẩm hiện có)</h3>
        </div>

        {products.length === 0 ? (
          <div style={{ padding: "50px", textAlign: "center", background: "#fff", borderRadius: "16px", border: "1px solid var(--border-color)" }}>Không có sản phẩm nào. Hãy thêm mới!</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "25px" }}>
            {products.map((p) => (
              <div key={p.id} style={{ border: "1px solid var(--border-color)", borderRadius: "16px", backgroundColor: "#fff", display: "flex", flexDirection: "column", overflow: "hidden", transition: "0.3s", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ position: "relative", height: "220px", background: "#f8fafc", padding: "20px" }}>
                  <img src={p.imageUrl?.startsWith("/") ? `${BASE_URL}${p.imageUrl}` : (p.imageUrl || "https://via.placeholder.com/400?text=No+Image")} alt={p.sanPham} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  <span style={{ position: "absolute", top: "10px", right: "10px", background: p.quantity > 0 ? "rgba(16, 185, 129, 0.9)" : "rgba(239, 68, 68, 0.9)", color: "#fff", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
                    Kho: {p.quantity}
                  </span>
                </div>
                
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <span style={{ color: "var(--primary-color)", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "5px" }}>{p.category?.name || "Lỗi DM"}</span>
                  <h4 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#0f172a", flex: 1, WebkitLineClamp: 2, overflow: "hidden", display: "-webkit-box", WebkitBoxOrient: "vertical" }}>{p.sanPham}</h4>
                  <p style={{ fontWeight: "900", color: "#ef4444", fontSize: "18px", margin: "0 0 20px 0" }}>{(p.price || 0).toLocaleString()}đ</p>
                  
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => handleEdit(p)} style={{ flex: 1, background: "#f8fafc", color: "var(--primary-color)", border: "1px solid #cbd5e1", padding: "10px", borderRadius: "8px", fontWeight: "bold" }}>Sửa</button>
                    <button onClick={() => handleDelete(p.id)} style={{ flex: 1, background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", padding: "10px", borderRadius: "8px", fontWeight: "bold" }}>Xóa</button>
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

export default AdminDashboard;
