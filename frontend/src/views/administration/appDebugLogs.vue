<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card :loading="loading">
          <v-toolbar color="primary" dark>
            <v-icon left>mdi-console</v-icon>
            <v-toolbar-title>App Debug Logs</v-toolbar-title>
          </v-toolbar>
          <div class="text-subtitle-2 pa-6 pb-0">
            View real-time debug logs for installed applications
          </div>

          <v-card-text>
            <!-- App Selector -->
            <v-row class="mb-4">
              <v-col md="4">
                <v-select
                  v-model="selectedApp"
                  :items="appList"
                  label="Select Application"
                  outlined
                  dense
                  @change="loadAppLogs()"
                  prepend-inner-icon="mdi-application"
                ></v-select>
              </v-col>

              <v-col md="2">
                <v-select
                  v-model="logLevel"
                  :items="logLevels"
                  label="Log Level"
                  outlined
                  dense
                  @change="filterLogs()"
                  prepend-inner-icon="mdi-filter"
                ></v-select>
              </v-col>

              <v-col md="3">
                <v-text-field
                  v-model="searchQuery"
                  label="Search Logs"
                  outlined
                  dense
                  clearable
                  @input="filterLogs()"
                  prepend-inner-icon="mdi-magnify"
                ></v-text-field>
              </v-col>

              <v-col md="3" class="d-flex align-end gap-2">
                <v-btn
                  @click="loadAppLogs()"
                  small
                  outlined
                  prepend-icon="mdi-refresh"
                >
                  Refresh
                </v-btn>
                <v-btn
                  @click="clearLogs()"
                  small
                  outlined
                  prepend-icon="mdi-delete"
                >
                  Clear
                </v-btn>
                <v-btn
                  @click="exportLogs()"
                  small
                  outlined
                  prepend-icon="mdi-download"
                >
                  Export
                </v-btn>
              </v-col>
            </v-row>

            <!-- Auto-refresh Toggle -->
            <v-switch
              v-model="autoRefresh"
              label="Auto-refresh logs (every 5 seconds)"
              class="mb-4"
            ></v-switch>

            <!-- Logs Display -->
            <v-card
              class="bg-grey-darken-4 pa-4"
              style="max-height: 600px; overflow-y: auto"
            >
              <div
                v-if="filteredLogs.length > 0"
                class="font-monospace text-caption"
              >
                <div
                  v-for="(log, index) in filteredLogs"
                  :key="index"
                  class="mb-2 d-flex"
                  :style="{ color: getLogColor(log.level) }"
                >
                  <span class="log-timestamp mr-3" style="min-width: 180px">
                    {{ formatTime(log.timestamp) }}
                  </span>
                  <span class="log-level mr-3" style="min-width: 70px">
                    [{{ log.level }}]
                  </span>
                  <span class="log-message" style="flex: 1">
                    {{ log.message }}
                  </span>
                </div>
              </div>
              <div v-else class="text-center py-8 text-grey">
                <p>No logs available</p>
              </div>
            </v-card>

            <!-- Log Count -->
            <div class="text-caption text-grey mt-3">
              Showing {{ filteredLogs.length }} of {{ appLogs.length }} logs
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Settings Dialog -->
    <v-dialog v-model="showSettingsDialog" max-width="500">
      <v-card>
        <v-card-title>Debug Log Settings</v-card-title>
        <v-card-text>
          <v-checkbox
            v-model="logSettings.enableDebugLogging"
            label="Enable Debug Logging"
            @change="updateLogSettings()"
          ></v-checkbox>

          <v-divider class="my-4"></v-divider>

          <div class="mb-4">
            <label class="text-body-2 font-weight-medium">
              Max Log Entries: {{ logSettings.maxEntries }}
            </label>
            <v-slider
              v-model="logSettings.maxEntries"
              :min="100"
              :max="5000"
              :step="100"
              @input="updateLogSettings()"
              class="mt-2"
            ></v-slider>
          </div>

          <v-divider class="my-4"></v-divider>

          <div class="mb-4">
            <label class="text-body-2 font-weight-medium mb-3 d-block">
              Log Levels
            </label>
            <v-checkbox
              v-model="logSettings.logDebug"
              label="Debug"
              @change="updateLogSettings()"
            ></v-checkbox>
            <v-checkbox
              v-model="logSettings.logInfo"
              label="Info"
              @change="updateLogSettings()"
            ></v-checkbox>
            <v-checkbox
              v-model="logSettings.logWarning"
              label="Warning"
              @change="updateLogSettings()"
            ></v-checkbox>
            <v-checkbox
              v-model="logSettings.logError"
              label="Error"
              @change="updateLogSettings()"
            ></v-checkbox>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showSettingsDialog = false" text>Cancel</v-btn>
          <v-btn color="primary" @click="showSettingsDialog = false">
            Done
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import moment from "moment";

