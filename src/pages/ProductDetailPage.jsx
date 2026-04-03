import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

const StarRating = ({ rating, onRate, readonly = false }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => !readonly && onRate?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{
            fontSize: readonly ? "14px" : "24px",
            cursor: readonly ? "default" : "pointer",
            color: star <= (hovered || rating) ? "#f59e0b" : "#e2e8f0",
            transition: "0.2s"
          }}
        >★</span>
      ))}
    </div>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("L");
  const [activeTab, setActiveTab] = useState("description");

  // Review states
  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchReviews = () => {
    axios.get(`https://api.anhhoangg.id.vn/api/reviews/product/${id}`)
      .then(res => setReviews(Array.isArray(res.data) ? res.data : []))
      .catch(() => setReviews([]));
  };

  useEffect(() => {
    setLoading(true);
    axios.get(`https://api.anhhoangg.id.vn/api/products/${id}`)
      .then(res => {
        setProduct(res.data);
        // Fetch related products (cùng category)
        if (res.data.category?.id) {
          axios.get(`https://api.anhhoangg.id.vn/api/products`)
            .then(allRes => {
              const all = Array.isArray(allRes.data) ? allRes.data : (allRes.data.content || []);
              const related = all.filter(p => p.category?.id === res.data.category.id && p.id !== res.data.id).slice(0, 4);
              setRelatedProducts(related);
            });
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
    fetchReviews();
    window.scrollTo(0, 0);
  }, [id]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const handleSubmitReview = async () => {
    if (!user) { window.showToast?.("Vui lòng đăng nhập để đánh giá!", "error"); return; }
    if (!myComment.trim()) { window.showToast?.("Vui lòng nhập nội dung!", "error"); return; }
    setSubmitting(true);
    try {
      await axios.post("https://api.anhhoangg.id.vn/api/reviews", {
        userId: user.id, userName: user.username, productId: parseInt(id), rating: myRating, comment: myComment.trim()
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setMyComment(""); setMyRating(5); fetchReviews();
      window.showToast?.("Đã gửi đánh giá! 🎉", "success");
    } catch (err) {
      window.showToast?.("Lỗi: " + err.message, "error");
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div style={{ maxWidth: "1200px", margin: "60px auto", padding: "0 20px" }}>
      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
        <div className="skeleton" style={{ flex: "1 1 500px", height: "600px", borderRadius: "20px" }}></div>
        <div style={{ flex: "1 1 400px" }}>
          <div className="skeleton" style={{ height: "40px", width: "70%", marginBottom: "20px" }}></div>
          <div className="skeleton" style={{ height: "20px", width: "40%", marginBottom: "30px" }}></div>
          <div className="skeleton" style={{ height: "60px", width: "90%", marginBottom: "40px" }}></div>
          <div className="skeleton" style={{ height: "200px", width: "100%" }}></div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div style={{ padding: "100px", textAlign: "center" }}>
      <div style={{ fontSize: "60px" }}>🚫</div>
      <h2>Không tìm thấy sản phẩm!</h2>
      <button onClick={() => navigate("/")} style={{ marginTop: "20px", padding: "10px 25px" }}>Quay lại</button>
    </div>
  );

  return (
    <div style={{ flex: 1, padding: "40px 0", background: "var(--bg-color)" }}>
      <div className="product-detail-padding" style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 3rem" }}>
        
        {/* BREADCRUMBS */}
        <nav style={{ marginBottom: "25px", fontSize: "14px", color: "var(--text-muted)" }}>
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Trang chủ</Link>
          <span style={{ margin: "0 10px" }}>/</span>
          <span style={{ color: "var(--text-secondary)" }}>{product.category?.name || "Sản phẩm"}</span>
          <span style={{ margin: "0 10px" }}>/</span>
          <span style={{ color: "var(--primary-color)", fontWeight: "600" }}>{product.sanPham}</span>
        </nav>

        <div className="product-detail-layout" style={{ display: "flex", gap: "60px", flexWrap: "wrap", alignItems: "flex-start" }}>
          
          {/* GALERRY ẢNH */}
          <div className="gallery-layout" style={{ flex: "1 1 600px", display: "flex", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
               {[1,2,3,4].map(i => (
                 <div key={i} style={{ width: "80px", height: "100px", borderRadius: "10px", overflow: "hidden", border: i === 1 ? "2px solid var(--primary-color)" : "1.5px solid var(--border-color)", cursor: "pointer", opacity: i === 1 ? 1 : 0.6 }}>
                    <img src={product.imageUrl && product.imageUrl.startsWith("/") ? `https://api.anhhoangg.id.vn${product.imageUrl}` : (product.imageUrl || "/placeholder.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="small" />
                 </div>
               ))}
            </div>
            <div className="gallery-main-img" style={{ flex: 1, background: "#fff", borderRadius: "24px", overflow: "hidden", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)", height: "700px" }}>
               <img 
                 src={product.imageUrl && product.imageUrl.startsWith("/") ? `https://api.anhhoangg.id.vn${product.imageUrl}` : (product.imageUrl || "/placeholder.png")} 
                 style={{ width: "100%", height: "100%", objectFit: "cover", transition: "0.5s" }}
                 alt={product.sanPham}
                 onMouseOver={e => e.currentTarget.style.transform = "scale(1.08)"}
                 onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
               />
            </div>
          </div>

          {/* CHI TIẾT SẢN PHẨM */}
          <div style={{ flex: "1 1 450px" }}>
            <span style={{ background: "rgba(224, 123, 57, 0.1)", color: "var(--primary-color)", padding: "6px 16px", borderRadius: "30px", fontSize: "12px", fontWeight: "800", letterSpacing: "1px", textTransform: "uppercase" }}>
              {product.category?.name || "Premium Collection"}
            </span>
            <h1 className="product-title" style={{ fontSize: "42px", fontWeight: "900", margin: "20px 0 10px 0", color: "var(--text-primary)", fontFamily: "'Playfair Display', serif" }}>{product.sanPham}</h1>
            
            <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" }}>
               <StarRating rating={Math.round(avgRating)} readonly />
               <span style={{ fontWeight: "800", color: "var(--warning-color)", fontSize: "16px" }}>{avgRating}</span>
               <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>| &nbsp; {reviews.length} đánh giá</span>
            </div>

            <div style={{ fontSize: "38px", fontWeight: "900", color: "var(--danger-color)", marginBottom: "35px" }}>
               {product.price.toLocaleString()}đ
            </div>

            <div style={{ marginBottom: "35px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>Kích thước: <span style={{ color: "var(--primary-color)" }}>{selectedSize}</span></span>
                <span style={{ fontSize: "13px", color: "var(--primary-color)", textDecoration: "underline", cursor: "pointer" }}>Hướng dẫn chọn Size</span>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                {["S", "M", "L", "XL", "XXL"].map(s => (
                  <button 
                    key={s} 
                    onClick={() => setSelectedSize(s)}
                    style={{ width: "50px", height: "50px", borderRadius: "14px", border: selectedSize === s ? "2.5px solid var(--primary-color)" : "1.5px solid var(--border-color)", background: selectedSize === s ? "#fff" : "transparent", color: selectedSize === s ? "var(--primary-color)" : "var(--text-secondary)", fontWeight: "700", fontSize: "15px", cursor: "pointer", transition: "0.2s" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: "20px", background: "rgba(224, 123, 57, 0.04)", borderRadius: "16px", marginBottom: "40px", border: "1px dashed var(--primary-color)" }}>
               <p style={{ margin: "0", fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.7" }}>
                 🎁 <strong>Ưu đãi hôm nay:</strong> Nhập mã <strong>SALE2026</strong> giảm ngay 20%. Freeship cho đơn hàng từ 1.000.000đ. Đổi trả trong 7 ngày nếu không vừa ý.
               </p>
            </div>

            <div style={{ display: "flex", gap: "15px" }}>
              <button 
                onClick={() => { addToCart(product); window.showToast?.(`Thêm ${product.sanPham} vào giỏ!`, "success"); }}
                style={{ flex: 1, padding: "18px", background: "var(--primary-color)", color: "#fff", border: "none", borderRadius: "16px", fontSize: "16px", fontWeight: "800", cursor: "pointer", boxShadow: "0 10px 25px rgba(224, 123, 57, 0.35)" }}
              >
                THÊM VÀO GIỎ HÀNG 🛒
              </button>
              <button style={{ width: "60px", background: "#fff", border: "1.5px solid var(--border-color)", borderRadius: "16px", fontSize: "24px", cursor: "pointer" }}>🤍</button>
            </div>

            <div style={{ marginTop: "40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
               {[
                 { icon: "🛡️", t: "Bảo hành 12 tháng" },
                 { icon: "🔄", t: "7 ngày đổi trả" },
                 { icon: "🚚", t: "Giao hàng toàn quốc" },
                 { icon: "✨", t: "Cam kết chính hãng" }
               ].map(item => (
                 <div key={item.t} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
                    <span style={{ fontSize: "18px" }}>{item.icon}</span> {item.t}
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/*Tabs & Social Content */}
        <div className="product-content-grid" style={{ marginTop: "80px", display: "grid", gridTemplateColumns: "1fr 340px", gap: "60px", alignItems: "flex-start" }}>
           
           <div style={{ background: "#fff", borderRadius: "24px", padding: "40px", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", gap: "40px", borderBottom: "1.5px solid var(--border-color)", marginBottom: "30px" }}>
                 {["description", "reviews"].map(tab => (
                   <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{ padding: "0 0 15px 0", background: "none", border: "none", borderBottom: activeTab === tab ? "3px solid var(--primary-color)" : "3px solid transparent", color: activeTab === tab ? "var(--primary-color)" : "var(--text-muted)", fontWeight: "800", fontSize: "16px", cursor: "pointer", transition: "0.2s" }}
                   >
                     {tab === "description" ? "MÔ TẢ SẢN PHẨM" : `ĐÁNH GIÁ (${reviews.length})`}
                   </button>
                 ))}
              </div>

              {activeTab === "description" ? (
                <div className="animate-float-up" style={{ color: "var(--text-secondary)", lineHeight: "1.9", fontSize: "16px" }}>
                   <p>Sản phẩm <strong>{product.sanPham}</strong> là niềm tự hào trong bộ sưu tập mới nhất của chúng tôi. Được thiết kế dựa trên sự kết hợp hoàn hảo giữa thời trang đương đại và chất liệu bền vững.</p>
                   <ul style={{ paddingLeft: "20px", marginTop: "20px" }}>
                      <li>Chất liệu: Cotton Premium 100% co giãn 4 chiều.</li>
                      <li>Form dáng: Modern Fit, tôn dáng nhưng vẫn thoải mái.</li>
                      <li>Độ bền: Không bai nhão, không phai màu sau 100 lần giặt.</li>
                      <li>Ứng dụng: Phù hợp đi làm, đi chơi, sự kiện trang trọng.</li>
                   </ul>
                   <div style={{ marginTop: "30px", height: "400px", borderRadius: "20px", overflow: "hidden" }}>
                      <img src="https://images.unsplash.com/photo-1441984969233-3f9306b74b3b?auto=format&fit=crop&q=80&w=1200" style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="detail" />
                   </div>
                </div>
              ) : (
                <div className="animate-float-up">
                  {/* Reviews logic copy từ bản cũ nhưng tối ưu UI */}
                  {user && (
                    <div style={{ background: "var(--bg-color)", padding: "20px", borderRadius: "16px", marginBottom: "30px" }}>
                      <h4 style={{ margin: "0 0 10px 0" }}>Viết đánh giá của bạn</h4>
                      <StarRating rating={myRating} onRate={setMyRating} />
                      <textarea value={myComment} onChange={e => setMyComment(e.target.value)} placeholder="Nhập nhận xét..." style={{ width: "100%", marginTop: "15px", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "12px", outline: "none", minHeight: "100px" }} />
                      <button onClick={handleSubmitReview} disabled={submitting} style={{ marginTop: "10px", padding: "10px 20px", background: "var(--primary-color)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Gửi Đánh Giá</button>
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {reviews.map(r => (
                      <div key={r.id} style={{ display: "flex", gap: "15px", paddingBottom: "20px", borderBottom: "1px solid var(--border-color)" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--primary-color)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px", textTransform: "uppercase" }}>{(r.userName || "A")[0]}</div>
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "14px", marginBottom: "4px", color: "var(--text-primary)" }}>{r.userName || "Ẩn danh"} <span style={{ marginLeft: "10px" }}><StarRating rating={r.rating} readonly /></span></div>
                          <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" }}>{r.comment}</p>
                        </div>
                      </div>
                    ))}
                    {reviews.length === 0 && <p style={{ textAlign: "center", color: "var(--text-muted)" }}>Chưa có đánh giá nào.</p>}
                  </div>
                </div>
              )}
           </div>

           {/* SIDEBAR RELATED */}
           <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
              <h3 style={{ margin: "0", fontSize: "20px", fontWeight: "900", fontFamily: "'Playfair Display', serif" }}>Sản phẩm liên quan</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                {relatedProducts.map(p => (
                  <Link to={`/product/${p.id}`} key={p.id} style={{ textDecoration: "none", color: "inherit", display: "flex", gap: "15px", alignItems: "center" }}>
                    <div style={{ width: "80px", height: "100px", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border-color)", flexShrink: 0 }}>
                       <img src={p.imageUrl && p.imageUrl.startsWith("/") ? `https://api.anhhoangg.id.vn${p.imageUrl}` : (p.imageUrl || "/placeholder.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="rel" />
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 5px 0", fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" }}>{p.sanPham}</h4>
                      <div style={{ color: "var(--danger-color)", fontWeight: "800", fontSize: "14px" }}>{p.price.toLocaleString()}đ</div>
                    </div>
                  </Link>
                ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetailPage;

