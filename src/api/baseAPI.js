// src/services/api.js
import axios from "axios";

const render = "https://adminbackend-xwfs.onrender.com/api/v1";
const railway = "https://adminbackend-production-bf1f.up.railway.app/"
const local = "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: railway,
  timeout: 10000,
});

export default api;
