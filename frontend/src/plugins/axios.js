import axios from "axios";
import Vue from "vue";
import Swal from "sweetalert2";

// Configure base URL - use relative path for dev proxy to work correctly
const apiBase = "/";
axios.defaults.baseURL = apiBase;

let isHandlingSessionExpiry = false;

axios.interceptors.response.use(
  (response) => {
    const status = response?.data?.status;
    if (status === "invalid-token") {
      // Prevent multiple simultaneous session expiry dialogs
      if (isHandlingSessionExpiry) {
        return Promise.reject("invalid-token");
      }
      isHandlingSessionExpiry = true;

      Swal.fire({
        icon: "warning",
        title: "Session Expired",
        text: "Your session has expired. Please log in again.",
        allowOutsideClick: false,
        allowEscapeKey: false,
      }).then(() => {
        isHandlingSessionExpiry = false;
        // Clear auth state properly via the store
        try {
          const { useAuthStore } = require("@/stores/auth");
          const authStore = useAuthStore();
          authStore.logout();
        } catch (_) {
          // Fallback if store not available
          localStorage.removeItem("appToken");
          sessionStorage.removeItem("sessionData");
        }
        // Navigate to root (login view will show)
        window.location.href = "/";
      });
      return Promise.reject("invalid-token");
    }
    if (status === "error") {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: response.data.errorMessage,
      });
      return Promise.reject(response.data.errorMessage);
    }
    return response;
  },
  (error) => {
    Swal.fire({
      icon: "error",
      title: "Network Error!",
      text: "Could not connect to the server or an unexpected error occurred.",
    });
    return Promise.reject(error);
  },
);

// Attach token to all API requests when available
axios.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("appToken");
    if (
      token &&
      typeof config.url === "string" &&
      !/\btoken=/.test(config.url)
    ) {
      const hasQuery = config.url.includes("?");
      const sep = hasQuery ? "&" : "?";
      config.url = `${config.url}${sep}token=${encodeURIComponent(token)}`;
    }
  } catch (_) {
    // ignore storage errors
  }
  return config;
});

Vue.prototype.$axios = axios;
