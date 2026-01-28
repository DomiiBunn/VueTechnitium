<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card :loading="loading" class="mx-auto">
          <v-card-text>
            <div><v-icon>mdi-access-point-plus</v-icon>Querry</div>
            <v-row>
              <v-col class="input">
                <v-select
                  :disabled="loading"
                  v-model="inputsData.name"
                  :items="apps"
                  :error-messages="errors.appname"
                  label="App name"
                  prepend-inner-icon="mdi-application"
                ></v-select>
              </v-col>
              <!-- Class Path -->

              <v-col class="input">
                <v-select
                  :disabled="loading"
                  v-model="inputsData.classPath"
                  :items="classPathList"
                  :error-messages="errors.classPath"
                  label="Class Path"
                  prepend-inner-icon="mdi-application"
                ></v-select>

              </v-col>
              <!-- Page Number -->
              <v-col class="input">
                <v-text-field
                  :disabled="loading"
                  label="Page Number"
                  v-model="inputsData.pageNumber"
                  :error-messages="errors.pageNumber"
                  prepend-inner-icon="mdi-page-last"
                ></v-text-field>
              </v-col>
              <!-- Order -->
              <v-col class="input">
                <v-select
                  :disabled="loading"
                  v-model="inputsData.descendingOrder"
                  :items="orderTypes"
                  item-text="text"
                  item-value="value"
                  :error-messages="errors.order"
                  label="Order"
                  prepend-inner-icon="mdi-sort"
                ></v-select>
              </v-col>

              <!-- From Date -->
              <!-- TODO add date and time picker  -->

              <v-col class="input">
                <v-menu
                  v-model="menu2"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="date"
                      label="From Date"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="date"
                    @input="menu2 = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>

              <!-- From Time -->

              <v-col class="input">
                <v-menu
                  ref="menu"
                  v-model="menu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  :return-value.sync="time"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="time"
                      label="From Time"
                      prepend-icon="mdi-clock-time-four-outline"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-time-picker
                    v-if="menu"
                    v-model="time"
                    full-width
                    @click:minute="$refs.menu.save(time)"
                  ></v-time-picker>
                </v-menu>
              </v-col>

              <!-- To Date -->
              <!-- TODO add date and time picker  -->

              <v-col class="input">
                <v-menu
                  v-model="menu3"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="date2"
                      label="To Date"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="date2"
                    @input="menu3 = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>

              <!-- To Time -->

              <v-col class="input">
                <v-menu
                  ref="menu"
                  v-model="menu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  :return-value.sync="time"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="time"
                      label="To Time"
                      prepend-icon="mdi-clock-time-four-outline"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-time-picker
                    v-if="menu"
                    v-model="time"
                    full-width
                    @click:minute="$refs.menu.save(time)"
                  ></v-time-picker>
                </v-menu>
              </v-col>

              <!-- Client IP -->
              <v-col class="input">
                <v-text-field
                  :disabled="loading"
                  label="Client IP"
                  v-model="inputsData.clientIpAddress"
                  :error-messages="errors.clientIp"
                  prepend-inner-icon="mdi-map-marker"
                ></v-text-field>
              </v-col>
              <!-- Protocol -->
              <v-col class="input">
                <v-select
                  :disabled="loading"
                  v-model="inputsData.protocol"
                  item-text="name"
                  item-value="value"
                  :items="protocolTypes"
                  :error-messages="errors.protocol"
                  label="Protocol"
                  prepend-inner-icon="mdi-web"
                ></v-select>
              </v-col>
              <!-- Response Type -->

              <v-col class="input">
                <v-select
                  :disabled="loading"
                  v-model="inputsData.responseType"
                  item-text="name"
                  item-value="value"
                  :items="responseTypes"
                  :error-messages="errors.responseType"
                  label="Response Type"
                  prepend-inner-icon="mdi-web"
                ></v-select>
              </v-col>

              <!-- RCODE -->

              <v-col class="input">
                <v-select
                  :disabled="loading"
                  v-model="inputsData.rcode"
                  item-text="name"
                  item-value="value"
                  :items="rcodeList"
                  :error-messages="errors.rcode"
                  label="Rcode"
                  prepend-inner-icon="mdi-web"
                ></v-select>
              </v-col>

              <!-- Domain -->

              <v-col class="input">
                <v-text-field
                  :disabled="loading"
                  label="Domain"
                  v-model="inputsData.domain"
                  :error-messages="errors.domain"
                  prepend-inner-icon="mdi-web"
                ></v-text-field>
              </v-col>

              <!-- Type (text field)-->

              <v-col class="input">
                <v-text-field
                  :disabled="loading"
                  label="Type"
                  v-model="inputsData.type"
                  :error-messages="errors.type"
                  prepend-inner-icon="mdi-apple-keyboard-option"
                ></v-text-field>
              </v-col>

              <!-- Class (select) -->

              <v-col class="input">
                <v-select
                  :disabled="loading"
                  v-model="inputsData.class"
                  :items="classList"
                  item-text="name"
                  item-value="value"
                  :error-messages="errors.class"
                  label="Class"
                  prepend-inner-icon="mdi-apple-keyboard-option"
                ></v-select>
              </v-col>

            </v-row>

          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              :disabled="loading"
              color="primary"
              @click="submitQuerry()"
              :loading="loading"
            >Querry</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card class="mx-auto">
          <v-card-text>
            <div><v-icon>mdi-database</v-icon>Entries</div>

            <v-data-table
              dense
              :headers="headers"
              hide-default-footer
              items-per-page="50"
              :items="entries"
            >
              <template v-slot:top>
                Showing {{ inputsData.descendingOrder ? totalEntries - 50 * (inputsData.pageNumber - 1) : inputsData.pageNumber * entries.length - 50 + 1 }} - {{ inputsData.descendingOrder ? totalEntries - 50 * (inputsData.pageNumber - 1) + 50 : 50 * inputsData.pageNumber }}/{{ totalEntries }} Entries
              </template>

              <template v-slot:[`item.timestamp`]="{ item }">
                {{ formatTimestamp(item.timestamp) }}
              </template>
            </v-data-table>

            <div class="text-center pt-2">
              <v-pagination circle @input="submitQuerry()" v-model="inputsData.pageNumber" :total-visible="7" :length="totalPages"></v-pagination>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import dnsServerList from "@/assets/json/dnsServerList.json";
