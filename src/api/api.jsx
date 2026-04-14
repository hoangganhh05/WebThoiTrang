import axios from "axios";

// Đổi thành http://localhost:8080 nếu bạn đang chạy backend ở máy local
export const BASE_URL = "https://api.anhhoangg.id.vn"; 
export const API_URL = `${BASE_URL}/api`;

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
