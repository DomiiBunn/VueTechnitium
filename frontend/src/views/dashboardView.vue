<template>
  <v-container>
    <v-row>
      <v-tabs v-model="selectedType" height="60px" class="mb-4">
        <v-tab>Past Hour</v-tab>
        <v-tab>Past Day</v-tab>
        <v-tab>Past Week</v-tab>
        <v-tab>Past Month</v-tab>
        <v-tab>Past Year</v-tab>
        <v-tab :style="selectedType == 5 ? 'width: 1000px' : ''"
          ><span v-if="selectedType != 5">Custom</span>
          <v-menu
            v-else
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="dateRangeText"
                label="Pick a date"
                prepend-icon="mdi-calendar"
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
              <v-btn class="mx-2" fab dark small color="primary"
                ><v-icon @click="customRange()" dark>
                  mdi-refresh
                </v-icon></v-btn
              >
            </template>
            <v-date-picker range v-model="dateRange" no-title scrollable>
              <v-spacer></v-spacer>
              <v-btn text color="primary" @click="menu = false"> Cancel </v-btn>
              <v-btn text color="primary" @click="customRange()"> OK </v-btn>
            </v-date-picker>
          </v-menu>
        </v-tab>
        <v-spacer></v-spacer>
        <v-btn
          text
          class="px-4"
          @click="showRefreshDialog = true"
          style="min-height: 60px; display: flex; align-items: center"
        >
          <v-icon class="mr-2">mdi-refresh</v-icon>
          <span>Auto-Refresh</span>
          <span v-if="autoRefreshInterval > 0" class="ml-2 text-caption">
            ({{ getRefreshLabel() }})
          </span>
        </v-btn>
      </v-tabs>
      <v-spacer></v-spacer>
    </v-row>

    <!-- Auto-Refresh Dialog -->
    <v-dialog v-model="showRefreshDialog" max-width="400">
      <v-card>
        <v-card-title>Dashboard Auto-Refresh</v-card-title>
        <v-card-text>
          <v-select
            v-model="autoRefreshInterval"
            :items="refreshIntervals"
            item-text="label"
            item-value="value"
            label="Refresh Interval"
            @change="updateRefreshInterval"
          ></v-select>
          <div v-if="autoRefreshInterval > 0" class="mt-4">
            <p class="text-caption">Next refresh: {{ nextRefreshTime }}</p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="showRefreshDialog = false"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-row>
      <v-col v-for="tile in tilesData" :key="tile.title">
        <dataSquare :square="tile" :squareLoading="loading" :desc="descFile" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <mainChart v-if="mainChartData" :allChartData="mainChartData" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <typesChart
          v-if="typesChartData"
          :chartData="typesChartData"
          :responseChartData="queryResponseChartData"
          :typeChartData="queryTypeChartData"
        />
      </v-col>
      <v-col>
        <topList v-if="topClients" :listData="topClientsData" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <topList v-if="topDomains" :listData="topDomainsData" />
      </v-col>
      <v-col>
        <topList v-if="topBlockedDomains" :listData="topBlockedsData" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import dataSquare from "@/components/dashboard/dataSquare.vue";
import mainChart from "@/components/dashboard/mainChart.vue";
import topList from "@/components/dashboard/topList.vue";
import typesChart from "@/components/dashboard/typesChart.vue";
import descFileImport from "@/assets/json/headerSquareDesc.json";