import dnsQuerryTypes from "@/assets/json/dnsQuerryTypes.json";
import dnsTransportMethods from "@/assets/json/dnsTransportMethods.json";
import axios from "axios";
import moment from "moment";
export default {
  data() {
    return {
      apps: [],
      classPathList: [],
      entries: [],
      headers: [
        {
          text: "#",
          align: "start",
          sortable: false,
          value: "rowNumber",
        },
        { text: "Timestamp", value: "timestamp", width: "180px" },
        { text: "Client IP", value: "clientIpAddress" },
        { text: "Protocol", value: "protocol" },
        { text: "Type", value: "responseType" },
        { text: "RCODE", value: "rcode" },
        { text: "QNAME", value: "qname" },
        { text: "QTYPE", value: "qtype" },
        { text: "QCLASS", value: "qclass" },
        { text: "Answer", value: "answer" },
      ],
      totalEntries: 0,
      totalPages: 0,
      dnsServerList,
      dnsQuerryTypes,
      dnsTransportMethods,
      inputsData: {
        server: "this-server",
        classPath: "",
        name: "",
        pageNumber: 1,
        entriesPerPage: 50,
        descendingOrder: true,
        start: "",
        end: "",
        clientIpAddress: "",
        protocol: "",
        responseType: "",
        rcode: "",
        qname: "",
        qtype: "",
        qclass: "",
      },
      orderTypes: [
        {
          text: "Ascending",
          value: false,
        },
        {
          text: "Descending",
          value: true,
        },
      ],
      protocolTypes: [
        {name: "Any", value: ""},
        {name: "UDP", value: "UDP"},
        {name: "TCP", value: "TCP"},
        {name: "TLS", value: "TLS"},
        {name: "HTTPS", value: "HTTPS"},
        {name: "QUICK", value: "QUICK"},
        {name: "UDP Proxy", value: "UDP Proxy"},
        {name: "TCP Proxy", value: "TCP Proxy"}
      ],
      responseTypes: [
        {name: "Any", value: ""},
        {name: "Authoritative", value: "Authoritative"},
        {name: "Recursive", value: "Recursive"},
        {name: "Cached", value: "Cached"},
        {name: "Blocked", value: "Blocked"},
        {name: "UpstreamBlocked", value: "UpstreamBlocked"},
        {name: "CacheBlocked", value: "CacheBlocked"},
      ],
      rcodeList: [
        {name: "Any", value: ""},
        {name: "NoError", value: "NoError"},
        {name: "FormatError", value: "FormatError"},
        {name: "ServerFailure", value: "ServerFailure"},
        {name: "NxDomain", value: "NxDomain"},
        {name: "NotImplemented", value: "NotImplemented"},
        {name: "Refused", value: "Refused"},
        {name: "YXDomain", value: "YXDomain"},
        {name: "YXRRSet", value: "YXRRSet"},
        {name: "NXRRSet", value: "NXRRSet"},
        {name: "NotAuth", value: "NotAuth"},
        {name: "NotZone", value: "NotZone"}
      ],
      classList: [
        {
          name: "-",
          value: ""
        },
        {
          name: "IN",
          value: "IN"
        },
        {
          name: "CS",
          value: "CS"
        },
        {
          name: "CH",
          value: "CH"
        },
        {
          name: "HS",
          value: "HS"
        },
        {
          name: "NONE",
          value: "NONE"
        },
        {
          name: "ANY",
          value: "ANY"
        }
      ],
      errorMessage: "Can't be empty!",
      errors: {
        server: "",
        domain: "",
        type: "",
        transport: "",
      },
      loading: false,
      resolved: false,
      response: {},
    };
  },

  mounted() {
    this.getApps();
  },

  methods: {
    getApps() {
      let that = this;
      this.loading = true;
      axios
        .post(`/api/apps/list?token=${localStorage.appToken}`)
        .catch(function (error) {
          that.handleError({ errorMessage: error, status: "Axios Error" });
        })
        .then(function (res) {
          if (res.data.status == "ok") {
            that.apps = res.data.response.apps.filter((app) => app.dnsApps[0].isQueryLogger).map((app) => app.name);
            that.classPathList = res.data.response.apps.filter((app) => app.dnsApps[0].isQueryLogger).map((app) => app.dnsApps[0].classPath);
            that.inputsData.classPath = that.classPathList[0];
            console.log(that.classPathList[0]);
            that.inputsData.name = that.apps[0];
            that.loading = false;
          } else {
            that.handleError(res.data.errorMessage);
          }
        });
    },

    formatTimestamp(timestamp) {
      return moment(timestamp).format("YYYY-MM-DD HH:mm:ss");
    },

    submitQuerry() {
      let that = this;
      this.loading = true;
      let querryString = "";

      for (const [key, value] of Object.entries(this.inputsData)) {
        querryString = querryString + `&${key}=${value}`;
      }
      axios
        .post(`/api/logs/query?token=${localStorage.appToken}${querryString}`)
        .catch(function (error) {
          that.handleError({ errorMessage: error, status: "Axios Error" });
        })
        .then(function (res) {
          if (res.data.status == "ok") {
            that.entries = res.data.response.entries;
            that.totalPages = res.data.response.totalPages;
            that.totalEntries = res.data.response.totalEntries;
            that.resolved = true;
            that.loading = false;
          } else {
            that.handleError(res.data.errorMessage);
          }
        }).catch(function (error) {
          that.$handleError({ errorMessage: error, status: "Axios Error" });
        });

    },

    handleError(error) {
      this.$root.$emit("show-error", error);
      this.loading = false;
    },

  }

};
</script>

<style lang="scss" scoped>
.input {
  min-width: 300px;
}
.code {
  padding-top: 15px;
}
</style>
