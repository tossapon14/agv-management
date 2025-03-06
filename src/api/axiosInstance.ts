import axios from "axios";

const API = axios.create({
  baseURL: "https://2514-110-164-87-31.ngrok-free.app", // Read from .env file
  timeout: 10000, // 10 seconds timeout
  headers: { 'content-type': 'application/x-www-form-urlencoded',
    'Authorization': sessionStorage.getItem('token'), 
    "ngrok-skip-browser-warning": "true"},
});

export default API;