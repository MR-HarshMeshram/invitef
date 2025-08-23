import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true, // send cookies for refresh token
});

// Request interceptor → attach access token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor → auto-refresh on 401
API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await API.post("/auth/refresh");
        localStorage.setItem("accessToken", data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return API(originalRequest); // retry request
      } catch (refreshErr) {
        localStorage.removeItem("accessToken");
        window.location.href = "/";
      }
    }
    return Promise.reject(err);
  }
);

export default API;
