<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-toolbar color="primary" dark>
            <v-icon left>mdi-store</v-icon>
            <v-toolbar-title>Application Store</v-toolbar-title>
          </v-toolbar>
          <v-card-text class="pa-6">
            <div v-if="apps" class="grid-container">
              <div v-for="(app, index) in apps" :key="app.name">
                <v-card :loading="loading" class="app-card" elevation="2">
                  <v-card-title>{{ app.name }}</v-card-title>
                  <v-card-subtitle>v{{ app.version }}</v-card-subtitle>
                  <v-card-text>{{ app.description }}</v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      v-can="{ section: 'Apps', action: 'delete' }"
                      :loading="loading"
                      v-if="app.installed"
                      small
                      color="error"
                      @click="uninstallApp(index)"
                    >
                      <v-icon left>mdi-delete</v-icon>
                      Uninstall
                    </v-btn>
                    <v-btn
                      v-can="{ section: 'Apps', action: 'modify' }"
                      :loading="loading"
                      v-else
                      small
                      color="primary"
                      @click="installApp(index)"
                    >
                      <v-icon left>mdi-download</v-icon>
                      Install
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </div>
            </div>
            <v-alert v-else type="info" outlined
              >No applications available</v-alert
            >
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
  margin-bottom: 20px;
}

.app-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.app-card .v-card__text {
  flex-grow: 1;
}
</style>

<script>
export default {
  data() {
    return {
      apps: [],
      loading: false,
    };
  },
  methods: {
    getApps() {
      let that = this;
      this.loading = true;
      this.$axios
        .post(`/api/apps/listStoreApps?token=${localStorage.appToken}`)
        .then(function (res) {
          that.apps = res.data.response.storeApps;
          that.loading = false;
        });
    },
    installApp(appIndex) {
      let that = this;
      this.loading = true;
      let app = this.apps[appIndex];
      this.$axios
        .post(
          `/api/apps/downloadAndInstall?token=${localStorage.appToken}&name=${app.name}&url=${app.url}`,
        )
        .then(function (res) {
          if (res.data.status == "ok") {
            that.apps = res.data.response.storeApps;
            that.getApps();
          }
        });
    },
    uninstallApp(appIndex) {
      let that = this;
      this.loading = true;
      let app = this.apps[appIndex];
      this.$axios
        .post(
          `/api/apps/uninstall?token=${localStorage.appToken}&name=${app.name}`,
        )
        .then(function (res) {
          if (res.data.status == "ok") {
            that.apps = res.data.response.storeApps;
            that.getApps();
          }
        });
    },
  },
  mounted() {
    this.getApps();
  },
};
</script>
