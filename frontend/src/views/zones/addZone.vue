<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-toolbar color="primary" dark>
            <v-icon left>mdi-plus</v-icon>
            <v-toolbar-title>Add New Zone</v-toolbar-title>
          </v-toolbar>
          <v-card-text class="pa-6">
            <v-stepper v-model="stepNumber">
              <v-stepper-header>
                <v-stepper-step :complete="stepNumber > 1" step="1">
                  Zone Info
                </v-stepper-step>

                <v-divider></v-divider>

                <v-stepper-step :complete="stepNumber > 2" step="2">
                  Zone Details
                </v-stepper-step>

                <v-divider></v-divider>

                <v-stepper-step step="3"> Overview </v-stepper-step>
              </v-stepper-header>

              <v-stepper-items>
                <v-stepper-content step="1">
                  <div class="pa-4">
                    <v-text-field
                      label="Zone"
                      prepend-icon="mdi-map-marker"
                      v-model="zoneDetails.zone"
                      id="zone"
                      :error-messages="errorzone"
                    ></v-text-field>
                    <v-radio-group
                      v-model="zoneDetails.type"
                      :error-messages="errortype"
                    >
                      <v-radio
                        label="Primary Zone (default)"
                        value="Primary"
                      ></v-radio>
                      <v-radio
                        label="Secondary Zone"
                        value="Secondary"
                      ></v-radio>
                      <v-radio label="Stub Zone" value="Stub"></v-radio>
                      <v-radio
                        label="Conditional Forwarder Zone"
                        value="Forwarder"
                      ></v-radio>
                    </v-radio-group>
                  </div>

                  <v-btn color="primary" @click="validateStep1()"> Next </v-btn>
                  <v-btn text @click="$router.push('/zones')"> Go Back </v-btn>
                </v-stepper-content>

                <v-stepper-content step="2">
                  <div class="pa-4">
                    <div v-if="zoneDetails.type == 'Primary'">
                      <v-alert type="info" outlined
                        >No additional details needed for Primary zones</v-alert
                      >
                    </div>
                    <div v-if="zoneDetails.type == 'Secondary'">
                      <div class="mb-4">
                        <h4>Primary Name Server Addresses:</h4>
                        <v-textarea
                          v-model="zoneDetails.primaryNameServerAddresses"
                          placeholder="192.168.1.1
2001:db8::
ns1.example.com (192.168.1.1)
ns1.example.com ([2001:db8::])"
                        ></v-textarea>
                      </div>
                      <div class="mb-4">
                        <h4>Zone Transfer Protocol</h4>
                        <v-radio-group
                          v-model="zoneDetails.zoneTransferProtocol"
                        >
                          <v-radio
                            label="XFR-over-TCP (default)"
                            value="Tcp"
                          ></v-radio>
                          <v-radio label="XFR-over-TLS" value="Tls"></v-radio>
                        </v-radio-group>
                      </div>
                      <div class="mb-4">
                        <h4>TSIG Key Name (Optional):</h4>
                        <v-text-field
                          v-model="zoneDetails.tsigKeyName"
                          label="TSIG Key Name"
                          prepend-icon="mdi-key"
                        ></v-text-field>
                      </div>
                    </div>

                    <div v-if="zoneDetails.type == 'Forwarder'">
                      <div class="mb-4">
                        <h4>Protocol:</h4>
                        <v-radio-group v-model="zoneDetails.protocol">
                          <v-radio
                            label="DNS-over-UDP (default)"
                            value="Udp"
                          ></v-radio>
                          <v-radio label="DNS-over-TCP" value="Tcp"></v-radio>
                          <v-radio label="DNS-over-TLS" value="Tls"></v-radio>
                          <v-radio
                            label="DNS-over-HTTPS"
                            value="Https"
                          ></v-radio>
                          <v-radio
                            label="DNS-over-HTTPS (JSON)"
                            value="HttpsJson"
                          ></v-radio>
                        </v-radio-group>
                      </div>
                      <div class="mb-4">
                        <h4>Forwarder</h4>
                        <v-switch
                          v-model="zoneDetails.forwarder"
                          value="this-server"
                          hide-details
                          label="Use 'This Server'"
                        ></v-switch>
                        <div
                          v-if="zoneDetails.forwarder == 'this-server'"
                          class="mt-3"
                        >
                          When using "This Server", if a record does not exists
                          in the zone then the request is forwarded to the DNS
                          server's resolver internally. This allows you to
                          override any record for the forwarded domain name or
                          control its DNSSEC validation.
                        </div>
                        <v-text-field
                          v-else
                          label="Forwarder Adress"
                          prepend-icon="mdi-map-marker"
                          v-model="zoneDetails.forwarder"
                        ></v-text-field>
                      </div>
                      <div class="mb-4">
                        <h4>DNSSEC</h4>
                        <v-switch
                          v-model="zoneDetails.dnssecValidation"
                          hide-details
                          label="Enable DNSSEC"
                        ></v-switch>
                      </div>
                      <div class="mb-4">
                        <h4>Network Proxy:</h4>
                        <v-radio-group v-model="zoneDetails.proxyType">
                          <v-radio
                            label="No Proxy(Default)"
                            value="None"
                          ></v-radio>
                          <v-radio label="HTTP Proxy" value="Http"></v-radio>
                          <v-radio
                            label="SOCKS5 Proxy"
                            value="Socks5"
                          ></v-radio>
                        </v-radio-group>
                      </div>
                      <div
                        v-if="
                          zoneDetails.proxyType &&
                          zoneDetails.proxyType != 'None'
                        "
                        class="mb-4"
                      >
                        <h4>Proxy Details</h4>
                        <v-text-field
                          label="Server Address"
                          prepend-icon="mdi-map-marker"
                          v-model="zoneDetails.proxyAddress"
                        ></v-text-field>
                        <v-text-field
                          label="Server Port"
                          prepend-icon="mdi-map-marker"
                          v-model="zoneDetails.proxyPort"
                        ></v-text-field>
                        <v-text-field
                          label="Server Username"
                          prepend-icon="mdi-map-marker"
                          v-model="zoneDetails.proxyUsername"
                        ></v-text-field>
                        <v-text-field
                          label="Server Password"
                          prepend-icon="mdi-map-marker"
                          type="password"
                          v-model="zoneDetails.proxyPassword"
                        ></v-text-field>
                      </div>
                    </div>

                    <div v-if="zoneDetails.type == 'Stub'">
                      <div class="mb-4">
                        <h4>Primary Name Server Addresses:</h4>
                        <v-textarea
                          v-model="zoneDetails.primaryNameServerAddresses"
                          placeholder="192.168.1.1
