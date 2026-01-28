<template>
  <!-- eslint-disable vue/valid-v-slot -->
  <div class="cache-container">
    <!-- Search & Navigation Bar -->
    <v-card class="mb-4" elevation="2">
      <v-card-text class="pa-6">
        <v-row align="center" class="mb-2">
          <v-col cols="12" sm="6">
            <v-text-field
              v-if="listingType == 'cache'"
              v-model="searchTerm"
              prepend-icon="mdi-magnify"
              placeholder="Search for a domain (e.g., google.com)"
              outlined
              dense
              clearable
              @keydown.enter="searchZone"
              @click:prepend="searchZone"
            ></v-text-field>
            <v-text-field
              v-else
              v-can="{
                section: listingType === 'allowed' ? 'Allowed' : 'Blocked',
                action: 'modify',
              }"
              v-model="searchTerm"
              :prepend-icon="
                listingType === 'allowed'
                  ? 'mdi-plus-circle'
                  : 'mdi-block-helper'
              "
              :placeholder="
                listingType === 'allowed'
                  ? 'Add allowed zone'
                  : 'Add blocked zone'
              "
              outlined
              dense
              clearable
              @keydown.enter="
                listingType === 'allowed' ? allowZone() : blockZone()
              "
              @click:prepend="
                listingType === 'allowed' ? allowZone() : blockZone()
              "
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" class="text-right">
            <v-btn-group dense>
              <v-btn
                icon
                small
                @click="getZones"
                :loading="loading"
                title="Refresh"
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
              <v-btn
                icon
                small
                v-if="selected != ''"
                @click="goBack"
                title="Go back to parent domain"
              >
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>
              <v-btn
                v-can="{ section: sectionName, action: 'delete' }"
                icon
                small
                color="error"
                @click="flushZone"
                v-if="selected == ''"
                title="Flush entire cache"
              >
                <v-icon>mdi-trash-can</v-icon>
              </v-btn>
            </v-btn-group>
          </v-col>
        </v-row>

        <!-- Breadcrumb Navigation -->
        <v-breadcrumbs :items="breadcrumbs" class="pa-0 mt-2">
          <template #item="{ item }">
            <v-breadcrumbs-item
              :href="item.href"
              :disabled="item.disabled"
              @click.prevent="item.disabled ? null : navigateTo(item.domain)"
              class="breadcrumb-item"
            >
              {{ item.text }}
            </v-breadcrumbs-item>
          </template>
        </v-breadcrumbs>
      </v-card-text>
    </v-card>

    <!-- Two Column Layout / Full Width for Deep Navigation -->
    <v-row class="ma-0">
      <!-- Subdomains List (Only show if there are zones) -->
      <v-col
        :cols="zones.length > 0 ? 12 : 0"
        :md="zones.length > 0 ? 4 : 0"
        class="pr-2"
        v-if="zones.length > 0"
      >
        <v-card class="mb-4" elevation="2">
          <v-card-title class="headline font-weight-bold pa-4">
            <v-icon class="mr-2">mdi-folder-multiple</v-icon>
            Subdomains
          </v-card-title>
          <v-divider></v-divider>
          <v-list dense class="py-0">
            <v-list-item
              v-for="zone in zones"
              :key="zone"
              @click="buttonAction(zone)"
              class="domain-item"
            >
              <v-list-item-icon>
                <v-icon color="primary">mdi-folder</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="font-weight-500">
                  {{ zone }}
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon small color="primary">mdi-chevron-right</v-icon>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Records Display (Full width when no zones, 2/3 when zones exist) -->
      <v-col
        :cols="12"
        :md="zones.length > 0 ? 8 : 12"
        :class="zones.length > 0 ? 'pl-2' : ''"
      >
        <!-- Records Card -->
        <v-card v-if="records.length > 0" elevation="2">
          <v-card-title
            class="headline font-weight-bold d-flex align-center justify-space-between pa-4 flex-wrap"
          >
            <span class="d-flex align-center">
              <v-icon class="mr-2">{{ viewIcon }}</v-icon>
              {{ viewTitle }}
              <span class="text-subtitle2 ml-3 grey--text"
                >({{ selected || "ROOT" }})</span
              >
            </span>
            <v-btn
              v-if="history.length > 0"
              v-can="{ section: sectionName, action: 'delete' }"
              small
              outlined
              color="warning"
              @click="deleteZone"
              class="mt-2 mt-md-0"
            >
              <v-icon left small>mdi-delete</v-icon>
              Delete
            </v-btn>
          </v-card-title>
          <v-divider></v-divider>

          <!-- Enhanced Records Display -->
          <div class="records-list pa-2">
            <v-card
              v-for="(record, idx) in records"
              :key="idx"
              class="record-card ma-2"
              elevation="1"
            >
              <v-card-text class="pa-3">
                <!-- Header Row -->
                <div
                  class="d-flex align-center justify-space-between mb-3 flex-wrap"
                >
                  <div class="d-flex align-center">
                    <v-icon
                      :color="getRecordTypeColor(record.type)"
                      class="mr-2"
                    >
                      {{ getRecordTypeIcon(record.type) }}
                    </v-icon>
                    <span class="record-name-header">{{ record.name }}</span>
                  </div>
                  <div class="d-flex align-center gap-6 flex-wrap">
                    <v-chip
                      small
                      :color="getRecordTypeColor(record.type)"
                      text-color="white"
                    >
                      {{ record.type }}
                    </v-chip>
                    <v-chip small label outlined>
                      <v-icon left x-small>mdi-clock-outline</v-icon>
                      {{ record.ttl }}
                    </v-chip>
                    <v-chip
                      v-if="
                        record.dnssecStatus && record.dnssecStatus !== 'Unknown'
                      "
                      small
                      :color="getDnssecStatusColor(record.dnssecStatus)"
                      text-color="white"
                    >
                      <v-icon left x-small>mdi-shield-check</v-icon>
                      {{ record.dnssecStatus }}
                    </v-chip>
                  </div>
                </div>

                <!-- Record Data -->
                <div class="record-data-section mb-2">
                  <div class="record-data-label">Record Data</div>
                  <div class="record-data-content">
                    <div class="record-data-pre">
                      {{ formatRecordData(record.rData) }}
                    </div>
                  </div>
                </div>

                <!-- Additional Info Grid -->
                <v-row dense v-if="hasAdditionalInfo(record)" class="mt-2">
                  <!-- Last Used -->
                  <v-col cols="12" sm="6" v-if="record.lastUsedOn">
                    <div class="info-item">
                      <v-icon small color="grey darken-1" class="mr-1"
                        >mdi-clock-check</v-icon
                      >
                      <span class="info-label">Last Used:</span>
                      <span class="info-value">{{
                        formatTimestamp(record.lastUsedOn)
                      }}</span>
                    </div>
                  </v-col>

                  <!-- EDNS Client Subnet -->
                  <v-col cols="12" sm="6" v-if="record.eDnsClientSubnet">
                    <div class="info-item">
                      <v-icon small color="blue" class="mr-1"
                        >mdi-ip-network</v-icon
                      >
                      <span class="info-label">Client Subnet:</span>
                      <span class="info-value">{{
                        record.eDnsClientSubnet
                      }}</span>
                    </div>
                  </v-col>

                  <!-- Response Metadata -->
                  <v-col cols="12" v-if="record.responseMetadata">
                    <v-expansion-panels flat>
                      <v-expansion-panel class="metadata-panel">
                        <v-expansion-panel-header class="py-1 px-2">
                          <div class="d-flex align-center">
                            <v-icon small color="indigo" class="mr-2"
                              >mdi-server-network</v-icon
                            >
                            <span class="info-label">Response Metadata</span>
                          </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content class="pt-2">
                          <v-simple-table dense>
                            <tbody>
                              <tr v-if="record.responseMetadata.nameServer">
                                <td class="meta-label">Name Server</td>
                                <td class="meta-value">
                                  {{ record.responseMetadata.nameServer }}
                                </td>
                              </tr>
                              <tr v-if="record.responseMetadata.protocol">
                                <td class="meta-label">Protocol</td>
                                <td class="meta-value">
                                  <v-chip
                                    x-small
                                    :color="
                                      getProtocolColor(
                                        record.responseMetadata.protocol,
                                      )
                                    "
                                  >
                                    {{ record.responseMetadata.protocol }}
                                  </v-chip>
                                </td>
                              </tr>
                              <tr v-if="record.responseMetadata.datagramSize">
                                <td class="meta-label">Datagram Size</td>
                                <td class="meta-value">
                                  {{ record.responseMetadata.datagramSize }}
                                </td>
                              </tr>
                              <tr v-if="record.responseMetadata.roundTripTime">
                                <td class="meta-label">Round Trip Time</td>
                                <td class="meta-value">
                                  {{ record.responseMetadata.roundTripTime }}
                                </td>
                              </tr>
                            </tbody>
                          </v-simple-table>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-col>

                  <!-- Name Server Metadata (for NS records) -->
                  <v-col cols="12" v-if="record.nameServerMetadata">
                    <v-expansion-panels flat>
                      <v-expansion-panel class="metadata-panel">
                        <v-expansion-panel-header class="py-1 px-2">
                          <div class="d-flex align-center">
                            <v-icon small color="green" class="mr-2"
                              >mdi-chart-line</v-icon
                            >
                            <span class="info-label"
                              >Name Server Statistics</span
                            >
                          </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content class="pt-2">
                          <v-simple-table dense>
                            <tbody>
                              <tr v-if="record.nameServerMetadata.totalQueries">
                                <td class="meta-label">Total Queries</td>
                                <td class="meta-value">
                                  {{ record.nameServerMetadata.totalQueries }}
                                </td>
                              </tr>
                              <tr v-if="record.nameServerMetadata.answerRate">
                                <td class="meta-label">Answer Rate</td>
                                <td class="meta-value">
                                  {{ record.nameServerMetadata.answerRate }}
                                </td>
                              </tr>
                              <tr
                                v-if="
                                  record.nameServerMetadata
                                    .smoothedRoundTripTime
                                "
                              >
                                <td class="meta-label">Smoothed RTT</td>
                                <td class="meta-value">
                                  {{
                                    record.nameServerMetadata
                                      .smoothedRoundTripTime
                                  }}
                                </td>
                              </tr>
                              <tr
                                v-if="
                                  record.nameServerMetadata
                                    .smoothedPenaltyRoundTripTime
                                "
                              >
                                <td class="meta-label">Smoothed Penalty RTT</td>
                                <td class="meta-value">
                                  {{
                                    record.nameServerMetadata
                                      .smoothedPenaltyRoundTripTime
                                  }}
                                </td>
                              </tr>
                              <tr
                                v-if="
                                  record.nameServerMetadata.netRoundTripTime
                                "
                              >
                                <td class="meta-label">Net RTT</td>
                                <td class="meta-value">
                                  {{
                                    record.nameServerMetadata.netRoundTripTime
                                  }}
                                </td>
                              </tr>
                            </tbody>
                          </v-simple-table>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-col>

                  <!-- Glue Records -->
                  <v-col
                    cols="12"
                    v-if="record.glueRecords && record.glueRecords.length > 0"
                  >
                    <div class="info-section">
                      <div class="info-section-header">
                        <v-icon small color="purple" class="mr-1"
                          >mdi-link-variant</v-icon
                        >
                        <span class="info-label"
                          >Glue Records ({{ record.glueRecords.length }})</span
                        >
                      </div>
                      <div class="glue-records-list">
                        <v-chip
                          v-for="(glue, gIdx) in record.glueRecords"
                          :key="gIdx"
                          small
                          outlined
                          class="ma-2"
                        >
                          {{ glue }}
                        </v-chip>
                      </div>
                    </div>
                  </v-col>

                  <!-- DNSSEC Records -->
                  <v-col
                    cols="12"
                    v-if="
                      record.dnssecRecords && record.dnssecRecords.length > 0
                    "
                  >
                    <v-expansion-panels flat>
                      <v-expansion-panel class="metadata-panel">
                        <v-expansion-panel-header class="py-1 px-2">
                          <div class="d-flex align-center">
                            <v-icon small color="orange" class="mr-2"
                              >mdi-shield-lock</v-icon
                            >
                            <span class="info-label"
                              >DNSSEC Records ({{
                                record.dnssecRecords.length
                              }})</span
                            >
                          </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content class="pt-2">
                          <div class="dnssec-records-list">
                            <v-data-table
                              :headers="dnssecHeaders"
                              :items="formatDnssecRecords(record.dnssecRecords)"
                              hide-default-footer
                              dense
                              class="dnssec-table"
                            >
                              <template v-slot:[`item.type`]="{ item }">
                                <v-chip
                                  small
                                  color="primary"
                                  text-color="white"
                                >
                                  {{ item.type }}
                                </v-chip>
                              </template>
                              <template v-slot:[`item.data`]="{ item }">
                                <code class="dnssec-data-field">{{
                                  item.data
                                }}</code>
                              </template>
                            </v-data-table>
                          </div>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </div>
        </v-card>

        <!-- Empty State for Records -->
        <v-card
          v-else-if="selected && !loading"
          class="empty-state"
          elevation="1"
        >
          <v-card-text class="text-center pa-12">
            <v-icon size="48" color="primary" class="mb-4">
              mdi-inbox-multiple
            </v-icon>
            <h3 class="text-subtitle1 font-weight-bold mb-2">
              No records found
            </h3>
            <p class="text-body2">
              No DNS records cached for <strong>{{ selected }}</strong>
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-card
      v-if="zones.length === 0 && records.length === 0 && !loading"
      class="empty-state"
      elevation="1"
    >
      <v-card-text class="text-center pa-12">
        <v-icon size="72" color="primary" class="mb-4">mdi-magnify</v-icon>
        <h3 class="text-subtitle1 font-weight-bold mb-2">
          {{
            listingType === "cache"
              ? "No cached data found"
              : "No data available"
          }}
        </h3>
        <p class="text-body2 text-lighten-1">
          {{
            listingType === "cache"
              ? "Search for a domain to view cached DNS records"
              : "No items in this list"
          }}
        </p>
      </v-card-text>
    </v-card>

    <!-- Loading State -->
    <v-card
      v-if="loading && zones.length === 0 && records.length === 0"
      elevation="0"
      outlined
    >
      <v-card-text class="text-center pa-8">
        <v-progress-circular
          indeterminate
          color="primary"
          class="mb-4"
        ></v-progress-circular>
        <p class="text-body2">Loading {{ listingType }} data...</p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selected: "",
      records: [],
      zones: [],
      history: [],
      loading: true,
      searchTerm: "",
      dnssecHeaders: [
        { text: "Type", value: "type", width: "100px" },
        { text: "Parameters", value: "params" },
        { text: "Data", value: "data" },
      ],
    };
  },
  props: {
    listingType: String,
    inputText: String,
  },
  computed: {
    sectionName() {
      const map = { cache: "Cache", allowed: "Allowed", blocked: "Blocked" };
      return map[this.listingType] || "";
    },
    breadcrumbs() {
      const items = [
        {
          text: "ROOT",
          domain: "",
          disabled: !this.selected,
        },
      ];

      if (this.selected) {
        const parts = this.selected.split(".");
        let domain = "";
        for (let i = parts.length - 1; i >= 0; i--) {
          domain = i === parts.length - 1 ? parts[i] : `${parts[i]}.${domain}`;
          items.push({
            text: domain,
            domain: domain,
            disabled: domain === this.selected,
          });
        }
      }

      return items;
    },
    viewTitle() {
      const map = {
        cache: "Cached Records",
        allowed: "Allowed Zones",
        blocked: "Blocked Zones",
      };
      return map[this.listingType] || "Records";
    },
    viewIcon() {
      const map = {
        cache: "mdi-database",
        allowed: "mdi-checkbox-marked-circle-outline",
        blocked: "mdi-close-box-multiple-outline",
      };
      return map[this.listingType] || "mdi-database";
    },
    recordHeaders() {
      return [
        { text: "Name", value: "name", width: "35%" },
        { text: "Type", value: "type", width: "15%" },
        { text: "TTL", value: "ttl", width: "20%" },
        { text: "Value", value: "rData", width: "30%" },
      ];
    },
  },
  mounted() {
    console.log(`zoneListing mounted with listingType: ${this.listingType}`);
    this.getZones();
  },
  methods: {
    formatDnssecRecords(records) {
      return records.map((record) => {
        const parts = record.trim().split(/\s+/);
        if (parts.length === 0) return { type: "", params: "", data: record };

        const type = parts[0];
        let params = "";
        let data = "";

        if (type === "DNSKEY") {
          // DNSKEY flags protocol algorithm [key data]
          params = parts.slice(1, 4).join(" ");
          data = parts.slice(4).join(" ");
        } else if (type === "DS") {
          // DS keytag algorithm digesttype [digest]
          params = parts.slice(1, 4).join(" ");
          data = parts.slice(4).join(" ");
        } else if (type === "RRSIG") {
          // RRSIG type-covered algorithm labels original-ttl sig-expiration sig-inception keytag signer-name [signature]
          params = parts.slice(1, 8).join(" ");
          data = parts.slice(8).join(" ");
        } else {
          // Generic format
          params = parts.slice(1, -1).join(" ");
          data = parts[parts.length - 1] || "";
        }

        return {
          type,
          params: params || "—",
          data: data || "—",
        };
      });
    },
    navigateTo(domain) {
      this.selected = domain;
      this.history = [domain];
      this.getZones();
    },
    searchZone() {
      if (!this.searchTerm.trim()) return;
      this.selected = this.searchTerm;
      this.history.push(this.searchTerm);
      this.getZones();
    },
    buttonAction(zone) {
      this.selected = zone;
      this.history.push(zone);
      this.getZones();
    },
    goBack() {
      this.history.pop();
      this.selected = this.history[this.history.length - 1] || "";
      this.getZones(true);
    },
    deleteZone() {
      let that = this;
      const typeLabel =
        this.listingType === "cache"
          ? "Cached Domain"
          : this.listingType === "allowed"
          ? "Allowed Zone"
          : "Blocked Zone";
      const recordsLabel =
        this.listingType === "cache"
          ? "cached records"
          : this.listingType === "allowed"
          ? "allowed zone"
          : "blocked zone";
      this.$swal
        .fire({
          title: `Delete ${typeLabel}?`,
          text: that.selected,
          html: `<p>This will delete ${recordsLabel} for <strong>${that.selected}</strong></p>`,
          icon: "warning",
          confirmButtonColor: "#FFA726",
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
          showCancelButton: true,
          showCloseButton: true,
        })
        .then(function (result) {
          if (result.isConfirmed) {
            that.$axios
              .post(
                `/api/${that.listingType}/delete?token=${localStorage.appToken}&domain=${that.selected}`,
              )
              .then(function (response) {
                if (response.data.status == "ok") {
                  that.$swal.fire({
                    title: "Deleted",
                    text: `${
                      recordsLabel.charAt(0).toUpperCase() +
                      recordsLabel.slice(1)
                    } for ${that.selected} has been removed`,
                    icon: "success",
                  });
                  that.goBack();
                } else {
                  that.$swal.fire({
                    title: "Error",
                    text: response.data.errorMessage || "Failed to delete zone",
                    icon: "error",
                  });
                }
              })
              .catch(function (error) {
                that.$swal.fire({
                  title: "Error",
                  text: error.message || "Failed to delete zone",
                  icon: "error",
                });
              });
          }
        });
    },
    allowZone() {
      let that = this;
      if (!this.searchTerm.trim()) {
        this.$swal.fire({
          title: "Please enter a domain",
          icon: "warning",
        });
        return;
      }
      this.$axios
        .post(
          `/api/${that.listingType}/add?token=${localStorage.appToken}&domain=${this.searchTerm}`,
        )
        .then(() => {
          this.searchTerm = "";
          this.getZones();
          this.$swal.fire({
            title: "Success",
            text: `Domain added to allowed zones`,
            icon: "success",
          });
        })
        .catch((error) => {
          this.$swal.fire({
            title: "Error",
            text: error.message || "Failed to add zone",
            icon: "error",
          });
        });
    },
    blockZone() {
      let that = this;
      if (!this.searchTerm.trim()) {
        this.$swal.fire({
          title: "Please enter a domain",
          icon: "warning",
        });
        return;
      }
      this.$axios
        .post(
          `/api/${that.listingType}/add?token=${localStorage.appToken}&domain=${this.searchTerm}`,
        )
        .then(() => {
          this.searchTerm = "";
          this.getZones();
          this.$swal.fire({
            title: "Success",
            text: `Domain added to blocked zones`,
            icon: "success",
          });
        })
        .catch((error) => {
          this.$swal.fire({
            title: "Error",
            text: error.message || "Failed to add zone",
            icon: "error",
          });
        });
    },
    flushZone() {
      let that = this;
      const flushTitle =
        this.listingType === "cache"
          ? "Flush Entire DNS Cache?"
          : this.listingType === "allowed"
          ? "Clear All Allowed Zones?"
          : "Clear All Blocked Zones?";
      const flushMessage =
        this.listingType === "cache"
          ? "<p>This will delete <strong>all</strong> cached DNS records from the server</p>"
          : this.listingType === "allowed"
          ? "<p>This will remove <strong>all</strong> allowed zones from the server</p>"
          : "<p>This will remove <strong>all</strong> blocked zones from the server</p>";
      const confirmText =
        this.listingType === "cache" ? "Flush All" : "Clear All";
      const successTitle =
        this.listingType === "cache"
          ? "Cache Flushed"
          : this.listingType === "allowed"
          ? "Allowed Zones Cleared"
          : "Blocked Zones Cleared";
      const successMessage =
        this.listingType === "cache"
          ? "All DNS cache has been cleared successfully"
          : this.listingType === "allowed"
          ? "All allowed zones have been removed successfully"
          : "All blocked zones have been removed successfully";
      this.$swal
        .fire({
          title: flushTitle,
          html: flushMessage,
          icon: "warning",
          confirmButtonColor: "#EF5350",
          confirmButtonText: confirmText,
          cancelButtonText: "Cancel",
          showCancelButton: true,
          showCloseButton: true,
        })
        .then(function (result) {
          if (result.isConfirmed) {
            that.$axios
              .post(
                `/api/${that.listingType}/flush?token=${localStorage.appToken}`,
              )
              .then(function (response) {
                if (response.data.status == "ok") {
                  that.$swal
                    .fire({
                      title: successTitle,
                      text: successMessage,
                      icon: "success",
                    })
                    .then(() => {
                      that.selected = "";
                      that.history = [];
                      that.getZones();
                    });
                } else {
                  that.$swal.fire({
                    title: "Error",
                    text: response.data.errorMessage || "Failed to flush cache",
                    icon: "error",
                  });
                }
              })
              .catch(function (error) {
                that.$swal.fire({
                  title: "Error",
                  text: error.message || "Failed to flush cache",
                  icon: "error",
                });
              });
          }
        });
    },
    hasAdditionalInfo(record) {
      return (
        record.lastUsedOn ||
        record.eDnsClientSubnet ||
        record.responseMetadata ||
        record.nameServerMetadata ||
        (record.glueRecords && record.glueRecords.length > 0) ||
        (record.dnssecRecords && record.dnssecRecords.length > 0)
      );
    },
    formatRecordData(rData) {
      return JSON.stringify(rData, null, 2);
    },
    formatTimestamp(timestamp) {
      try {
        const date = new Date(timestamp);
        return date.toLocaleString();
      } catch (e) {
        return timestamp;
      }
    },
    getRecordTypeIcon(type) {
      const icons = {
        A: "mdi-alpha-a-circle",
        AAAA: "mdi-alpha-a-circle",
        CNAME: "mdi-link-variant",
        MX: "mdi-email",
        NS: "mdi-server",
        TXT: "mdi-text",
        SOA: "mdi-database-cog",
        SRV: "mdi-server-network",
        PTR: "mdi-arrow-left-circle",
        CAA: "mdi-certificate",
        DNSKEY: "mdi-key",
        DS: "mdi-shield-key",
        RRSIG: "mdi-file-sign",
        NSEC: "mdi-lock",
        NSEC3: "mdi-lock-check",
      };
      return icons[type] || "mdi-file-document";
    },
    getRecordTypeColor(type) {
      const colors = {
        A: "#667eea",
        AAAA: "#764ba2",
        CNAME: "#f093fb",
        MX: "#4facfe",
        NS: "#43e97b",
        TXT: "#fa709a",
        SOA: "#feca57",
        SRV: "#48dbfb",
        PTR: "#ff6348",
        CAA: "#1dd1a1",
        DNSKEY: "#ee5a6f",
        DS: "#c44569",
        RRSIG: "#f368e0",
        NSEC: "#ff9ff3",
        NSEC3: "#54a0ff",
      };
      return colors[type] || "#667eea";
    },
    getDnssecStatusColor(status) {
      const colors = {
        Secure: "success",
        Insecure: "warning",
        Bogus: "error",
        Indeterminate: "grey",
      };
      return colors[status] || "grey";
    },
    getProtocolColor(protocol) {
      const colors = {
        Udp: "blue",
        Tcp: "green",
        Tls: "purple",
        Https: "indigo",
        Quic: "orange",
      };
      return colors[protocol] || "grey";
    },
    getZones(up) {
      this.searchTerm = this.selected;
      let that = this;
      this.loading = true;
      const token = localStorage.appToken;
      const url = `/api/${that.listingType}/list?token=${token}&domain=${
        this.selected
      }${up ? "&direction=up" : ""}`;
      console.log(`Fetching zones from: ${url}`);
      this.$axios
        .post(url)
        .then(function (response) {
          console.log(
            `Response status: ${response.data.status}`,
            response.data,
          );
          if (response.data.status == "ok") {
            that.records = response.data.response.records || [];
            that.zones = response.data.response.zones || [];
            that.selected = response.data.response.domain;
          } else {
            console.error("API returned non-ok status:", response.data);
          }
        })
        .catch(function (error) {
          console.error(`Error fetching ${that.listingType} zones:`, error);
          that.$swal.fire({
            title: "Error",
            text: `Failed to fetch ${that.listingType} data: ${error.message}`,
            icon: "error",
          });
        })
        .finally(function () {
          that.loading = false;
        });
      return;
    },
  },
};
</script>

