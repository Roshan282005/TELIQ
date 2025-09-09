// src/lib.js

import axios from "axios";

// 🔹 Change this to your backend URL
export const API_URL = "http://localhost:5000/api";

// Axios instance
export const api = axios.create({
  baseURL: API_URL,
});

// Function to set Authorization header dynamically
export const setAuthHeader = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};
