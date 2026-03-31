import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import { useSearchParams } from "react-router-dom";

// ============================================================
// Xử lý lỗi Circular Reference từ Spring Boot
// ============================================================
// Spring Boot JPA trả về Category chứa products[], mỗi product
// lại chứa category, rồi category lại chứa products[]...
// → JSON bị lồng vô hạn, malformed, Axios không parse được.
//
// Giải pháp: Nhận raw text → loại bỏ "products":[...] lồng nhau
// → parse JSON sạch.
// ============================================================

/**
 * Loại bỏ các mảng "products":[...] bị lồng nhau trong JSON string.
 * Dùng vòng lặp: mỗi lần thay thế "products":[nội dung không có ngoặc vuông]
 * bằng "products":[] → lặp cho đến khi không còn gì để thay.
 */
const stripCircularProducts = (jsonText) => {
  let text = jsonText;
  let prev;
  // Tối đa 200 lần lặp để tránh infinite loop
  let maxIterations = 200;
  do {
    prev = text;
    // Thay thế "products":[...nội dung không chứa [ hoặc ]...] → "products":[]
    text = text.replace(/"products"\s*:\s*\[[^\[\]]*\]/g, '"products":[]');
    maxIterations--;
  } while (text !== prev && maxIterations > 0);
  return text;
};

/**
 * Parse JSON an toàn, xử lý cả trường hợp JSON bị malformed
 * do circular reference từ Spring Boot.
 */
const safeParseJSON = (data) => {
  // Nếu đã là object/array (Axios parse thành công) → trả về luôn
  if (typeof data === "object" && data !== null) return data;

  // Nếu là string → thử parse bình thường trước
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch (e) {
      // JSON bị lỗi do circular reference → strip rồi parse lại
      console.warn("JSON bị malformed (circular reference), đang xử lý...");
      try {
        const cleaned = stripCircularProducts(data);
        return JSON.parse(cleaned);
      } catch (e2) {
        console.error("Không thể parse JSON sau khi xử lý:", e2);
        return null;
      }
    }
  }

  return null;
};

/**
 * Validate & chuẩn hóa dữ liệu sản phẩm từ API.
 * - Đảm bảo mỗi field có giá trị mặc định hợp lệ
 * - Loại bỏ category.products để tránh circular data trong memory
 */
const sanitizeProduct = (product) => {
  if (!product || typeof product !== "object") return null;

  // Chỉ giữ lại id + name của category, bỏ products để tránh circular
  const cleanCategory = product.category
    ? { id: product.category.id, name: product.category.name }
    : { name: "Chưa phân loại" };

  return {
    id: product.id ?? 0,
    sanPham: product.sanPham || product.name || "Sản phẩm không tên",
    price:
      typeof product.price === "number" && !isNaN(product.price)
        ? product.price
        : 0,
    quantity:
      typeof product.quantity === "number" && !isNaN(product.quantity)
        ? product.quantity
        : 0,
    imageUrl: product.imageUrl || "",
    category: cleanCategory,
  };
};

/**
 * Lấy mảng sản phẩm hợp lệ từ response API.
 * Hỗ trợ nhiều format response khác nhau từ Spring Boot.
 */