<style lang="scss" scoped>
.cache-container {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.domain-item {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px !important;

  &:hover {
    background-color: rgba(102, 126, 234, 0.1);
    transform: translateX(4px);
  }

  :deep(.v-list-item__content) {
    padding: 8px 0;
  }
}

.record-item {
  border-radius: 8px !important;
  margin-bottom: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(102, 126, 234, 0.08);
  }

  :deep(.v-list-item__content) {
    padding: 8px 0;
  }
}

.records-list {
  max-height: 800px;
  overflow-y: auto;
}

.record-card {
  border-radius: 12px !important;
  border-left: 4px solid #667eea !important;
  transition: all 0.3s ease;
  background: linear-gradient(
    to right,
    rgba(102, 126, 234, 0.02) 0%,
    transparent 100%
  );

  &:hover {
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15) !important;
    transform: translateX(2px);
  }
}

.record-name-header {
  font-size: 16px;
  font-weight: 700;
  color: #1a202c;
  word-break: break-word;
}

.theme--dark .record-name-header {
  color: #f7fafc;
}

.record-data-section {
  background: rgba(102, 126, 234, 0.08);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.record-data-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #5568d3;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.record-data-content {
  overflow-x: auto;
}

.record-data-pre {
  margin: 0;
  padding: 12px;
  font-family: "Monaco", "Menlo", "Courier New", monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #1a202c;
  font-weight: 500;
  white-space: pre-wrap;
  word-break: break-word;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow-x: auto;
  display: block;
}

