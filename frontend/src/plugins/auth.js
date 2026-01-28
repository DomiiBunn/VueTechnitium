export default {
  install(Vue) {
    const auth = {
      hasToken() {
        try {
          return !!localStorage.getItem("appToken");
        } catch (_) {
          return false;
        }
      },
      getSession() {
        try {
          const s = sessionStorage.getItem("sessionData");
          return s ? JSON.parse(s) : null;
        } catch (_) {
          return null;
        }
      },
      getPermissions() {
        const sess = this.getSession();
        return sess?.info?.permissions || null;
      },
      canView(section) {
        const perms = this.getPermissions();
        return perms && perms[section]?.canView === true;
      },
      canModify(section) {
        const perms = this.getPermissions();
        return perms && perms[section]?.canModify === true;
      },
      canDelete(section) {
        const perms = this.getPermissions();
        return perms && perms[section]?.canDelete === true;
      },
      can(section, action = "view") {
        if (action === "view") return this.canView(section);
        if (action === "modify") return this.canModify(section);
        if (action === "delete") return this.canDelete(section);
        return false;
      },
    };
    Vue.prototype.$auth = auth;
  },
};
