<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-toolbar color="primary" dark>
            <v-icon left>mdi-folder-upload</v-icon>
            <v-toolbar-title>Sideload Application</v-toolbar-title>
          </v-toolbar>
          <v-card-text class="pa-6">
            <p class="text-body1 mb-4">
              Upload a custom application package to sideload it into the
              system.
            </p>
            <v-file-input
              v-model="appFile"
              show-size
              accept="zip,application/zip,application/x-zip,application/x-zip-compressed"
              label="Select App Package (.zip)"
              prepend-icon="mdi-package"
              outlined
            ></v-file-input>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              v-can="{ section: 'Apps', action: 'modify' }"
              color="primary"
              :loading="loading"
              @click="sideloadApp"
            >
              <v-icon left>mdi-upload</v-icon>
              Upload & Install
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      appFile: null,
      loading: false,
    };
  },
  methods: {
    sideloadApp() {
      if (!this.appFile) {
        this.$toast.error("Please select an app zip file");
        return;
      }

      const formData = new FormData();
      formData.append("file", this.appFile);

      this.loading = true;
      this.$axios
        .post(`/api/apps/install?token=${localStorage.appToken}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          if (response.data.status === "ok") {
            this.$toast.success("App sideloaded successfully");
            this.appFile = null;
          } else {
            this.$toast.error(
              response.data.errorMessage || "Failed to sideload app",
            );
          }
        })
        .catch((error) => {
          console.error(error);
          this.$toast.error("Failed to sideload app");
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