.theme--dark .record-data-pre {
  color: #f7fafc;
  background-color: #2d3748;
  border-color: #4a5568;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: rgba(102, 126, 234, 0.04);
  border-radius: 6px;
  flex-wrap: wrap;
}

.info-label {
  font-weight: 700;
  font-size: 12px;
  color: #5568d3;
}

.info-value {
  font-size: 12px;
  color: #1a202c;
  font-weight: 500;
  font-family: "Monaco", "Menlo", "Courier New", monospace;
}

.theme--dark .info-value {
  color: #f7fafc;
}

.info-section {
  padding: 12px;
  background: rgba(102, 126, 234, 0.03);
  border-radius: 8px;
  border: 1px dashed rgba(102, 126, 234, 0.2);
}

.info-section-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 600;
}

.glue-records-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.metadata-panel {
  background: rgba(102, 126, 234, 0.02) !important;
  border: 1px solid rgba(102, 126, 234, 0.1) !important;
  border-radius: 8px !important;
}

.meta-label {
  font-weight: 700 !important;
  font-size: 12px !important;
  color: #5568d3 !important;
  width: 180px !important;
}

.meta-value {
  font-family: "Monaco", "Menlo", "Courier New", monospace !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  color: #1a202c !important;
}

.theme--dark .meta-value {
  color: #f7fafc !important;
}

