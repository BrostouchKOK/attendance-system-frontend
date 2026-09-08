import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

// បន្ថែម Token ទៅក្នុង Header ស្វ័យប្រវត្តិរាល់ពេលហៅ API
axiosInstance.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem("userInfo")
      ? JSON.parse(localStorage.getItem("userInfo"))
      : null;

    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstance;
