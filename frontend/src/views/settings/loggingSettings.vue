<template>
  <v-container v-if="settings" fluid>
    <div>
      <v-card elevation="2">
        <v-toolbar color="primary" dark>
          <v-icon left>mdi-file-document-outline</v-icon>
          <v-toolbar-title>Logging Settings</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-switch
            v-model="settings.enableLogging"
            prepend-icon="mdi-file-document"
            label="Enable Logging"
          ></v-switch>
          <p class="text-caption">
            When enabled, DNS server events and activities are logged to disk
            for auditing and troubleshooting purposes.
          </p>

          <v-divider class="my-4"></v-divider>

          <v-switch
            v-model="settings.logQueries"
            prepend-icon="mdi-file-list"
            label="Log Individual Queries"
          ></v-switch>
          <p class="text-caption">
            When enabled, each DNS query received by the server is logged in
            detail. This can significantly increase log file size.
          </p>

          <v-alert
            border="right"
            colored-border
            type="warning"
            elevation="4"
            class="mt-4"
          >
            Enabling detailed query logging may significantly increase disk I/O
            and reduce performance. Use with caution on production servers.
          </v-alert>

          <v-switch
            v-model="settings.ignoreResolverLogs"
            prepend-icon="mdi-file-hidden"
            label="Ignore Resolver Logs"
          ></v-switch>
          <p class="text-caption">
            When enabled, suppresses logs from the recursive resolver component,
            reducing log volume.
          </p>

          <v-divider class="my-4"></v-divider>

          <v-switch
            v-model="settings.useLocalTime"
            prepend-icon="mdi-clock-outline"
            label="Use Local Time in Logs"
          ></v-switch>
          <p class="text-caption">
            When enabled, log entries use local server time. When disabled, logs
            use UTC time for consistency across distributed systems.
          </p>
        </v-card-text>
      </v-card>
    </div>

    <div class="my-4">
      <v-card elevation="2">
        <v-toolbar color="primary" dark>
          <v-icon left>mdi-folder-multiple</v-icon>
          <v-toolbar-title>Log File Management</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            label="Log Folder Path"
            prepend-inner-icon="mdi-folder"
            v-model="settings.logFolder"
            hint="The folder where log files are stored. Use relative paths for server installation folder, or absolute paths."
          ></v-text-field>

          <v-text-field
            label="Maximum Log File Days"
            prepend-inner-icon="mdi-calendar-range"
            v-model="settings.maxLogFileDays"
            hint="Log files older than this number of days will be automatically deleted."
            suffix="days (default 30)"
            type="number"
          ></v-text-field>

          <v-alert
            border="right"
            colored-border
            type="info"
            elevation="4"
            class="mt-4"
          >
            Set to 0 to disable automatic log file cleanup and keep logs
            indefinitely.
          </v-alert>
        </v-card-text>
      </v-card>
    </div>

    <div class="my-4">
      <v-card elevation="2">
        <v-toolbar color="primary" dark>
          <v-icon left>mdi-chart-bar</v-icon>
          <v-toolbar-title>Statistics Collection</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-switch
            v-model="settings.enableInMemoryStats"
            prepend-icon="mdi-memory"
            label="Enable In-Memory Statistics"
          ></v-switch>
          <p class="text-caption">
            When enabled, the DNS server collects statistical data about
            queries, responses, and performance metrics in memory. This data is
            used for analytics and can be exported.
          </p>

          <v-alert
            border="right"
            colored-border
            type="info"
            elevation="4"
            class="mt-4"
          >
            Enabling statistics collection uses additional memory but provides
            valuable insights into DNS server performance and usage patterns.
          </v-alert>

          <v-divider class="my-4"></v-divider>

          <v-text-field
            label="Maximum Statistics File Days"
            prepend-inner-icon="mdi-calendar-range"
            v-model="settings.maxStatFileDays"
            hint="Statistics files older than this number of days will be automatically deleted."
            suffix="days (default 365)"
            type="number"
          ></v-text-field>

          <v-alert border="right" colored-border type="info" elevation="4">
            Set to 0 to disable automatic statistics file cleanup and keep
            historical data indefinitely.
          </v-alert>
        </v-card-text>
      </v-card>
    </div>

    <div class="my-4">
      <v-card elevation="2">
        <v-toolbar color="primary" dark>
          <v-icon left>mdi-information-outline</v-icon>
          <v-toolbar-title>About Log Files</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <div class="text-subtitle-2 mb-2">Log Files Location</div>
          <p class="text-caption mb-4">
            Log files are stored in the configured log folder. By default, this
            is the "logs" folder within the DNS server installation directory.
          </p>

          <div class="text-subtitle-2 mb-2">Log File Format</div>
          <p class="text-caption mb-4">
            Logs are stored as compressed files (.log files) and are organized
            by date. Each log file contains timestamped entries of server
            activities.
          </p>

          <div class="text-subtitle-2 mb-2">Available Log Operations</div>
          <ul class="text-caption" style="margin-left: 20px; line-height: 1.8">
            <li>View and download log files</li>
            <li>Query logs with filters (date, IP, protocol, response type)</li>
            <li>Export query logs as CSV</li>
            <li>Delete individual or all log files</li>
          </ul>

          <v-alert
            border="right"
            colored-border
            type="info"
            elevation="4"
            class="mt-4"
          >
            Log management operations can be performed via the "Logs" section in
            the main navigation menu.
          </v-alert>
        </v-card-text>
      </v-card>
    </div>

    <div class="my-4">
      <v-card elevation="2">
        <v-card-text class="d-flex flex-wrap justify-space-around">
          <v-btn
            v-can="{ section: 'Settings', action: 'modify' }"
            color="primary"
            class="ma-2"
            @click="saveSettings()"
          >
            <v-icon left>mdi-content-save</v-icon>
            Save Settings
          </v-btn>
          <v-btn
            v-can="{ section: 'Settings', action: 'view' }"
            color="secondary"
            class="ma-2"
            @click="getSettings()"
          >
            <v-icon left>mdi-refresh</v-icon>
            Reload
          </v-btn>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script>
