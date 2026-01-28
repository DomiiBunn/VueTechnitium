<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card :loading="loading">
          <v-toolbar color="primary" dark>
            <v-icon left>mdi-account-multiple</v-icon>
            <v-toolbar-title>Active Sessions</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
              text
              color="white"
              @click="refreshSessions"
              prepend-icon="mdi-refresh"
              :loading="loading"
            >
              Refresh
            </v-btn>
          </v-toolbar>

          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="sessions"
              :loading="loading"
              item-key="sessionId"
              class="elevation-1"
            >
              <template v-slot:[`item.loginTime`]="{ item }">
                {{ formatDateTime(item.loginTime) }}
              </template>

              <template v-slot:[`item.lastAccessTime`]="{ item }">
                {{ formatDateTime(item.lastAccessTime) }}
              </template>

              <template v-slot:[`item.browser`]="{ item }">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-chip small v-bind="attrs" v-on="on">
                      {{ item.userAgent | truncate(40) }}
                    </v-chip>
                  </template>
                  {{ item.userAgent }}
                </v-tooltip>
              </template>

              <template v-slot:[`item.ipAddress`]="{ item }">
                <code>{{ item.ipAddress }}</code>
              </template>

              <template v-slot:[`item.isCurrentSession`]="{ item }">
                <v-chip
                  v-if="item.isCurrentSession"
                  color="primary"
                  text-color="white"
                  small
                >
                  <v-icon left x-small>mdi-check</v-icon>
                  Current
                </v-chip>
                <v-chip v-else small>Other</v-chip>
              </template>

              <template v-slot:[`item.actions`]="{ item }">
                <v-btn
                  v-if="!item.isCurrentSession"
                  icon
                  small
                  color="error"
                  @click="forceLogout(item.sessionId, item.username)"
                  title="Force logout"
                >
                  <v-icon>mdi-logout</v-icon>
                </v-btn>
                <v-chip v-else small disabled>Current</v-chip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Session Details Dialog -->
    <v-dialog v-model="showSessionDetailsDialog" max-width="600">
      <v-card v-if="selectedSession">
        <v-card-title>Session Details</v-card-title>
        <v-card-text>
          <v-row>
            <v-col>
              <p><strong>Username:</strong> {{ selectedSession.username }}</p>
              <p>
                <strong>IP Address:</strong>
                <code>{{ selectedSession.ipAddress }}</code>
              </p>
              <p>
                <strong>Login Time:</strong>
                {{ formatDateTime(selectedSession.loginTime) }}
              </p>
              <p>
                <strong>Last Access:</strong>
                {{ formatDateTime(selectedSession.lastAccessTime) }}
              </p>
              <p><strong>Browser:</strong> {{ selectedSession.userAgent }}</p>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <h4 class="mb-3">Permissions</h4>
          <v-row>
            <v-col
              v-for="perm in selectedSession.permissions"
              :key="perm"
              cols="12"
              sm="6"
            >
              <v-chip small color="primary" text-color="white">
                {{ perm }}
              </v-chip>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="secondary"
            text
            @click="showSessionDetailsDialog = false"
            >Close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "ActiveSessions",
  data() {
    return {
      loading: false,
      sessions: [],
      showSessionDetailsDialog: false,
      selectedSession: null,
      headers: [
        { text: "Username", value: "username", width: "12%" },
        { text: "IP Address", value: "ipAddress", width: "12%" },
        { text: "Login Time", value: "loginTime", width: "16%" },
        { text: "Last Access", value: "lastAccessTime", width: "16%" },
        { text: "Browser", value: "browser", width: "24%" },
        { text: "Type", value: "isCurrentSession", width: "10%" },
        { text: "", value: "actions", width: "10%", sortable: false },
      ],
    };
  },
  filters: {
    truncate(value, length = 40) {
      if (!value) return "";
      return value.length > length ? value.substring(0, length) + "..." : value;
    },
  },
  mounted() {
    this.refreshSessions();
    // Refresh sessions every 30 seconds
    this.sessionInterval = setInterval(() => {
      this.refreshSessions();
    }, 30000);
  },
  beforeDestroy() {
    if (this.sessionInterval) {
      clearInterval(this.sessionInterval);
    }
  },
  methods: {
    refreshSessions() {
      this.loading = true;
      axios
        .post(`/api/admin/sessions/list?token=${localStorage.appToken}`)
        .then((response) => {
          if (response.data.status === "ok") {
            this.sessions = response.data.response.sessions || [];
          }
        })
        .catch(() => {
          this.$toast.error("Failed to load sessions");
        })
        .finally(() => {
          this.loading = false;
        });
    },
    forceLogout(sessionId, username) {
      this.$swal
        .fire({
          title: "Force Logout?",
          text: `Force logout user '${username}'? They will be logged out immediately.`,
          icon: "warning",
          confirmButtonText: "Force Logout",
          cancelButtonText: "Cancel",
          showCancelButton: true,
        })
        .then((result) => {
          if (result.isConfirmed) {
            axios
              .post(
                `/api/admin/sessions/forceLogout?token=${localStorage.appToken}&sessionId=${sessionId}`,
              )
              .then((response) => {
                if (response.data.status === "ok") {
                  this.$toast.success("User logged out");
                  this.refreshSessions();
                }
              })
              .catch(() => {
                this.$toast.error("Failed to logout user");
              });
          }
        });
    },
    showDetails(session) {
      this.selectedSession = session;
      this.showSessionDetailsDialog = true;
    },
    formatDateTime(dateString) {
      if (!dateString) return "Unknown";
      const date = new Date(dateString);
      return date.toLocaleString();
    },
  },
};
</script>

<style lang="scss" scoped>
code {
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}
</style>
