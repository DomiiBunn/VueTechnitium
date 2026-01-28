<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-toolbar color="primary" dark>
            <v-icon left>mdi-check-circle</v-icon>
            <v-toolbar-title>Installed Applications</v-toolbar-title>
          </v-toolbar>
          <v-card-text class="pa-6">
            <div v-if="apps" class="grid-container">
              <div v-for="app in apps" :key="app.name">
                <v-card class="app-card" elevation="2">
                  <v-card-title>{{ app.name }}</v-card-title>
                  <v-card-subtitle>v{{ app.version }}</v-card-subtitle>
                  <v-card-text>{{ app.dnsApps[0].description }}</v-card-text>
                  <v-card-actions>
                    <v-btn
                      v-can="{ section: 'Apps', action: 'modify' }"
                      small
                      icon
                      color="primary"
                      @click="showAppConfig(app)"
                      title="Configure"
                    >
                      <v-icon>mdi-cog</v-icon>
                    </v-btn>
                    <v-btn
                      v-can="{ section: 'Apps', action: 'modify' }"
                      small
                      icon
                      color="warning"
                      @click="updateApp(app)"
                      title="Update"
                    >
                      <v-icon>mdi-arrow-up-circle</v-icon>
                    </v-btn>
                    <v-btn
                      v-can="{ section: 'Apps', action: 'modify' }"
                      small
                      icon
                      color="info"
                      @click="uploadAppConfig(app)"
                      title="Upload Config"
                    >
                      <v-icon>mdi-cloud-upload</v-icon>
                    </v-btn>
                    <v-btn
                      v-can="{ section: 'Apps', action: 'modify' }"
                      small
                      icon
                      :color="app.dnsApps[0].enabled ? 'success' : 'warning'"
                      @click="toggleAppEnabled(app)"
                      :title="app.dnsApps[0].enabled ? 'Disable' : 'Enable'"
                    >
                      <v-icon>{{
                        app.dnsApps[0].enabled ? "mdi-play" : "mdi-pause"
                      }}</v-icon>
                    </v-btn>
                    <v-btn
                      v-can="{ section: 'Apps', action: 'delete' }"
                      small
                      icon
                      color="error"
                      @click="deleteApp(app)"
                      title="Delete"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </div>
            </div>
            <v-alert v-else type="info" outlined
              >No applications installed</v-alert
            >
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showConfigDialog" max-width="800px">
      <v-card elevation="2">
        <v-toolbar color="primary" dark>
          <v-icon left>mdi-cog</v-icon>
          <v-toolbar-title
            >{{ selectedApp?.name }} - Configuration</v-toolbar-title
          >
        </v-toolbar>
        <v-card-text class="pa-6">
          <v-textarea
            v-model="appConfig"
            label="App Configuration (JSON)"
            rows="15"
            outlined
            :rules="[validateJSON]"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showConfigDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveAppConfig">Save Config</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showUploadDialog" max-width="600px">
      <v-card elevation="2">
        <v-toolbar color="primary" dark>
          <v-icon left>mdi-cloud-upload</v-icon>
          <v-toolbar-title
            >{{ selectedApp?.name }} - Upload Config</v-toolbar-title
          >
        </v-toolbar>
        <v-card-text class="pa-6">
          <v-file-input
            v-model="uploadConfigFile"
            label="Select Config File"
            accept=".zip"
            prepend-icon="mdi-file-upload"
          ></v-file-input>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showUploadDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="performUploadConfig">Upload</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
      showConfigDialog: false,
      showUploadDialog: false,
      selectedApp: null,
      appConfig: "",
      uploadConfigFile: null,
    };
  },
  methods: {
    getApps() {
      let that = this;
      this.loading = true;
      this.$axios
        .post(`/api/apps/list?token=${localStorage.appToken}`)
        .then(function (res) {
          if (res.data.status == "ok") {
            that.apps = res.data.response.apps;
            that.loading = false;
          }
        });
    },
    showAppConfig(app) {
      this.selectedApp = app;
      this.$axios
        .post(
          `/api/apps/getConfig?token=${localStorage.appToken}&name=${app.name}`,
        )
        .then((response) => {
          if (response.data.status === "ok") {
            this.appConfig = JSON.stringify(
              response.data.response.config,
              null,
              2,
            );
            this.showConfigDialog = true;
          } else {
            this.$toast.error(
              response.data.errorMessage || "Failed to load config",
            );
          }
        })
        .catch((error) => {
          console.error(error);
          this.$toast.error("Failed to load app configuration");
        });
    },
    saveAppConfig() {
      try {
        const config = JSON.parse(this.appConfig);
        this.$axios
          .post(
            `/api/apps/setConfig?token=${localStorage.appToken}&name=${this.selectedApp.name}`,
            { config },
          )
          .then((response) => {
            if (response.data.status === "ok") {
              this.$toast.success("App configuration saved");
              this.showConfigDialog = false;
            } else {
              this.$toast.error(
                response.data.errorMessage || "Failed to save config",
              );
            }
          })
          .catch((error) => {
            console.error(error);
            this.$toast.error("Failed to save app configuration");
          });
      } catch (e) {
        this.$toast.error("Invalid JSON configuration");
      }
    },
    validateJSON(value) {
      try {
        JSON.parse(value);
        return true;
      } catch (e) {
        return "Invalid JSON";
      }
    },
    updateApp(app) {
      if (!confirm(`Update ${app.name}?`)) return;

      this.$axios
        .post(
          `/api/apps/update?token=${localStorage.appToken}&name=${app.name}`,
        )
        .then((response) => {
          if (response.data.status === "ok") {
            this.$toast.success("App updated successfully");
            this.getApps();
          } else {
            this.$toast.error(
              response.data.errorMessage || "Failed to update app",
            );
          }
        })
        .catch((error) => {
          console.error(error);
          this.$toast.error("Failed to update app");
        });
    },
    uploadAppConfig(app) {
      this.selectedApp = app;
      this.uploadConfigFile = null;
      this.showUploadDialog = true;
    },
    performUploadConfig() {
      if (!this.uploadConfigFile) {
        this.$toast.error("Please select a config file");
        return;
      }

      const formData = new FormData();
      formData.append("name", this.selectedApp.name);
      formData.append("file", this.uploadConfigFile);

      this.$axios
        .post(
          `/api/apps/uploadConfig?token=${localStorage.appToken}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        )
        .then((response) => {
          if (response.data.status === "ok") {
            this.$toast.success("Config uploaded successfully");
            this.showUploadDialog = false;
          } else {
            this.$toast.error(
              response.data.errorMessage || "Failed to upload config",
            );
          }
        })
        .catch((error) => {
          console.error(error);
          this.$toast.error("Failed to upload config");
        });
    },
    deleteApp(app) {
      if (!confirm(`Delete ${app.name}? This action cannot be undone.`)) return;

      this.$axios
        .post(
          `/api/apps/uninstall?token=${localStorage.appToken}&name=${app.name}`,
        )
        .then((response) => {
          if (response.data.status === "ok") {
            this.$toast.success("App deleted successfully");
            this.getApps();
          } else {
            this.$toast.error(
              response.data.errorMessage || "Failed to delete app",
            );
          }
        })
        .catch((error) => {
          console.error(error);
          this.$toast.error("Failed to delete app");
        });
    },
    toggleAppEnabled(app) {
      const action = app.dnsApps[0].enabled ? "disable" : "enable";
      const params = new URLSearchParams();
      params.append("token", localStorage.appToken);
      params.append("name", app.name);
      params.append("enabled", action === "enable");

      this.$axios
        .post(`/api/apps/setState?${params.toString()}`)
        .then((response) => {
          if (response.data.status === "ok") {
            const status = action === "enable" ? "enabled" : "disabled";
            this.$toast.success(`App ${status} successfully`);
            this.getApps();
          } else {
            this.$toast.error(
              response.data.errorMessage || `Failed to ${action} app`,
            );
          }
        })
        .catch((error) => {
          console.error(error);
          this.$toast.error(`Failed to ${action} app`);
        });
    },
  },
  mounted() {
    this.getApps();
  },
};
</script>
