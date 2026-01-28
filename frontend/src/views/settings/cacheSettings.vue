<template>
  <v-container v-if="settings" fluid>
    <div>
      <v-card elevation="2">
        <v-toolbar color="primary" dark>
          <v-icon left>mdi-database</v-icon>
          <v-toolbar-title>Cache Size & Limits</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            label="Maximum Cache Entries"
            prepend-inner-icon="mdi-table"
            v-model="settings.cacheMaximumEntries"
            hint="Maximum number of DNS records that can be stored in the cache."
            type="number"
            suffix="entries (default 10000)"
          ></v-text-field>

          <v-alert
            border="right"
            colored-border
            type="info"
            elevation="4"
            class="mt-4"
          >
            Increasing the maximum cache size allows caching more records but
            uses more memory. Decreasing it reduces memory usage but may cause
            more cache misses.
          </v-alert>
        </v-card-text>
      </v-card>
    </div>

    <div class="my-4">
      <v-card elevation="2">
        <v-toolbar color="primary" dark>
          <v-icon left>mdi-timer</v-icon>
          <v-toolbar-title>Cache TTL Settings</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            label="Minimum Record TTL"
            prepend-inner-icon="mdi-timer-sand"
            v-model="settings.cacheMinimumRecordTtl"
            hint="Minimum TTL for cached records. Records with lower TTL will be cached with this value."
            suffix="seconds (default 10)"
            type="number"
          ></v-text-field>

          <v-text-field
            label="Maximum Record TTL"
            prepend-inner-icon="mdi-timer-lock"
            v-model="settings.cacheMaximumRecordTtl"
            hint="Maximum TTL for cached records. Records with higher TTL will be cached with this value."
            suffix="seconds (default 604800/7 days)"
            type="number"
          ></v-text-field>

          <v-text-field
            label="Negative Response TTL"
            prepend-inner-icon="mdi-cancel"
            v-model="settings.cacheNegativeRecordTtl"
            hint="TTL for caching negative responses (NXDOMAIN, NODATA)."
            suffix="seconds (default 300/5m)"
            type="number"
          ></v-text-field>

          <v-text-field
            label="Failed Query TTL"
            prepend-inner-icon="mdi-alert-circle"
            v-model="settings.cacheFailureRecordTtl"
            hint="TTL for caching failed DNS queries and server failures."
            suffix="seconds (default 10)"
            type="number"
          ></v-text-field>

          <v-alert
            border="right"
            colored-border
            type="info"
            elevation="4"
            class="mt-4"
          >
            TTL (Time To Live) controls how long records remain in the cache
            before being refreshed. Longer TTL values reduce queries but use
            more memory. Shorter values reduce memory usage but increase query
            load.
          </v-alert>
        </v-card-text>
      </v-card>
    </div>

    <div class="my-4">
      <v-card elevation="2">
        <v-toolbar color="primary" dark>
          <v-icon left>mdi-lightning-bolt</v-icon>
          <v-toolbar-title>Cache Prefetch Settings</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            label="Prefetch Eligibility"
            prepend-inner-icon="mdi-history"
            v-model="settings.cachePrefetchEligibility"
            hint="Hours before expiry when a record becomes eligible for prefetch refresh."
            suffix="hours (default 2)"
            type="number"
          ></v-text-field>

          <v-text-field
            label="Prefetch Trigger Count"
            prepend-inner-icon="mdi-counter"
            v-model="settings.cachePrefetchTrigger"
            hint="Number of queries within the sample interval that triggers automatic cache prefetch."
            suffix="queries (default 9)"
            type="number"
          ></v-text-field>

          <v-text-field
            label="Prefetch Sample Interval"
            prepend-inner-icon="mdi-clock"
            v-model="settings.cachePrefetchSampleIntervalInMinutes"
            hint="Time interval used to measure query frequency for determining prefetch eligibility."
            suffix="minutes (default 5)"
            type="number"
          ></v-text-field>

          <v-text-field
            label="Prefetch Eligibility Threshold"
            prepend-inner-icon="mdi-speedometer"
            v-model="settings.cachePrefetchSampleEligibilityHitsPerHour"
            hint="Minimum number of hits per hour required for a record to be eligible for prefetch."
            suffix="hits/hour (default 30)"
            type="number"
          ></v-text-field>

          <v-alert
            border="right"
            colored-border
            type="info"
            elevation="4"
            class="mt-4"
          >
            Cache prefetch automatically refreshes frequently-accessed records
            before they expire, improving response times and reducing query
            load. Lower prefetch trigger counts make the system more aggressive
            about prefetching.
          </v-alert>
        </v-card-text>
      </v-card>
    </div>

    <div class="my-4">
      <v-card elevation="2">
        <v-toolbar color="primary" dark>
          <v-icon left>mdi-archive-outline</v-icon>
          <v-toolbar-title>Cache Persistence & Stale</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-switch
            v-model="settings.saveCache"
            prepend-icon="mdi-content-save"
            label="Save Cache to Disk"
          ></v-switch>
          <p class="text-caption">
            When enabled, the DNS cache is persisted to disk and restored when
            the server restarts, improving performance on startup.
          </p>

          <v-divider class="my-4"></v-divider>

          <v-switch
            v-model="settings.serveStale"
            prepend-icon="mdi-history"
            label="Serve Stale Cached Records"
          ></v-switch>
          <p class="text-caption">
            When enabled, allows serving expired cached records if the recursive
            resolver is unavailable, improving reliability.
          </p>

          <v-text-field
            v-if="settings.serveStale"
            label="Stale Record Maximum Age"
            prepend-inner-icon="mdi-timer-sand"
            v-model="settings.serveStaleTtl"
            hint="Maximum age of a record that can be served as stale."
            suffix="seconds (default 259200/3 days)"
            type="number"
          ></v-text-field>

          <v-text-field
            v-if="settings.serveStale"
            label="Stale Record Response TTL"
            prepend-inner-icon="mdi-timer-outline"
            v-model="settings.serveStaleAnswerTtl"
            hint="TTL value assigned to stale records when served to clients."
            suffix="seconds (default 30)"
            type="number"
          ></v-text-field>

          <v-text-field
            v-if="settings.serveStale"
            label="Stale Record Max Wait Time"
            prepend-inner-icon="mdi-clock-fast"
            v-model="settings.serveStaleMaxWaitTime"
            hint="Maximum time to wait for refreshing a stale record before serving it."
            suffix="seconds (default 1800/30m)"
            type="number"
          ></v-text-field>

          <v-alert
            border="right"
            colored-border
            type="info"
            elevation="4"
            class="mt-4"
          >
            Serving stale records improves availability when the recursive
            resolver is temporarily unavailable, but clients will receive
            expired data.
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
          <v-btn
            v-can="{ section: 'Settings', action: 'modify' }"
            color="warning"
            class="ma-2"
            @click="flushCache()"
          >
            <v-icon left>mdi-trash-can-outline</v-icon>
            Flush Cache
          </v-btn>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script>
