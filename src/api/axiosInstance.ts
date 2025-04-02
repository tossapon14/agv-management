import axios from "axios";
const API = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL, // Read from .env file
  timeout: 10000, // 10 seconds timeout
  headers: { 
    // 'content-type': 'application/x-www-form-urlencoded',
    'content-type': 'application/json',
    'Authorization': sessionStorage.getItem('token'), 
    "ngrok-skip-browser-warning": "true"},
});

export default API;