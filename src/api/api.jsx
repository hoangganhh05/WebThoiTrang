import axios from "axios";

const API_URL = "https://api.anhhoangg.id.vn/api";

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
