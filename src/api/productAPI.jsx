import axiosClient from "./api";

export const getProduct = async () => {
  const res = await axiosClient.get("/products");
  return res.data;
};

export const addProduct = async (products) => {
  const res = await axiosClient.post("/products", products);
  return res.data;
};
