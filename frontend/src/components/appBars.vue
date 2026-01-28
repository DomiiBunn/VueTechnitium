<template>
  <div v-if="sessionData && hideAppBars()">
    <v-app-bar dark color="primary" app>
      <v-app-bar-nav-icon @click="toggleSideBar"></v-app-bar-nav-icon>

      <v-toolbar-title
        >Technitium DNS Server -
        {{ sessionData.info.dnsServerDomain }}</v-toolbar-title
      >
      <v-spacer></v-spacer>
      <v-btn
        v-if="updateInfo.updateAvailable"
        color="danger"
        @click="updatePopup()"
        class="update"
        >Update Available</v-btn
      >
      <v-btn @click="toggleDarkMode" icon>
        <v-icon v-if="!darkMode" class="theme--dark"
          >mdi-white-balance-sunny</v-icon
        >
        <v-icon v-else class="theme--dark">mdi-weather-night </v-icon>
      </v-btn>
      <v-btn @click="switchToLegacyUI" icon title="Switch to Legacy UI">
        <v-icon class="theme--dark">mdi-undo</v-icon>
      </v-btn>
      <v-icon @click="logOut" class="nav-icon theme--dark"> mdi-logout </v-icon>
    </v-app-bar>
    <v-navigation-drawer v-model="sideBarShown" app>
      <sideBarUser :sessionData="sessionData" />
      <sideBarListing />
      <v-spacer></v-spacer>
      <div class="bottom">v {{ sessionData.info.version }}</div>
    </v-navigation-drawer>
  </div>
</template>

<script>
import sideBarUser from "./sideBar/sideBarUser.vue";
import sideBarListing from "./sideBar/sideBarListing.vue";
import { useAuthStore } from "@/stores/auth";

export default {
  components: {
    sideBarUser,
    sideBarListing,
  },
  data() {
    return {
      sideBarShown: true,
      darkMode: JSON.parse(localStorage.getItem("darkMode")) || false,
      drawer: {},
      updateInfo: {},
    };
  },
  methods: {
    hideAppBars() {
      if (localStorage.hideAppBars) return false;
      return true;
    },
    toggleSideBar() {
      this.sideBarShown = !this.sideBarShown;
    },
    logOut() {
      localStorage.clear();
      location.reload();
    },
    updatePopup() {
      let that = this;
      this.$swal
        .fire({
          title: `Update Available: ${that.updateInfo.currentVersion} -> ${that.updateInfo.updateVersion}`,
          text: "Note! It is highly recommended to Backup Settings before installing the update.",
          icon: "info",
          iconHtml: "i",
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: "How to update",
          confirmButtonColor: "#6699FF",
          denyButtonText: `Changelog`,
          denyButtonColor: "#8CD3E8",
          cancelButtonText: "Close",
          showCloseButton: true,
        })
        .then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            window.open(that.updateInfo.instructionsLink, "_blank");
          } else if (result.isDenied) {
            window.open(that.updateInfo.changeLogLink, "_blank");
          }
        });
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem("darkMode", JSON.stringify(this.darkMode));
    },
    switchToLegacyUI() {
      this.$swal
        .fire({
          title: "Switch to Legacy UI?",
          text: "You will be redirected to the legacy UI.",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes, switch",
          confirmButtonColor: "#6699FF",
          cancelButtonText: "Cancel",
        })
        .then((result) => {
          if (result.isConfirmed) {
            // Set cookie and reload
            this.$axios
              .post(
                `/api/ui/preference?version=legacy&token=${localStorage.appToken}`,
              )
              .then(() => {
                location.reload();
              })
              .catch(() => {
                // Fallback if API fails
                document.cookie = "ui-version=legacy; path=/;";
                location.reload();
              });
          }
        });
    },
  },
  mounted() {
    this.$axios
      .post(`/api/user/checkForUpdate?token=${localStorage.appToken}`)
      .then((response) => {
        if (response.data.status == "ok") {
          this.updateInfo = response.data.response;
        }
      });
  },
  watch: {
    darkMode: function () {
      this.$vuetify.theme.dark = this.darkMode;
    },
  },
  computed: {
    sessionData() {
      const store = useAuthStore();
      return store.session;
    },
  },
};
</script>

<style lang="scss" scoped>
.nav-icon {
  margin-left: 15px;
  animation-name: fadeInOut;
  cursor: pointer;
  animation-duration: 150ms;
}
.nav-icon:hover {
  text-shadow: 0px 0px 4px white;
}

.bottom {
  position: relative;
  text-align: center;
  width: 100%;
  padding: 16px 0;
}

.update {
  margin-right: 5px;
  color: danger;
}
</style>
