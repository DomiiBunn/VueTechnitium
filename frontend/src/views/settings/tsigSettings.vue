<template>
  <v-container>
    <v-row no-gutters>
      <v-col>
        <v-card :loading="loading">
          <v-toolbar color="primary" dark>
            <v-icon left>mdi-key</v-icon>
            <v-toolbar-title>TSIG Keys</v-toolbar-title>
          </v-toolbar>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="showGenerateDialog = true"
              prepend-icon="mdi-plus"
            >
              Generate Key
            </v-btn>
          </v-card-actions>

          <v-card-text>
            <v-data-table
              v-if="tsigKeys.length > 0"
              :headers="headers"
              :items="tsigKeys"
              dense
              class="elevation-0"
            >
              <template v-slot:[`item.algorithm`]="{ item }">
                <v-chip small :color="getAlgorithmColor(item.algorithm)">
                  {{ item.algorithm }}
                </v-chip>
              </template>

              <template v-slot:[`item.created`]="{ item }">
                {{ formatDate(item.created) }}
              </template>

              <template v-slot:[`item.actions`]="{ item }">
                <v-btn x-small icon @click="showKeyDetails(item)" class="mr-1">
                  <v-icon x-small>mdi-eye</v-icon>
                </v-btn>
                <v-btn
                  x-small
                  icon
                  @click="copyKeyToClipboard(item)"
                  class="mr-1"
                >
                  <v-icon x-small>mdi-content-copy</v-icon>
                </v-btn>
                <v-btn x-small icon color="error" @click="confirmDelete(item)">
                  <v-icon x-small>mdi-delete</v-icon>
                </v-btn>
              </template>

              <template v-slot:no-data>
                <div class="text-center py-8">
                  <v-icon large class="mb-4">mdi-key-plus</v-icon>
                  <p class="text-grey">No TSIG keys configured</p>
                </div>
              </template>
            </v-data-table>

            <div v-else class="text-center py-12">
              <v-icon large class="mb-4">mdi-key-plus</v-icon>
              <p class="text-grey mb-4">No TSIG keys configured yet</p>
              <v-btn
                color="primary"
                @click="showGenerateDialog = true"
                prepend-icon="mdi-plus"
              >
                Generate Your First Key
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Generate TSIG Key Dialog -->
    <v-dialog v-model="showGenerateDialog" max-width="500">
      <v-card>
        <v-card-title>Generate TSIG Key</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newKey.name"
            label="Key Name"
            placeholder="example.com"
            outlined
            dense
            class="mb-4"
            :error="errors.name"
            error-messages="Key name is required"
            @keyup.enter="generateKey()"
          ></v-text-field>

          <v-select
            v-model="newKey.algorithm"
            :items="algorithms"
            label="Algorithm"
            outlined
            dense
            class="mb-4"
          ></v-select>

          <p class="text-caption text-grey mb-2">Key Generation Method:</p>
          <v-btn-toggle
            v-model="newKey.generationMethod"
            mandatory
            class="mb-4"
          >
            <v-btn value="random" small>
              <v-icon small>mdi-shuffle</v-icon>
              Generate Random
            </v-btn>
            <v-btn value="manual" small>
              <v-icon small>mdi-pencil</v-icon>
              Enter Manually
            </v-btn>
          </v-btn-toggle>

          <div v-if="newKey.generationMethod === 'manual'" class="mb-4">
            <v-textarea
              v-model="newKey.secret"
              label="Secret (Base64)"
              placeholder="Base64-encoded secret"
              outlined
              dense
              rows="4"
              class="font-monospace"
            ></v-textarea>
            <p class="text-caption text-grey mt-2">
              Enter the Base64-encoded secret for this TSIG key
            </p>
          </div>

          <p
            v-if="newKey.generationMethod === 'random'"
            class="text-caption text-blue"
          >
            A random Base64-encoded secret will be generated automatically
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showGenerateDialog = false" text>Cancel</v-btn>
          <v-btn
            color="primary"
            @click="generateKey()"
            :disabled="!newKey.name.trim()"
            :loading="generating"
          >
            Generate
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Key Details Dialog -->
    <v-dialog v-model="showDetailsDialog" max-width="600">
      <v-card>
        <v-card-title>TSIG Key Details</v-card-title>
        <v-card-text>
          <div class="mb-4">
            <p class="text-caption font-weight-medium">Key Name</p>
            <code class="text-body-2">{{ selectedKey.name }}</code>
          </div>

          <v-divider class="my-4"></v-divider>

          <div class="mb-4">
            <p class="text-caption font-weight-medium">Algorithm</p>
            <v-chip small :color="getAlgorithmColor(selectedKey.algorithm)">
              {{ selectedKey.algorithm }}
            </v-chip>
          </div>

          <v-divider class="my-4"></v-divider>

          <div class="mb-4">
            <div class="d-flex justify-space-between align-center mb-2">
              <p class="text-caption font-weight-medium">Secret (Base64)</p>
              <v-btn
                x-small
                @click="copySecretToClipboard()"
                color="primary"
                prepend-icon="mdi-content-copy"
              >
                Copy
              </v-btn>
            </div>
            <v-textarea
              :value="selectedKey.secret"
              readonly
              outlined
              dense
              rows="4"
              class="font-monospace"
            ></v-textarea>
          </div>

          <v-divider class="my-4"></v-divider>

          <div class="mb-4">
            <p class="text-caption font-weight-medium">Created</p>
            <p class="text-body-2">{{ formatDate(selectedKey.created) }}</p>
          </div>

          <v-divider class="my-4"></v-divider>

          <v-expansion-panels>
            <v-expansion-panel>
              <template v-slot:header>
                <v-icon small class="mr-2">mdi-code-json</v-icon>
                Zone Configuration Reference
              </template>
              <v-expansion-panel-content>
                <p class="text-caption text-grey mb-3">
                  Use these values when configuring secondary zones or
                  conditional forwarders with TSIG authentication:
                </p>
                <v-card class="bg-grey-lighten-5 mb-3">
                  <v-card-text class="font-monospace text-caption">
                    <p class="mb-2">
                      <strong>Key Name:</strong> {{ selectedKey.name }}
                    </p>
                    <p class="mb-2">
                      <strong>Algorithm:</strong> {{ selectedKey.algorithm }}
                    </p>
                    <p><strong>Secret:</strong> (as shown above)</p>
                  </v-card-text>
                </v-card>
                <p class="text-caption text-grey">
                  When creating zones with TSIG, both the key name and secret
                  must match exactly.
                </p>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDetailsDialog = false" text>Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete TSIG Key?</v-card-title>
        <v-card-text>
          <p>
            Are you sure you want to delete the TSIG key
            <code>{{ deleteKeyName }}</code
            >?
          </p>
          <p class="text-caption text-warning mt-4">
            <v-icon x-small>mdi-alert</v-icon>
            This key will no longer be available for zone configurations. Any
            zones using this key may fail to transfer.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDeleteDialog = false" text>Cancel</v-btn>
          <v-btn color="error" @click="deleteKey()" :loading="deleting">
            Delete
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
      generating: false,
      deleting: false,
      tsigKeys: [],
      headers: [
        { text: "Key Name", value: "name", width: "40%" },
        { text: "Algorithm", value: "algorithm", width: "25%" },
        { text: "Created", value: "created", width: "25%" },
        { text: "", value: "actions", sortable: false, width: "10%" },
      ],
      algorithms: [
        { text: "HMAC-MD5", value: "hmac-md5" },
        { text: "HMAC-SHA1", value: "hmac-sha1" },
        { text: "HMAC-SHA256", value: "hmac-sha256" },
        { text: "HMAC-SHA512", value: "hmac-sha512" },
      ],
      showGenerateDialog: false,
      showDetailsDialog: false,
      showDeleteDialog: false,
      selectedKey: {},
      deleteKeyName: "",
      deleteKeyIndex: -1,
      newKey: {
        name: "",
        algorithm: "hmac-sha256",
        secret: "",
        generationMethod: "random",
      },
      errors: {
        name: false,
      },
    };
  },

  mounted() {
    this.loadTsigKeys();
  },

  methods: {
    loadTsigKeys() {
      this.loading = true;
      const axios = require("axios");
      axios
        .get(`/api/settings/get?token=${localStorage.appToken}`)
        .then((res) => {
          if (res.data.response.tsigKeys) {
            // Parse pipe-separated format: name|secret|algorithm (one per line)
            this.tsigKeys = res.data.response.tsigKeys
              .split("\n")
              .filter((line) => line.trim())
              .map((line) => {
                const parts = line.split("|");
                return {
                  name: parts[0] || "",
                  algorithm: parts[2] || "hmac-sha256",
                  secret: parts[1] || "",
                };
              });
          } else {
            this.tsigKeys = [];
          }
          this.loading = false;
        })
        .catch((e) => {
          console.log(e);
          this.tsigKeys = [];
          this.loading = false;
        });
    },

    generateKey() {
      this.errors.name = !this.newKey.name.trim();
      if (this.errors.name) {
        return;
      }

      // Check if name already exists
      if (this.tsigKeys.some((key) => key.name === this.newKey.name)) {
        this.$toast.error("TSIG key with this name already exists");
        return;
      }

      this.generating = true;

      // Generate secret if needed
      let secret = this.newKey.secret.trim();
      if (this.newKey.generationMethod === "random" || !secret) {
        // Generate random base64 secret (32 bytes = 44 chars in base64)
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        secret = btoa(String.fromCharCode(...array));
      }

      // Add new key to the list
      this.tsigKeys.push({
        name: this.newKey.name,
        algorithm: this.newKey.algorithm,
        secret: secret,
      });

      // Save to settings
      this.saveTsigKeys()
        .then(() => {
          this.$toast.success("TSIG key generated successfully");
          this.showGenerateDialog = false;
          this.resetNewKey();
          this.generating = false;
        })
        .catch((error) => {
          // Remove the key we just added if save failed
          this.tsigKeys.pop();
          this.$toast.error(
            error.response?.data?.errorMessage || "Failed to generate TSIG key",
          );
          this.generating = false;
        });
    },

    saveTsigKeys() {
      const axios = require("axios");
      const formData = new FormData();
      formData.append("token", localStorage.appToken);

      // Convert array back to pipe-separated format
      const tsigKeysValue = this.tsigKeys
        .map((key) => `${key.name}|${key.secret}|${key.algorithm}`)
        .join("\n");

      formData.append("tsigKeys", tsigKeysValue);

      return axios.post(`/api/settings/set`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },

    showKeyDetails(key) {
      this.selectedKey = { ...key };
      this.showDetailsDialog = true;
    },

    copyKeyToClipboard(key) {
      const content = `${key.name}:${key.algorithm}:${key.secret}`;
      navigator.clipboard.writeText(content);
      this.$toast.success("Key information copied to clipboard");
    },

    copySecretToClipboard() {
      navigator.clipboard.writeText(this.selectedKey.secret);
      this.$toast.success("Secret copied to clipboard");
    },

    confirmDelete(key) {
      this.selectedKey = { ...key };
      this.deleteKeyName = key.name;
      this.deleteKeyIndex = this.tsigKeys.indexOf(key);
      this.showDeleteDialog = true;
    },

    deleteKey() {
      if (this.deleteKeyIndex === -1) return;

      this.deleting = true;

      // Remove key from list
      this.tsigKeys.splice(this.deleteKeyIndex, 1);

      // Save to settings
      this.saveTsigKeys()
        .then(() => {
          this.$toast.success("TSIG key deleted successfully");
          this.showDeleteDialog = false;
          this.deleting = false;
        })
        .catch((error) => {
          // Restore the key if save failed
          this.tsigKeys.splice(this.deleteKeyIndex, 0, this.selectedKey);
          this.$toast.error(
            error.response?.data?.errorMessage || "Failed to delete TSIG key",
          );
          this.deleting = false;
        });
    },

    resetNewKey() {
      this.newKey = {
        name: "",
        algorithm: "hmac-sha256",
        secret: "",
        generationMethod: "random",
      };
      this.errors.name = false;
    },

    getAlgorithmColor(algorithm) {
      const colors = {
        "hmac-md5": "warning",
        "hmac-sha1": "warning",
        "hmac-sha256": "success",
        "hmac-sha512": "success",
      };
      return colors[algorithm] || "grey";
    },

    formatDate(date) {
      if (!date) return "Unknown";
      return moment(date).format("YYYY-MM-DD HH:mm:ss");
    },
  },
};
</script>

<style lang="scss" scoped>
.masonry {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 960px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1264px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.font-monospace {
  font-family: "Courier New", monospace;
  letter-spacing: 0.5px;
}

code {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: "Courier New", monospace;
}
</style>