.dnssec-records-list {
  max-height: 300px;
  overflow-y: auto;
}

.dnssec-record-item {
  padding: 8px;
  margin-bottom: 4px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  border-left: 3px solid #ff9800;
}

.dnssec-code {
  font-family: "Monaco", "Menlo", "Courier New", monospace;
  font-size: 12px;
  font-weight: 500;
  color: #1a202c;
  word-break: break-all;
  white-space: pre-wrap;
  display: block;
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  overflow-x: auto;
  margin: 8px 0;
}

.dnssec-data-field {
  font-family: "Monaco", "Menlo", "Courier New", monospace;
  font-size: 11px;
  color: #1a202c;
  word-break: break-all;
  background-color: #f9f9f9;
  padding: 4px 8px;
  border-radius: 3px;
  border: 1px solid #e0e0e0;
  display: inline-block;
  max-width: 100%;
}

.dnssec-table {
  background: transparent;
}

.theme--dark .dnssec-code {
  color: #f7fafc;
  background-color: #2d3748;
  border-color: #4a5568;
}

.theme--dark .dnssec-data-field {
  color: #f7fafc;
  background-color: #2d3748;
  border-color: #4a5568;
}

.record-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 4px 0;
  width: 100%;

  .record-name {
    font-weight: 600;
    color: #2c3e50;
    min-width: 150px;
    word-break: break-word;
  }
}