const axios = require("axios");
export default {
  name: "loggingSettings",
  data() {
    return {
      settings: undefined,
    };
  },
  methods: {
    getSettings() {
      axios
        .get(`/api/settings/get?token=${localStorage.appToken}`)
        .then((response) => {
          const s = response.data.response;

          // Initialize missing fields with defaults
          if (s.enableLogging === undefined) s.enableLogging = true;
          if (s.logQueries === undefined) s.logQueries = false;
          if (s.ignoreResolverLogs === undefined) s.ignoreResolverLogs = false;
          if (s.useLocalTime === undefined) s.useLocalTime = false;
          if (!s.logFolder) s.logFolder = "logs";
          if (s.maxLogFileDays === undefined) s.maxLogFileDays = 30;
          if (s.enableInMemoryStats === undefined)
            s.enableInMemoryStats = false;
          if (s.maxStatFileDays === undefined) s.maxStatFileDays = 365;

          this.settings = s;
        })
        .catch((e) => {
          console.log(e);
          this.$toast.error(`Error loading settings: ${e}`, {
            timeout: 5000,
            closeOnClick: true,
          });
        });
    },

    saveSettings() {
      // Convert numeric fields
      const payload = { ...this.settings };
      payload.maxLogFileDays = parseInt(payload.maxLogFileDays) || 30;
      payload.maxStatFileDays = parseInt(payload.maxStatFileDays) || 365;

      // Filter out null or undefined values that could cause validation errors
      Object.keys(payload).forEach((key) => {
        if (payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });

      const formData = new FormData();
      Object.keys(payload).forEach((key) => {
        formData.append(key, payload[key]);
      });
      formData.append("token", localStorage.appToken);

      axios
        .post(`/api/settings/set`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          if (res.data.status !== "ok") {
            throw new Error(res.data.errorMessage);
          }
          this.getSettings();
          this.$toast.success("Settings saved successfully", {
            timeout: 3000,
            closeOnClick: true,
          });
        })
        .catch((e) => {
          this.$toast.error(`Error saving settings: ${e}`, {
            timeout: 5000,
            closeOnClick: true,
          });
          console.log(e);
        });
    },
  },

  mounted() {
    this.getSettings();
  },
};
</script>

<style lang="scss" scoped>
.my-4 {
  margin-top: 16px;
  margin-bottom: 16px;
}

ul {
  line-height: 1.8;
}
</style>
