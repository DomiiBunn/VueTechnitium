<template>
  <v-card>
    <v-card-title>
      Scopes
      <v-spacer></v-spacer>
      <v-btn
        v-can="{ section: 'DhcpServer', action: 'modify' }"
        color="primary"
        @click="showAddScopeDialog = true"
        >Add scope</v-btn
      >
    </v-card-title>
    <v-card-text>
      <v-data-table
        :loading="loading"
        :headers="headers"
        :items="scopes"
        multi-sort
        item-key="name"
        :items-per-page="100"
        :footer-props="{
          itemsPerPageOptions: [100, 200, 500, -1],
        }"
      >
        <template v-slot:[`item.type`]="{ item }">
          <v-chip
            class="ma-2 chip"
            style="width: 75px"
            small
            :color="getTypeColor(item.type)"
            dark
          >
            <span>{{ item.type }}</span>
          </v-chip>
        </template>
        <template v-slot:[`item.scope`]="{ item }">
          {{ item.startingAddress }} - {{ item.endingAddress }}
        </template>
        <template v-slot:[`item.options`]="{ item }">
          <div class="flex-options">
            <v-btn
              color="primary"
              rounded
              link
              small
              fab
              outlined
              :to="`/dhcp/edit-scope/${item.name}`"
              ><v-icon>mdi-pencil</v-icon></v-btn
            >
            <v-btn
              color="warning"
              rounded
              small
              fab
              outlined
              v-if="item.enabled"
              @click="disable(item)"
              ><v-icon>mdi-pause</v-icon></v-btn
            >
            <v-btn
              color="success"
              small
              fab
              rounded
              outlined
              v-else
              @click="enable(item)"
              ><v-icon>mdi-play</v-icon></v-btn
            >
            <v-btn
              v-can="{ section: 'DhcpServer', action: 'delete' }"
              color="danger"
              small
              fab
              dark
              rounded
              outlined
              @click="deleteScope(item)"
              ><v-icon>mdi-trash-can</v-icon></v-btn
            >
          </div>
        </template>
      </v-data-table>
    </v-card-text>

    <v-dialog v-model="showAddScopeDialog" max-width="800px">
      <v-card>
        <v-card-title>Add New DHCP Scope</v-card-title>
        <v-card-text>
          <v-form ref="addScopeForm" v-model="validForm">
            <v-text-field
              v-model="newScope.name"
              label="Scope Name*"
              :rules="[rules.required]"
              hint="Display name for the scope"
            ></v-text-field>
            <v-text-field
              v-model="newScope.startingAddress"
              label="Starting Address*"
              :rules="[rules.required, rules.ipv4]"
              hint="First IP address in DHCP range"
            ></v-text-field>
            <v-text-field
              v-model="newScope.endingAddress"
              label="Ending Address*"
              :rules="[rules.required, rules.ipv4]"
              hint="Last IP address in DHCP range"
            ></v-text-field>
            <v-text-field
              v-model="newScope.subnetMask"
              label="Subnet Mask*"
              :rules="[rules.required, rules.ipv4]"
              hint="Subnet mask for the network"
            ></v-text-field>
            <v-text-field
              v-model="newScope.leaseTimeDays"
              label="Lease Days"
              type="number"
              :rules="[rules.number]"
            ></v-text-field>
            <v-text-field
              v-model="newScope.leaseTimeHours"
              label="Lease Hours"
              type="number"
              :rules="[rules.number]"
            ></v-text-field>
            <v-text-field
              v-model="newScope.leaseTimeMinutes"
              label="Lease Minutes"
              type="number"
              :rules="[rules.number]"
            ></v-text-field>
            <v-text-field
              v-model="newScope.offerDelayTime"
              label="Offer Delay Time (ms)"
              type="number"
            ></v-text-field>
            <v-text-field
              v-model="newScope.domainName"
              label="Domain Name"
              hint="Domain name for this network (Option 15)"
            ></v-text-field>
            <v-textarea
              v-model="newScope.domainSearchList"
              label="Domain Search List"
              hint="Comma-separated list of domain names (Option 119)"
              rows="2"
            ></v-textarea>
            <v-checkbox
              v-model="newScope.dnsUpdates"
              label="Enable DNS Updates"
            ></v-checkbox>
            <v-checkbox
              v-model="newScope.pingCheckEnabled"
              label="Enable Ping Check"
            ></v-checkbox>
            <div v-if="newScope.pingCheckEnabled">
              <v-text-field
                v-model="newScope.pingCheckTimeout"
                label="Ping Check Timeout (ms)"
                type="number"
              ></v-text-field>
              <v-text-field
                v-model="newScope.pingCheckRetries"
                label="Ping Check Retries"
                type="number"
              ></v-text-field>
            </div>

            <!-- Exclusions Section -->
            <v-divider class="my-4"></v-divider>
            <h4 class="mb-3">IP Address Exclusions</h4>
            <v-row>
              <v-col cols="12">
                <p class="text-caption">
                  Define IP address ranges that should not be assigned by DHCP.
                </p>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field
                  v-model="exclusionStart"
                  label="Exclusion Starting Address"
                  :rules="[rules.ipv4]"
                ></v-text-field>
              </v-col>
              <v-col>
                <v-text-field
                  v-model="exclusionEnd"
                  label="Exclusion Ending Address"
                  :rules="[rules.ipv4]"
                ></v-text-field>
              </v-col>
              <v-col cols="auto" class="d-flex align-center">
                <v-btn
                  icon
                  color="primary"
                  @click="addExclusion"
                  :disabled="!exclusionStart || !exclusionEnd"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <!-- Exclusions Table -->
            <v-row v-if="newScope.exclusions && newScope.exclusions.length > 0">
              <v-col cols="12">
                <v-data-table
                  :headers="exclusionHeaders"
                  :items="newScope.exclusions"
                  hide-default-footer
                  dense
                >
                  <template v-slot:[`item.actions`]="{ index }">
                    <v-btn
                      icon
                      x-small
                      color="danger"
                      @click="removeExclusion(index)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showAddScopeDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="addScope">Add Scope</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      polling: null,
      scopes: [],
      loading: false,
      dialog: false,
      headers: [
        { text: "Name", value: "name" },
        {
          text: "Scope",
          value: "scope",
          groupable: false,
          align: "end",
        },
        {
          text: "Subnet",
          value: "subnetMask",
          groupable: false,
          align: "start",
        },
        { text: "Network", value: "networkAddress", align: "end" },
        {
          text: "Broadcast",
          value: "broadcastAddress",
          groupable: false,
          align: "start",
        },
        {
          text: "Interface",
          value: "interfaceAddress",
        },
      ],
      permissions: {},
      showAddScopeDialog: false,
      validForm: true,
      exclusionStart: "",
      exclusionEnd: "",
      exclusionHeaders: [
        { text: "Starting Address", value: "start" },
        { text: "Ending Address", value: "end" },
        { text: "", value: "actions", sortable: false },
      ],
      newScope: {
        name: "",
        startingAddress: "",
        endingAddress: "",
        subnetMask: "255.255.255.0",
        leaseTimeDays: 1,
        leaseTimeHours: 0,
        leaseTimeMinutes: 0,
        offerDelayTime: 0,
        domainName: "",
        domainSearchList: "",
        dnsUpdates: false,
        pingCheckEnabled: false,
        pingCheckTimeout: 1000,
        pingCheckRetries: 2,
        exclusions: [],
      },
      rules: {
        required: (v) => !!v || "Required",
        ipv4: (v) =>
          /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
            v,
          ) || "Invalid IPv4 address",
        number: (v) =>
          (!isNaN(parseFloat(v)) && isFinite(v)) || "Must be a number",
      },
    };
  },
  created() {
    this.getScopes();
    try {
      const { useAuthStore } = require("@/stores/auth");
      const store = useAuthStore();
      this.permissions =
        (store.permissions && store.permissions.DhcpServer) || {};
    } catch (_) {
      this.permissions = {};
    }
    if (this.permissions.canModify) {
      this.headers.push({
        text: "",
        value: "options",
        groupable: false,
        sortable: false,
        filterable: false,
      });
    }
    this.polling = setInterval(this.getScopes, 5000);
  },
  beforeDestroy() {
    clearInterval(this.polling);
  },
  methods: {
    getScopes() {
      let that = this;
      this.loading = true;
      this.$axios
        .post(`/api/dhcp/scopes/list?token=${localStorage.appToken}`)
        .then(function (response) {
          if (response.data.status == "ok") {
            that.scopes = response.data.response.scopes;
          }
        })
        .then(function () {
          that.loading = false;
        });
    },
    disable(scope) {
      let that = this;
      this.loading = true;
      this.$axios
        .post(
          `/api/dhcp/scopes/disable?token=${localStorage.appToken}&name=${scope.name}`,
        )
        .then(function (response) {
          if (response.data.status == "ok") {
            that.loading = false;
          }
        })
        .then(function () {
          that.getScopes();
        });
    },
    enable(scope) {
      let that = this;
      this.loading = true;
      this.$axios
        .post(
          `/api/dhcp/scopes/enable?token=${localStorage.appToken}&name=${scope.name}`,
        )
        .then(function (response) {
          if (response.data.status == "ok") {
            that.loading = false;
          }
        })
        .then(function () {
          that.getScopes();
        });
    },
    deleteScope(scope) {
      let that = this;
      this.loading = true;
      this.$axios
        .post(
          `/api/dhcp/scopes/delete?token=${localStorage.appToken}&name=${scope.name}`,
        )
        .then(function (response) {
          if (response.data.status == "ok") {
            that.loading = false;
          }
        })
        .then(function () {
          that.getScopes();
        });
    },
    addScope() {
      if (!this.$refs.addScopeForm.validate()) {
        return;
      }

      this.loading = true;
      const params = new URLSearchParams();
      params.append("token", localStorage.appToken);
      params.append("name", this.newScope.name);
      params.append("startingAddress", this.newScope.startingAddress);
      params.append("endingAddress", this.newScope.endingAddress);
      params.append("subnetMask", this.newScope.subnetMask);
      params.append("leaseTimeDays", this.newScope.leaseTimeDays);
      params.append("leaseTimeHours", this.newScope.leaseTimeHours);
      params.append("leaseTimeMinutes", this.newScope.leaseTimeMinutes);
      params.append("offerDelayTime", this.newScope.offerDelayTime);
      if (this.newScope.domainName) {
        params.append("domainName", this.newScope.domainName);
      }
      if (this.newScope.domainSearchList) {
        params.append("domainSearchList", this.newScope.domainSearchList);
      }
      params.append("dnsUpdates", this.newScope.dnsUpdates);
      params.append("pingCheckEnabled", this.newScope.pingCheckEnabled);
      if (this.newScope.pingCheckEnabled) {
        params.append("pingCheckTimeout", this.newScope.pingCheckTimeout);
        params.append("pingCheckRetries", this.newScope.pingCheckRetries);
      }

      // Add exclusions
      if (this.newScope.exclusions && this.newScope.exclusions.length > 0) {
        const exclusionStrings = this.newScope.exclusions.map(
          (e) => `${e.start}|${e.end}`,
        );
        exclusionStrings.forEach((exc) => params.append("exclusions", exc));
      }

      this.$axios
        .post(`/api/dhcp/scopes/set?${params.toString()}`)
        .then((response) => {
          if (response.data.status === "ok") {
            this.$toast.success("DHCP scope added successfully");
            this.showAddScopeDialog = false;
            this.$refs.addScopeForm.reset();
            this.newScope.exclusions = [];
            this.exclusionStart = "";
            this.exclusionEnd = "";
            this.getScopes();
          } else {
            this.$toast.error(
              response.data.errorMessage || "Failed to add scope",
            );
          }
        })
        .catch((error) => {
          console.error(error);
          this.$toast.error("Failed to add DHCP scope");
        })
        .finally(() => {
          this.loading = false;
        });
    },
    addExclusion() {
      if (!this.exclusionStart || !this.exclusionEnd) {
        this.$toast.error("Both starting and ending addresses are required");
        return;
      }

      // Validate IPs
      const ipRegex =
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (
        !ipRegex.test(this.exclusionStart) ||
        !ipRegex.test(this.exclusionEnd)
      ) {
        this.$toast.error("Invalid IP address");
        return;
      }

      // Check if range is within scope
      const scopeStart = this.ipToNumber(this.newScope.startingAddress);
      const scopeEnd = this.ipToNumber(this.newScope.endingAddress);
      const exclusionStart = this.ipToNumber(this.exclusionStart);
      const exclusionEnd = this.ipToNumber(this.exclusionEnd);

      if (exclusionStart < scopeStart || exclusionEnd > scopeEnd) {
        this.$toast.error("Exclusion range must be within scope range");
        return;
      }

      this.newScope.exclusions.push({
        start: this.exclusionStart,
        end: this.exclusionEnd,
      });

      this.exclusionStart = "";
      this.exclusionEnd = "";
    },
    removeExclusion(index) {
      this.newScope.exclusions.splice(index, 1);
    },
    ipToNumber(ip) {
      const parts = ip.split(".");
      return parts.reduce((acc, part) => acc * 256 + parseInt(part), 0);
    },
  },
};
</script>

<style lang="scss" scoped>
.flex-title {
  display: flex;
  justify-content: space-between;
}

.flex-options {
  display: flex;
  gap: 10px;
}
</style>