.record-value {
  font-family: "Courier New", monospace;
  font-size: 11px;
  color: #667eea;
  word-break: break-all;
  display: inline-block;
  background-color: rgba(102, 126, 234, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  flex: 1;
  min-width: 150px;
}

.empty-state {
  border-radius: 12px !important;
  border: 2px dashed rgba(102, 126, 234, 0.3) !important;
  background: rgba(102, 126, 234, 0.02);
}

.breadcrumb-item {
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s ease;

  &:hover {
    color: #667eea !important;
  }
}

:deep(.v-card) {
  border-radius: 12px !important;
  transition: box-shadow, border-color 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
  }
}

:deep(.v-list) {
  background: transparent;
}

:deep(.v-list-item) {
  min-height: 48px;
}

:deep(.mb-4) {
  margin-bottom: 24px !important;
}

:deep(.v-card-title) {
  color: #2c3e50;
  font-size: 18px;
}

:deep(.headline) {
  font-weight: 600;
  font-size: 20px;
}

:deep(.v-btn-group) {
  background-color: transparent;
  border-radius: 6px;

  .v-btn {
    border-radius: 6px;
    margin-right: 4px;
    transition: all 0.2s ease;

    &:hover {
      background-color: rgba(102, 126, 234, 0.1) !important;
    }
  }
}

:deep(.v-divider) {
  border-color: rgba(102, 126, 234, 0.2) !important;
}

:deep(.pr-2) {
  padding-right: 8px !important;
}

:deep(.pl-2) {
  padding-left: 8px !important;
}

@media (max-width: 960px) {
  .record-row {
    flex-direction: column;
    align-items: flex-start;

    .record-value {
      width: 100%;
    }
  }
}

.v-chip {
  margin: 6px !important;
}
</style>
