<template>
  <v-container>
    <v-row
      ><v-col>
        <v-card :loading="loading" class="mx-auto">
          <v-card-text>
            <div><v-icon>mdi-access-point-plus</v-icon>Querry</div>
            <v-row>
              <v-col class="input">
                <v-select
                  :disabled="loading"
                  v-model="inputsData.server"
                  :items="dnsServerList"
                  :error-messages="errors.server"
                  label="Server"
                  prepend-inner-icon="mdi-server"
                ></v-select>
              </v-col>
              <v-col class="input">
                <v-text-field
                  :disabled="loading"
                  label="Domain"
                  v-model="inputsData.domain"
                  :error-messages="errors.domain"
                  prepend-inner-icon="mdi-web"
                ></v-text-field
              ></v-col>
              <v-col class="input">
                <v-select
                  :disabled="loading"
                  v-model="inputsData.type"
                  :items="dnsQuerryTypes"
                  :error-messages="errors.type"
                  label="Type"
                  prepend-inner-icon="mdi-apple-keyboard-option"
                ></v-select>
              </v-col>
              <v-col class="input">
                <v-select
                  :disabled="loading"
                  v-model="inputsData.transport"
                  :items="dnsTransportMethods"
                  :error-messages="errors.transport"
                  label="Transport Method"
                  prepend-inner-icon="mdi-train-car"
                ></v-select>
              </v-col>
              <v-col class="input">
                <v-switch
                  :disabled="loading"
                  v-model="inputsData.dnssec"
                  prepend-icon="mdi-lock"
                  label="Enable DNSSEC Validation"
                ></v-switch>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-btn
                  v-can="{ section: 'DnsClient', action: 'modify' }"
                  color="#6699FF"
                  :disabled="loading"
                  :loading="loading"
                  class="ma-2 white--text"
                  @click="resolve(false)"
                >
                  Resolve
                  <v-icon right dark>
                    mdi-chart-timeline-variant-shimmer
                  </v-icon>
                </v-btn>
                <v-btn
                  v-can="{ section: 'DnsClient', action: 'modify' }"
                  :disabled="loading"
                  :loading="loading"
                  color="warning"
                  class="ma-2 white--text"
                  @click="resolve(true)"
                >
                  Import
                  <v-icon right dark> mdi-cloud-upload </v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-if="resolved">
      <v-col>
        <v-card class="mx-auto">
          <v-card-text>
            <div><v-icon>mdi-database</v-icon>Response</div>
            <highlight-code class="code" lang="json">{{
              response
            }}</highlight-code>
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
export default {
  data() {
    return {
      dnsServerList,
      dnsQuerryTypes,
      dnsTransportMethods,
      inputsData: {
        server: "this-server",
        domain: "",
        type: "A",
        transport: "UDP",
        dnssec: false,
      },
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
  methods: {
    resolve(inport) {
      let error = false;
      if (this.inputsData.server == "") {
        this.errors.server = this.errorMessage;
        error = true;
      } else {
        this.errors.server = "";
      }
      if (this.inputsData.domain == "") {
        this.errors.domain = this.errorMessage;
        error = true;
      } else {
        this.errors.domain = "";
      }
      if (this.inputsData.type == "") {
        this.errors.type = this.errorMessage;
        error = true;
      } else {
        this.errors.type = "";
      }
      if (this.inputsData.transport == "") {
        this.errors.transport = this.errorMessage;
        error = true;
      } else {
        this.errors.transport = "";
      }
      if (!error) {
        let that = this;
        this.loading = true;
        this.$axios
          .post(
            `/api/dnsClient/resolve?token=${localStorage.appToken}&server=${
              that.inputsData.server
            }&domain=${that.inputsData.domain}&type=${
              that.inputsData.type
            }&protocol=${that.inputsData.transport}&dnssec=${
              that.inputsData.dnssec
            }${inport ? "&import=true" : ""}`,
          )
          .then(function (response) {
            if (response.data.status == "ok") {
              that.response = response.data.response.result;
            }
          })
          .then(function () {
            that.loading = false;
            that.resolved = true;
          });
      }
    },
  },
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
