<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card :loading="loading">
          <v-toolbar color="primary" dark>
            <v-icon left>mdi-history</v-icon>
            <v-toolbar-title>Audit Trail</v-toolbar-title>
          </v-toolbar>
          <div class="text-subtitle-2 pa-6 pb-0">
            Track administrative changes and permission modifications
          </div>

          <v-card-text>
            <!-- Filters -->
            <v-card class="mb-4" outlined>
              <v-card-text class="pa-3">
                <v-row>
                  <v-col md="3">
                    <v-text-field
                      v-model="filters.username"
                      label="Username"
                      outlined
                      dense
                      clearable
                      prepend-inner-icon="mdi-account"
                      @input="applyFilters()"
                    ></v-text-field>
                  </v-col>

                  <v-col md="3">
                    <v-select
                      v-model="filters.action"
                      :items="actionTypes"
                      label="Action Type"
                      outlined
                      dense
                      clearable
                      prepend-inner-icon="mdi-tag"
                      @change="applyFilters()"
                    ></v-select>
                  </v-col>

                  <v-col md="3">
                    <v-text-field
                      v-model="filters.resource"
                      label="Resource"
                      outlined
                      dense
                      clearable
                      prepend-inner-icon="mdi-database"
                      @input="applyFilters()"
                    ></v-text-field>
                  </v-col>

                  <v-col md="3">
                    <v-select
                      v-model="filters.status"
                      :items="statusTypes"
                      label="Status"
                      outlined
                      dense
                      clearable
                      prepend-inner-icon="mdi-check-circle"
                      @change="applyFilters()"
                    ></v-select>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col md="3">
                    <v-menu
                      v-model="dateMenuStart"
                      :close-on-content-click="false"
                      transition="scale-transition"
                      offset-y
                      min-width="auto"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="filters.dateFrom"
                          label="From Date"
                          readonly
                          outlined
                          dense
                          clearable
                          prepend-inner-icon="mdi-calendar"
                          v-bind="attrs"
                          v-on="on"
                          @click:clear="
                            filters.dateFrom = '';
                            applyFilters();
                          "
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="filters.dateFrom"
                        @input="
                          dateMenuStart = false;
                          applyFilters();
                        "
                      ></v-date-picker>
                    </v-menu>
                  </v-col>

                  <v-col md="3">
                    <v-menu
                      v-model="dateMenuEnd"
                      :close-on-content-click="false"
                      transition="scale-transition"
                      offset-y
                      min-width="auto"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="filters.dateTo"
                          label="To Date"
                          readonly
                          outlined
                          dense
                          clearable
                          prepend-inner-icon="mdi-calendar"
                          v-bind="attrs"
                          v-on="on"
                          @click:clear="
                            filters.dateTo = '';
                            applyFilters();
                          "
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="filters.dateTo"
                        @input="
                          dateMenuEnd = false;
                          applyFilters();
                        "
                      ></v-date-picker>
                    </v-menu>
                  </v-col>

                  <v-col md="6" class="d-flex align-end gap-2">
                    <v-btn
                      @click="resetFilters()"
                      outlined
                      small
                      prepend-icon="mdi-refresh"
                    >
                      Reset
                    </v-btn>
                    <v-btn
                      @click="exportToCSV()"
                      outlined
                      small
                      prepend-icon="mdi-download"
                    >
                      Export
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Audit Logs Table -->
            <v-data-table
              :headers="headers"
              :items="auditLogs"
              :loading="loading"
              dense
              :footer-props="{ itemsPerPageOptions: [10, 25, 50] }"
              class="elevation-0"
            >
              <template v-slot:[`item.timestamp`]="{ item }">
                <div class="text-caption">
                  {{ formatDateTime(item.timestamp) }}
                </div>
              </template>

              <template v-slot:[`item.username`]="{ item }">
                <v-chip small size="small">{{ item.username }}</v-chip>
              </template>

              <template v-slot:[`item.action`]="{ item }">
                <v-chip small :color="getActionColor(item.action)">
                  {{ item.action }}
                </v-chip>
              </template>

              <template v-slot:[`item.status`]="{ item }">
                <v-icon
                  :color="item.status === 'Success' ? 'success' : 'error'"
                  small
                >
                  {{
                    item.status === "Success"
                      ? "mdi-check-circle"
                      : "mdi-alert-circle"
                  }}
                </v-icon>
                {{ item.status }}
              </template>

              <template v-slot:[`item.details`]="{ item }">
                <v-btn x-small text @click="showDetails(item)" color="primary">
                  View
                </v-btn>
              </template>

              <template v-slot:no-data>
                <div class="text-center py-8">
                  <v-icon large class="mb-4">mdi-history</v-icon>
                  <p class="text-grey">No audit logs found</p>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Details Dialog -->
    <v-dialog v-model="showDetailsDialog" max-width="700">
      <v-card>
        <v-card-title>Audit Log Details</v-card-title>
        <v-card-text>
          <v-row>
            <v-col md="6">
              <p class="text-caption font-weight-medium">Timestamp</p>
              <p class="text-body-2">
                {{ formatDateTime(selectedLog.timestamp) }}
              </p>
            </v-col>
            <v-col md="6">
              <p class="text-caption font-weight-medium">Username</p>
              <p class="text-body-2">{{ selectedLog.username }}</p>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <v-row>
            <v-col md="6">
              <p class="text-caption font-weight-medium">Action</p>
              <v-chip small :color="getActionColor(selectedLog.action)">
                {{ selectedLog.action }}
              </v-chip>
            </v-col>
            <v-col md="6">
              <p class="text-caption font-weight-medium">Status</p>
              <v-chip
                small
                :color="selectedLog.status === 'Success' ? 'success' : 'error'"
              >
                {{ selectedLog.status }}
              </v-chip>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <v-row>
            <v-col>
              <p class="text-caption font-weight-medium">Resource</p>
              <p class="text-body-2">{{ selectedLog.resource }}</p>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <v-row>
            <v-col>
              <p class="text-caption font-weight-medium">IP Address</p>
              <p class="text-body-2 font-monospace">
                {{ selectedLog.ipAddress }}
              </p>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <v-row>
            <v-col>
              <p class="text-caption font-weight-medium">Details</p>
              <v-card class="bg-grey-lighten-5 pa-3">
                <p class="text-body-2 font-monospace">
                  {{ selectedLog.details }}
                </p>
              </v-card>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <v-row>
            <v-col>
              <p class="text-caption font-weight-medium">Before Value</p>
              <v-card
                class="bg-red-lighten-5 pa-3"
                v-if="selectedLog.beforeValue"
              >
                <p class="text-body-2 font-monospace">
                  {{ selectedLog.beforeValue }}
                </p>
              </v-card>
              <p v-else class="text-body-2 text-grey">N/A</p>
            </v-col>
            <v-col>
              <p class="text-caption font-weight-medium">After Value</p>
              <v-card
                class="bg-green-lighten-5 pa-3"
                v-if="selectedLog.afterValue"
              >
                <p class="text-body-2 font-monospace">
                  {{ selectedLog.afterValue }}
                </p>
              </v-card>
              <p v-else class="text-body-2 text-grey">N/A</p>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDetailsDialog = false" text>Close</v-btn>
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
      auditLogs: [],
      filteredLogs: [],
      showDetailsDialog: false,
      selectedLog: {},
      dateMenuStart: false,
      dateMenuEnd: false,

      headers: [
        { text: "Timestamp", value: "timestamp", width: "180px" },
        { text: "User", value: "username", width: "120px" },
        { text: "Action", value: "action", width: "120px" },
        { text: "Resource", value: "resource", width: "150px" },
        { text: "Status", value: "status", width: "100px" },
        { text: "", value: "details", sortable: false, width: "80px" },
      ],

      filters: {
        username: "",
        action: "",
        resource: "",
        status: "",
        dateFrom: "",
        dateTo: "",
      },

      actionTypes: [
        "Create",
        "Update",
        "Delete",
        "Modify",
        "Enable",
        "Disable",
        "Grant",
        "Revoke",
        "Login",
        "Logout",
        "ChangePassword",
        "GenerateToken",
        "RevokeToken",
      ],

      statusTypes: ["Success", "Failed", "Denied"],
    };
  },

  mounted() {
    this.loadAuditLogs();
  },

  methods: {
    loadAuditLogs() {
      this.loading = true;
      this.$axios
        .post(`/api/admin/auditLogs/list?token=${localStorage.appToken}`)
        .then((res) => {
          if (res.data.status === "ok") {
            this.auditLogs = res.data.response.logs || [];
            this.filteredLogs = this.auditLogs;
            this.loading = false;
          }
        })
        .catch(() => {
          this.$toast.error("Failed to load audit logs");
          this.loading = false;
          // Mock data for demonstration
          this.auditLogs = this.generateMockLogs();
          this.filteredLogs = this.auditLogs;
        });
    },

    applyFilters() {
      this.filteredLogs = this.auditLogs.filter((log) => {
        const matchUsername =
          !this.filters.username ||
          log.username
            .toLowerCase()
            .includes(this.filters.username.toLowerCase());
        const matchAction =
          !this.filters.action || log.action === this.filters.action;
        const matchResource =
          !this.filters.resource ||
          log.resource
            .toLowerCase()
            .includes(this.filters.resource.toLowerCase());
        const matchStatus =
          !this.filters.status || log.status === this.filters.status;

        const logDate = moment(log.timestamp).format("YYYY-MM-DD");
        const matchDateFrom =
          !this.filters.dateFrom ||
          moment(logDate).isSameOrAfter(this.filters.dateFrom);
        const matchDateTo =
          !this.filters.dateTo ||
          moment(logDate).isSameOrBefore(this.filters.dateTo);

        return (
          matchUsername &&
          matchAction &&
          matchResource &&
          matchStatus &&
          matchDateFrom &&
          matchDateTo
        );
      });
    },

    resetFilters() {
      this.filters = {
        username: "",
        action: "",
        resource: "",
        status: "",
        dateFrom: "",
        dateTo: "",
      };
      this.filteredLogs = this.auditLogs;
    },

    showDetails(log) {
      this.selectedLog = { ...log };
      this.showDetailsDialog = true;
    },

    exportToCSV() {
      if (this.filteredLogs.length === 0) {
        this.$toast.warning("No audit logs to export");
        return;
      }

      const headers = [
        "Timestamp",
        "Username",
        "Action",
        "Resource",
        "Status",
        "IP Address",
        "Details",
      ];

      const rows = this.filteredLogs.map((log) => [
        this.formatDateTime(log.timestamp),
        log.username,
        log.action,
        log.resource,
        log.status,
        log.ipAddress,
        log.details,
      ]);

      const escapeCSV = (value) => {
        if (value === null || value === undefined) return "";
        const str = String(value);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const csvContent = [
        headers.map(escapeCSV).join(","),
        ...rows.map((row) => row.map(escapeCSV).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `audit-logs-${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.$toast.success("Audit logs exported to CSV");
    },

    getActionColor(action) {
      const colors = {
        Create: "success",
        Update: "info",
        Delete: "error",
        Modify: "warning",
        Enable: "success",
        Disable: "orange",
        Grant: "success",
        Revoke: "error",
        Login: "info",
        Logout: "grey",
        ChangePassword: "warning",
        GenerateToken: "success",
        RevokeToken: "error",
      };
      return colors[action] || "grey";
    },

    formatDateTime(timestamp) {
      return moment(timestamp).format("YYYY-MM-DD HH:mm:ss");
    },

    generateMockLogs() {
      const actions = [
        "Create",
        "Update",
        "Delete",
        "Modify",
        "Enable",
        "Disable",
        "Grant",
        "Revoke",
      ];
      const resources = [
        "User admin",
        "Zone example.com",
        "DHCP Scope 1",
        "Permission Zones.Add",
        "API Token",
        "Block List",
      ];
      const users = ["admin", "operator", "auditor"];

      const logs = [];
      const now = moment();

      for (let i = 0; i < 30; i++) {
        logs.push({
          timestamp: now
            .clone()
            .subtract(i * 5, "minutes")
            .toDate(),
          username: users[Math.floor(Math.random() * users.length)],
          action: actions[Math.floor(Math.random() * actions.length)],
          resource: resources[Math.floor(Math.random() * resources.length)],
          status: Math.random() > 0.05 ? "Success" : "Failed",
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          details: `Audit log entry for administrative action`,
          beforeValue: null,
          afterValue: null,
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

.gap-2 {
  gap: 8px;
}
</style>