2001:db8::
ns1.example.com (192.168.1.1)
ns1.example.com ([2001:db8::])"
                        ></v-textarea>
                      </div>
                    </div>
                  </div>

                  <v-btn color="primary" @click="stepNumber++"> Next </v-btn>
                  <v-btn text @click="stepNumber--"> Go Back </v-btn>
                </v-stepper-content>

                <v-stepper-content step="3">
                  <div class="pa-4">
                    <highlight-code class="code" lang="json">{{
                      zoneDetails
                    }}</highlight-code>
                  </div>

                  <v-btn color="primary" @click="postNewZone()"> Add </v-btn>
                  <v-btn
                    v-if="zoneDetails.type == 'Primary'"
                    text
                    @click="stepNumber = 1"
                  >
                    Go Back
                  </v-btn>
                  <v-btn v-else text @click="stepNumber--"> Go Back </v-btn>
                </v-stepper-content>
              </v-stepper-items>
            </v-stepper>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      stepNumber: 1,
      zoneDetails: {},
      errorzone: "",
      errortype: "",
    };
  },
  methods: {
    validateStep1() {
      if (
        this.zoneDetails.zone == "" ||
        typeof this.zoneDetails.zone == "undefined"
      ) {
        this.errorzone = "Can't be empty";
        return;
      }
      this.errorzone = "";
      if (this.zoneDetails.type == undefined) {
        this.errortype = "Zone requires at least one type";
        return;
      }
      this.errortype = "";
      this.stepNumber = 2;
      if (this.zoneDetails.type == "Primary") {
        this.stepNumber = 3;
      }
    },
    postNewZone() {
      const params = new URLSearchParams();
      params.append("token", localStorage.appToken);

      for (let [key, value] of Object.entries(this.zoneDetails)) {
        if (value) {
          params.append(key, value);
        }
      }

      let that = this;
      this.$axios
        .post(`/api/zones/create?${params.toString()}`)
        .then(function (response) {
          if (response.data.status == "ok") {
            that.$swal
              .fire({
                title: "Zone Added",
                text: that.zoneDetails.zone,
                icon: "success",
                cancelButtonText: "Ok",
                showCloseButton: true,
              })
              .then(function () {
                that.$router.push(`/zone/${that.zoneDetails.zone}`);
              });
          } else {
            that.$swal.fire({
              title: "Error",
              text: response.data.errorMessage,
              icon: "error",
              iconHtml: "x",
              cancelButtonText: "Cancel",
              showCloseButton: true,
            });
          }
        })
        .catch((error) => {
          console.error("Error creating zone:", error);
          that.$swal.fire({
            title: "Network Error",
            text: "Could not connect to the server. Please check your connection.",
            icon: "error",
            cancelButtonText: "Ok",
            showCloseButton: true,
          });
        });
    },
  },
};
</script>
