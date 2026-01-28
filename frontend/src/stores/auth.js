import { defineStore } from "pinia";
import axios from "axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null,
    session: null,
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated(state) {
      return !!state.token;
    },
    permissions(state) {
      return state.session?.info?.permissions || null;
    },
    username(state) {
      return state.session?.username || null;
    },
  },
  actions: {
    loadFromStorage() {
      try {
        const t = localStorage.getItem("appToken");
        this.token = t || null;
        const s = sessionStorage.getItem("sessionData");
        this.session = s ? JSON.parse(s) : null;
      } catch (_) {
        this.token = null;
        this.session = null;
      }
    },
    async login(user, pass) {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.post(
          `/api/user/login?user=${encodeURIComponent(
            user,
          )}&pass=${encodeURIComponent(pass)}&includeInfo=true`,
        );
        if (res.data.status === "ok") {
          this.token = res.data.token;
          this.session = res.data;
          sessionStorage.setItem("sessionData", JSON.stringify(res.data));
          localStorage.setItem("appToken", res.data.token);
          sessionStorage.authMsg = "";
          this.loading = false;
          return true;
        }
        this.error = res.data.errorMessage || "Login failed";
      } catch (e) {
        this.error = "Network or server error";
      } finally {
        this.loading = false;
      }
      return false;
    },
    async fetchSession() {
      if (!this.token) return false;
      this.loading = true;
      try {
        const res = await axios.post(
          `/api/user/session/get?token=${encodeURIComponent(this.token)}`,
        );
        if (res.data.status === "ok") {
          this.session = res.data;
          sessionStorage.setItem("sessionData", JSON.stringify(res.data));
          return true;
        }
        if (res.data.status === "invalid-token") {
          this.logout();
        }
      } catch (_) {
        // ignore; UI can handle
      } finally {
        this.loading = false;
      }
      return false;
    },
    logout() {
      try {
        if (this.token) {
          axios
            .post(`/api/user/logout?token=${encodeURIComponent(this.token)}`)
            .catch(() => {});
        }
      } catch (_) {
        // Logout error handling
      }
      this.token = null;
      this.session = null;
      localStorage.removeItem("appToken");
      sessionStorage.removeItem("sessionData");
    },
  },
});
