// src/services/api.js
import axios from "axios";

const render = "https://adminbackend-xwfs.onrender.com/api/v1";
const railway = "adminbackend-production-df9b.up.railway.app/api/v1"
const local = "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: railway,
  timeout: 10000,
});

export default api;