export default {
  data() {
    return {
      loading: false,
      selectedApp: "",
      appList: [],
      appLogs: [],
      filteredLogs: [],
      searchQuery: "",
      logLevel: "ALL",
      autoRefresh: false,
      autoRefreshInterval: null,
      showSettingsDialog: false,

      logLevels: ["ALL", "DEBUG", "INFO", "WARNING", "ERROR"],

      logSettings: {
        enableDebugLogging: true,
        maxEntries: 1000,
        logDebug: true,
        logInfo: true,
        logWarning: true,
        logError: true,
      },
    };
  },

  watch: {
    autoRefresh(newVal) {
      if (newVal) {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
    },
  },

  mounted() {
    this.loadAppList();
  },

  beforeDestroy() {
    this.stopAutoRefresh();
  },

  methods: {
    loadAppList() {
      this.$axios
        .post(`/api/apps/list?token=${localStorage.appToken}`)
        .then((res) => {
          if (res.data.status === "ok") {
            this.appList = res.data.response.apps.map((app) => ({
              text: app.name,
              value: app.name,
            }));

            if (this.appList.length > 0) {
              this.selectedApp = this.appList[0].value;
              this.loadAppLogs();
            }
          }
        })
        .catch(() => {
          this.$toast.error("Failed to load app list");
        });
    },

    loadAppLogs() {
      if (!this.selectedApp) return;

      this.loading = true;
      const params = new URLSearchParams();
      params.append("token", localStorage.appToken);
      params.append("appName", this.selectedApp);

      this.$axios
        .post(`/api/apps/debugLogs/get?${params.toString()}`)
        .then((res) => {
          if (res.data.status === "ok") {
            this.appLogs = res.data.response.logs || [];
            this.filterLogs();
            this.loading = false;
          }
        })
        .catch(() => {
          this.$toast.error("Failed to load app logs");
          this.loading = false;
          // Generate mock logs for demonstration
          this.appLogs = this.generateMockLogs();
          this.filterLogs();
        });
    },

    filterLogs() {
      this.filteredLogs = this.appLogs.filter((log) => {
        const matchLevel =
          this.logLevel === "ALL" || log.level === this.logLevel;
        const matchSearch =
          !this.searchQuery ||
          log.message.toLowerCase().includes(this.searchQuery.toLowerCase());

        return matchLevel && matchSearch;
      });
    },

    clearLogs() {
      if (!confirm("Clear all logs for this app? This cannot be undone.")) {
        return;
      }

      const params = new URLSearchParams();
      params.append("token", localStorage.appToken);
      params.append("appName", this.selectedApp);

      this.$axios
        .post(`/api/apps/debugLogs/clear?${params.toString()}`)
        .then((res) => {
          if (res.data.status === "ok") {
            this.appLogs = [];
            this.filteredLogs = [];
            this.$toast.success("Logs cleared");
          }
        })
        .catch(() => {
          this.$toast.error("Failed to clear logs");
        });
    },

    exportLogs() {
      if (this.filteredLogs.length === 0) {
        this.$toast.warning("No logs to export");
        return;
      }

      const content = this.filteredLogs
        .map(
          (log) =>
            `${this.formatTime(log.timestamp)} [${log.level}] ${log.message}`,
        )
        .join("\n");

      const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${this.selectedApp}-debug-${
          new Date().toISOString().split("T")[0]
        }.log`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.$toast.success("Logs exported");
    },

    startAutoRefresh() {
      this.autoRefreshInterval = setInterval(() => {
        this.loadAppLogs();
      }, 5000);
    },

    stopAutoRefresh() {
      if (this.autoRefreshInterval) {
        clearInterval(this.autoRefreshInterval);
        this.autoRefreshInterval = null;
      }
    },

    updateLogSettings() {
      const params = new URLSearchParams();
      params.append("token", localStorage.appToken);
      params.append("appName", this.selectedApp);
      params.append("enableDebugLogging", this.logSettings.enableDebugLogging);
      params.append("maxEntries", this.logSettings.maxEntries);

      this.$axios
        .post(`/api/apps/debugLogs/settings?${params.toString()}`)
        .then((res) => {
          if (res.data.status === "ok") {
            this.$toast.success("Settings updated");
          }
        })
        .catch(() => {
          this.$toast.error("Failed to update settings");
        });
    },

    getLogColor(level) {
      const colors = {
        DEBUG: "#00BCD4",
        INFO: "#4CAF50",
        WARNING: "#FF9800",
        ERROR: "#F44336",
      };
      return colors[level] || "#FFFFFF";
    },

    formatTime(timestamp) {
      return moment(timestamp).format("YYYY-MM-DD HH:mm:ss.SSS");
    },

    generateMockLogs() {
      const levels = ["DEBUG", "INFO", "WARNING", "ERROR"];
      const messages = [
        "Initializing application",
        "Processing request",
        "Database query executed",
        "Cache hit",
        "Configuration loaded",
        "Event listener registered",
        "Background job started",
        "Resource allocation successful",
        "Warning: Low memory condition",
        "Error: Connection timeout",
        "Error: Invalid parameter",
        "Cleanup completed",
      ];

      const logs = [];
      const now = moment();

      for (let i = 0; i < 100; i++) {
        logs.push({
          timestamp: now
            .clone()
            .subtract(i * 100, "milliseconds")
            .toDate(),
          level: levels[Math.floor(Math.random() * levels.length)],
          message:
            messages[Math.floor(Math.random() * messages.length)] +
            ` (${Math.random().toString(36).substring(7)})`,
        });
      }

      return logs.reverse();
    },
  },
};
</script>

<style scoped lang="scss">
.font-monospace {
  font-family: "Courier New", monospace;
  letter-spacing: 0.5px;
}

.log-timestamp {
  color: #999999;
}

.log-level {
  font-weight: bold;
}

.log-message {
  word-break: break-word;
}

.gap-2 {
  gap: 8px;
}
</style>
