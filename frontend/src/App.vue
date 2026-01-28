<template>
  <v-app id="inspire">
    <div v-if="isAuthenticated">
      <appBars />
      <v-main>
        <v-container class="py-8 px-6" fluid>
          <v-icon>{{ $route.meta.icon }}</v-icon>
          {{ $route.meta.name || $route.name }}
          <router-view></router-view>
        </v-container>
      </v-main>
    </div>
    <loginView v-else />
  </v-app>
</template>

<script>
import loginView from "@/views/loginView.vue";
import appBars from "@/components/appBars.vue";
import { useAuthStore } from "@/stores/auth";

export default {
  components: {
    loginView,
    appBars,
  },
  methods: {
    onLoad() {
      const store = useAuthStore();
      store.loadFromStorage();
      if (store.token) {
        store.fetchSession();
      }
    },
  },
  mounted() {
    this.onLoad();
  },
  data() {
    return {
      // local state removed; rely on store
    };
  },
  computed: {
    isAuthenticated() {
      const store = useAuthStore();
      return store.isAuthenticated;
    },
  },
};
</script>

<style lang="scss">
@import "@/assets/css/scrollbar.css";
.swal2-container {
  font-family: "Roboto", sans-serif;
}
.v-card,
.v-tabs {
  border-radius: 16px !important;

  box-shadow: 0 4px 24px rgba(60, 60, 60, 0.12),
    0 1.5px 6px rgba(60, 60, 60, 0.08) !important;
  transition: box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) !important;
  &:hover {
    box-shadow: 0 8px 32px rgba(133, 133, 133, 0.18),
      0 3px 12px rgba(60, 60, 60, 0.12) !important;
  }
}

.swal2-confirm,
.swal2-styled {
  color: white !important;
}
</style>

<!-- Global styles for SweetAlert2 -->
<style>
.swal2-confirm,
.swal2-styled {
  color: white !important;
}
