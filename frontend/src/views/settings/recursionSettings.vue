<template>
  <v-container v-if="settings" fluid>
    <div>
      <v-card elevation="2">
        <v-toolbar color="primary" dark>
          <v-icon left>mdi-sync-circle</v-icon>
          <v-toolbar-title>Recursion Policy</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-select
            label="Recursion Policy"
            prepend-inner-icon="mdi-shield-check"
            v-model="settings.recursion"
            :items="recursionOptions"
            hint="Controls how the DNS server handles recursive DNS queries from clients."
          ></v-select>
          <div class="mt-4 mb-2 text-subtitle-2">Recursion Policy Modes:</div>
          <ul class="text-caption" style="margin-left: 20px">
            <li><strong>Deny:</strong> Disable recursion for all queries</li>
            <li><strong>Allow:</strong> Allow recursion from any client</li>
            <li>
              <strong>AllowOnlyForPrivateNetworks:</strong> Allow recursion only
              from private networks
            </li>
            <li>
              <strong>UseSpecifiedNetworkACL:</strong> Allow recursion based on
              network ACL
            </li>
          </ul>
          <v-textarea
            label="Recursion Network ACL"
            prepend-inner-icon="mdi-network"
            v-model="settings.recursionNetworkACL"
            hint="Comma-separated list of IP addresses or network addresses to allow recursion. Use ! prefix to deny. Only used when recursion policy is 'UseSpecifiedNetworkACL'."
            filled
            rows="4"
          ></v-textarea>
          <v-alert
            border="right"
            colored-border
            type="info"
            elevation="4"
            class="mt-4"
          >
            Network ACL entries are processed in order. If no networks match,
            the default is to deny all except loopback.
          </v-alert>
        </v-card-text>
      </v-card>
    </div>

    <div class="my-4">
      <v-card elevation="2">
        <v-toolbar color="primary" dark>
          <v-icon left>mdi-cog</v-icon>
          <v-toolbar-title>Query Name Minimization</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-switch
            v-model="settings.qnameMinimization"
            prepend-icon="mdi-shield-outline"
            label="Enable QNAME Minimization"
          ></v-switch>
          <p class="text-caption">
            QNAME minimization reduces the information sent to name servers
            during recursive resolution by only sending the necessary query
            labels, improving privacy and security per
            draft-ietf-dnsop-rfc7816bis-04.
          </p>

          <v-divider class="my-4"></v-divider>

          <v-switch
            v-model="settings.randomizeName"
            prepend-icon="mdi-dice-multiple"
            label="Enable DNS 0x20 Randomization"
          ></v-switch>
          <p class="text-caption">
            DNS 0x20 randomization randomizes the case of query names when using
            UDP, improving security against DNS cache poisoning attacks per
            draft-vixie-dnsext-dns0x20-00.
          </p>

          <v-alert
            border="right"
            colored-border
            type="info"
            elevation="4"
            class="mt-4"
          >
            Both QNAME minimization and DNS 0x20 randomization are recommended
            for improved privacy and security during recursive resolution.
          </v-alert>
        </v-card-text>
      </v-card>
    </div>

    <div class="my-4">
      <v-card elevation="2">
        <v-toolbar color="primary" dark>
          <v-icon left>mdi-clock-fast</v-icon>
          <v-toolbar-title>Resolver Timeouts & Retries</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            label="Resolver Timeout"
            prepend-inner-icon="mdi-timer"
            v-model="settings.resolverTimeout"
            hint="The timeout value for recursive resolver requests to name servers."
            suffix="milliseconds (default 1500)"
          ></v-text-field>

          <v-text-field
            label="Resolver Retries"
            prepend-inner-icon="mdi-repeat"
            v-model="settings.resolverRetries"
            hint="The number of retries that the recursive resolver must perform when a request times out."
            type="number"
          ></v-text-field>

          <v-text-field
            label="Resolver Concurrency"
            prepend-inner-icon="mdi-transit-connection-variant"
            v-model="settings.resolverConcurrency"
            hint="The number of concurrent requests that should be sent by the recursive resolver to name servers."
            type="number"
          ></v-text-field>

          <v-text-field
            label="Resolver Max Stack Count"
            prepend-inner-icon="mdi-layers-multiple"
            v-model="settings.resolverMaxStackCount"
            hint="The maximum recursion depth for the recursive resolver."
            type="number"
          ></v-text-field>

          <v-alert
            border="right"
            colored-border
            type="warning"
            elevation="4"
            class="mt-4"
          >
            Increasing timeout values may improve reliability but will slow down
            resolution. Decreasing retries may speed up resolution but reduce
            reliability.
          </v-alert>
        </v-card-text>
      </v-card>
    </div>

    <div class="my-4">
      <v-card elevation="2">
        <v-toolbar color="primary" dark>
          <v-icon left>mdi-server-network</v-icon>
          <v-toolbar-title>Resolution Limits</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            label="Max Concurrent Resolutions Per Core"
            prepend-inner-icon="mdi-cpu-64-bit"
            v-model="settings.maxConcurrentResolutionsPerCore"
            hint="The maximum number of concurrent async outbound resolutions that should be done per CPU core."
            suffix="per CPU core (default 100)"
            type="number"
          ></v-text-field>

          <v-alert
            border="right"
            colored-border
            type="info"
            elevation="4"
            class="mt-4"
          >
            This limit helps control the load on the DNS server's recursive
            resolver. Higher values may improve performance but use more memory
            and CPU resources. Lower values reduce resource usage but may cause
            queries to be dropped under high load.
          </v-alert>

          <v-alert border="right" colored-border type="error" elevation="4">
            Setting this too low may cause legitimate queries to be dropped.
            Setting too high may cause excessive resource usage.
          </v-alert>
        </v-card-text>
      </v-card>
    </div>

    <div class="my-4">
      <v-card elevation="2">
        <v-card-text class="d-flex flex-wrap justify-space-around">
          <v-btn
            v-can="{ section: 'Settings', action: 'modify' }"
            color="primary"
            class="ma-2"
            @click="saveSettings()"
          >
            <v-icon left>mdi-content-save</v-icon>
            Save Settings
          </v-btn>
          <v-btn
            v-can="{ section: 'Settings', action: 'view' }"
            color="secondary"
            class="ma-2"
            @click="getSettings()"
          >
            <v-icon left>mdi-refresh</v-icon>
            Reload
          </v-btn>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script>
