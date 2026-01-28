<template>
  <v-container>
    <v-row>
      <v-col class="mx-auto">
        <v-card :loading="loading">
          <v-card-title>
            <p>Total {{ leases.length }} leases</p>
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
            ></v-text-field>
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="leases"
            multi-sort
            group-by="scope"
            item-key="name"
            :search="search"
            :items-per-page="-1"
            disable-pagination
            show-group-by
            :footer-props="{
              itemsPerPageOptions: [-1],
            }"
          >
            <template v-slot:[`item.type`]="{ item }">
              <v-chip
                class="ma-2 chip"
                style="width: 75px"
                small
                :color="getTypeColor(item.type)"
                dark
              >
                <span>{{ item.type }}</span>
              </v-chip>
            </template>
            <template v-slot:[`item.leaseObtained`]="{ item }">
              {{ getHumanTime(item.leaseObtained) }}
            </template>
            <template v-slot:[`item.leaseObtainedtime`]="{ item }">
              {{ getFromTime(item.leaseObtained) }}
            </template>
            <template v-slot:[`item.leaseExpires`]="{ item }">
              {{ getHumanTime(item.leaseExpires) }}
            </template>
            <template v-slot:[`item.leaseExpirestime`]="{ item }">
              {{ getFromTime(item.leaseExpires) }}
            </template>
            <template v-slot:[`item.options`]="{ item }">
              <v-icon
                v-if="item.type == 'Dynamic'"
                @click="convertToReserved(item)"
              >
                mdi-lock </v-icon
              ><v-icon v-else @click="convertToDynamic(item)" color="primary"
                >mdi-lock-open </v-icon
              ><v-icon
                v-can="{ section: 'DhcpServer', action: 'delete' }"
                @click="remove(item)"
                color="danger"
                >mdi-archive-arrow-up
              </v-icon>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import moment from "moment";
export default {
  data() {
    return {
      polling: null,
      leases: [],
      loading: true,
      search: "",
      headers: [
        { text: "Scope", value: "scope" },
        { text: "MAC Address", value: "hardwareAddress", groupable: false },
        { text: "IP Address", value: "address", groupable: false },
        { text: "Type", value: "type", align: "center" },
        { text: "Host Name", value: "hostName", groupable: false },
        {
          text: "Lease Obtained",
          value: "leaseObtained",
          groupable: false,
          filterable: false,
          align: "end",
        },
        {
          text: "",
          value: "leaseObtainedtime",
          groupable: false,
          sortable: false,
          filterable: false,
          align: "start",
        },
        {
          text: "Lease Expires",
          value: "leaseExpires",
          groupable: false,
          filterable: false,
          align: "end",
        },
        {
          text: "",
          value: "leaseExpirestime",
          groupable: false,
          sortable: false,
          filterable: false,
          align: "start",
        },
      ],
      permissions: {},
    };
  },
  created() {
    this.getLeases();
    try {
      const { useAuthStore } = require("@/stores/auth");
      const store = useAuthStore();
      this.permissions =
        (store.permissions && store.permissions.DhcpServer) || {};
    } catch (_) {
      this.permissions = {};
    }
    if (this.permissions.canModify) {
      this.headers.push({
        text: "",
        value: "options",
        groupable: false,
        sortable: false,
        filterable: false,
      });
    }
    this.polling = setInterval(this.getLeases, 5000);
  },
  beforeDestroy() {
    clearInterval(this.polling);
  },
  methods: {
    getLeases() {
      let that = this;
      this.loading = true;
      this.$axios
        .post(`/api/dhcp/leases/list?token=${localStorage.appToken}`)
        .then(function (response) {
          if (response.data.status == "ok") {
            that.leases = response.data.response.leases;
          }
        })
        .then(function () {
          that.loading = false;
        });
    },
    convertToReserved(itemInfo) {
      let that = this;
      this.loading = true;
      this.$axios
        .post(
          `/api/dhcp/leases/convertToReserved?token=${localStorage.appToken}&name=${itemInfo.scope}&clientIdentifier=${itemInfo.clientIdentifier}`,
        )
        .then(function (response) {
          if (response.data.status == "ok") {
            that.getLeases();
          }
        });
    },
    convertToDynamic(itemInfo) {
      let that = this;
      this.loading = true;
      this.$axios
        .post(
          `/api/dhcp/leases/convertToDynamic?token=${localStorage.appToken}&name=${itemInfo.scope}&clientIdentifier=${itemInfo.clientIdentifier}`,
        )
        .then(function (response) {
          if (response.data.status == "ok") {
            that.getLeases();
          }
        });
    },
    remove(itemInfo) {
      let that = this;
      this.loading = true;
      this.$axios
        .post(
          `/api/dhcp/leases/remove?token=${localStorage.appToken}&name=${itemInfo.scope}&clientIdentifier=${itemInfo.clientIdentifier}`,
        )
        .then(function (response) {
          if (response.data.status == "ok") {
            that.getLeases();
          }
        });
    },
    getTypeColor(type) {
      switch (type) {
        case "Reserved":
          return "secondary";
        case "Dynamic":
          return "primary";

        default:
          return "#fff";
      }
    },
    getHumanTime(time) {
      return moment(time).format("HH:mm - DD.MM.YYYY");
    },
    getFromTime(time) {
      return moment(time).fromNow();
    },
  },
};
</script>

<style lang="scss" scoped>
.logs-item {
  height: calc(100vh - 350px);
  overflow: auto;
  width: 100%;
}
.button {
  margin-right: 15px;
}
</style>
