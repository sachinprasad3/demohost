  import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { getCookie } from "./cookies";
// console.log("AXIOS FILE LOADED");

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // change this
  // timeout: 10000, // optional timeout
  headers: {
    Accept: 'application/json',
  },
  // withCredentials: true, // Useful for HTTP-only cookies; otherwise use Bearer token
});

// 🔹 Add token automatically for every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getCookie("authTokenWeb");
    // console.log("authTOkenweb",token)

    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
export const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};


// 🔹 Handle responses globally


export default axiosInstance;
