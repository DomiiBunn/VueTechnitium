<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-toolbar color="primary" dark>
            <v-icon left>mdi-dns</v-icon>
            <v-toolbar-title>DNS Zones</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
              v-can="{ section: 'Zones', action: 'modify' }"
              @click="$router.push('/add-zone')"
              color="white"
              text
            >
              <v-icon left>mdi-plus</v-icon>
              Add Zone
            </v-btn>
          </v-toolbar>
          <v-card-text class="pa-6">
            <v-data-table
              :headers="headers"
              :items="zones"
              :items-per-page="-1"
              hide-default-footer
              :loading="loading"
            >
              <template v-slot:[`item.type`]="{ item }">
                <v-chip
                  class="ma-2 chip"
                  style="width: 75px"
                  small
                  :color="getTypeColor(item.type, item.internal)"
                  dark
                >
                  <span v-if="item.internal">Internal</span>
                  <span v-else>{{ item.type }}</span>
                </v-chip>
              </template>
              <template v-slot:[`item.dnssecStatus`]="{ item }">
                <v-chip
                  class="ma-2 chip"
                  small
                  :color="getDNSSEECcolor(item.dnssecStatus)"
                  dark
                >
                  <span>{{ item.dnssecStatus || "Unsigned" }}</span>
                </v-chip>
              </template>
              <template v-slot:[`item.disabled`]="{ item }">
                <v-chip
                  class="ma-2 chip"
                  style="width: 100px"
                  small
                  :color="getStatsusColor(item.disabled, item.notifyFailed)"
                  dark
                >
                  <span v-if="item.disabled">Disabled</span>
                  <span v-else-if="item.notifyFailed">Notify Failed</span>
                  <span v-else>Enabled</span>
                </v-chip>
              </template>
              <template v-slot:[`item.expires`]="{ item }">
                <v-chip
                  v-if="item.expires"
                  class="ma-2 chip"
                  small
                  color="#9A87B7"
                  dark
                >
                  <span>{{ getExpiryTime(item.expires) }}</span>
                </v-chip>
                <v-chip v-else class="ma-2 chip" small color="success" dark>
                  <span>Never</span>
                </v-chip>
              </template>
              <template v-slot:[`item.actions`]="{ item }">
                <span class="actions">
                  <v-tooltip v-if="!item.internal" bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        @click="$router.push(`/zone/${item.name}`)"
                        color="#6699FF"
                        dark
                        v-bind="attrs"
                        v-on="on"
                      >
                        mdi-cog
                      </v-icon>
                    </template>
                    <span>Edit</span>
                  </v-tooltip>
                  <v-tooltip v-else bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        @click="$router.push(`/zone/${item.name}`)"
                        color="#6699FF"
                        dark
                        v-bind="attrs"
                        v-on="on"
                      >
                        mdi-eye
                      </v-icon>
                    </template>
                    <span>View</span>
                  </v-tooltip>
                  <v-tooltip v-if="!item.internal && !item.disabled" bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        v-can="{ section: 'Zones', action: 'modify' }"
                        @click="triggerModalDisable(item.name)"
                        color="warning"
                        dark
                        v-bind="attrs"
                        v-on="on"
                      >
                        mdi-server-network-off
                      </v-icon>
                    </template>
                    <span>Disable</span>
                  </v-tooltip>
                  <v-tooltip
                    v-if="!item.internal && item.disabled == true"
                    bottom
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        v-can="{ section: 'Zones', action: 'modify' }"
                        @click="triggerModalEnable(item.name)"
                        color="success"
                        dark
                        v-bind="attrs"
                        v-on="on"
                      >
                        mdi-server-network
                      </v-icon>
                    </template>
                    <span>Enable</span>
                  </v-tooltip>
                  <v-tooltip v-if="!item.internal" bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        v-can="{ section: 'Zones', action: 'delete' }"
                        @click="triggerModalDelete(item.name)"
                        color="danger"
                        dark
                        v-bind="attrs"
                        v-on="on"
                      >
                        mdi-delete
                      </v-icon>
                    </template>
                    <span>Delete</span>
                  </v-tooltip>

                  <v-menu offset-y>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn color="#70A2CC" dark v-bind="attrs" v-on="on" icon>
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item
                        v-can="{ section: 'Zones', action: 'modify' }"
                        @click="importZone(item.name)"
                      >
                        <v-list-item-title>Import Zone</v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        v-can="{ section: 'Zones', action: 'modify' }"
                        @click="exportZone(item.name)"
                      >
                        <v-list-item-title>Export Zone</v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        v-can="{ section: 'Zones', action: 'modify' }"
                        @click="cloneZone(item.name)"
                      >
                        <v-list-item-title>Clone Zone</v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        v-can="{ section: 'Zones', action: 'modify' }"
                        @click="convertZone(item.name, item.type)"
                      >
                        <v-list-item-title>Convert Zone</v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        v-can="{ section: 'Zones', action: 'modify' }"
                        @click="resyncZone(item.name)"
                      >
                        <v-list-item-title>Resync Zone</v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        v-can="{ section: 'Zones', action: 'modify' }"
                        @click="showZoneOptions(item.name)"
                      >
                        <v-list-item-title>Zone Options</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="showZonePermissions(item.name)">
                        <v-list-item-title>Permissions</v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        v-can="{ section: 'Zones', action: 'modify' }"
                        @click="signZone(item.name)"
                      >
                        <v-list-item-title>Sign Zone</v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        v-can="{ section: 'Zones', action: 'modify' }"
                        @click="unsignZone(item.name)"
                      >
                        <v-list-item-title>Unsign Zone</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="viewDsInfo(item.name)">
                        <v-list-item-title>View DS Info</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="showDnssecProperties(item.name)">
                        <v-list-item-title>DNSSEC Properties</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </span>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showZonePermissionsModal" max-width="900px">
      <v-card>
        <v-card-title>Zone Permissions - {{ selectedZoneName }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <v-card>
                <v-card-title>User Permissions</v-card-title>
                <v-card-text>
                  <v-data-table
                    dense
                    :headers="userPermissionsHeaders"
                    :items="zonePermissions.userPermissions"
                    :items-per-page="-1"
                    hide-default-footer
                  >
                    <template v-slot:[`item.canView`]="{ item }">
                      <v-checkbox
                        v-model="item.canView"
                        dense
                        hide-details
                      ></v-checkbox>
                    </template>
                    <template v-slot:[`item.canModify`]="{ item }">
                      <v-checkbox
                        v-model="item.canModify"
                        dense
                        hide-details
                      ></v-checkbox>
                    </template>
                    <template v-slot:[`item.canDelete`]="{ item }">
                      <v-checkbox
                        v-model="item.canDelete"
                        dense
                        hide-details
                      ></v-checkbox>
                    </template>
                    <template v-slot:[`item.actions`]="{ item }">
                      <v-icon small @click="removeUserPermission(item)"
                        >mdi-delete</v-icon
                      >
                    </template>
                  </v-data-table>
                  <v-select
                    :items="availableUsers"
                    label="Add User"
                    @change="addUserPermission"
                    class="mt-3"
                  ></v-select>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6">
              <v-card>
                <v-card-title>Group Permissions</v-card-title>
                <v-card-text>
                  <v-data-table
                    dense
                    :headers="groupPermissionsHeaders"
                    :items="zonePermissions.groupPermissions"
                    :items-per-page="-1"
                    hide-default-footer
                  >
                    <template v-slot:[`item.canView`]="{ item }">
                      <v-checkbox
                        v-model="item.canView"
                        dense
                        hide-details
                      ></v-checkbox>
                    </template>
                    <template v-slot:[`item.canModify`]="{ item }">
                      <v-checkbox
                        v-model="item.canModify"
                        dense
                        hide-details
                      ></v-checkbox>
                    </template>
                    <template v-slot:[`item.canDelete`]="{ item }">
                      <v-checkbox
                        v-model="item.canDelete"
                        dense
                        hide-details
                      ></v-checkbox>
                    </template>
                    <template v-slot:[`item.actions`]="{ item }">
                      <v-icon small @click="removeGroupPermission(item)"
                        >mdi-delete</v-icon
                      >
                    </template>
                  </v-data-table>
                  <v-select
                    :items="availableGroups"
                    label="Add Group"
                    @change="addGroupPermission"
                    class="mt-3"
                  ></v-select>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showZonePermissionsModal = false">Cancel</v-btn>
          <v-btn
            v-can="{ section: 'Administration', action: 'modify' }"
            color="primary"
            @click="saveZonePermissions"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showImportZoneDialog" max-width="600px">
      <v-card>
        <v-card-title>Import Zone - {{ selectedZoneName }}</v-card-title>
        <v-card-text>
          <v-file-input
            v-model="importZoneFile"
            label="Select Zone File"
            accept=".zone,.txt"
            prepend-icon="mdi-file-upload"
            :rules="[(v) => !!v || 'Zone file is required']"
          ></v-file-input>
          <v-checkbox
            v-model="importOverwrite"
            label="Overwrite existing records"
          ></v-checkbox>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showImportZoneDialog = false">Cancel</v-btn>
          <v-btn
            v-can="{ section: 'Zones', action: 'modify' }"
            color="primary"
            @click="performImportZone"
            >Import</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showCloneZoneDialog" max-width="600px">
      <v-card>
        <v-card-title>Clone Zone - {{ selectedZoneName }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="cloneZoneName"
            label="New Zone Name"
            :rules="[(v) => !!v || 'Zone name is required']"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showCloneZoneDialog = false">Cancel</v-btn>
          <v-btn
            v-can="{ section: 'Zones', action: 'modify' }"
            color="primary"
            @click="performCloneZone"
            >Clone</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showConvertZoneDialog" max-width="600px">
      <v-card>
        <v-card-title>Convert Zone - {{ selectedZoneName }}</v-card-title>
        <v-card-text>
          <v-alert type="info" dense>
            Current type: <strong>{{ selectedZoneType }}</strong>
          </v-alert>
          <v-select
            v-model="convertToType"
            :items="convertibleTypes"
            label="Convert To"
            :rules="[(v) => !!v || 'Target type is required']"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showConvertZoneDialog = false">Cancel</v-btn>
          <v-btn
            v-can="{ section: 'Zones', action: 'modify' }"
            color="primary"
            @click="performConvertZone"
            >Convert</v-btn
          >
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
      polling: null,
      headers: [
        { text: "Zone", value: "name" },
        { text: "Type", value: "type" },
        { text: "DNSSEEC", value: "dnssecStatus" },
        { text: "Status", value: "disabled" },
        { text: "Expires", value: "expires" },
        { text: "", value: "actions" },
      ],
      zones: [],
      loading: true,
      showZonePermissionsModal: false,
      selectedZoneName: "",
      zonePermissions: {
        userPermissions: [],
        groupPermissions: [],
      },
      availableUsers: [],
      availableGroups: [],
      userPermissionsHeaders: [
        { text: "Username", value: "username" },
        { text: "View", value: "canView" },
        { text: "Modify", value: "canModify" },
        { text: "Delete", value: "canDelete" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      groupPermissionsHeaders: [
        { text: "Group", value: "name" },
        { text: "View", value: "canView" },
        { text: "Modify", value: "canModify" },
        { text: "Delete", value: "canDelete" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      showImportZoneDialog: false,
      importZoneFile: null,
      importOverwrite: false,
      showCloneZoneDialog: false,
      cloneZoneName: "",
      showConvertZoneDialog: false,
      convertToType: "",
      selectedZoneType: "",
      convertibleTypes: ["Primary", "Secondary", "Stub", "Forwarder"],
    };
  },
  computed: {
    squareData() {
      let zones = this.zones;
      return {
        value: zones.length,
        detailed: false,
        title: "Total zones",
        tall: false,
        icon: "mdi-dns",
        color: "#5CBECD",
      };
    },
  },
  created() {
    this.getZones();
    this.polling = setInterval(this.getZones, 15000);
  },
  beforeDestroy() {
    clearInterval(this.polling);
  },
  methods: {
    getExpiryTime(timeStamp) {
      return moment(timeStamp).fromNow();
    },
    getZones() {
      this.loading = true;
      let that = this;
      this.$axios
        .post(`/api/zones/list?token=${localStorage.appToken}`)
        .then(function (response) {
          if (response.data.status == "ok") {
            that.zones = response.data.response.zones;
            that.loading = false;
          }
        });
    },
    getTypeColor(type, internal) {
      if (type == undefined) return;
      if (internal == true) return "#777777";
      if (type == "Primary") return "success";
      if (type == "Forwarder") return "#9A87B7";
    },
    getDNSSEECcolor(dnssecStatus) {
      if (dnssecStatus == undefined) return "danger";
      if (dnssecStatus == "Unsigned") return "danger";
      if (dnssecStatus == "") return "danger";
    },
    getStatsusColor(status, notifyFailed) {
      if (notifyFailed == true) return "warning";
      if (status == true) return "danger";
      return "success";
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
              `/api/zones/disable?token=${localStorage.appToken}&zone=${zoneName}`,
            );
          }
        })
        .then(function () {
          that.getZones();
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
              `/api/zones/enable?token=${localStorage.appToken}&zone=${zoneName}`,
            );
          }
        })
        .then(function () {
          that.getZones();
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
              `/api/zones/delete?token=${localStorage.appToken}&zone=${zoneName}`,
            );
          }
        })
        .then(function () {
          that.getZones();
        });
    },
    importZone(zoneName) {
      this.selectedZoneName = zoneName;
      this.importZoneFile = null;
      this.importOverwrite = false;
      this.showImportZoneDialog = true;
    },
    performImportZone() {
      if (!this.importZoneFile) {
        this.$toast.error("Please select a zone file");
        return;
      }

      const formData = new FormData();
      formData.append("zone", this.selectedZoneName);
      formData.append("overwrite", this.importOverwrite);
      formData.append("file", this.importZoneFile);

      this.$axios
        .post(`/api/zones/import?token=${localStorage.appToken}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          if (response.data.status === "ok") {
            this.$toast.success("Zone imported successfully");
            this.showImportZoneDialog = false;
            this.refreshZoneList();
          } else {
            this.$toast.error(
              response.data.errorMessage || "Failed to import zone",
            );
          }
        })
        .catch((error) => {
          console.error("Error importing zone:", error);
          this.$toast.error("Failed to import zone");
        });
    },
    exportZone(zoneName) {
      window.open(
        `api/zones/export?token=${localStorage.appToken}&zone=${zoneName}`,
        "_blank",
      );
    },
    cloneZone(zoneName) {
      this.selectedZoneName = zoneName;
      this.cloneZoneName = "";
      this.showCloneZoneDialog = true;
    },
    performCloneZone() {
      if (!this.cloneZoneName) {
        this.$toast.error("Please enter a zone name");
        return;
      }

      this.$axios
        .post(
          `/api/zones/clone?token=${localStorage.appToken}&zone=${this.selectedZoneName}&sourceZone=${this.selectedZoneName}&zone=${this.cloneZoneName}`,
        )
        .then((response) => {
          if (response.data.status === "ok") {
            this.$toast.success("Zone cloned successfully");
            this.showCloneZoneDialog = false;
            this.refreshZoneList();
          } else {
            this.$toast.error(
              response.data.errorMessage || "Failed to clone zone",
            );
          }
        })
        .catch((error) => {
          console.error("Error cloning zone:", error);
          this.$toast.error("Failed to clone zone");
        });
    },
    convertZone(zoneName, zoneType) {
      this.selectedZoneName = zoneName;
      this.selectedZoneType = zoneType;
      this.convertToType = "";
      this.showConvertZoneDialog = true;
    },
    performConvertZone() {
      if (!this.convertToType) {
        this.$toast.error("Please select a target type");
        return;
      }

      this.$axios
        .post(
          `/api/zones/convert?token=${localStorage.appToken}&zone=${this.selectedZoneName}&type=${this.convertToType}`,
        )
        .then((response) => {
          if (response.data.status === "ok") {
            this.$toast.success("Zone converted successfully");
            this.showConvertZoneDialog = false;
            this.refreshZoneList();
          } else {
            this.$toast.error(
              response.data.errorMessage || "Failed to convert zone",
            );
          }
        })
        .catch((error) => {
          console.error("Error converting zone:", error);
          this.$toast.error("Failed to convert zone");
        });
    },
    resyncZone(zoneName) {
      this.$axios
        .post(
          `/api/zones/resync?token=${localStorage.appToken}&zone=${zoneName}`,
        )
        .then((response) => {
          if (response.data.status === "ok") {
            this.$toast.success("Zone resync initiated successfully");
            this.refreshZoneList();
          } else {
            this.$toast.error(
              response.data.errorMessage || "Failed to resync zone",
            );
          }
        })
        .catch((error) => {
          console.error("Error resyncing zone:", error);
          this.$toast.error("Failed to resync zone");
        });
    },
    showZoneOptions(zoneName) {
      console.log("Show Zone Options: ", zoneName);
      // Implement show zone options logic here
    },
    showZonePermissions(zoneName) {
      this.selectedZoneName = zoneName;
      this.fetchZonePermissions(zoneName);
      this.showZonePermissionsModal = true;
    },
    fetchZonePermissions(zoneName) {
      this.$axios
        .post(
          `/api/zones/permissions/get?token=${localStorage.appToken}&zone=${zoneName}&includeUsersAndGroups=true`,
        )
        .then((response) => {
          if (response.data.status === "ok") {
            this.zonePermissions = {
              userPermissions: response.data.response.userPermissions || [],
              groupPermissions: response.data.response.groupPermissions || [],
            };
            this.availableUsers = response.data.response.users || [];
            this.availableGroups = response.data.response.groups || [];
          }
        })
        .catch((error) => {
          console.error("Error fetching zone permissions:", error);
          this.$toast.error("Failed to load zone permissions");
        });
    },
    addUserPermission(username) {
      if (!username) return;
      this.zonePermissions.userPermissions.push({
        username: username,
        canView: false,
        canModify: false,
        canDelete: false,
      });
    },
    removeUserPermission(user) {
      this.zonePermissions.userPermissions =
        this.zonePermissions.userPermissions.filter(
          (u) => u.username !== user.username,
        );
    },
    addGroupPermission(groupName) {
      if (!groupName) return;
      this.zonePermissions.groupPermissions.push({
        name: groupName,
        canView: false,
        canModify: false,
        canDelete: false,
      });
    },
    removeGroupPermission(group) {
      this.zonePermissions.groupPermissions =
        this.zonePermissions.groupPermissions.filter(
          (g) => g.name !== group.name,
        );
    },
    saveZonePermissions() {
      const userPermissions = this.zonePermissions.userPermissions
        .map((p) => `${p.username},${p.canView},${p.canModify},${p.canDelete}`)
        .join("|");
      const groupPermissions = this.zonePermissions.groupPermissions
        .map((p) => `${p.name},${p.canView},${p.canModify},${p.canDelete}`)
        .join("|");

      this.$axios
        .post(
          `/api/zones/permissions/set?token=${localStorage.appToken}&zone=${
            this.selectedZoneName
          }&userPermissions=${encodeURIComponent(
            userPermissions,
          )}&groupPermissions=${encodeURIComponent(groupPermissions)}`,
        )
        .then((response) => {
          if (response.data.status === "ok") {
            this.$toast.success("Zone permissions saved successfully");
            this.showZonePermissionsModal = false;
          } else {
            this.$toast.error(
              response.data.errorMessage || "Failed to save permissions",
            );
          }
        })
        .catch((error) => {
          console.error("Error saving zone permissions:", error);
          this.$toast.error("Failed to save zone permissions");
        });
    },
    signZone(zoneName) {
      console.log("Sign Zone: ", zoneName);
      // Implement sign zone logic here
    },
    unsignZone(zoneName) {
      console.log("Unsign Zone: ", zoneName);
      // Implement unsign zone logic here
    },
    viewDsInfo(zoneName) {
      console.log("View DS Info: ", zoneName);
      // Implement view DS info logic here
    },
    showDnssecProperties(zoneName) {
      console.log("Show DNSSEC Properties: ", zoneName);
      // Implement show DNSSEC properties logic here
    },
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