const axios = require("axios");
export default {
  name: "cacheSettings",
  data() {
    return {
      settings: undefined,
    };
  },
  methods: {
    getSettings() {
      axios
        .get(`/api/settings/get?token=${localStorage.appToken}`)
        .then((response) => {
          const s = response.data.response;

          // Initialize missing fields with defaults
          if (s.cacheMaximumEntries === undefined)
            s.cacheMaximumEntries = 10000;
          if (s.cacheMinimumRecordTtl === undefined)
            s.cacheMinimumRecordTtl = 10;
          if (s.cacheMaximumRecordTtl === undefined)
            s.cacheMaximumRecordTtl = 604800;
          if (s.cacheNegativeRecordTtl === undefined)
            s.cacheNegativeRecordTtl = 300;
          if (s.cacheFailureRecordTtl === undefined)
            s.cacheFailureRecordTtl = 10;
          if (s.cachePrefetchEligibility === undefined)
            s.cachePrefetchEligibility = 2;
          if (s.cachePrefetchTrigger === undefined) s.cachePrefetchTrigger = 9;
          if (s.cachePrefetchSampleIntervalInMinutes === undefined)
            s.cachePrefetchSampleIntervalInMinutes = 5;
          if (s.cachePrefetchSampleEligibilityHitsPerHour === undefined)
            s.cachePrefetchSampleEligibilityHitsPerHour = 30;
          if (s.saveCache === undefined) s.saveCache = true;
          if (s.serveStale === undefined) s.serveStale = true;
          if (s.serveStaleTtl === undefined) s.serveStaleTtl = 259200;
          if (s.serveStaleAnswerTtl === undefined) s.serveStaleAnswerTtl = 30;
          if (s.serveStaleMaxWaitTime === undefined)
            s.serveStaleMaxWaitTime = 1800;

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
      // Convert numeric fields
      const payload = { ...this.settings };
      payload.cacheMaximumEntries =
        parseInt(payload.cacheMaximumEntries) || 10000;
      payload.cacheMinimumRecordTtl =
        parseInt(payload.cacheMinimumRecordTtl) || 10;
      payload.cacheMaximumRecordTtl =
        parseInt(payload.cacheMaximumRecordTtl) || 604800;
      payload.cacheNegativeRecordTtl =
        parseInt(payload.cacheNegativeRecordTtl) || 300;
      payload.cacheFailureRecordTtl =
        parseInt(payload.cacheFailureRecordTtl) || 10;
      payload.cachePrefetchEligibility =
        parseInt(payload.cachePrefetchEligibility) || 2;
      payload.cachePrefetchTrigger =
        parseInt(payload.cachePrefetchTrigger) || 9;
      payload.cachePrefetchSampleIntervalInMinutes =
        parseInt(payload.cachePrefetchSampleIntervalInMinutes) || 5;
      payload.cachePrefetchSampleEligibilityHitsPerHour =
        parseInt(payload.cachePrefetchSampleEligibilityHitsPerHour) || 30;
      payload.serveStaleTtl = parseInt(payload.serveStaleTtl) || 259200;
      payload.serveStaleAnswerTtl = parseInt(payload.serveStaleAnswerTtl) || 30;
      payload.serveStaleMaxWaitTime =
        parseInt(payload.serveStaleMaxWaitTime) || 1800;

      // Filter out null or undefined values that could cause validation errors
      Object.keys(payload).forEach((key) => {
        if (payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });

      const formData = new FormData();
      Object.keys(payload).forEach((key) => {
        formData.append(key, payload[key]);
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

    flushCache() {
      this.$confirm(
        "Are you sure you want to flush the entire DNS cache? This will clear all cached records and may cause increased query load initially.",
        "Flush Cache",
        {
          confirmButtonText: "Flush",
          cancelButtonText: "Cancel",
          type: "warning",
        },
      )
        .then(() => {
          const formData = new FormData();
          formData.append("token", localStorage.appToken);
          axios
            .post(`/api/cache/flush`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })
            .then((res) => {
              if (res.data.status === "ok") {
                this.$toast.success("Cache flushed successfully", {
                  timeout: 3000,
                  closeOnClick: true,
                });
              } else {
                throw new Error(res.data.errorMessage);
              }
            })
            .catch((e) => {
              this.$toast.error(`Error flushing cache: ${e}`, {
                timeout: 5000,
                closeOnClick: true,
              });
              console.log(e);
            });
        })
        .catch(() => {
          // User cancelled the action
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
</style>
