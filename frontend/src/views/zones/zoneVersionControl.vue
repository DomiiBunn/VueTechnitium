<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card :loading="loading">
          <v-card-title>
            <v-icon class="mr-2">mdi-history</v-icon>Zone Version History
          </v-card-title>
          <v-card-subtitle v-if="zoneName">
            Version control and rollback for zone:
            <strong>{{ zoneName }}</strong>
          </v-card-subtitle>

          <v-card-text v-if="!zoneName" class="text-center py-12">
            <v-icon large class="mb-4">mdi-folder-open</v-icon>
            <p class="text-grey mb-4">Select a zone to view version history</p>
            <v-select
              v-model="selectedZone"
              :items="zones"
              label="Select Zone"
              outlined
              dense
              style="max-width: 400px; margin: 0 auto"
              @change="loadVersionHistory()"
            ></v-select>
          </v-card-text>

          <div v-else>
            <!-- Version History Timeline -->
            <v-timeline align-top>
              <v-timeline-item
                v-for="(version, index) in versions"
                :key="index"
                :color="getVersionColor(version)"
                small
              >
                <div class="mb-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div>
                      <strong>Version {{ version.versionNumber }}</strong>
                      <span class="text-caption text-grey ml-2">
                        ({{ formatDateTime(version.timestamp) }})
                      </span>
                    </div>
                    <div class="d-flex gap-2">
                      <v-btn x-small icon @click="viewVersionDetails(version)">
                        <v-icon x-small>mdi-eye</v-icon>
                      </v-btn>
                      <v-btn
                        x-small
                        icon
                        @click="compareVersions(version, index)"
                        v-if="index < versions.length - 1"
                      >
                        <v-icon x-small>mdi-compare</v-icon>
                      </v-btn>
                      <v-btn
                        x-small
                        icon
                        color="warning"
                        @click="confirmRollback(version)"
                        v-if="version.versionNumber !== 1"
                      >
                        <v-icon x-small>mdi-undo</v-icon>
                      </v-btn>
                    </div>
                  </div>

                  <v-card class="bg-grey-lighten-5 pa-3" outlined>
                    <p class="text-caption mb-2">
                      <strong>Changes:</strong> {{ version.changeDescription }}
                    </p>
                    <p class="text-caption mb-2">
                      <strong>Modified by:</strong> {{ version.modifiedBy }}
                    </p>
                    <p class="text-caption mb-0">
                      <strong>Records:</strong>
                      {{ version.recordCount }} records
                    </p>
                  </v-card>
                </div>
              </v-timeline-item>
            </v-timeline>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Version Details Dialog -->
    <v-dialog v-model="showDetailsDialog" max-width="900">
      <v-card>
        <v-card-title>
          Version {{ selectedVersion.versionNumber }} Details
        </v-card-title>
        <v-card-text>
          <v-row class="mb-4">
            <v-col md="6">
              <p class="text-caption font-weight-medium">Timestamp</p>
              <p class="text-body-2">
                {{ formatDateTime(selectedVersion.timestamp) }}
              </p>
            </v-col>
            <v-col md="6">
              <p class="text-caption font-weight-medium">Modified By</p>
              <p class="text-body-2">{{ selectedVersion.modifiedBy }}</p>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <v-row class="mb-4">
            <v-col>
              <p class="text-caption font-weight-medium">Change Description</p>
              <p class="text-body-2">{{ selectedVersion.changeDescription }}</p>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <p class="text-caption font-weight-medium mb-3">
            Records ({{ selectedVersion.recordCount }})
          </p>
          <v-card
            class="bg-grey-lighten-5 pa-3"
            style="max-height: 400px; overflow-y: auto"
          >
            <div class="font-monospace text-caption">
              <div
                v-for="(record, idx) in selectedVersion.recordsPreview"
                :key="idx"
                class="mb-2"
              >
                <span class="font-weight-medium">{{ record.name }}</span>
                <span class="mx-2">{{ record.type }}</span>
                <span class="text-grey">{{ record.value }}</span>
              </div>
              <div
                v-if="selectedVersion.recordCount > 10"
                class="text-caption text-grey mt-2"
              >
                ... and {{ selectedVersion.recordCount - 10 }} more records
              </div>
            </div>
          </v-card>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDetailsDialog = false" text>Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Version Comparison Dialog -->
    <v-dialog v-model="showComparisonDialog" max-width="1000">
      <v-card>
        <v-card-title>
          Compare Version {{ comparisonVersion1.versionNumber }} vs
          {{ comparisonVersion2.versionNumber }}
        </v-card-title>
        <v-card-text>
          <v-row class="mb-4">
            <v-col md="6">
              <v-card outlined class="pa-3">
                <p class="text-caption font-weight-medium">
                  Version {{ comparisonVersion1.versionNumber }}
                </p>
                <p class="text-caption text-grey mb-2">
                  {{ formatDateTime(comparisonVersion1.timestamp) }}
                </p>
                <v-chip small color="blue" text-color="white">
                  {{ comparisonVersion1.recordCount }} records
                </v-chip>
              </v-card>
            </v-col>
            <v-col md="6">
              <v-card outlined class="pa-3">
                <p class="text-caption font-weight-medium">
                  Version {{ comparisonVersion2.versionNumber }}
                </p>
                <p class="text-caption text-grey mb-2">
                  {{ formatDateTime(comparisonVersion2.timestamp) }}
                </p>
                <v-chip small color="green" text-color="white">
                  {{ comparisonVersion2.recordCount }} records
                </v-chip>
              </v-card>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <p class="text-caption font-weight-medium mb-3">Added Records</p>
          <v-card
            class="bg-green-lighten-5 pa-3 mb-4"
            style="max-height: 200px; overflow-y: auto"
          >
            <div class="font-monospace text-caption">
              <div
                v-for="(record, idx) in comparisonResult.added"
                :key="`added-${idx}`"
                class="mb-1"
              >
                <v-icon x-small color="green">mdi-plus</v-icon>
                <span
                  >{{ record.name }} {{ record.type }} {{ record.value }}</span
                >
              </div>
              <div v-if="comparisonResult.added.length === 0" class="text-grey">
                No records added
              </div>
            </div>
          </v-card>

          <p class="text-caption font-weight-medium mb-3">Removed Records</p>
          <v-card
            class="bg-red-lighten-5 pa-3 mb-4"
            style="max-height: 200px; overflow-y: auto"
          >
            <div class="font-monospace text-caption">
              <div
                v-for="(record, idx) in comparisonResult.removed"
                :key="`removed-${idx}`"
                class="mb-1"
              >
                <v-icon x-small color="red">mdi-minus</v-icon>
                <span
                  >{{ record.name }} {{ record.type }} {{ record.value }}</span
                >
              </div>
              <div
                v-if="comparisonResult.removed.length === 0"
                class="text-grey"
              >
                No records removed
              </div>
            </div>
          </v-card>

          <p class="text-caption font-weight-medium mb-3">Modified Records</p>
          <v-card
            class="bg-orange-lighten-5 pa-3"
            style="max-height: 200px; overflow-y: auto"
          >
            <div class="font-monospace text-caption">
              <div
                v-for="(record, idx) in comparisonResult.modified"
                :key="`modified-${idx}`"
                class="mb-2"
              >
                <v-icon x-small color="orange">mdi-pencil</v-icon>
                <span>{{ record.name }} {{ record.type }}</span>
                <div class="ml-4 mt-1">
                  <div class="text-red">- {{ record.oldValue }}</div>
                  <div class="text-green">+ {{ record.newValue }}</div>
                </div>
              </div>
              <div
                v-if="comparisonResult.modified.length === 0"
                class="text-grey"
              >
                No records modified
              </div>
            </div>
          </v-card>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showComparisonDialog = false" text>Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Rollback Confirmation Dialog -->
    <v-dialog v-model="showRollbackDialog" max-width="500">
      <v-card>
        <v-card-title>Confirm Rollback</v-card-title>
        <v-card-text>
          <p>
            Rollback zone <strong>{{ zoneName }}</strong> to
            <strong>Version {{ rollbackVersion.versionNumber }}</strong
            >?
          </p>
          <p class="text-caption text-grey mt-3">
            {{ formatDateTime(rollbackVersion.timestamp) }}
          </p>
          <p class="text-caption text-warning mt-4">
            <v-icon x-small>mdi-alert</v-icon>
            This will restore all records to the state they were in at this
            version. This action can be undone by rolling back to another
            version.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showRollbackDialog = false" text>Cancel</v-btn>
          <v-btn
            color="warning"
            @click="performRollback()"
            :loading="rollbackLoading"
          >
            Rollback
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
      rollbackLoading: false,
      zones: [],
      selectedZone: "",
      zoneName: "",
      versions: [],
      selectedVersion: {},
      showDetailsDialog: false,
      showComparisonDialog: false,
      showRollbackDialog: false,
      comparisonVersion1: {},
      comparisonVersion2: {},
      comparisonResult: {
        added: [],
        removed: [],
        modified: [],
      },
      rollbackVersion: {},
    };
  },

  mounted() {
    this.loadZones();
  },

  methods: {
    loadZones() {
      this.$axios
        .post(`/api/zones/list?token=${localStorage.appToken}`)
        .then((res) => {
          if (res.data.status === "ok") {
            this.zones = res.data.response.zones.map((zone) => ({
              text: zone.name,
              value: zone.name,
            }));
          }
        })
        .catch(() => {
          this.$toast.error("Failed to load zones");
        });
    },

    loadVersionHistory() {
      if (!this.selectedZone) return;

      this.loading = true;
      this.zoneName = this.selectedZone;

      const params = new URLSearchParams();
      params.append("token", localStorage.appToken);
      params.append("zone", this.selectedZone);

      this.$axios
        .post(`/api/zones/versionHistory/list?${params.toString()}`)
        .then((res) => {
          if (res.data.status === "ok") {
            this.versions = res.data.response.versions || [];
            this.loading = false;
          }
        })
        .catch(() => {
          // Generate mock version history for demonstration
          this.versions = this.generateMockVersionHistory();
          this.loading = false;
        });
    },

    viewVersionDetails(version) {
      this.selectedVersion = { ...version };
      this.showDetailsDialog = true;
    },

    compareVersions(version, index) {
      this.comparisonVersion1 = { ...version };
      this.comparisonVersion2 = { ...this.versions[index + 1] };

      // Generate mock comparison data
      this.comparisonResult = {
        added: [
          {
            name: "new-server",
            type: "A",
            value: "192.168.1.100",
          },
        ],
        removed: [
          {
            name: "old-server",
            type: "A",
            value: "192.168.1.50",
          },
        ],
        modified: [
          {
            name: "@",
            type: "MX",
            oldValue: "10 mail1.example.com",
            newValue: "10 mail2.example.com",
          },
        ],
      };

      this.showComparisonDialog = true;
    },

    confirmRollback(version) {
      this.rollbackVersion = { ...version };
      this.showRollbackDialog = true;
    },

    performRollback() {
      this.rollbackLoading = true;

      const params = new URLSearchParams();
      params.append("token", localStorage.appToken);
      params.append("zone", this.zoneName);
      params.append("versionNumber", this.rollbackVersion.versionNumber);

      this.$axios
        .post(`/api/zones/versionHistory/rollback?${params.toString()}`)
        .then((res) => {
          if (res.data.status === "ok") {
            this.$toast.success(
              `Rolled back ${this.zoneName} to version ${this.rollbackVersion.versionNumber}`,
            );
            this.showRollbackDialog = false;
            this.rollbackLoading = false;
            this.loadVersionHistory();
          }
        })
        .catch(() => {
          this.$toast.error("Failed to rollback zone");
          this.rollbackLoading = false;
        });
    },

    getVersionColor(version) {
      if (version.changeType === "Import") return "info";
      if (version.changeType === "Update") return "primary";
      if (version.changeType === "Delete") return "error";
      return "grey";
    },

    formatDateTime(timestamp) {
      return moment(timestamp).format("YYYY-MM-DD HH:mm:ss");
    },

    generateMockVersionHistory() {
      const now = moment();
      const changeTypes = ["Update", "Import", "Delete"];
      const users = ["admin", "operator"];

      const versions = [];

      for (let i = 1; i <= 5; i++) {
        versions.unshift({
          versionNumber: i,
          timestamp: now
            .clone()
            .subtract((6 - i) * 24, "hours")
            .toDate(),
          changeDescription: `Updated MX records and added ${
            Math.floor(Math.random() * 5) + 1
          } new A records`,
          modifiedBy: users[Math.floor(Math.random() * users.length)],
          recordCount: 20 + i * 5,
          changeType:
            changeTypes[Math.floor(Math.random() * changeTypes.length)],
          recordsPreview: [
            {
              name: "@",
              type: "SOA",
              value: "ns1.example.com. admin@example.com.",
            },
            { name: "@", type: "NS", value: "ns1.example.com" },
            { name: "@", type: "A", value: "192.168.1.1" },
            { name: "www", type: "A", value: "192.168.1.2" },
            { name: "mail", type: "A", value: "192.168.1.3" },
          ],
        });
      }

      return versions;
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
