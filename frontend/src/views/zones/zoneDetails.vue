<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card :loading="loading">
          <v-toolbar color="primary" dark>
            <v-icon left>mdi-dns</v-icon>
            <v-toolbar-title>{{ $route.params.zoneId }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <div v-if="zoneData" class="d-flex align-center">
              <v-tooltip
                v-if="!zoneData.zone.internal && !zoneData.zone.disabled"
                bottom
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    color="warning"
                    @click="triggerModalDisable($route.params.zoneId)"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon>mdi-server-network-off</v-icon>
                  </v-btn>
                </template>
                <span>Disable</span>
              </v-tooltip>
              <v-tooltip
                v-if="!zoneData.zone.internal && zoneData.zone.disabled == true"
                bottom
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    color="success"
                    @click="triggerModalEnable($route.params.zoneId)"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon>mdi-server-network</v-icon>
                  </v-btn>
                </template>
                <span>Enable</span>
              </v-tooltip>
              <v-tooltip v-if="!zoneData.zone.internal" bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    color="error"
                    @click="triggerModalDelete($route.params.zoneId)"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
                <span>Delete</span>
              </v-tooltip>
              <v-tooltip v-if="!zoneData.zone.internal" bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    color="info"
                    v-bind="attrs"
                    v-on="on"
                    @click="
                      $router.push(
                        `/zone-version-control/${$route.params.zoneId}`,
                      )
                    "
                  >
                    <v-icon>mdi-history</v-icon>
                  </v-btn>
                </template>
                <span>Version Control</span>
              </v-tooltip>
            </div>
          </v-toolbar>
          <v-card-text v-if="zoneData" class="pa-6">
            <div class="mb-4">
              <div class="text-subtitle-2 mb-2">Zone Information</div>
              <v-divider class="mb-4"></v-divider>
              <v-row align="center" class="flex-wrap">
                <v-col cols="auto">
                  <div class="text-caption text-uppercase font-weight-bold">
                    Records
                  </div>
                  <div class="text-h6">{{ zoneData.records.length }}</div>
                </v-col>
                <v-col cols="auto">
                  <v-chip
                    class="ma-2 chip"
                    small
                    :color="
                      getTypeColor(zoneData.zone.type, zoneData.zone.internal)
                    "
                    dark
                  >
                    <span v-if="zoneData.zone.internal">Type: Internal</span>
                    <span v-else>Type: {{ zoneData.zone.type }}</span>
                  </v-chip>
                </v-col>
                <v-col cols="auto">
                  <v-chip
                    class="ma-1 chip"
                    small
                    :color="getStatsusColor(zoneData.zone.disabled)"
                    dark
                  >
                    <span v-if="zoneData.zone.disabled">Status: Disabled</span>
                    <span v-else>Status: Enabled</span>
                  </v-chip>
                </v-col>
                <v-col cols="auto">
                  <v-chip
                    class="ma-2 chip"
                    small
                    :color="getDNSSEECcolor(zoneData.zone.dnssecStatus)"
                    dark
                  >
                    <span
                      >DNSSEC:
                      {{ zoneData.zone.dnssecStatus || "Unsigned" }}</span
                    >
                  </v-chip>
                </v-col>
              </v-row>
            </div>
            <v-divider class="my-8"></v-divider>
            <div class="mt-8 mb-4">
              <v-tabs v-model="select" centered slider-color="primary">
                <v-tab>Records</v-tab>
                <v-tab>Permissions</v-tab>
                <v-tab
                  v-if="
                    !zoneData.zone.internal && zoneData.zone.type === 'Primary'
                  "
                  >DNSSEC</v-tab
                >
              </v-tabs>
            </div>

            <div v-if="select == 0">
              <zoneTable
                :records="zoneData.records"
                :internal="zoneData.zone.internal"
                @record-saved="getZoneData()"
              />
            </div>

            <div v-if="select == 1">
              <v-row>
                <v-col>
                  <v-card elevation="5">
                    <v-card-title>
                      User Permissions
                      <v-spacer></v-spacer>
                      <v-btn small icon @click="showAddUserDialog = true">
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                    </v-card-title>
                    <v-card-text>
                      <permissionTable
                        ref="userPermissions"
                        type="user"
                        :zoneName="$route.params.zoneId"
                      />
                      <v-btn
                        color="primary"
                        @click="savePermissions"
                        :loading="savingPermissions"
                        class="mt-2"
                        >Save</v-btn
                      >
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col>
                  <v-card elevation="5"
                    ><v-card-title>
                      Group Permissions
                      <v-spacer></v-spacer>
                      <v-btn small icon @click="showAddGroupDialog = true">
                        <v-icon>mdi-plus</v-icon>
                      </v-btn> </v-card-title
                    ><v-card-text>
                      <permissionTable
                        ref="groupPermissions"
                        type="group"
                        :zoneName="$route.params.zoneId"
                      />
                      <v-btn
                        color="primary"
                        @click="savePermissions"
                        :loading="savingPermissions"
                        class="mt-2"
                        >Save</v-btn
                      >
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <div v-if="select == 2">
              <v-card elevation="5">
                <v-card-title>
                  DNSSEC Zone Signing
                  <v-spacer></v-spacer>
                  <v-btn
                    v-if="
                      zoneData.zone.dnssecStatus === 'Unsigned' ||
                      zoneData.zone.dnssecStatus === ''
                    "
                    color="primary"
                    @click="showSignZoneDialog = true"
                    :loading="dnssecLoading"
                  >
                    <v-icon left>mdi-lock</v-icon>
                    Sign Zone
                  </v-btn>
                  <v-btn
                    v-else
                    color="warning"
                    @click="showUnsignZoneDialog = true"
                    :loading="dnssecLoading"
                  >
                    <v-icon left>mdi-lock-open</v-icon>
                    Unsign Zone
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="12">
                      <p>
                        <strong>DNSSEC Status:</strong>
                        {{ zoneData.zone.dnssecStatus || "Unsigned" }}
                      </p>
                    </v-col>
                  </v-row>
                  <v-row
                    v-if="
                      zoneData.zone.dnssecStatus &&
                      zoneData.zone.dnssecStatus !== 'Unsigned'
                    "
                  >
                    <v-col cols="12">
                      <v-expansion-panels>
                        <v-expansion-panel>
                          <v-expansion-panel-header>
                            <v-icon left>mdi-key</v-icon>
                            DNSSEC Keys
                          </v-expansion-panel-header>
                          <v-expansion-panel-content>
                            <v-row>
                              <v-col cols="12">
                                <p class="text-caption">
                                  <strong>Zone Signing Keys (ZSK):</strong>
                                </p>
                                <div v-if="dnssecKeys.zsk.length > 0">
                                  <v-chip
                                    v-for="key in dnssecKeys.zsk"
                                    :key="key.id"
                                    class="ma-2"
                                    @click:close="deleteKey('zsk', key.id)"
                                    close
                                  >
                                    {{ key.name }}
                                  </v-chip>
                                </div>
                                <p v-else class="text-caption">
                                  No ZSK keys configured
                                </p>
                              </v-col>
                            </v-row>
                            <v-row>
                              <v-col cols="12">
                                <p class="text-caption">
                                  <strong>Key Signing Keys (KSK):</strong>
                                </p>
                                <div v-if="dnssecKeys.ksk.length > 0">
                                  <v-chip
                                    v-for="key in dnssecKeys.ksk"
                                    :key="key.id"
                                    class="ma-2"
                                    @click:close="deleteKey('ksk', key.id)"
                                    close
                                  >
                                    {{ key.name }}
                                  </v-chip>
                                </div>
                                <p v-else class="text-caption">
                                  No KSK keys configured
                                </p>
                              </v-col>
                            </v-row>
                          </v-expansion-panel-content>
                        </v-expansion-panel>
                        <v-expansion-panel>
                          <v-expansion-panel-header>
                            <v-icon left>mdi-link</v-icon>
                            DS Records (for parent zone delegation)
                          </v-expansion-panel-header>
                          <v-expansion-panel-content>
                            <v-textarea
                              v-model="dsRecords"
                              readonly
                              label="DS Records"
                              rows="8"
                              hint="Use these records in your parent zone for proper DNSSEC delegation"
                              persistent-hint
                            ></v-textarea>
                          </v-expansion-panel-content>
                        </v-expansion-panel>
                        <v-expansion-panel>
                          <v-expansion-panel-header>
                            <v-icon left>mdi-tune</v-icon>
                            DNSSEC Options
                          </v-expansion-panel-header>
                          <v-expansion-panel-content>
                            <v-row>
                              <v-col>
                                <v-select
                                  v-model="dnssecOptions.signatureInceptionDays"
                                  :items="[1, 2, 3, 7, 14, 30]"
                                  label="Signature Inception Period (days)"
                                ></v-select>
                              </v-col>
                              <v-col>
                                <v-select
                                  v-model="
                                    dnssecOptions.signatureExpirationDays
                                  "
                                  :items="[7, 14, 30, 60, 90, 180, 365]"
                                  label="Signature Expiration Period (days)"
                                ></v-select>
                              </v-col>
                            </v-row>
                            <v-row>
                              <v-col>
                                <v-checkbox
                                  v-model="dnssecOptions.useNsec3"
                                  label="Use NSEC3 (opt-out)"
                                  hint="Use NSEC3 for better privacy instead of NSEC records"
                                ></v-checkbox>
                              </v-col>
                            </v-row>
                          </v-expansion-panel-content>
                        </v-expansion-panel>
                      </v-expansion-panels>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialogs -->
    <v-dialog v-model="showAddUserDialog" max-width="400">
      <v-card>
        <v-card-title>Add User Permission</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedUser"
            :items="availableUsers"
            label="Select User"
            outlined
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showAddUserDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="addUserPermission">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showAddGroupDialog" max-width="400">
      <v-card>
        <v-card-title>Add Group Permission</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedGroup"
            :items="availableGroups"
            label="Select Group"
            outlined
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showAddGroupDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="addGroupPermission">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Sign Zone Dialog -->
    <v-dialog v-model="showSignZoneDialog" max-width="600">
      <v-card>
        <v-card-title>Sign Zone with DNSSEC</v-card-title>
        <v-card-text>
          <v-form ref="signZoneForm">
            <v-select
              v-model="signZoneConfig.algorithm"
              :items="['ECDSA', 'RSA', 'EDDSA']"
              label="Algorithm"
              hint="DNSSEC signing algorithm (ECDSA recommended)"
              required
            ></v-select>
            <v-text-field
              v-model="signZoneConfig.kskBits"
              type="number"
              label="KSK Bit Length"
              hint="Key Signing Key size (typically 2048 or 4096)"
              value="2048"
            ></v-text-field>
            <v-text-field
              v-model="signZoneConfig.zskBits"
              type="number"
              label="ZSK Bit Length"
              hint="Zone Signing Key size (typically 1024 or 2048)"
              value="1024"
            ></v-text-field>
            <v-select
              v-if="signZoneConfig.algorithm === 'ECDSA'"
              v-model="signZoneConfig.curve"
              :items="['P256', 'P384']"
              label="Curve"
              hint="ECDSA curve type"
            ></v-select>
            <v-select
              v-if="signZoneConfig.algorithm === 'EDDSA'"
              v-model="signZoneConfig.curve"
              :items="['ED25519', 'ED448']"
              label="Curve"
              hint="EdDSA curve type"
            ></v-select>
            <v-select
              v-if="signZoneConfig.algorithm === 'RSA'"
              v-model="signZoneConfig.hashAlgorithm"
              :items="['SHA256', 'SHA512', 'SHA1', 'MD5']"
              label="Hash Algorithm"
              hint="Hash algorithm for RSA signing"
            ></v-select>
            <v-checkbox
              v-model="signZoneConfig.useNsec3"
              label="Use NSEC3"
              hint="Use NSEC3 instead of NSEC for better privacy"
            ></v-checkbox>
            <v-alert type="info" outlined small>
              <strong>Note:</strong> Zone signing may take a few moments. The
              server will generate cryptographic keys.
            </v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" text @click="showSignZoneDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="primary" @click="signZone" :loading="dnssecLoading"
            >Sign Zone</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Unsign Zone Dialog -->
    <v-dialog v-model="showUnsignZoneDialog" max-width="500">
      <v-card>
        <v-card-title>Unsign Zone</v-card-title>
        <v-card-text>
          <p>Are you sure you want to remove DNSSEC signing from this zone?</p>
          <p class="text-caption">
            All DNSSEC records and keys will be removed. Update your parent zone
            to remove DS records.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" text @click="showUnsignZoneDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="warning" @click="unsignZone" :loading="dnssecLoading"
            >Unsign Zone</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import zoneTable from "@/components/zoneTable.vue";
import permissionTable from "@/components/permissionTable.vue";
export default {
  components: {
    zoneTable,
    permissionTable,
  },
  data() {
    return {
      polling: null,
      zoneData: undefined,
      loading: true,
      select: 0,
      dnssecLoading: false,
      savingPermissions: false,
      showAddUserDialog: false,
      showAddGroupDialog: false,
      selectedUser: null,
      selectedGroup: null,
      availableUsers: [],
      availableGroups: [],
      showSignZoneDialog: false,
      showUnsignZoneDialog: false,
      signZoneConfig: {
        algorithm: "ECDSA",
        curve: "P256",
        hashAlgorithm: "SHA256",
        kskBits: 2048,
        zskBits: 1024,
        useNsec3: false,
      },
      dnssecKeys: {
        zsk: [],
        ksk: [],
      },
      dsRecords: "",
      dnssecOptions: {
        signatureInceptionDays: 7,
        signatureExpirationDays: 30,
        useNsec3: false,
      },
    };
  },
  methods: {
    getStatsusColor(status) {
      if (status == true) return "danger";
      return "success";
    },
    getDNSSEECcolor(dnssecStatus) {
      if (dnssecStatus == undefined) return "danger";
      if (dnssecStatus == "Unsigned") return "danger";
      if (dnssecStatus == "") return "danger";
    },
    getTypeColor(type, internal) {
      if (type == undefined) return;
      if (internal == true) return "#777777";
      if (type == "Primary") return "success";
      if (type == "Forwarder") return "#9A87B7";
    },
    getZoneData() {
      let that = this;
      this.loading = true;
      this.$axios
        .post(
          `/api/zones/records/get?token=${localStorage.appToken}&domain=${that.$route.params.zoneId}&listZone=true`,
        )
        .then(function (response) {
          if (response.data.status == "ok") {
            that.zoneData = response.data.response;
          }
        })
        .then(function () {
          that.loading = false;
        });

      // Load available users and groups
      this.loadAvailableUsersAndGroups();
    },
    loadAvailableUsersAndGroups() {
      this.$axios
        .get(
          `/api/zones/permissions/get?token=${localStorage.appToken}&zone=${this.$route.params.zoneId}&includeUsersAndGroups=true`,
        )
        .then((response) => {
          if (response.data.status === "ok") {
            this.availableUsers = response.data.response.users || [];
            this.availableGroups = response.data.response.groups || [];
          }
        })
        .catch((error) => {
          console.error("Failed to load available users and groups:", error);
        });
    },
    addUserPermission() {
      if (this.selectedUser && this.$refs.userPermissions) {
        const permissions = this.$refs.userPermissions.getPermissions();
        // Check if user already exists
        if (permissions.some((p) => p.name === this.selectedUser)) {
          this.$toast.warning("User already has permissions");
          return;
        }
        permissions.push({
          name: this.selectedUser,
          view: true,
          modify: false,
          delete: false,
        });
        this.selectedUser = null;
        this.showAddUserDialog = false;
      }
    },
    addGroupPermission() {
      if (this.selectedGroup && this.$refs.groupPermissions) {
        const permissions = this.$refs.groupPermissions.getPermissions();
        // Check if group already exists
        if (permissions.some((p) => p.name === this.selectedGroup)) {
          this.$toast.warning("Group already has permissions");
          return;
        }
        permissions.push({
          name: this.selectedGroup,
          view: true,
          modify: false,
          delete: false,
        });
        this.selectedGroup = null;
        this.showAddGroupDialog = false;
      }
    },
    triggerModalDisable(zoneName) {
      let that = this;
      this.$swal
        .fire({
          title: "Disable zone?",
          text: zoneName,
          icon: "warning",
          iconHtml: "?",
          confirmButtonColor: "warning",
          confirmButtonText: "Disable",
          cancelButtonText: "Cancel",
          showCancelButton: true,
          showCloseButton: true,
        })
        .then(function (result) {
          if (result.isConfirmed) {
            that.$axios.post(
              `/api/zones/records/disable?token=${localStorage.appToken}&zone=${zoneName}`,
            );
          }
        })
        .then(function () {
          that.getZoneData();
        });
    },
    triggerModalEnable(zoneName) {
      let that = this;
      this.$swal
        .fire({
          title: "Enable zone?",
          text: zoneName,
          icon: "success",
          iconHtml: "?",
          confirmButtonColor: "success",
          confirmButtonText: "Enable",
          cancelButtonText: "Cancel",
          showCancelButton: true,
          showCloseButton: true,
        })
        .then(function (result) {
          if (result.isConfirmed) {
            that.$axios.post(
              `/api/zones/records/enable?token=${localStorage.appToken}&zone=${zoneName}`,
            );
          }
        })
        .then(function () {
          that.getZoneData();
        });
    },
    triggerModalDelete(zoneName) {
      let that = this;
      this.$swal
        .fire({
          title: "Delete zone?",
          text: zoneName,
          icon: "error",
          confirmButtonColor: "danger",
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
          showCancelButton: true,
          showCloseButton: true,
        })
        .then(function (result) {
          if (result.isConfirmed) {
            that.$axios.post(
              `/api/zones/records/delete?token=${localStorage.appToken}&zone=${zoneName}`,
            );
          }
        })
        .then(function () {
          that.$router.push("/zones");
        });
    },
    signZone() {
      this.dnssecLoading = true;
      const params = new URLSearchParams();
      params.append("token", localStorage.appToken);
      params.append("zone", this.$route.params.zoneId);
      params.append("algorithm", this.signZoneConfig.algorithm);

      // Add algorithm-specific parameters
      if (this.signZoneConfig.algorithm === "RSA") {
        params.append("hashAlgorithm", this.signZoneConfig.hashAlgorithm);
        params.append("kskKeySize", this.signZoneConfig.kskBits);
        params.append("zskKeySize", this.signZoneConfig.zskBits);
      } else if (
        this.signZoneConfig.algorithm === "ECDSA" ||
        this.signZoneConfig.algorithm === "EDDSA"
      ) {
        params.append("curve", this.signZoneConfig.curve);
      }

      // Add common parameters
      params.append("nxProof", this.signZoneConfig.useNsec3 ? "NSEC3" : "NSEC");
      if (this.signZoneConfig.useNsec3) {
        params.append("iterations", "0");
        params.append("saltLength", "0");
      }

      this.$axios
        .post(`/api/zones/dnssec/sign?${params.toString()}`)
        .then((response) => {
          if (response.data.status === "ok") {
            this.$toast.success(
              "Zone signing initiated. This may take a moment...",
            );
            this.showSignZoneDialog = false;
            setTimeout(() => {
              this.getZoneData();
              this.getDnssecStatus();
            }, 2000);
          } else {
            this.$toast.error(
              response.data.errorMessage || "Failed to sign zone",
            );
          }
        })
        .catch((error) => {
          console.error("Sign zone error:", error);
          this.$toast.error(
            error.response?.data?.errorMessage || "Failed to sign zone",
          );
        })
        .finally(() => {
          this.dnssecLoading = false;
        });
    },
    unsignZone() {
      this.dnssecLoading = true;
      const params = new URLSearchParams();
      params.append("token", localStorage.appToken);
      params.append("zone", this.$route.params.zoneId);

      this.$axios
        .post(`/api/zones/dnssec/unsign?${params.toString()}`)
        .then((response) => {
          if (response.data.status === "ok") {
            this.$toast.success("Zone unsigned successfully");
            this.showUnsignZoneDialog = false;
            this.getZoneData();
            this.getDnssecStatus();
          } else {
            this.$toast.error(
              response.data.errorMessage || "Failed to unsign zone",
            );
          }
        })
        .catch(() => {
          this.$toast.error("Failed to unsign zone");
        })
        .finally(() => {
          this.dnssecLoading = false;
        });
    },
    getDnssecStatus() {
      // Only load DNSSEC status for primary zones
      if (!this.zoneData || this.zoneData.zone.type !== "Primary") {
        return;
      }

      const params = new URLSearchParams();
      params.append("token", localStorage.appToken);
      params.append("zone", this.$route.params.zoneId);

      this.$axios
        .post(`/api/zones/dnssec/properties/get?${params.toString()}`)
        .then((response) => {
          if (response.data.status === "ok") {
            const dnssecData = response.data.response;
            if (dnssecData.dnssecPrivateKeys) {
              this.dnssecKeys.zsk =
                dnssecData.dnssecPrivateKeys.filter(
                  (k) => k.keyType === "ZoneSigningKey",
                ) || [];
              this.dnssecKeys.ksk =
                dnssecData.dnssecPrivateKeys.filter(
                  (k) => k.keyType === "KeySigningKey",
                ) || [];
            }
          }
        })
        .catch(() => {
          // DNSSEC not signed or API not available
        });
    },
    deleteKey(keyType, keyId) {
      this.$swal
        .fire({
          title: "Delete DNSSEC Key?",
          text: `This will remove the ${keyType.toUpperCase()} key from the zone.`,
          icon: "warning",
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
          showCancelButton: true,
        })
        .then((result) => {
          if (result.isConfirmed) {
            const params = new URLSearchParams();
            params.append("token", localStorage.appToken);
            params.append("zone", this.$route.params.zoneId);
            params.append("keyId", keyId);
            params.append("keyType", keyType.toUpperCase());

            this.$axios
              .post(`/api/zones/dnssec/deleteKey?${params.toString()}`)
              .then((response) => {
                if (response.data.status === "ok") {
                  this.$toast.success("Key deleted successfully");
                  this.getDnssecStatus();
                }
              });
          }
        });
    },
    savePermissions() {
      this.savingPermissions = true;

      const userPermissions = this.$refs.userPermissions.getPermissions();
      const groupPermissions = this.$refs.groupPermissions.getPermissions();

      // Format permissions as pipe-separated string: username|view|modify|delete
      const userPermsString = userPermissions
        .map((p) => `${p.name}|${p.view}|${p.modify}|${p.delete}`)
        .join("|");

      const groupPermsString = groupPermissions
        .map((p) => `${p.name}|${p.view}|${p.modify}|${p.delete}`)
        .join("|");

      const params = new URLSearchParams();
      params.append("token", localStorage.appToken);
      params.append("zone", this.$route.params.zoneId);
      if (userPermsString) params.append("userPermissions", userPermsString);
      if (groupPermsString) params.append("groupPermissions", groupPermsString);

      this.$axios
        .post(`/api/zones/permissions/set?${params.toString()}`)
        .then((response) => {
          if (response.data.status === "ok") {
            this.$toast.success("Permissions saved successfully");
            // Reload permissions to reflect any server-side changes
            this.$refs.userPermissions.loadPermissions();
            this.$refs.groupPermissions.loadPermissions();
          } else {
            this.$toast.error("Failed to save permissions");
          }
        })
        .catch((error) => {
          console.error("Error saving permissions:", error);
          this.$toast.error("Failed to save permissions");
        })
        .finally(() => {
          this.savingPermissions = false;
        });
    },
  },
  created() {
    this.getZoneData();
    this.getDnssecStatus();
    this.polling = setInterval(this.getZoneData, 15000);
  },
  beforeDestroy() {
    clearInterval(this.polling);
  },
};
</script>

<style lang="scss" scoped>
.actions {
  display: flex;
  align-items: center;
  justify-content: center;
  * {
    cursor: pointer;
  }
}

.chip {
  justify-content: center;
  align-items: center;
}
</style>
