import API from "../api/axiosInstance";

const axiosGet = async (endpoint: string) => {
  try {
    const response = await API.get(endpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching data", error);
    throw error;
  }
};
const axiosPost = async (endpoint: string,body: { [key: string]: any; }) => {
    try {
      const response = await API.post(endpoint,body);
      return response.data;
    } catch (error) {
      console.error("Error fetching data", error);
      throw error;
    }
  };
//   const axiosLogin = async (endpoint: string,body: { [key: string]: any; }) => {
//     try {
//       const response = await API.post(endpoint,body);
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching data", error);
//       throw error;
//     }
//   };
export { axiosGet, axiosPost};