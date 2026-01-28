<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card :loading="loading">
          <v-toolbar color="primary" dark>
            <v-icon left>mdi-block-helper</v-icon>
            <v-toolbar-title>Blocking Settings</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <!-- Block List Quick Presets -->
            <v-row>
              <v-col cols="12">
                <h3>Block List Quick Presets</h3>
                <v-divider class="my-4"></v-divider>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="selectedPresets"
                  :items="blockListPresets"
                  item-text="name"
                  item-value="value"
                  label="Select Preset Block Lists"
                  multiple
                  chips
                  @change="applyBlockListPreset"
                  prepend-inner-icon="mdi-lightning-bolt"
                >
                  <template v-slot:item="{ item }">
                    <div>
                      <strong>{{ item.name }}</strong>
                      <div class="text-caption">{{ item.description }}</div>
                    </div>
                  </template>
                </v-select>
              </v-col>
            </v-row>

            <!-- Block List URLs -->
            <v-row class="mt-6">
              <v-col cols="12">
                <h3>Block List URLs</h3>
                <v-divider class="my-4"></v-divider>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.blockListUrls"
                  label="Block List URLs"
                  hint="One URL per line"
                  persistent-hint
                  rows="8"
                  @input="touched = true"
                ></v-textarea>
              </v-col>
            </v-row>

            <!-- Blocking Type -->
            <v-row class="mt-6">
              <v-col cols="12">
                <h3>Blocking Configuration</h3>
                <v-divider class="my-4"></v-divider>
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-select
                  v-model="formData.blockingType"
                  :items="blockingTypes"
                  label="Blocking Type"
                  @change="touched = true"
                >
                  <template v-slot:item="{ item }">
                    <div>
                      <strong>{{ item.text }}</strong>
                      <div class="text-caption">{{ item.description }}</div>
                    </div>
                  </template>
                  <template v-slot:selection="{ item }">
                    <div>{{ item.text }}</div>
                  </template>
                </v-select>
              </v-col>
            </v-row>

            <!-- Custom Blocking Addresses -->
            <v-row v-if="formData.blockingType === 'CustomAddress'">
              <v-col>
                <v-text-field
                  v-model="formData.customBlockingAddresses"
                  label="Custom Blocking Addresses"
                  hint="Comma-separated IP addresses (e.g., 0.0.0.0, ::)"
                  persistent-hint
                  @input="touched = true"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Use NxDomain for Blocking -->
            <v-row>
              <v-col>
                <v-checkbox
                  v-model="formData.useNxDomainForBlocking"
                  label="Use NX Domain for Blocking (overrides blocking type)"
                  @change="touched = true"
                ></v-checkbox>
              </v-col>
            </v-row>

            <!-- Block List Auto-Update -->
            <v-row class="mt-6">
              <v-col cols="12">
                <h3>Block List Auto-Update</h3>
                <v-divider class="my-4"></v-divider>
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-select
                  v-model="formData.blockListUpdateSchedule"
                  :items="updateScheduleOptions"
                  item-text="label"
                  item-value="value"
                  label="Update Schedule"
                  @change="touched = true"
                ></v-select>
              </v-col>
            </v-row>

            <v-row
              v-if="
                formData.blockListUpdateSchedule &&
                formData.blockListUpdateSchedule !== 'disabled'
              "
            >
              <v-col class="text-center">
                <p class="text-caption">
                  <v-icon small>mdi-information</v-icon>
                  Next update: {{ nextUpdateTime || "Calculating..." }}
                </p>
              </v-col>
            </v-row>

            <v-row v-if="lastBlockListUpdate">
              <v-col>
                <p class="text-caption">
                  <v-icon small>mdi-check-circle</v-icon>
                  Last updated: {{ formatTime(lastBlockListUpdate) }}
                </p>
              </v-col>
            </v-row>

            <!-- Manual Update Button -->
            <v-row>
              <v-col>
                <v-btn
                  color="primary"
                  @click="forceUpdateBlockLists"
                  :loading="updating"
                  prepend-icon="mdi-refresh"
                >
                  Update Now
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="saveSettings"
              :loading="loading"
              :disabled="!touched"
            >
              Save Settings
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      loading: false,
      updating: false,
      touched: false,
      selectedPresets: [],
      nextUpdateTime: "",
      lastBlockListUpdate: null,
      updateIntervalTimer: null,
      formData: {
        blockListUrls: "",
        blockingType: "AnyAddress",
        customBlockingAddresses: "",
        useNxDomainForBlocking: false,
        blockListUpdateSchedule: "disabled",
      },
      blockListPresets: [
        {
          name: "Ads & Trackers",
          value: "ads",
          description: "Blocks ads and tracking domains",
          urls: [
            "https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts",
            "https://s3.amazonaws.com/lists.disconnect.me/simple_ad.txt",
          ],
        },
        {
          name: "Malware & Phishing",
          value: "malware",
          description: "Blocks known malicious and phishing domains",
          urls: [
            "https://mirror1.malwaredomains.com/files/justdomains",
            "https://phishing.army/download/phishing_army_blocklist_extended.txt",
          ],
        },
        {
          name: "Tracking Domains",
          value: "tracking",
          description: "Blocks known tracking domains",
          urls: [
            "https://s3.amazonaws.com/lists.disconnect.me/simple_tracking.txt",
          ],
        },
        {
          name: "Social Media",
          value: "social",
          description: "Blocks social media domains",
          urls: [
            "https://raw.githubusercontent.com/Perflyst/PiracyBlocklist/master/SmartTV.txt",
          ],
        },
      ],
      blockingTypes: [
        {
          value: "AnyAddress",
          text: "Any Address",
          description: "Respond with 0.0.0.0 / ::",
        },
        {
          value: "NxDomain",
          text: "NX Domain",
          description: "Respond with NX Domain",
        },
        {
          value: "CustomAddress",
          text: "Custom Address",
          description: "Respond with custom IP",
        },
      ],
      updateScheduleOptions: [
        { label: "Disabled", value: "disabled" },
        { label: "Hourly", value: "hourly" },
        { label: "Daily", value: "daily" },
        { label: "Weekly", value: "weekly" },
      ],
    };
  },
  mounted() {
    this.loadSettings();
    this.calculateNextUpdate();
    this.updateIntervalTimer = setInterval(() => {
      this.calculateNextUpdate();
    }, 60000); // Update every minute
  },
  beforeDestroy() {
    if (this.updateIntervalTimer) {
      clearInterval(this.updateIntervalTimer);
    }
  },
  methods: {
    loadSettings() {
      this.loading = true;
      axios
        .post(`/api/settings/get?token=${localStorage.appToken}`)
        .then((response) => {
          if (response.data.status === "ok") {
            const settings = response.data.response;
            this.formData = {
              blockListUrls: settings.blockListUrls?.join("\n") || "",
              blockingType: settings.blockingType || "AnyAddress",
              customBlockingAddresses:
                settings.customBlockingAddresses?.join(", ") || "",
              useNxDomainForBlocking: settings.useNxDomainForBlocking || false,
              blockListUpdateSchedule:
                settings.blockListUpdateSchedule || "disabled",
            };
            this.lastBlockListUpdate = settings.lastBlockListUpdate;
            this.touched = false;
          }
        })
        .catch(() => {
          this.$toast.error("Failed to load settings");
        })
        .finally(() => {
          this.loading = false;
        });
    },
    applyBlockListPreset(presets) {
      const urls = new Set();
      presets.forEach((presetValue) => {
        const preset = this.blockListPresets.find(
          (p) => p.value === presetValue,
        );
        if (preset) {
          preset.urls.forEach((url) => urls.add(url));
        }
      });

      // Combine with existing URLs
      const existing = this.formData.blockListUrls
        .split("\n")
        .map((u) => u.trim())
        .filter((u) => u);

      const combined = [...new Set([...existing, ...urls])];
      this.formData.blockListUrls = combined.join("\n");
      this.touched = true;
    },
    calculateNextUpdate() {
      const schedule = this.formData.blockListUpdateSchedule;
      if (!schedule || schedule === "disabled") {
        this.nextUpdateTime = "Not scheduled";
        return;
      }

      const now = new Date();
      let next = new Date();

      switch (schedule) {
        case "hourly":
          next.setHours(next.getHours() + 1);
          next.setMinutes(0);
          break;
        case "daily": {
          next.setDate(next.getDate() + 1);
          next.setHours(0, 0, 0);
          break;
        }
        case "weekly": {
          const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
          next.setDate(next.getDate() + daysUntilSunday);
          next.setHours(0, 0, 0);
          break;
        }
      }

      this.nextUpdateTime = next.toLocaleString();
    },
    forceUpdateBlockLists() {
      this.updating = true;
      axios
        .post(
          `/api/settings/forceBlockListUpdate?token=${localStorage.appToken}`,
        )
        .then((response) => {
          if (response.data.status === "ok") {
            this.$toast.success("Block lists updated successfully");
            this.lastBlockListUpdate = new Date();
          }
        })
        .catch(() => {
          this.$toast.error("Failed to update block lists");
        })
        .finally(() => {
          this.updating = false;
        });
    },
    saveSettings() {
      this.loading = true;
      const params = new URLSearchParams();
      params.append("token", localStorage.appToken);

      // Parse block list URLs
      const urls = this.formData.blockListUrls
        .split("\n")
        .map((u) => u.trim())
        .filter((u) => u);
      urls.forEach((url) => params.append("blockListUrls", url));

      params.append("blockingType", this.formData.blockingType);

      // Parse custom addresses
      const addresses = this.formData.customBlockingAddresses
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a);
      addresses.forEach((addr) =>
        params.append("customBlockingAddresses", addr),
      );

      params.append(
        "useNxDomainForBlocking",
        this.formData.useNxDomainForBlocking,
      );
      params.append(
        "blockListUpdateSchedule",
        this.formData.blockListUpdateSchedule,
      );

      axios
        .post("/api/settings/set", params)
        .then((response) => {
          if (response.data.status === "ok") {
            this.$toast.success("Settings saved successfully");
            this.touched = false;
            this.calculateNextUpdate();
          } else {
            this.$toast.error(
              response.data.errorMessage || "Failed to save settings",
            );
          }
        })
        .catch(() => {
          this.$toast.error("Failed to save settings");
        })
        .finally(() => {
          this.loading = false;
        });
    },
    formatTime(dateString) {
      if (!dateString) return "";
      return new Date(dateString).toLocaleString();
    },
  },
};
</script>

<style lang="scss" scoped>
h3 {
  margin-top: 20px;
  margin-bottom: 10px;
}
</style>
