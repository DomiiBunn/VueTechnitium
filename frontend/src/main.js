import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import { PiniaVuePlugin, createPinia } from "pinia";
import VueCompositionAPI from "@vue/composition-api";
import VueSweetalert2 from "vue-sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
if (localStorage.darkMode) {
  require("@sweetalert2/theme-dark/dark.min.css");
}
import VueHighlightJS from "vue-highlight.js";
import json from "highlight.js/lib/languages/json";
import accesslog from "highlight.js/lib/languages/accesslog";

import "highlight.js/styles/obsidian.css";
import "./plugins/axios"; // Import the new axios plugin
import AuthPlugin from "./plugins/auth";
import PermissionsPlugin from "./plugins/permissions";

Vue.use(VueHighlightJS, {
  languages: {
    json,
    accesslog,
  },
});

Vue.config.productionTip = false;
Vue.use(VueSweetalert2);
Vue.use(VueHighlightJS, {});
Vue.use(Toast, {
  transition: "Vue-Toastification__bounce",
  maxToasts: 20,
  newestOnTop: true,
  position: "bottom-right",
});
Vue.use(AuthPlugin);
Vue.use(PermissionsPlugin);
Vue.use(VueCompositionAPI);
Vue.use(PiniaVuePlugin);
const pinia = createPinia();
new Vue({
  router,
  vuetify,
  pinia,
  render: (h) => h(App),
}).$mount("#app");
