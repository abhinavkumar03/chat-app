import axios from "axios";

const API = axios.create({
    baseURL: "https://chat-backend-p6dq.onrender.com",
//   baseURL: "http://localhost:8080",
});

export default API;
