<template>
  <v-container fluid>
    <div>
      <v-card :loading="loading">
        <v-toolbar color="primary" dark>
          <v-icon left>mdi-network</v-icon>
          <v-toolbar-title>DNS Protocols Configuration</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <!-- UDP/TCP (Always Enabled) -->
          <div class="text-subtitle-1 mb-3">Standard DNS</div>
          <v-divider class="my-3"></v-divider>
          <v-checkbox
            v-model="formData.enableDns"
            label="Enable Standard DNS (UDP/TCP)"
            disabled
            hint="Always enabled"
          ></v-checkbox>

          <!-- DNS over TLS (DoT) -->
          <div class="text-subtitle-1 mb-3 mt-6">DNS over TLS (DoT)</div>
          <v-divider class="my-3"></v-divider>
          <v-checkbox
            v-model="formData.enableDnsOverTls"
            label="Enable DNS over TLS (DoT)"
            @change="touched = true"
            prepend-icon="mdi-lock"
          ></v-checkbox>

          <div v-if="formData.enableDnsOverTls" class="mt-4">
            <v-text-field
              v-model.number="formData.dnsTlsPort"
              label="DoT Port"
              type="number"
              min="1"
              max="65535"
              hint="Default: 853"
              @input="touched = true"
            ></v-text-field>
            <v-file-input
              v-model="dnsTlsCert"
              label="TLS Certificate (.pem)"
              accept=".pem,.crt,.pfx"
              hint="Upload certificate file"
              @change="touched = true"
            ></v-file-input>
            <v-text-field
              v-model="formData.dnsTlsCertificatePath"
              label="Certificate Path"
              disabled
              hint="Certificate location on server"
            ></v-text-field>
            <v-text-field
              v-model="formData.dnsTlsCertificatePassword"
              label="Certificate Password (Optional)"
              type="password"
              hint="If certificate is encrypted"
              @input="touched = true"
            ></v-text-field>
          </div>

          <!-- DNS over HTTPS (DoH) -->
          <div class="text-subtitle-1 mb-3 mt-6">DNS over HTTPS (DoH)</div>
          <v-divider class="my-3"></v-divider>
          <v-checkbox
            v-model="formData.enableDnsOverHttps"
            label="Enable DNS over HTTPS (DoH)"
            @change="touched = true"
            prepend-icon="mdi-lock"
          ></v-checkbox>

          <div v-if="formData.enableDnsOverHttps" class="mt-4">
            <v-text-field
              v-model.number="formData.dnsHttpsPort"
              label="DoH Port"
              type="number"
              min="1"
              max="65535"
              hint="Default: 443"
              @input="touched = true"
            ></v-text-field>
            <v-file-input
              v-model="dnsHttpsCert"
              label="HTTPS Certificate (.pem)"
              accept=".pem,.crt,.pfx"
              hint="Upload certificate file"
              @change="touched = true"
            ></v-file-input>
            <v-text-field
              v-model="formData.dnsHttpsCertificatePath"
              label="Certificate Path"
              disabled
              hint="Certificate location on server"
            ></v-text-field>
            <v-text-field
              v-model="formData.dnsHttpsCertificatePassword"
              label="Certificate Password (Optional)"
              type="password"
              hint="If certificate is encrypted"
              @input="touched = true"
            ></v-text-field>
          </div>

          <!-- DNS over QUIC (DoQ) -->
          <div class="text-subtitle-1 mb-3 mt-6">
            DNS over QUIC (DoQ)
            <v-chip small color="info" text-color="white">Experimental</v-chip>
          </div>
          <v-divider class="my-3"></v-divider>
          <v-checkbox
            v-model="formData.enableDnsOverQuic"
            label="Enable DNS over QUIC (DoQ)"
            @change="touched = true"
            prepend-icon="mdi-flash"
          ></v-checkbox>

          <div v-if="formData.enableDnsOverQuic" class="mt-4">
            <v-text-field
              v-model.number="formData.dnsQuicPort"
              label="DoQ Port"
              type="number"
              min="1"
              max="65535"
              hint="Default: 853"
              @input="touched = true"
            ></v-text-field>
            <v-file-input
              v-model="dnsQuicCert"
              label="QUIC Certificate (.pem)"
              accept=".pem,.crt,.pfx"
              hint="Upload certificate file"
              @change="touched = true"
            ></v-file-input>
            <v-text-field
              v-model="formData.dnsQuicCertificatePath"
              label="Certificate Path"
              disabled
              hint="Certificate location on server"
            ></v-text-field>
            <v-text-field
              v-model="formData.dnsQuicCertificatePassword"
              label="Certificate Password (Optional)"
              type="password"
              hint="If certificate is encrypted"
              @input="touched = true"
            ></v-text-field>
          </div>

          <!-- DNSSEC Configuration -->
          <div class="text-subtitle-1 mb-3 mt-6">DNSSEC Configuration</div>
          <v-divider class="my-3"></v-divider>
          <v-checkbox
            v-model="formData.enableDnssecValidation"
            label="Enable DNSSEC Validation"
            @change="touched = true"
            hint="Validate DNSSEC signatures on recursive queries"
          ></v-checkbox>

          <div v-if="formData.enableDnssecValidation" class="mt-4">
            <div class="text-subtitle-2 mb-2">Negative Trust Anchors</div>
            <v-divider class="my-2"></v-divider>
            <v-textarea
              v-model="formData.dnssecNegativeTrustAnchors"
              label="Negative Trust Anchors"
              hint="One domain per line (e.g., example.com)"
              rows="4"
              @input="touched = true"
              prepend-icon="mdi-alert"
            ></v-textarea>
          </div>

          <!-- Connection Security -->
          <div class="text-subtitle-1 mb-3 mt-6">Connection Security</div>
          <v-divider class="my-3"></v-divider>
          <v-select
            v-model="formData.tlsMinVersion"
            :items="tlsVersions"
            label="Minimum TLS Version"
            @change="touched = true"
          ></v-select>
          <v-select
            v-model="formData.tlsMaxVersion"
            :items="tlsVersions"
            label="Maximum TLS Version"
            @change="touched = true"
          ></v-select>

          <!-- Information -->
          <v-alert type="info" outlined class="mt-6">
            <strong>Note:</strong> Changes to DNS protocols require server
            restart to take effect. Certificate files should be in PEM format.
            Keep backups of your certificates.
          </v-alert>
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
    </div>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      loading: false,
      touched: false,
      dnsTlsCert: null,
      dnsHttpsCert: null,
      dnsQuicCert: null,
      formData: {
        enableDns: true,
        enableDnsOverTls: false,
        dnsTlsPort: 853,
        dnsTlsCertificatePath: "",
        dnsTlsCertificatePassword: "",
        enableDnsOverHttps: false,
        dnsHttpsPort: 443,
        dnsHttpsCertificatePath: "",
        dnsHttpsCertificatePassword: "",
        enableDnsOverQuic: false,
        dnsQuicPort: 853,
        dnsQuicCertificatePath: "",
        dnsQuicCertificatePassword: "",
        enableDnssecValidation: false,
        dnssecNegativeTrustAnchors: "",
        tlsMinVersion: "TLS1.2",
        tlsMaxVersion: "TLS1.3",
      },
      tlsVersions: ["TLS1.0", "TLS1.1", "TLS1.2", "TLS1.3"],
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
              enableDns: true,
              enableDnsOverTls: settings.enableDnsOverTls || false,
              dnsTlsPort: settings.dnsTlsPort || 853,
              dnsTlsCertificatePath: settings.dnsTlsCertificatePath || "",
              dnsTlsCertificatePassword: "",
              enableDnsOverHttps: settings.enableDnsOverHttps || false,
              dnsHttpsPort: settings.dnsHttpsPort || 443,
              dnsHttpsCertificatePath: settings.dnsHttpsCertificatePath || "",
              dnsHttpsCertificatePassword: "",
              enableDnsOverQuic: settings.enableDnsOverQuic || false,
              dnsQuicPort: settings.dnsQuicPort || 853,
              dnsQuicCertificatePath: settings.dnsQuicCertificatePath || "",
              dnsQuicCertificatePassword: "",
              enableDnssecValidation: settings.enableDnssecValidation || false,
              dnssecNegativeTrustAnchors:
                settings.dnssecNegativeTrustAnchors?.join("\n") || "",
              tlsMinVersion: settings.tlsMinVersion || "TLS1.2",
              tlsMaxVersion: settings.tlsMaxVersion || "TLS1.3",
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
    saveSettings() {
      this.loading = true;
      const params = new URLSearchParams();
      params.append("token", localStorage.appToken);
      params.append("enableDnsOverTls", this.formData.enableDnsOverTls);
      params.append("dnsTlsPort", this.formData.dnsTlsPort);
      if (this.formData.dnsTlsCertificatePath) {
        params.append(
          "dnsTlsCertificatePath",
          this.formData.dnsTlsCertificatePath,
        );
      }
      if (this.formData.dnsTlsCertificatePassword) {
        params.append(
          "dnsTlsCertificatePassword",
          this.formData.dnsTlsCertificatePassword,
        );
      }

      params.append("enableDnsOverHttps", this.formData.enableDnsOverHttps);
      params.append("dnsHttpsPort", this.formData.dnsHttpsPort);
      if (this.formData.dnsHttpsCertificatePath) {
        params.append(
          "dnsHttpsCertificatePath",
          this.formData.dnsHttpsCertificatePath,
        );
      }
      if (this.formData.dnsHttpsCertificatePassword) {
        params.append(
          "dnsHttpsCertificatePassword",
          this.formData.dnsHttpsCertificatePassword,
        );
      }

      params.append("enableDnsOverQuic", this.formData.enableDnsOverQuic);
      params.append("dnsQuicPort", this.formData.dnsQuicPort);
      if (this.formData.dnsQuicCertificatePath) {
        params.append(
          "dnsQuicCertificatePath",
          this.formData.dnsQuicCertificatePath,
        );
      }
      if (this.formData.dnsQuicCertificatePassword) {
        params.append(
          "dnsQuicCertificatePassword",
          this.formData.dnsQuicCertificatePassword,
        );
      }

      params.append(
        "enableDnssecValidation",
        this.formData.enableDnssecValidation,
      );
      if (this.formData.dnssecNegativeTrustAnchors) {
        const anchors = this.formData.dnssecNegativeTrustAnchors
          .split("\n")
          .map((a) => a.trim())
          .filter((a) => a);
        anchors.forEach((anchor) =>
          params.append("dnssecNegativeTrustAnchors", anchor),
        );
      }
      params.append("tlsMinVersion", this.formData.tlsMinVersion);
      params.append("tlsMaxVersion", this.formData.tlsMaxVersion);

      axios
        .post("/api/settings/set", params)
        .then((response) => {
          if (response.data.status === "ok") {
            this.$toast.success(
              "Settings saved. Server restart may be required.",
            );
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

h4 {
  margin-top: 15px;
  margin-bottom: 10px;
}
</style>
