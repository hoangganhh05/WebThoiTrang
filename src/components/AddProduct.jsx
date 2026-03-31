import { useState } from "react";
import { addProduct } from "../api/productAPI";

function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleAdd = async () => {
    if (!name || !price || !quantity) {
      alert("Vui lòng nhập đầy đủ!");
      return;
    }

    if (Number(price) <= 0) {
      alert("Giá phải > 0");
      return;
    }
    const newProduct = {
      sanPham: name,
      price: Number(price),
      quantity: Number(quantity),
    };
    try {
      await addProduct(newProduct);
      alert("Thêm thành công!");
    } catch (err) {
      console.log("Lỗi thêm: " + err);
    } finally {
      setName("");
      setPrice("");
      setQuantity("");
    }
  };

  return (
    <div>
      <input
        placeholder="Tên sản phẩm"
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Giá"
        onChange={(e) => setPrice(e.target.value)}
      />
      <input
        type="number"
        placeholder="Số lượng"
        onChange={(e) => setQuantity(e.target.value)}
      />
      <button onClick={handleAdd}>Thêm</button>
    </div>
  );
}

export default AddProduct;