const extractProducts = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.content)) return data.content;
  return null;
};

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword");

  useEffect(() => {
    // Fetch categories
    axios.get("http://localhost:8080/api/categories")
      .then((res) => {
        if (Array.isArray(res.data)) setCategories(res.data);
        else if (res.data && Array.isArray(res.data.data)) setCategories(res.data.data);
        else if (res.data && Array.isArray(res.data.content)) setCategories(res.data.content);
      })
      .catch((err) => console.error("Lỗi fetch categories:", err));
  }, []);

  useEffect(() => {
    setLoading(true);

    let apiUrl = "http://localhost:8080/api/products";
    if (keyword) {
      apiUrl = `http://localhost:8080/api/products/search?keyword=${keyword}`;
    }

    axios
      .get(apiUrl, {
        // Nhận response dưới dạng text thô để tự xử lý JSON
        // (tránh Axios parse lỗi khi JSON bị circular reference)
        transformResponse: [(data) => data],
      })
      .then((res) => {
        // Parse JSON an toàn, xử lý circular reference nếu có
        const parsed = safeParseJSON(res.data);

        if (parsed === null) {
          console.warn("Dữ liệu API trả về không hợp lệ:", res.data);
          setProducts([]);
          return;
        }

        const rawProducts = extractProducts(parsed);

        if (rawProducts === null) {
          console.warn(
            "Dữ liệu API không chứa mảng sản phẩm hợp lệ:",
            parsed,
          );
          setProducts([]);
          return;
        }

        // Validate & chuẩn hóa từng sản phẩm, loại bỏ item null/invalid
        const validProducts = rawProducts
          .map(sanitizeProduct)
          .filter((p) => p !== null && p.id !== 0);

        setProducts(validProducts);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy danh sách sản phẩm:", err);
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [keyword]);

  // --- CÁC STATE MỚI CHO LỌC & SẮP XẾP ---
  const [sortBy, setSortBy] = useState("default"); // default, priceAsc, priceDesc
  const [priceRange, setPriceRange] = useState(5000000); // 0 -> 5tr
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- COUNTDOWN FLASH SALE ---
  const [timeLeft, setTimeLeft] = useState({ h: 2, m: 30, s: 0 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev;
        if (s > 0) s--;
        else if (m > 0) { m--; s = 59; }
        else if (h > 0) { h--; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    window.showToast?.(`Đã thêm ${product.sanPham} vào giỏ! 🛒`, "success");
  };

  // Reset về trang 1 khi lọc hoặc tìm kiếm thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, keyword, sortBy, priceRange]);

  // Xử lý Lọc & Sắp xếp & Phân trang
  const filteredProducts = products
    .filter(p => !selectedCategory || p.category?.id === selectedCategory)
    .filter(p => p.price <= priceRange)
    .sort((a, b) => {
      if (sortBy === "priceAsc") return a.price - b.price;
      if (sortBy === "priceDesc") return b.price - a.price;
      return 0;
    });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const displayProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      {/* HERO BANNER SECTION */}
      <div style={{ 
        width: "100%", height: "480px", 
        background: "linear-gradient(120deg, rgba(28,22,18,0.88) 0%, rgba(28,22,18,0.4) 60%, transparent 100%), url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1920')", 
        backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed",
        display: "flex", alignItems: "center", justifyContent: "flex-start", paddingLeft: "8%",
        color: "#fff", position: "relative"
      }}>
        <div style={{ maxWidth: "560px" }}>
          <p style={{ color: "var(--primary-color)", fontWeight: "700", letterSpacing: "3px", fontSize: "13px", margin: "0 0 14px 0", textTransform: "uppercase" }}>Bộ sưu tập mới — Mùa Hè 2026</p>
          <h1 style={{ fontSize: "54px", fontWeight: "800", margin: "0 0 18px 0", color: "#fff", lineHeight: "1.1", fontFamily: "'Playfair Display', serif" }}>
            Tự Tin Thể Hiện <span style={{ color: "var(--primary-color)" }}>Phong Cách</span> Của Bạn
          </h1>
          <p style={{ fontSize: "17px", margin: "0 0 36px 0", color: "rgba(255,255,255,0.78)", lineHeight: "1.65", maxWidth: "460px" }}>
            Khám phá hàng trăm mẫu thời trang đa phong cách — từ năng động, lịch lãm đến thư giãn cuối tuần.
          </p>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <button style={{ 
              background: "var(--primary-color)", color: "#fff", border: "none", padding: "14px 34px", borderRadius: "var(--border-radius-pill)", 
              fontSize: "15px", fontWeight: "700", cursor: "pointer", boxShadow: "0 10px 24px rgba(224, 123, 57, 0.45)" 
            }} onClick={() => document.getElementById("product-section")?.scrollIntoView({ behavior: 'smooth' })}>
              Mua Sắm Ngay 🛍️
            </button>
            <button 
              onClick={() => window.showToast?.("🎉 Bộ sưu tập đang được chuẩn bị!", "info")}
              style={{ 
              background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.5)", padding: "14px 32px", borderRadius: "var(--border-radius-pill)", 
              fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "0.3s" 
            }}>
              Xem Bộ Sưu Tập
            </button>
          </div>
        </div>
      </div>

      {/* FLASH SALE COUNTDOWN SECTION */}
      <div style={{ background: "linear-gradient(to right, #2c2420, #1c1612)", padding: "25px 0", borderBottom: "4px solid var(--primary-color)" }}>
        <div className="flash-sale-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "40px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <span style={{ fontSize: "32px" }}>🔥</span>
            <h2 style={{ color: "#fff", margin: 0, fontSize: "24px", fontWeight: "900", letterSpacing: "1px" }}>FLASH SALE GIỜ VÀNG</h2>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: "600", fontSize: "14px" }}>KẾT THÚC TRONG:</span>
            {[
              { val: timeLeft.h, label: "GIỜ" },
              { val: timeLeft.m, label: "PHÚT" },
              { val: timeLeft.s, label: "GIÂY" }
            ].map((unit, i) => (
              <React.Fragment key={unit.label}>
                <div style={{ background: "var(--primary-color)", color: "#fff", padding: "10px", borderRadius: "10px", minWidth: "50px", textAlign: "center", boxShadow: "0 0 15px rgba(224, 123, 57, 0.4)" }}>
                  <div style={{ fontSize: "20px", fontWeight: "900" }}>{unit.val.toString().padStart(2, "0")}</div>
                </div>
                {i < 2 && <span style={{ color: "var(--primary-color)", fontWeight: "900", fontSize: "20px" }}>:</span>}
              </React.Fragment>
            ))}
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", padding: "8px 20px", borderRadius: "30px", border: "1px dashed rgba(255,255,255,0.3)", color: "var(--warning-color)", fontWeight: "bold" }}>
             🎟️ NHẬP MÃ: <span style={{ color: "#fff" }}>SALE2026</span> GIẢM 20%
          </div>
        </div>
      </div>

      <div id="product-section" className="home-container" style={{ padding: "60px 3rem", display: "flex", gap: "40px", alignItems: "flex-start", width: "100%", boxSizing: "border-box", maxWidth: "1600px", margin: "0 auto" }}>
        
        {/* SIDEBAR BỘ LỌC */}
        <div style={{ width: "260px", flexShrink: 0, position: "sticky", top: "100px", display: "flex", flexDirection: "column", gap: "30px" }}>
          
          <div style={{ padding: "25px", background: "white", borderRadius: "16px", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
              🏷️ Danh mục
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
              <li>
                <button
                  onClick={() => setSelectedCategory(null)}
                  style={{ width: "100%", textAlign: "left", background: selectedCategory === null ? "var(--primary-color)" : "transparent", color: selectedCategory === null ? "#fff" : "var(--text-secondary)", border: "none", padding: "10px 16px", borderRadius: "10px", cursor: "pointer", fontWeight: selectedCategory === null ? "700" : "500", fontSize: "14px", transition: "0.2s" }}
                >
                  Tất cả sản phẩm
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{ width: "100%", textAlign: "left", background: selectedCategory === cat.id ? "var(--primary-color)" : "transparent", color: selectedCategory === cat.id ? "#fff" : "var(--text-secondary)", border: selectedCategory === cat.id ? "none" : "1px solid transparent", padding: "10px 16px", borderRadius: "10px", cursor: "pointer", fontWeight: selectedCategory === cat.id ? "700" : "500", fontSize: "14px", transition: "0.2s" }}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ padding: "25px", background: "white", borderRadius: "16px", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", fontWeight: "800", color: "var(--text-primary)" }}>💰 Khoảng giá</h3>
            <input 
              type="range" 
              min="0" max="5000000" step="100000"
              value={priceRange}
              onChange={(e) => setPriceRange(parseInt(e.target.value))}
              style={{ width: "100%", cursor: "pointer", accentColor: "var(--primary-color)" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", color: "var(--text-secondary)", fontSize: "14px", fontWeight: "600" }}>
              <span>0đ</span>
              <span style={{ color: "var(--primary-color)" }}>Dưới {priceRange.toLocaleString()}đ</span>
            </div>
          </div>
        </div>

        {/* CỘT SẢN PHẨM */}
        <div style={{ flex: 1 }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "20px" }}>
            <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "800", fontFamily: "'Playfair Display', serif" }}>
              {keyword ? `🔍 Kết quả cho "${keyword}"` : (selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : "Bộ Sưu Tập Mới")}
              <span style={{ fontSize: "14px", color: "var(--text-muted)", marginLeft: "15px", fontWeight: "normal", fontFamily: "var(--font-body)" }}>
                ({filteredProducts.length} sản phẩm)
              </span>
            </h2>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>Sắp xếp:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: "8px 15px", borderRadius: "10px", border: "1.5px solid var(--border-color)", outline: "none", fontSize: "14px", fontWeight: "600", background: "#fff", cursor: "pointer" }}
              >
                <option value="default">Mới nhất</option>
                <option value="priceAsc">Giá: Thấp đến Cao</option>
                <option value="priceDesc">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "25px" }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="skeleton" style={{ height: "380px" }}></div>)}
            </div>
          ) : displayProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "100px 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "60px", marginBottom: "20px" }}>📦</div>
              <h3 style={{ margin: 0 }}>Không tìm thấy sản phẩm nào khớp với bộ lọc!</h3>
              <p>Hãy thử điều chỉnh khoảng giá hoặc danh mục khác.</p>
            </div>
          ) : (
            <>
              <div
                className="product-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "25px",
                  minHeight: "800px", // Giữ chiều cao để tránh nhảy trang khi switch page
                  alignContent: "start"
                }}
              >
                {displayProducts.map((p) => (
                  <ProductCard key={p.id} product={p} addToCart={handleAddToCart} />
                ))}
              </div>

              {/* PHÂN TRANG UI */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "50px", alignItems: "center" }}>
                   <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    style={{ padding: "10px 15px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}
                   >
                     Trước
                   </button>
                   
                   {[...Array(totalPages)].map((_, i) => (
                     <button
                        key={i}
                        onClick={() => {
                          setCurrentPage(i + 1);
                          window.scrollTo({ top: 480, behavior: 'smooth' });
                        }}
                        style={{
                          width: "40px", height: "40px", borderRadius: "10px",
                          border: "none", 
                          background: currentPage === i + 1 ? "var(--primary-color)" : "rgba(224, 123, 57, 0.1)",
                          color: currentPage === i + 1 ? "#fff" : "var(--primary-color)",
                          fontWeight: "700", cursor: "pointer", transition: "0.2s"
                        }}
                     >
                       {i + 1}
                     </button>
                   ))}

                   <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    style={{ padding: "10px 15px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1 }}
                   >
                     Sau
                   </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default HomePage;

