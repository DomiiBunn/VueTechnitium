<template>
  <v-container v-if="settings" fluid>
    <div>
      <v-card elevation="2">
        <v-toolbar color="primary" dark>
          <v-icon left>mdi-web</v-icon>
          <v-toolbar-title>HTTP Configuration</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-textarea
            label="Web Service Local Addresses"
            prepend-inner-icon="mdi-ip-network"
            v-model="settings.webServiceLocalAddresses"
            hint="Local addresses are the network interface IP addresses you want the web service to listen for requests. Enter IP addresses one per line. Use [::] for all IPv6 addresses or 0.0.0.0 for all IPv4 addresses."
            rows="3"
          ></v-textarea>

          <v-text-field
            label="HTTP Port"
            prepend-inner-icon="mdi-ethernet"
            v-model.number="settings.webServiceHttpPort"
            type="number"
            hint="The TCP port number for HTTP access to the web console. Default: 5380"
            suffix="(default 5380)"
          ></v-text-field>

          <v-text-field
            label="Real IP Header"
            prepend-inner-icon="mdi-web-box"
            v-model="settings.webServiceRealIpHeader"
            hint="The HTTP header name used to read client's actual IP address when behind a reverse proxy (e.g., X-Real-IP, X-Forwarded-For)"
            placeholder="X-Real-IP"
          ></v-text-field>

          <v-alert type="info" border="left" colored-border elevation="2">
            Note! HTTP port changes require a manual restart of the DNS Server
            service to apply.
          </v-alert>
        </v-card-text>
      </v-card>
    </div>

    <div class="my-4">
      <v-card elevation="2">
        <v-toolbar color="primary" dark>
          <v-icon left>mdi-shield-lock</v-icon>
          <v-toolbar-title>HTTPS/TLS Configuration</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-switch
            v-model="settings.webServiceEnableTls"
            prepend-icon="mdi-lock"
            label="Enable HTTPS/TLS"
            hint="Enable HTTPS for secure web console access"
          ></v-switch>

          <v-text-field
            v-if="settings.webServiceEnableTls"
            label="HTTPS Port"
            prepend-inner-icon="mdi-ethernet"
            v-model.number="settings.webServiceTlsPort"
            type="number"
            hint="The TCP port number for HTTPS access. Default: 53443"
            suffix="(default 53443)"
          ></v-text-field>

          <v-switch
            v-if="settings.webServiceEnableTls"
            v-model="settings.webServiceHttpToTlsRedirect"
            prepend-icon="mdi-arrow-right-bold"
            label="HTTP to HTTPS Redirect"
            hint="Automatically redirect HTTP requests to HTTPS"
          ></v-switch>

          <v-switch
            v-if="settings.webServiceEnableTls"
            v-model="settings.webServiceEnableHttp3"
            prepend-icon="mdi-numeric-3-box"
            label="Enable HTTP/3"
            hint="Enable HTTP/3 protocol support for improved performance"
          ></v-switch>

          <v-divider
            v-if="settings.webServiceEnableTls"
            class="my-4"
          ></v-divider>

          <div v-if="settings.webServiceEnableTls">
            <div class="text-subtitle-1 mb-3">TLS Certificate</div>

            <v-switch
              v-model="settings.webServiceUseSelfSignedTlsCertificate"
              prepend-icon="mdi-certificate"
              label="Use Self-Signed Certificate"
              hint="Use an automatically generated self-signed certificate"
            ></v-switch>

            <v-file-input
              v-if="!settings.webServiceUseSelfSignedTlsCertificate"
              label="TLS Certificate Path"
              prepend-icon="mdi-file-certificate"
              v-model="certificateFile"
              accept=".pfx,.p12"
              hint="PKCS #12 certificate file (.pfx) with private key"
              placeholder="Select certificate file..."
              @change="handleCertificateUpload"
            ></v-file-input>

            <v-text-field
              v-if="
                !settings.webServiceUseSelfSignedTlsCertificate &&
                settings.webServiceTlsCertificatePath
              "
              label="Current Certificate"
              prepend-inner-icon="mdi-file-check"
              :value="settings.webServiceTlsCertificatePath"
              readonly
              hint="Currently configured certificate file path"
            ></v-text-field>

            <v-text-field
              v-if="
                !settings.webServiceUseSelfSignedTlsCertificate &&
                settings.webServiceTlsCertificatePath
              "
              label="Certificate Password"
              prepend-inner-icon="mdi-key"
              v-model="settings.webServiceTlsCertificatePassword"
              type="password"
              hint="Password for the certificate file (if required)"
              placeholder="Enter password..."
            ></v-text-field>

            <v-alert
              v-if="!settings.webServiceUseSelfSignedTlsCertificate"
              type="warning"
              border="left"
              colored-border
              elevation="2"
              class="mt-3"
            >
              The certificate file must be in PKCS #12 format (.pfx) and contain
              the private key. Place the file in the DNS server's config folder
              or use an absolute path.
            </v-alert>
          </div>

          <v-alert
            v-if="settings.webServiceEnableTls"
            type="info"
            border="left"
            colored-border
            elevation="2"
            class="mt-3"
          >
            Note! HTTPS/TLS changes require a manual restart of the DNS Server
            service to apply.
          </v-alert>
        </v-card-text>
      </v-card>
    </div>

    <div class="my-4">
      <v-btn
        color="primary"
        large
        @click="saveSettings"
        :loading="saving"
        elevation="2"
      >
        <v-icon left>mdi-content-save</v-icon>
        Save Web Service Settings
      </v-btn>
    </div>
  </v-container>
  <v-container v-else>
    <v-row>
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <p class="mt-4">Loading web service settings...</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "WebServiceSettings",
  data() {
    return {
      settings: null,
      saving: false,
      certificateFile: null,
    };
  },
  mounted() {
    this.loadSettings();
  },
  methods: {
    loadSettings() {
      const axios = require("axios");
      axios
        .get(`/api/settings/get?token=${localStorage.appToken}`)
        .then((response) => {
          if (response.data.status === "ok") {
            this.settings = {
              webServiceLocalAddresses: this.formatArrayToTextarea(
                response.data.response.webServiceLocalAddresses,
              ),
              webServiceHttpPort: response.data.response.webServiceHttpPort,
              webServiceEnableTls: response.data.response.webServiceEnableTls,
              webServiceEnableHttp3:
                response.data.response.webServiceEnableHttp3,
              webServiceHttpToTlsRedirect:
                response.data.response.webServiceHttpToTlsRedirect,
              webServiceTlsPort: response.data.response.webServiceTlsPort,
              webServiceUseSelfSignedTlsCertificate:
                response.data.response.webServiceUseSelfSignedTlsCertificate,
              webServiceTlsCertificatePath:
                response.data.response.webServiceTlsCertificatePath || "",
              webServiceTlsCertificatePassword: "",
              webServiceRealIpHeader:
                response.data.response.webServiceRealIpHeader || "",
            };
          } else {
            this.$toast.error(
              response.data.errorMessage || "Failed to load settings",
            );
          }
        })
        .catch((error) => {
          console.error("Error loading settings:", error);
          this.$toast.error("Failed to load web service settings");
        });
    },

    saveSettings() {
      const axios = require("axios");
      this.saving = true;
      const formData = new FormData();
      formData.append("token", localStorage.appToken);
      formData.append(
        "webServiceLocalAddresses",
        this.formatTextareaToArray(this.settings.webServiceLocalAddresses),
      );
      formData.append("webServiceHttpPort", this.settings.webServiceHttpPort);
      formData.append("webServiceEnableTls", this.settings.webServiceEnableTls);
      formData.append(
        "webServiceEnableHttp3",
        this.settings.webServiceEnableHttp3,
      );
      formData.append(
        "webServiceHttpToTlsRedirect",
        this.settings.webServiceHttpToTlsRedirect,
      );
      formData.append("webServiceTlsPort", this.settings.webServiceTlsPort);
      formData.append(
        "webServiceUseSelfSignedTlsCertificate",
        this.settings.webServiceUseSelfSignedTlsCertificate,
      );

      if (
        !this.settings.webServiceUseSelfSignedTlsCertificate &&
        this.settings.webServiceTlsCertificatePath
      ) {
        formData.append(
          "webServiceTlsCertificatePath",
          this.settings.webServiceTlsCertificatePath,
        );
        if (this.settings.webServiceTlsCertificatePassword) {
          formData.append(
            "webServiceTlsCertificatePassword",
            this.settings.webServiceTlsCertificatePassword,
          );
        }
      }

      if (this.settings.webServiceRealIpHeader) {
        formData.append(
          "webServiceRealIpHeader",
          this.settings.webServiceRealIpHeader,
        );
      }

      axios
        .post(`/api/settings/set`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          if (res.data.status !== "ok") {
            throw new Error(res.data.errorMessage);
          }
          this.$toast.success("Web service settings saved successfully", {
            timeout: 3000,
            closeOnClick: true,
          });

          // Show restart notice for web service changes
          this.$swal.fire({
            title: "Restart Required",
            html: "<p>Web service settings have been saved. Please <strong>manually restart</strong> the DNS Server service for the changes to take effect.</p>",
            icon: "warning",
            confirmButtonText: "OK",
          });

          // Reload settings to get updated values
          this.loadSettings();
        })
        .catch((e) => {
          this.$toast.error(`Error saving settings: ${e.message || e}`, {
            timeout: 5000,
            closeOnClick: true,
          });
          console.log(e);
        })
        .finally(() => {
          this.saving = false;
        });
    },

    handleCertificateUpload(file) {
      if (file) {
        // Store the file name as the path
        this.settings.webServiceTlsCertificatePath = file.name;
        this.$toast.info(
          "Please upload the certificate file to the DNS server's config folder manually",
        );
      }
    },

    formatArrayToTextarea(arr) {
      if (!arr || !Array.isArray(arr)) return "";
      return arr.join("\n");
    },

    formatTextareaToArray(text) {
      if (!text) return "";
      return text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join(",");
    },
  },
};
</script>

<style scoped>
.v-card {
  margin-bottom: 24px;
}

.text-subtitle-1 {
  font-weight: 600;
  color: #667eea;
}
</style>
