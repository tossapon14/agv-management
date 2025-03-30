import axios from "axios";

const API = axios.create({
  // baseURL: "https://gensurv.ap.ngrok.io/", // Read from .env file
  baseURL :"http://127.0.0.1:5000",
  timeout: 10000, // 10 seconds timeout
  headers: { 
    // 'content-type': 'application/x-www-form-urlencoded',
    'content-type': 'application/json',
    'Authorization': sessionStorage.getItem('token'), 
    "ngrok-skip-browser-warning": "true"},
});

export default API;