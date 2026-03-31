import { useState, useEffect } from "react";
import "./Products.css";
import { getProduct } from "../api/productAPI";
export default function ProductList() {
  const [products, setProduct] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const data = await getProduct();
        if (isMounted) {
          setProduct(data);
        }
      } catch (err) {
        console.log("lỗi API: " + err);
      } finally {
        console.log("Done");
      }
    };
    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="container">
      <h2>Danh sách sản phẩm</h2>

      <table border={1} className="table">
        <thead>
          <tr style={{ background: "#ddd" }}>
            <th>Tên sản phẩm</th>
            <th>Giá</th>
            <th>Số lượng</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.sanPham}</td>
              <td>{p.price}</td>
              <td>{p.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
