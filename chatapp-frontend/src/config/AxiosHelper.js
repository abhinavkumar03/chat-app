import axios from "axios";
export const baseURL = "https://chat-backend-p6dq.onrender.com";
// export const baseURL = "http://localhost:8080";
export const httpClient = axios.create({
  baseURL: baseURL,
});

httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Axios interceptor - Token available:', !!token);
    console.log('Request URL:', config.url);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header added');
    } else {
      console.log('No token found, request will be unauthorized');
    }
    return config;
  },
  (error) => Promise.reject(error)
);