export default {
  components: {
    dataSquare,
    mainChart,
    topList,
    typesChart,
  },
  data() {
    return {
      polling: null,
      menu: false,
      dates: [],
      attrs: undefined,
      topClients: undefined,
      topDomains: undefined,
      topBlockedDomains: undefined,
      descFile: descFileImport,
      testDataTable: {
        title: "Test Title",
        icon: "mdi-checkbox-marked-circle-outline",
        items: [{ name: "Test", value: "5" }],
        headers: [
          { text: "Domain", value: "name" },
          { text: "Queries", value: "value" },
        ],
      },
      mainChartData: undefined,
      stats: undefined,
      queriesData: undefined,
      queryResponseChartData: undefined,
      queryTypeChartData: undefined,
      type: "lastHour",
      selectedType: 0,
      dateRange: [],
      dateRangeText: "",
      loading: true,
      showRefreshDialog: false,
      autoRefreshInterval: 300000,
      nextRefreshTime: "",
      refreshIntervals: [
        { label: "Disabled", value: 0 },
        { label: "10 seconds", value: 10000 },
        { label: "30 seconds", value: 30000 },
        { label: "1 minute", value: 60000 },
        { label: "5 minutes", value: 300000 },
        { label: "1 hour", value: 3600000 },
      ],
      lastRefreshTime: null,
    };
  },
  computed: {
    topClientsData() {
      let clients = this.topClients;
      return {
        title: "Top Clients",
        icon: "mdi-laptop",
        items: clients,
        headers: [
          { text: "Client", value: "name", align: "end" },
          { text: "Domain", value: "domain", align: "start" },
          { text: "Queries", value: "hits" },
        ],
      };
    },
    topDomainsData() {
      let domains = this.topDomains;
      return {
        title: "Top Domains",
        icon: "mdi-web",
        items: domains,
        headers: [
          { text: "Domain", value: "name" },
          { text: "Queries", value: "hits" },
        ],
      };
    },
    topBlockedsData() {
      let domains = this.topBlockedDomains;
      return {
        title: "Top Blocked Domains",
        icon: "mdi-alert-octagon",
        items: domains,
        headers: [
          { text: "Domain", value: "name" },
          { text: "Queries", value: "hits" },
        ],
      };
    },
    typesChartData() {
      let stats = this.stats;
      if (stats == undefined) return;
      return {
        title: "Queries Overview",
        icon: "mdi-chart-donut",
        dataSquares: [
          {
            title: "Hosted",
            value: stats.zones,
            icon: "mdi-server",
            color: "#70A2CC",
          },
          {
            title: "Cached",
            value: stats.cachedEntries,
            icon: "mdi-cached",
            color: "#9A87B7",
          },
          {
            title: "Allowed",
            value: stats.allowedZones,
            icon: "mdi-checkbox-marked-circle-outline",
            color: "success",
          },
          {
            title: "Blocked",
            value: stats.blockedZones,
            icon: "mdi-alert-octagon",
            color: "warning",
          },
          {
            title: "Block List",
            value: stats.blockListZones,
            icon: "mdi-format-list-bulleted",
            color: "danger",
          },
        ],
        queryResponseChartData: this.queryResponseChartData,
        queryTypeChartData: this.queryTypeChartData,
      };
    },
    tilesData() {
      let stats = this.stats;
      if (stats == undefined) return;
      return [
        {
          value: stats.totalQueries,
          title: "Total",
          tall: true,
          icon: "mdi-percent",
          color: "#94B7FF",
        },
        {
          value: stats.totalNoError,
          detailed: true,
          percent: this.calcPct(stats.totalNoError),
          title: "No Error",
          tall: true,
          icon: "mdi-checkbox-marked-circle-outline",
          color: "success",
        },
        {
          value: stats.totalServerFailure,
          detailed: true,
          percent: this.calcPct(stats.totalServerFailure),
          title: "Server Failure",
          icon: "mdi-message-alert",
          tall: true,
          color: "danger",
        },
        {
          value: stats.totalNxDomain,
          detailed: true,
          percent: this.calcPct(stats.totalNxDomain),
          title: "NX Domain",
          tall: true,
          icon: "mdi-cloud-question",
          color: "secondary",
        },
        {
          value: stats.totalRefused,
          detailed: true,
          percent: this.calcPct(stats.totalRefused),
          title: "Refused",
          tall: true,
          icon: "mdi-block-helper",
          color: "warning",
        },
        {
          value: stats.totalAuthoritative,
          detailed: true,
          percent: this.calcPct(stats.totalAuthoritative),
          title: "Authoritative",
          tall: true,
          icon: "mdi-alpha-a",
          color: "#B5B54C",
        },
        {
          value: stats.totalRecursive,
          detailed: true,
          percent: this.calcPct(stats.totalRecursive),
          title: "Recursive",
          tall: true,
          icon: "mdi-refresh",
          color: "#5CBECD",
        },
        {
          value: stats.totalCached,
          detailed: true,
          percent: this.calcPct(stats.totalCached),
          title: "Cached",
          tall: true,
          icon: "mdi-cached",
          color: "#9A87B7",
        },
        {
          value: stats.totalBlocked,
          detailed: true,
          percent: this.calcPct(stats.totalBlocked),
          title: "Blocked",
          tall: true,
          icon: "mdi-alert-octagon",
          color: "warning",
        },
        {
          value: stats.totalClients,
          title: "Clients",
          tall: true,
          icon: "mdi-laptop",
          color: "#70A2CC",
        },
      ];
    },
  },
  created() {
    // Load auto-refresh interval from localStorage
    const saved = localStorage.getItem("dashboardAutoRefreshInterval");
    if (saved) {
      this.autoRefreshInterval = parseInt(saved);
    }
    this.getStats();
    this.updateRefreshInterval();
  },
  beforeDestroy() {
    if (this.polling) {
      clearInterval(this.polling);
    }
  },
  methods: {
    calcPct(num) {
      return Math.round((num / this.stats.totalQueries) * 10000) / 100;
    },
    intervalRefresh() {
      if (this.selectedType == 0) {
        this.getStats();
      }
      if (this.selectedType != 5) {
        this.dateRange = [];
      }
    },
    getStats(active) {
      if (active != true && this.selectedType == 5) return;
      this.loading = true;
      let that = this;
      //This is a stupid workaround a bug
      //https://github.com/vuetifyjs/vuetify/issues/10540
      // THIS HAS BEEN OPEN FOR 2 YEARS FFS
      let types = [
        "lastHour",
        "lastDay",
        "lastWeek",
        "lastMonth",
        "lastYear",
        "custom",
      ];
      let type = types[this.selectedType];
      const start = this.dateRange[0] || "";
      const end = this.dateRange[1] || "";
      this.$axios
        .post(
          `/api/dashboard/stats/get?token=${localStorage.appToken}&type=${type}&start=${start}&end=${end}`,
        )
        .then(function (response) {
          if (response.data.status == "ok") {
            that.mainChartData = response.data.response.mainChartData;
            that.stats = response.data.response.stats;
            that.queryResponseChartData =
              response.data.response.queryResponseChartData;
            that.queryTypeChartData = response.data.response.queryTypeChartData;
          }
        });
      this.$axios
        .post(
          `/api/dashboard/stats/getTop?token=${localStorage.appToken}&type=${type}&statsType=TopClients&limit=1000&start=${start}&end=${end}`,
        )
        .then(function (response) {
          if (response.data.status == "ok") {
            that.topClients = response.data.response.topClients;
          }
        });
      this.$axios
        .post(
          `/api/dashboard/stats/getTop?token=${localStorage.appToken}&type=${type}&statsType=TopDomains&limit=1000&start=${start}&end=${end}`,
        )
        .then(function (response) {
          if (response.data.status == "ok") {
            that.topDomains = response.data.response.topDomains;
          }
        });
      this.$axios
        .post(
          `/api/dashboard/stats/getTop?token=${localStorage.appToken}&type=${type}&statsType=TopBlockedDomains&limit=1000&start=${start}&end=${end}`,
        )
        .then(function (response) {
          if (response.data.status == "ok") {
            that.topBlockedDomains = response.data.response.topBlockedDomains;
          }
        })
        .then(function () {
          that.loading = false;
        });
    },
    customRange() {
      if (this.dateRange.length == 2) {
        this.dateRange.sort();
        this.dateRangeText = `${this.dateRange[0]} - ${this.dateRange[1]}`;
        this.getStats(true);
      }
    },
    updateRefreshInterval() {
      // Save interval to localStorage
      localStorage.setItem(
        "dashboardAutoRefreshInterval",
        this.autoRefreshInterval,
      );

      if (this.polling) {
        clearInterval(this.polling);
      }
      if (this.autoRefreshInterval > 0) {
        this.lastRefreshTime = new Date();
        this.updateNextRefreshTime();
        this.polling = setInterval(() => {
          if (this.selectedType <= 4) {
            this.getStats();
            this.lastRefreshTime = new Date();
            this.updateNextRefreshTime();
          }
        }, this.autoRefreshInterval);
      }
    },
    updateNextRefreshTime() {
      if (this.autoRefreshInterval > 0 && this.lastRefreshTime) {
        const next = new Date(
          this.lastRefreshTime.getTime() + this.autoRefreshInterval,
        );
        this.nextRefreshTime = next.toLocaleTimeString();
      }
    },
    getRefreshLabel() {
      const interval = this.refreshIntervals.find(
        (i) => i.value === this.autoRefreshInterval,
      );
      return interval ? interval.label : "Unknown";
    },
  },
  watch: {
    selectedType: function () {
      // Only call getStats for valid tab indices (0-5)
      if (this.selectedType >= 0 && this.selectedType <= 5) {
        this.getStats();
      }
    },
  },
};
</script>

<style scoped>
::v-deep .v-tabs .v-tabs-bar .v-tabs-slider {
  width: calc(100% - 20px) !important;
  margin-left: 10px;
  margin-right: 10px;
}
</style>
