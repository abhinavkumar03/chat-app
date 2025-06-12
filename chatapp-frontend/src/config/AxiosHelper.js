import axios from "axios";
export const baseURL = "https://chat-backend-p6dq.onrender.com";
// export const baseURL = "http://localhost:8080";
export const httpClient = axios.create({
  baseURL: baseURL,
});

httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);