const axios = require("axios");
export default {
  name: "recursionSettings",
  data() {
    return {
      settings: undefined,
      recursionOptions: [
        { text: "Deny", value: "Deny" },
        { text: "Allow", value: "Allow" },
        {
          text: "Allow Only For Private Networks",
          value: "AllowOnlyForPrivateNetworks",
        },
        { text: "Use Specified Network ACL", value: "UseSpecifiedNetworkACL" },
      ],
    };
  },
  methods: {
    getSettings() {
      axios
        .get(`/api/settings/get?token=${localStorage.appToken}`)
        .then((response) => {
          const s = response.data.response;

          // Convert array fields to string for textarea
          if (Array.isArray(s.recursionNetworkACL)) {
            s.recursionNetworkACL = s.recursionNetworkACL.join("\n");
          }

          // Initialize missing fields with defaults
          if (!s.recursion) s.recursion = "AllowOnlyForPrivateNetworks";
          if (s.qnameMinimization === undefined) s.qnameMinimization = true;
          if (s.randomizeName === undefined) s.randomizeName = true;
          if (!s.resolverTimeout) s.resolverTimeout = 1500;
          if (!s.resolverRetries) s.resolverRetries = 3;
          if (!s.resolverConcurrency) s.resolverConcurrency = 2;
          if (!s.resolverMaxStackCount) s.resolverMaxStackCount = 16;
          if (!s.maxConcurrentResolutionsPerCore)
            s.maxConcurrentResolutionsPerCore = 100;

          this.settings = s;
        })
        .catch((e) => {
          console.log(e);
          this.$toast.error(`Error loading settings: ${e}`, {
            timeout: 5000,
            closeOnClick: true,
          });
        });
    },

    saveSettings() {
      // Convert textarea/textfield string fields back to arrays where needed
      const payload = { ...this.settings };

      // Convert recursionNetworkACL back to array
      if (typeof payload.recursionNetworkACL === "string") {
        payload.recursionNetworkACL = payload.recursionNetworkACL
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }

      // Convert numeric fields
      payload.resolverTimeout = parseInt(payload.resolverTimeout) || 1500;
      payload.resolverRetries = parseInt(payload.resolverRetries) || 3;
      payload.resolverConcurrency = parseInt(payload.resolverConcurrency) || 2;
      payload.resolverMaxStackCount =
        parseInt(payload.resolverMaxStackCount) || 16;
      payload.maxConcurrentResolutionsPerCore =
        parseInt(payload.maxConcurrentResolutionsPerCore) || 100;

      // Filter out null or undefined values that could cause validation errors
      Object.keys(payload).forEach((key) => {
        if (payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });

      const formData = new FormData();
      Object.keys(payload).forEach((key) => {
        if (Array.isArray(payload[key])) {
          formData.append(key, JSON.stringify(payload[key]));
        } else {
          formData.append(key, payload[key]);
        }
      });
      formData.append("token", localStorage.appToken);

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
          this.getSettings();
          this.$toast.success("Settings saved successfully", {
            timeout: 3000,
            closeOnClick: true,
          });
        })
        .catch((e) => {
          this.$toast.error(`Error saving settings: ${e}`, {
            timeout: 5000,
            closeOnClick: true,
          });
          console.log(e);
        });
    },
  },

  mounted() {
    this.getSettings();
  },
};
</script>

<style lang="scss" scoped>
.my-4 {
  margin-top: 16px;
  margin-bottom: 16px;
}

ul {
  line-height: 1.8;
}
</style>
