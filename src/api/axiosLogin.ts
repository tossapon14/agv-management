import axios from "axios";

const APILogin = axios.create({
  baseURL: "https://98a3-110-164-87-31.ngrok-free.app", // Read from .env file
  // baseURL :"http://192.168.1.14:5000",
  timeout: 10000, // 10 seconds timeout
  headers: { 
    'content-type': 'application/x-www-form-urlencoded',
    'Authorization': sessionStorage.getItem('token'), 
    "ngrok-skip-browser-warning": "true"},
});

export default APILogin;