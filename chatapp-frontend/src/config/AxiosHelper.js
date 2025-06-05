import axios from "axios";
export const baseURL = "https://chat-backend-p6dq.onrender.com";
export const httpClient = axios.create({
  baseURL: baseURL,
});
