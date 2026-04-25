import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000",
});

// ✅ REQUEST INTERCEPTOR (attach token)
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ✅ RESPONSE INTERCEPTOR (handle errors globally)
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    if (status === 403) {
      console.error("Forbidden: insufficient permissions");
    }

    return Promise.reject(error);
  }
);

const auth = {
  me: async () => {
    const res = await instance.get("/users/me");
    return res.data;
  },

  logout: (redirectUrl = "/login") => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = redirectUrl;
  },

  redirectToLogin: (redirectUrl = "/login") => {
    window.location.href = redirectUrl;
  },
};

const api = {
  get: (url, config) => instance.get(url, config),
  post: (url, data, config) => instance.post(url, data, config),
  put: (url, data, config) => instance.put(url, data, config),
  patch: (url, data, config) => instance.patch(url, data, config),
  delete: (url, config) => instance.delete(url, config),
  auth,
};

export default api;