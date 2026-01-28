<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card :loading="loading">
          <v-toolbar color="primary" dark>
            <v-icon left>mdi-network-outline</v-icon>
            <v-toolbar-title>Proxy & Forwarders Settings</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <!-- Forwarders Section -->
            <v-row>
              <v-col cols="12">
                <h3>DNS Forwarders</h3>
                <v-divider class="my-4"></v-divider>
              </v-col>
            </v-row>

            <!-- Quick Presets -->
            <v-row>
              <v-col>
                <v-select
                  v-model="selectedPreset"
                  :items="forwarderPresets"
                  item-text="name"
                  item-value="value"
                  label="Quick Preset Forwarders"
                  @change="applyForwarderPreset"
                  prepend-inner-icon="mdi-lightning-bolt"
                >
                  <template v-slot:item="{ item }">
                    <div>
                      <strong>{{ item.name }}</strong>
                      <div class="text-caption">{{ item.dns.join(", ") }}</div>
                    </div>
                  </template>
                  <template v-slot:selection="{ item }">
                    <div>{{ item.name }}</div>
                  </template>
                </v-select>
              </v-col>
            </v-row>

            <!-- Forwarder Addresses -->
            <v-row>
              <v-col>
                <v-text-field
                  v-model="formData.forwarders"
                  label="Forwarder Addresses"
                  hint="Comma-separated IP addresses or domain names (e.g., 8.8.8.8, 1.1.1.1)"
                  persistent-hint
                  @input="touched = true"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Forwarder Protocol -->
            <v-row>
              <v-col>
                <v-select
                  v-model="formData.forwarderProtocol"
                  :items="protocolOptions"
                  label="Forwarder Protocol"
                  @change="touched = true"
                ></v-select>
              </v-col>
            </v-row>

            <!-- Proxy Section -->
            <v-row class="mt-6">
              <v-col cols="12">
                <h3>Proxy Settings</h3>
                <v-divider class="my-4"></v-divider>
              </v-col>
            </v-row>

            <!-- Proxy Type -->
            <v-row>
              <v-col>
                <v-select
                  v-model="formData.proxyType"
                  :items="proxyTypeOptions"
                  label="Proxy Type"
                  @change="touched = true"
                ></v-select>
              </v-col>
            </v-row>

            <!-- Proxy Address -->
            <v-row v-if="formData.proxyType !== 'None'">
              <v-col>
                <v-text-field
                  v-model="formData.proxyAddress"
                  label="Proxy Address"
                  hint="IP address or hostname of the proxy server"
                  persistent-hint
                  @input="touched = true"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Proxy Port -->
            <v-row v-if="formData.proxyType !== 'None'">
              <v-col>
                <v-text-field
                  v-model.number="formData.proxyPort"
                  label="Proxy Port"
                  type="number"
                  min="1"
                  max="65535"
                  @input="touched = true"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Proxy Username -->
            <v-row v-if="formData.proxyType !== 'None'">
              <v-col>
                <v-text-field
                  v-model="formData.proxyUsername"
                  label="Proxy Username"
                  hint="Optional: Leave empty if no authentication required"
                  persistent-hint
                  @input="touched = true"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Proxy Password -->
            <v-row v-if="formData.proxyType !== 'None'">
              <v-col>
                <v-text-field
                  v-model="formData.proxyPassword"
                  label="Proxy Password"
                  type="password"
                  hint="Optional: Leave empty if no authentication required"
                  persistent-hint
                  @input="touched = true"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Proxy Bypass -->
            <v-row v-if="formData.proxyType !== 'None'">
              <v-col>
                <v-text-field
                  v-model="formData.proxyBypass"
                  label="Proxy Bypass"
                  hint="Comma-separated CIDR notation (e.g., 127.0.0.0/8, 192.168.0.0/16)"
                  persistent-hint
                  @input="touched = true"
                ></v-text-field>
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
      touched: false,
      selectedPreset: null,
      formData: {
        forwarders: "",
        forwarderProtocol: "Udp",
        proxyType: "None",
        proxyAddress: "",
        proxyPort: 9050,
        proxyUsername: "",
        proxyPassword: "",
        proxyBypass: "",
      },
      forwarderPresets: [
        {
          name: "Cloudflare DNS (1.1.1.1)",
          value: "cloudflare",
          dns: ["1.1.1.1", "1.0.0.1"],
        },
        {
          name: "Quad9 DNS (9.9.9.9)",
          value: "quad9",
          dns: ["9.9.9.9", "149.112.112.112"],
        },
        {
          name: "Google DNS (8.8.8.8)",
          value: "google",
          dns: ["8.8.8.8", "8.8.4.4"],
        },
        {
          name: "OpenDNS (208.67.222.123)",
          value: "opendns",
          dns: ["208.67.222.123", "208.67.220.123"],
        },
        {
          name: "Comodo Secure DNS (8.26.56.26)",
          value: "comodo",
          dns: ["8.26.56.26", "8.20.247.20"],
        },
        {
          name: "NextDNS (45.90.28.0)",
          value: "nextdns",
          dns: ["45.90.28.0", "45.90.29.0"],
        },
      ],
      protocolOptions: ["Udp", "Tcp", "Tls", "Https", "Quic"],
      proxyTypeOptions: ["None", "Http", "Socks5"],
    };
  },
  mounted() {
    this.loadSettings();
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
              forwarders: settings.forwarders?.join(", ") || "",
              forwarderProtocol: settings.forwarderProtocol || "Udp",
              proxyType: settings.proxyType || "None",
              proxyAddress: settings.proxyAddress || "",
              proxyPort: settings.proxyPort || 9050,
              proxyUsername: settings.proxyUsername || "",
              proxyPassword: settings.proxyPassword || "",
              proxyBypass: settings.proxyBypass?.join(", ") || "",
            };
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
    applyForwarderPreset(presetValue) {
      const preset = this.forwarderPresets.find((p) => p.value === presetValue);
      if (preset) {
        this.formData.forwarders = preset.dns.join(", ");
        this.touched = true;
      }
    },
    saveSettings() {
      this.loading = true;
      const params = new URLSearchParams();
      params.append("token", localStorage.appToken);
      params.append("forwarders", this.formData.forwarders);
      params.append("forwarderProtocol", this.formData.forwarderProtocol);
      params.append("proxyType", this.formData.proxyType);
      params.append("proxyAddress", this.formData.proxyAddress);
      params.append("proxyPort", this.formData.proxyPort);
      params.append("proxyUsername", this.formData.proxyUsername);
      params.append("proxyPassword", this.formData.proxyPassword);
      params.append("proxyBypass", this.formData.proxyBypass);

      axios
        .post("/api/settings/set", params)
        .then((response) => {
          if (response.data.status === "ok") {
            this.$toast.success("Settings saved successfully");
            this.touched = false;
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
  },
};
</script>

<style lang="scss" scoped>
h3 {
  margin-top: 20px;
  margin-bottom: 10px;
}
</style>
