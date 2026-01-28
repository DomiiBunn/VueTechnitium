<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card :loading="loading">
          <v-toolbar color="primary" dark>
            <v-icon left>mdi-lock-check</v-icon>
            <v-toolbar-title>API Tokens</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
              text
              color="white"
              @click="showGenerateTokenDialog = true"
              prepend-icon="mdi-plus"
            >
              Generate New Token
            </v-btn>
          </v-toolbar>

          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="tokens"
              :loading="loading"
              item-key="token"
              class="elevation-1"
            >
              <template v-slot:[`item.createdDate`]="{ item }">
                {{ formatDate(item.createdDate) }}
              </template>

              <template v-slot:[`item.expirationDate`]="{ item }">
                <v-chip
                  v-if="item.expirationDate"
                  :color="
                    isTokenExpired(item.expirationDate) ? 'error' : 'success'
                  "
                  text-color="white"
                  small
                >
                  {{ formatDate(item.expirationDate) }}
                </v-chip>
                <v-chip v-else small color="info" text-color="white">
                  No expiration
                </v-chip>
              </template>

              <template v-slot:[`item.permissions`]="{ item }">
                <v-tooltip bottom max-width="400">
                  <template v-slot:activator="{ on, attrs }">
                    <v-chip small v-bind="attrs" v-on="on">
                      {{ item.permissions ? item.permissions.length : 0 }}
                      permissions
                    </v-chip>
                  </template>
                  <div>{{ (item.permissions || []).join(", ") }}</div>
                </v-tooltip>
              </template>

              <template v-slot:[`item.actions`]="{ item }">
                <v-btn
                  icon
                  small
                  color="info"
                  @click="copyToken(item.token)"
                  title="Copy token"
                >
                  <v-icon>mdi-content-copy</v-icon>
                </v-btn>
                <v-btn
                  icon
                  small
                  color="warning"
                  @click="showEditTokenDialog(item)"
                  title="Edit"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  icon
                  small
                  color="error"
                  @click="deleteToken(item.token)"
                  title="Revoke"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Generate Token Dialog -->
    <v-dialog v-model="showGenerateTokenDialog" max-width="600">
      <v-card>
        <v-card-title>Generate New API Token</v-card-title>
        <v-card-text>
          <v-form ref="generateTokenForm">
            <v-text-field
              v-model="newTokenConfig.comment"
              label="Token Name/Comment"
              hint="Description for this token (e.g., 'Mobile App', 'Backup Script')"
              persistent-hint
              :rules="[rules.required]"
            ></v-text-field>

            <v-row>
              <v-col>
                <v-checkbox
                  v-model="newTokenConfig.neverExpires"
                  label="Never Expires"
                  @change="
                    newTokenConfig.expirationDays = neverExpires ? 0 : 90
                  "
                ></v-checkbox>
              </v-col>
            </v-row>

            <v-row v-if="!newTokenConfig.neverExpires">
              <v-col>
                <v-select
                  v-model="newTokenConfig.expirationDays"
                  :items="expirationOptions"
                  label="Token Expiration"
                  hint="After how many days should this token expire"
                  persistent-hint
                ></v-select>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <h4 class="mb-3">Permissions</h4>
            <v-row>
              <v-col cols="12">
                <p class="text-caption">
                  Select which permissions this token can access:
                </p>
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-checkbox
                  v-model="newTokenConfig.permissions"
                  value="Dashboard"
                  label="Dashboard"
                ></v-checkbox>
              </v-col>
              <v-col>
                <v-checkbox
                  v-model="newTokenConfig.permissions"
                  value="Zones"
                  label="Zones"
                ></v-checkbox>
              </v-col>
              <v-col>
                <v-checkbox
                  v-model="newTokenConfig.permissions"
                  value="Cache"
                  label="Cache"
                ></v-checkbox>
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-checkbox
                  v-model="newTokenConfig.permissions"
                  value="Allowed"
                  label="Allowed"
                ></v-checkbox>
              </v-col>
              <v-col>
                <v-checkbox
                  v-model="newTokenConfig.permissions"
                  value="Blocked"
                  label="Blocked"
                ></v-checkbox>
              </v-col>
              <v-col>
                <v-checkbox
                  v-model="newTokenConfig.permissions"
                  value="DhcpServer"
                  label="DHCP"
                ></v-checkbox>
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-checkbox
                  v-model="newTokenConfig.permissions"
                  value="Apps"
                  label="Apps"
                ></v-checkbox>
              </v-col>
              <v-col>
                <v-checkbox
                  v-model="newTokenConfig.permissions"
                  value="Logs"
                  label="Logs"
                ></v-checkbox>
              </v-col>
              <v-col>
                <v-checkbox
                  v-model="newTokenConfig.permissions"
                  value="Settings"
                  label="Settings"
                ></v-checkbox>
              </v-col>
            </v-row>

            <v-alert type="info" outlined small>
              <strong>Note:</strong> Token will be displayed only once after
              generation. Make sure to copy and store it securely.
            </v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" text @click="showGenerateTokenDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="primary" @click="generateToken" :loading="tokenLoading">
            Generate Token
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Generated Token Display Dialog -->
    <v-dialog v-model="showTokenDisplayDialog" max-width="600" persistent>
      <v-card>
        <v-card-title class="text-warning">⚠️ Save Your API Token</v-card-title>
        <v-card-text>
          <p><strong>Your new API token has been created!</strong></p>
          <p class="text-caption">
            Copy it now. You won't be able to see it again for security reasons.
          </p>

          <v-textarea
            v-model="generatedToken"
            readonly
            label="API Token"
            rows="4"
            class="font-weight-bold"
            @focus="$event.target.select()"
          ></v-textarea>

          <p class="text-caption mt-4">
            <strong>How to use:</strong> Include this token in your API
            requests:<br />
            <code>GET /api/endpoint?token={{ generatedToken }}</code>
          </p>

          <v-alert type="warning" outlined small>
            <strong>Important:</strong> Store this token securely. Anyone with
            this token can access your DNS server with the permissions you
            assigned.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="copyTokenToClipboard(generatedToken)">
            <v-icon left>mdi-content-copy</v-icon>
            Copy Token
          </v-btn>
          <v-btn color="secondary" @click="acknowledgeToken">Done</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Token Dialog -->
    <v-dialog v-model="showEditTokenDialog" max-width="600">
      <v-card>
        <v-card-title>Edit API Token</v-card-title>
        <v-card-text>
          <v-form ref="editTokenForm">
            <v-text-field
              v-model="editingToken.comment"
              label="Token Name/Comment"
              :rules="[rules.required]"
            ></v-text-field>

            <h4 class="mb-3 mt-4">Permissions</h4>
            <v-row>
              <v-col>
                <v-checkbox
                  v-model="editingToken.permissions"
                  value="Dashboard"
                  label="Dashboard"
                ></v-checkbox>
              </v-col>
              <v-col>
                <v-checkbox
                  v-model="editingToken.permissions"
                  value="Zones"
                  label="Zones"
                ></v-checkbox>
              </v-col>
              <v-col>
                <v-checkbox
                  v-model="editingToken.permissions"
                  value="Cache"
                  label="Cache"
                ></v-checkbox>
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-checkbox
                  v-model="editingToken.permissions"
                  value="Allowed"
                  label="Allowed"
                ></v-checkbox>
              </v-col>
              <v-col>
                <v-checkbox
                  v-model="editingToken.permissions"
                  value="Blocked"
                  label="Blocked"
                ></v-checkbox>
              </v-col>
              <v-col>
                <v-checkbox
                  v-model="editingToken.permissions"
                  value="DhcpServer"
                  label="DHCP"
                ></v-checkbox>
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-checkbox
                  v-model="editingToken.permissions"
                  value="Apps"
                  label="Apps"
                ></v-checkbox>
              </v-col>
              <v-col>
                <v-checkbox
                  v-model="editingToken.permissions"
                  value="Logs"
                  label="Logs"
                ></v-checkbox>
              </v-col>
              <v-col>
                <v-checkbox
                  v-model="editingToken.permissions"
                  value="Settings"
                  label="Settings"
                ></v-checkbox>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" text @click="showEditTokenDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="primary" @click="updateToken" :loading="tokenLoading">
            Update Token
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      loading: false,
      tokenLoading: false,
      tokens: [],
      showGenerateTokenDialog: false,
      showTokenDisplayDialog: false,
      showEditTokenDialog: false,
      generatedToken: "",
      editingToken: null,
      newTokenConfig: {
        comment: "",
        neverExpires: true,
        expirationDays: 0,
        permissions: ["Dashboard"],
      },
      headers: [
        { text: "Comment", value: "comment", width: "20%" },
        { text: "Created", value: "createdDate", width: "15%" },
        { text: "Expires", value: "expirationDate", width: "15%" },
        { text: "Permissions", value: "permissions", width: "35%" },
        { text: "", value: "actions", width: "15%", sortable: false },
      ],
      expirationOptions: [30, 60, 90, 180, 365, 730],
      rules: {
        required: (v) => !!v || "Required",
      },
    };
  },
  mounted() {
    this.loadTokens();
  },
  methods: {
    loadTokens() {
      this.loading = true;
      axios
        .post(`/api/admin/tokens/list?token=${localStorage.appToken}`)
        .then((response) => {
          if (response.data.status === "ok") {
            this.tokens = response.data.response.tokens || [];
          }
        })
        .catch(() => {
          this.$toast.error("Failed to load tokens");
        })
        .finally(() => {
          this.loading = false;
        });
    },
    generateToken() {
      if (!this.$refs.generateTokenForm.validate()) return;

      this.tokenLoading = true;
      const params = new URLSearchParams();
      params.append("token", localStorage.appToken);
      params.append("comment", this.newTokenConfig.comment);
      if (!this.newTokenConfig.neverExpires) {
        params.append("expirationDays", this.newTokenConfig.expirationDays);
      }
      this.newTokenConfig.permissions.forEach((p) =>
        params.append("permissions", p),
      );

      axios
        .post(`/api/admin/tokens/generate?${params.toString()}`)
        .then((response) => {
          if (response.data.status === "ok") {
            this.generatedToken = response.data.response.token;
            this.showGenerateTokenDialog = false;
            this.showTokenDisplayDialog = true;
          } else {
            this.$toast.error(
              response.data.errorMessage || "Failed to generate token",
            );
          }
        })
        .catch(() => {
          this.$toast.error("Failed to generate token");
        })
        .finally(() => {
          this.tokenLoading = false;
        });
    },
    acknowledgeToken() {
      this.showTokenDisplayDialog = false;
      this.generatedToken = "";
      this.newTokenConfig = {
        comment: "",
        neverExpires: true,
        expirationDays: 0,
        permissions: ["Dashboard"],
      };
      this.loadTokens();
    },
    copyToken(token) {
      this.copyTokenToClipboard(token);
    },
    copyTokenToClipboard(token) {
      navigator.clipboard.writeText(token).then(() => {
        this.$toast.success("Token copied to clipboard");
      });
    },
    showEditTokenDialogModal(token) {
      this.editingToken = { ...token };
      this.showEditTokenDialog = true;
    },
    updateToken() {
      if (!this.$refs.editTokenForm.validate()) return;

      this.tokenLoading = true;
      const params = new URLSearchParams();
      params.append("token", localStorage.appToken);
      params.append("tokenId", this.editingToken.token);
      params.append("comment", this.editingToken.comment);
      (this.editingToken.permissions || []).forEach((p) =>
        params.append("permissions", p),
      );

      axios
        .post(`/api/admin/tokens/update?${params.toString()}`)
        .then((response) => {
          if (response.data.status === "ok") {
            this.$toast.success("Token updated");
            this.showEditTokenDialog = false;
            this.loadTokens();
          } else {
            this.$toast.error(
              response.data.errorMessage || "Failed to update token",
            );
          }
        })
        .catch(() => {
          this.$toast.error("Failed to update token");
        })
        .finally(() => {
          this.tokenLoading = false;
        });
    },
    deleteToken(token) {
      this.$swal
        .fire({
          title: "Revoke Token?",
          text: "This will permanently revoke the token. Any scripts using it will stop working.",
          icon: "warning",
          confirmButtonText: "Revoke",
          cancelButtonText: "Cancel",
          showCancelButton: true,
        })
        .then((result) => {
          if (result.isConfirmed) {
            axios
              .post(
                `/api/admin/tokens/delete?token=${localStorage.appToken}&tokenId=${token}`,
              )
              .then((response) => {
                if (response.data.status === "ok") {
                  this.$toast.success("Token revoked");
                  this.loadTokens();
                }
              });
          }
        });
    },
    formatDate(dateString) {
      if (!dateString) return "Never";
      return new Date(dateString).toLocaleDateString();
    },
    isTokenExpired(expirationDate) {
      return new Date(expirationDate) < new Date();
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
}
</style>
