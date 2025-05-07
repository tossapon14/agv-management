import API from "../api/axiosInstance";
import APILogin from "./axiosLogin";
const axiosGet = async (endpoint: string) => {
    const response = await API.get(endpoint);
    return response.data;
};
const axiosPost = async (endpoint: string,body: { [key: string]: any; }) => {
   
      const response = await API.post(endpoint,body);
      return response.data;
  };
  const axiosPut = async (endpoint: string,body?: { [key: string]: any; }) => {
    
      const response = await API.put(endpoint,body);
      return response.data;
    
  };
  const axiosDelete = async (endpoint: string,data?: { [key: string]: any; }) => {
    const response = await API.delete(endpoint,{data});
    return response.data;
  
};
  const axiosLogin = async (endpoint: string,body: { [key: string]: any; }) => {
      const response = await APILogin.post(endpoint,body);
      return response.data;
  };
export { axiosGet, axiosPost,axiosLogin,axiosPut,axiosDelete};