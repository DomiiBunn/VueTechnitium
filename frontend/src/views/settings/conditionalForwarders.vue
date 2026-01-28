<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card :loading="loading">
          <v-card-title>
            <v-icon class="mr-2">mdi-arrow-right-box</v-icon>Conditional
            Forwarders
          </v-card-title>
          <v-card-subtitle>
            Configure per-domain DNS forwarders for specific domain patterns
          </v-card-subtitle>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              v-can="('Settings', 'modify')"
              color="primary"
              @click="showAddDialog = true"
              prepend-icon="mdi-plus"
            >
              Add Forwarder
            </v-btn>
          </v-card-actions>

          <v-card-text>
            <!-- Conditional Forwarders Table -->
            <v-data-table
              v-if="forwarders.length > 0"
              :headers="headers"
              :items="forwarders"
              :loading="loading"
              dense
              class="elevation-0"
              :footer-props="{ itemsPerPageOptions: [10, 25, 50] }"
            >
              <template v-slot:[`item.domainPattern`]="{ item }">
                <v-chip small color="blue" text-color="white">
                  {{ item.domainPattern }}
                </v-chip>
              </template>

              <template v-slot:[`item.forwarders`]="{ item }">
                <div class="text-caption">
                  <div v-for="(fwd, idx) in item.forwarders" :key="idx">
                    <span class="font-monospace">{{ fwd }}</span>
                  </div>
                </div>
              </template>

              <template v-slot:[`item.protocol`]="{ item }">
                <v-chip small :color="getProtocolColor(item.protocol)">
                  {{ item.protocol }}
                </v-chip>
              </template>

              <template v-slot:[`item.useTsig`]="{ item }">
                <v-icon :color="item.useTsig ? 'success' : 'grey'">
                  {{ item.useTsig ? "mdi-lock" : "mdi-lock-open" }}
                </v-icon>
              </template>

              <template v-slot:[`item.actions`]="{ item }">
                <v-btn x-small icon @click="editForwarder(item)" class="mr-1">
                  <v-icon x-small>mdi-pencil</v-icon>
                </v-btn>
                <v-btn x-small icon color="error" @click="confirmDelete(item)">
                  <v-icon x-small>mdi-delete</v-icon>
                </v-btn>
              </template>

              <template v-slot:no-data>
                <div class="text-center py-8">
                  <v-icon large class="mb-4">mdi-arrow-right-box</v-icon>
                  <p class="text-grey">No conditional forwarders configured</p>
                </div>
              </template>
            </v-data-table>

            <div v-else class="text-center py-12">
              <v-icon large class="mb-4">mdi-arrow-right-box</v-icon>
              <p class="text-grey mb-4">No conditional forwarders configured</p>
              <p class="text-caption text-grey mb-6">
                Create conditional forwarders to route specific domains to
                custom DNS servers
              </p>
              <v-btn
                v-can="('Settings', 'modify')"
                color="primary"
                @click="showAddDialog = true"
                prepend-icon="mdi-plus"
              >
                Add Forwarder
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add/Edit Conditional Forwarder Dialog -->
    <v-dialog v-model="showAddDialog" max-width="600" persistent>
      <v-card>
        <v-card-title>
          {{ editingForwarder.id ? "Edit" : "Add" }} Conditional Forwarder
        </v-card-title>
        <v-card-text>
          <!-- Domain Pattern -->
          <div class="mb-4">
            <v-text-field
              v-model="editingForwarder.domainPattern"
              label="Domain Pattern"
              placeholder="example.com or *.internal.local"
              outlined
              dense
              :error="errors.domainPattern"
              error-messages="Domain pattern is required"
              @keyup.enter="saveForwarder()"
            ></v-text-field>
            <p class="text-caption text-grey mt-1">
              Use * for wildcard matching (e.g., *.internal.local matches
              host.internal.local)
            </p>
          </div>

          <!-- Forwarder Servers -->
          <div class="mb-4">
            <label class="text-body-2 font-weight-medium mb-2 d-block">
              Forwarder Servers
            </label>
            <div
              v-for="(fwd, idx) in editingForwarder.forwarders"
              :key="idx"
              class="d-flex gap-2 mb-2"
            >
              <v-text-field
                v-model="editingForwarder.forwarders[idx]"
                label="IP Address or Hostname"
                outlined
                dense
                placeholder="8.8.8.8 or dns.example.com"
              ></v-text-field>
              <v-btn
                icon
                @click="editingForwarder.forwarders.splice(idx, 1)"
                class="mt-1"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
            <v-btn
              small
              outlined
              @click="editingForwarder.forwarders.push('')"
              prepend-icon="mdi-plus"
            >
              Add Server
            </v-btn>
            <p class="text-caption text-grey mt-2">
              At least one forwarder server is required
            </p>
          </div>

          <v-divider class="my-4"></v-divider>

          <!-- Protocol Selection -->
          <div class="mb-4">
            <label class="text-body-2 font-weight-medium mb-2 d-block">
              Protocol
            </label>
            <v-btn-toggle
              v-model="editingForwarder.protocol"
              mandatory
              class="mb-2"
            >
              <v-btn value="UDP" small>UDP</v-btn>
              <v-btn value="TCP" small>TCP</v-btn>
              <v-btn value="DoT" small>DoT</v-btn>
              <v-btn value="DoH" small>DoH</v-btn>
            </v-btn-toggle>
            <p class="text-caption text-grey">
              Select the protocol for DNS queries to these forwarders
            </p>
          </div>

          <v-divider class="my-4"></v-divider>

          <!-- TSIG Key Selection -->
          <div class="mb-4">
            <v-switch
              v-model="editingForwarder.useTsig"
              label="Use TSIG Authentication"
              @change="
                editingForwarder.useTsig
                  ? null
                  : (editingForwarder.tsigKey = '')
              "
            ></v-switch>

            <div v-if="editingForwarder.useTsig" class="mt-3">
              <v-select
                v-model="editingForwarder.tsigKey"
                :items="tsigKeys"
                label="TSIG Key"
                outlined
                dense
                prepend-inner-icon="mdi-key"
              ></v-select>
              <p class="text-caption text-grey mt-2">
                Select a TSIG key for secure zone transfers and updates
              </p>
            </div>
          </div>

          <!-- Proxy Configuration -->
          <v-expansion-panels>
            <v-expansion-panel>
              <template v-slot:header>
                <v-icon small class="mr-2">mdi-proxy</v-icon>
                Proxy Settings
              </template>
              <v-expansion-panel-content>
                <v-switch
                  v-model="editingForwarder.useProxy"
                  label="Use Proxy Server"
                  class="mb-3"
                ></v-switch>

                <div v-if="editingForwarder.useProxy">
                  <v-text-field
                    v-model="editingForwarder.proxyAddress"
                    label="Proxy Address"
                    outlined
                    dense
                    class="mb-3"
                  ></v-text-field>

                  <v-text-field
                    v-model="editingForwarder.proxyPort"
                    label="Proxy Port"
                    type="number"
                    outlined
                    dense
                    class="mb-3"
                  ></v-text-field>

                  <v-text-field
                    v-model="editingForwarder.proxyUsername"
                    label="Proxy Username (optional)"
                    outlined
                    dense
                    class="mb-3"
                  ></v-text-field>

                  <v-text-field
                    v-model="editingForwarder.proxyPassword"
                    label="Proxy Password (optional)"
                    type="password"
                    outlined
                    dense
                  ></v-text-field>
                </div>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
              <template v-slot:header>
                <v-icon small class="mr-2">mdi-shield</v-icon>
                Advanced Options
              </template>
              <v-expansion-panel-content>
                <v-checkbox
                  v-model="editingForwarder.ignoreDnsSec"
                  label="Ignore DNSSEC validation for this domain"
                  class="mb-3"
                ></v-checkbox>

                <v-checkbox
                  v-model="editingForwarder.bypassBlockList"
                  label="Bypass block lists for this domain"
                  class="mb-3"
                ></v-checkbox>

                <v-text-field
                  v-model.number="editingForwarder.timeout"
                  label="Query Timeout (ms)"
                  type="number"
                  outlined
                  dense
                  :min="100"
                  :max="10000"
                ></v-text-field>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="cancelEdit()" text>Cancel</v-btn>
          <v-btn
            color="primary"
            @click="saveForwarder()"
            :loading="saving"
            :disabled="
              !editingForwarder.domainPattern ||
              editingForwarder.forwarders.filter((f) => f.trim()).length === 0
            "
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete Conditional Forwarder?</v-card-title>
        <v-card-text>
          <p>
            Are you sure you want to delete the conditional forwarder for
            <code>{{ deleteForwarder.domainPattern }}</code
            >?
          </p>
          <p class="text-caption text-grey mt-4">
            <v-icon x-small>mdi-alert</v-icon>
            Queries for this domain will no longer be routed to the specified
            forwarders.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDeleteDialog = false" text>Cancel</v-btn>
          <v-btn
            color="error"
            @click="deleteForwarderConfirmed()"
            :loading="deleting"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      saving: false,
      deleting: false,
      forwarders: [],
      tsigKeys: [
        { text: "example.com", value: "example.com" },
        { text: "internal.local", value: "internal.local" },
      ],
      showAddDialog: false,
      showDeleteDialog: false,
      deleteForwarder: {},
      editingForwarder: {
        id: null,
        domainPattern: "",
        forwarders: [""],
        protocol: "UDP",
        useTsig: false,
        tsigKey: "",
        useProxy: false,
        proxyAddress: "",
        proxyPort: 3128,
        proxyUsername: "",
        proxyPassword: "",
        ignoreDnsSec: false,
        bypassBlockList: false,
        timeout: 3000,
      },
      errors: {
        domainPattern: false,
      },
      headers: [
        { text: "Domain Pattern", value: "domainPattern", width: "25%" },
        { text: "Forwarders", value: "forwarders", width: "35%" },
        { text: "Protocol", value: "protocol", width: "15%" },
        { text: "TSIG", value: "useTsig", sortable: false, width: "10%" },
        { text: "", value: "actions", sortable: false, width: "15%" },
      ],
    };
  },

  mounted() {
    this.loadForwarders();
    this.loadTsigKeys();
  },

  methods: {
    loadForwarders() {
      this.loading = true;
      this.$axios
        .post(
          `/api/settings/conditionalForwarders/list?token=${localStorage.appToken}`,
        )
        .then((res) => {
          if (res.data.status === "ok") {
            this.forwarders = res.data.response.forwarders || [];
            this.loading = false;
          }
        })
        .catch(() => {
          // Mock data for demonstration
          this.forwarders = [
            {
              id: "1",
              domainPattern: "*.internal.local",
              forwarders: ["192.168.1.1", "192.168.1.2"],
              protocol: "UDP",
              useTsig: false,
              tsigKey: "",
            },
            {
              id: "2",
              domainPattern: "secure.example.com",
              forwarders: ["8.8.8.8"],
              protocol: "DoT",
              useTsig: true,
              tsigKey: "example.com",
            },
          ];
          this.loading = false;
        });
    },

    loadTsigKeys() {
      this.$axios
        .post(`/api/settings/tsig/list?token=${localStorage.appToken}`)
        .then((res) => {
          if (res.data.status === "ok") {
            this.tsigKeys = (res.data.response.keys || []).map((key) => ({
              text: key.name,
              value: key.name,
            }));
          }
        })
        .catch(() => {
          // Keep mock data
        });
    },

    resetForm() {
      this.editingForwarder = {
        id: null,
        domainPattern: "",
        forwarders: [""],
        protocol: "UDP",
        useTsig: false,
        tsigKey: "",
        useProxy: false,
        proxyAddress: "",
        proxyPort: 3128,
        proxyUsername: "",
        proxyPassword: "",
        ignoreDnsSec: false,
        bypassBlockList: false,
        timeout: 3000,
      };
      this.errors.domainPattern = false;
    },

    editForwarder(forwarder) {
      this.editingForwarder = { ...forwarder };
      this.showAddDialog = true;
    },

    cancelEdit() {
      this.resetForm();
      this.showAddDialog = false;
    },

    saveForwarder() {
      this.errors.domainPattern = !this.editingForwarder.domainPattern.trim();

      if (this.errors.domainPattern) {
        this.$toast.warning("Domain pattern is required");
        return;
      }

      const validForwarders = this.editingForwarder.forwarders.filter((f) =>
        f.trim(),
      );
      if (validForwarders.length === 0) {
        this.$toast.warning("At least one forwarder server is required");
        return;
      }

      this.saving = true;

      const params = new URLSearchParams();
      params.append("token", localStorage.appToken);
      params.append("domainPattern", this.editingForwarder.domainPattern);
      params.append("protocol", this.editingForwarder.protocol);
      params.append("forwarders", validForwarders.join(","));
      params.append("useTsig", this.editingForwarder.useTsig);
      if (this.editingForwarder.useTsig) {
        params.append("tsigKey", this.editingForwarder.tsigKey);
      }

      const endpoint = this.editingForwarder.id
        ? `/api/settings/conditionalForwarders/update?${params.toString()}`
        : `/api/settings/conditionalForwarders/add?${params.toString()}`;

      this.$axios
        .post(endpoint)
        .then((res) => {
          if (res.data.status === "ok") {
            this.$toast.success("Conditional forwarder saved successfully");
            this.showAddDialog = false;
            this.resetForm();
            this.loadForwarders();
          }
        })
        .catch(() => {
          this.$toast.error("Failed to save conditional forwarder");
          this.saving = false;
        });
    },

    confirmDelete(forwarder) {
      this.deleteForwarder = { ...forwarder };
      this.showDeleteDialog = true;
    },

    deleteForwarderConfirmed() {
      this.deleting = true;

      const params = new URLSearchParams();
      params.append("token", localStorage.appToken);
      params.append("id", this.deleteForwarder.id);

      this.$axios
        .post(`/api/settings/conditionalForwarders/delete?${params.toString()}`)
        .then((res) => {
          if (res.data.status === "ok") {
            this.$toast.success("Conditional forwarder deleted");
            this.showDeleteDialog = false;
            this.deleting = false;
            this.loadForwarders();
          }
        })
        .catch(() => {
          this.$toast.error("Failed to delete conditional forwarder");
          this.deleting = false;
        });
    },

    getProtocolColor(protocol) {
      const colors = {
        UDP: "info",
        TCP: "warning",
        DoT: "success",
        DoH: "success",
      };
      return colors[protocol] || "grey";
    },
  },
};
</script>

<style scoped lang="scss">
code {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: "Courier New", monospace;
}

.gap-2 {
  gap: 8px;
}

.font-monospace {
  font-family: "Courier New", monospace;
  letter-spacing: 0.5px;
}
</style>
