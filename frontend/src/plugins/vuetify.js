import Vue from "vue";
import Vuetify from "vuetify/lib/framework";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: JSON.parse(localStorage.getItem("darkMode")) || false,
    themes: {
      light: {
        primary: "#6699FF",
        secondary: "#515151",
        success: "#8DCD8D",
        danger: "#E48683",
        warning: "#FFC04C",
        info: "#8CD3E8",
      },
      dark: {
        primary: "#6699FF",
        secondary: "#515151",
        success: "#8DCD8D",
        danger: "#E48683",
        warning: "#FFC04C",
        info: "#8CD3E8",
      },
    },
  },
});
