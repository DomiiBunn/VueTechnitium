export default {
  install(Vue) {
    // Helper methods using sessionStorage permissions
    const parseExpr = (expr) => {
      if (!expr) return null;
      if (typeof expr === "string") {
        const [section, action = "view"] = expr.split(".");
        return { section, action };
      }
      if (typeof expr === "object" && expr.section) {
        return {
          section: expr.section,
          action: expr.action || "view",
          mode: expr.mode || "disable",
        };
      }
      return null;
    };

    const hasPermission = (section, action = "view") => {
      try {
        const s = sessionStorage.getItem("sessionData");
        const sess = s ? JSON.parse(s) : null;
        const perms = sess?.info?.permissions || {};
        const p = perms[section];
        if (!p) return false;
        if (action === "view") return p.canView === true;
        if (action === "modify") return p.canModify === true;
        if (action === "delete") return p.canDelete === true;
        return false;
      } catch (_) {
        return false;
      }
    };

    // Expose helpers
    Vue.prototype.$can = (section, action = "view") =>
      hasPermission(section, action);
    Vue.prototype.$cannot = (section, action = "view") =>
      !hasPermission(section, action);

    // v-can directive: value can be "Section.action" or { section, action, mode }
    Vue.directive("can", {
      bind(el, binding) {
        const cfg = parseExpr(binding.value);
        if (!cfg) return;
        const allowed = hasPermission(cfg.section, cfg.action);
        const mode = cfg.mode || "disable"; // disable|hide
        if (!allowed) {
          if (mode === "hide") {
            el.style.display = "none";
          } else {
            // disable by setting attribute and prevent clicks
            el.setAttribute("disabled", "disabled");
            el.classList.add("v-can-disabled");
            el.addEventListener("click", (e) => e.stopImmediatePropagation());
          }
        }
      },
      update(el, binding) {
        const cfg = parseExpr(binding.value);
        if (!cfg) return;
        const allowed = hasPermission(cfg.section, cfg.action);
        const mode = cfg.mode || "disable";
        if (!allowed) {
          if (mode === "hide") {
            el.style.display = "none";
            el.setAttribute("aria-hidden", "true");
          } else {
            el.setAttribute("disabled", "disabled");
            el.classList.add("v-can-disabled");
          }
        } else {
          if (mode === "hide") {
            el.style.display = "";
            el.removeAttribute("aria-hidden");
          } else {
            el.removeAttribute("disabled");
            el.classList.remove("v-can-disabled");
          }
        }
      },
    });
  },
};
