<template>
  <div>
    <v-card :loading="loading">
      <v-card-text>
        <span
          ><v-icon large @click="$router.back()"> mdi-arrow-left </v-icon> Go
          Back</span
        >
        <v-text-field
          label="Scope Name"
          prepend-inner-icon="mdi-map-marker"
          :value="scope.name"
          hint="Display name for the scope"
        ></v-text-field>
        <v-text-field
          label="Start Adress"
          prepend-inner-icon="mdi-map-marker"
          :value="scope.startingAddress"
          hint="First IP in DHCP range"
        ></v-text-field>
        <v-text-field
          label="End Adress"
          prepend-inner-icon="mdi-map-marker"
          :value="scope.endingAddress"
          hint="Last IP in DHCP range"
        ></v-text-field>
        <v-text-field
          label="Subnet Mask"
          prepend-inner-icon="mdi-map-marker"
          :value="scope.subnetMask"
          hint="Subnet mask"
        ></v-text-field>
        <p>Lease Period</p>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              :value="scope.leaseTimeDays"
              label="Days"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              :value="scope.leaseTimeHours"
              label="Hours"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              :value="scope.leaseTimeMinutes"
              label="Minutes"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-text-field
          label="Offer Delay Time"
          prepend-inner-icon="mdi-map-marker"
          :value="scope.offerDelayTime"
          hint="The time duration that the DHCP server delays sending an DHCPOFFER message."
        ></v-text-field>
        <v-switch :value="scope.pingCheckEnabled" label="Ping Check"></v-switch>
        <p>
          Enable this option to allow DHCP server to find out if an IP address
          is already in use to prevent IP address conflict when some of the
          devices on the network have manually configured IP addresses.
        </p>
        <v-text-field
          label="Ping Check Timeout"
          :value="scope.pingCheckTimeout"
          prepend-inner-icon="mdi-map-marker"
          hint="The timeout interval to wait for an ping reply."
        ></v-text-field>
        <v-text-field
          label="Ping Check Retries"
          :value="scope.pingCheckRetries"
          prepend-inner-icon="mdi-map-marker"
          hint="The maximum number of ping requests to try."
        ></v-text-field>
        <v-alert border="right" colored-border type="danger" elevation="4">
          Warning! Ping check would work as expected only when you make sure
          that all the client devices with manually configured IP addresses on
          the network respond to a ping request. Devices running Microsoft
          Windows by default drop ping requests at host firewall and will cause
          this ping check to fail to detect in use IP addresses. It is
          recommended to not rely on this option and instead make sure that you
          exclude a range of addresses using Exclusions and manually assign IP
          addresses to your devices only in the excluded range.
        </v-alert>
        <v-text-field
          label="Domain Name"
          :value="scope.domainName"
          prepend-inner-icon="mdi-map-marker"
          hint="The domain name for this network to allow assigning a fully qualified domain name to clients. Use a domain name that you own or that is not in common use like 'home' or 'lan' so that you don't block out an existing domain name. (Option 15)"
        ></v-text-field>
        <v-textarea
          label="Domain Search List"
          value=""
          hint="The list of domain names that the clients can use as a suffix when searching a domain name. (Option 119)"
        ></v-textarea>
        <v-switch :value="scope.dnsUpdates" label="DNS Updates"></v-switch>
        <p>
          Enable this option to allow the DHCP server to automatically update
          forward and reverse DNS entries for clients.
        </p>
        <v-text-field
          label="DNS TTL"
          :value="scope.dnsTtl"
          prepend-inner-icon="mdi-map-marker"
          hint="The TTL value of the DNS records updated for the above provided domain name."
        ></v-text-field>
        <v-text-field
          label="Router Address"
          :value="scope.routerAddress"
          prepend-inner-icon="mdi-map-marker"
          hint="The default gateway IP address to be used by the clients. (Option 3)"
        ></v-text-field>
        <v-switch
          :value="scope.useThisDnsServer"
          label="Use This DNS Server"
        ></v-switch>
        <p>Enable this option to automatically use this DNS Server.</p>
        <v-textarea
          label="DNS Servers"
          :value="scope.dnsServers"
          hint="The DNS server IP addresses to be used by the clients. (Option 6)"
        ></v-textarea>
        <v-textarea
          label="WINS Servers"
          :value="scope.winsServers"
          hint="The NBNS/WINS server IP addresses to be used by the clients. (Option 44)"
        ></v-textarea>
        <v-textarea
          label="NTP Servers"
          :value="scope.ntpServers"
          hint="The Network Time Protocol (NTP) server IP addresses to be used by the clients. (Option 42)"
        ></v-textarea>
        <v-textarea
          label="NTP Server Domain Names"
          :value="scope.ntpServerDomainNames"
          hint="Enter NTP server domain names (e.g. pool.ntp.org) above that the DHCP server should automatically resolve and pass the resolved IP addresses to clients as NTP server option. (Option 42)"
        ></v-textarea>
        <v-card>
          <v-card-title>Static Routes:</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="staticRouteHeaders"
              :items="scope.staticRoutes"
              multi-sort
              item-key="name"
              :search="search"
              :items-per-page="100"
              :footer-props="{
                itemsPerPageOptions: [100, 200, 500, -1],
              }"
            >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>Static Routes:</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-btn color="primary">+</v-btn>
                </v-toolbar>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
        <v-text-field
          label="Bootstrap Server Address"
          :value="scope.serverAddress"
          prepend-inner-icon="mdi-map-marker"
          hint="The IP address of next server (TFTP) to use in bootstrap by the clients. If not specified, the DHCP server's IP address is used. (siaddr)"
        ></v-text-field>
        <v-text-field
          label="Bootstrap Server Host Name"
          :value="scope.serverHostName"
          prepend-inner-icon="mdi-map-marker"
          hint="The optional bootstrap server host name to be used by the clients to identify the TFTP server. (sname/Option 66)"
        ></v-text-field>
        <v-text-field
          label="Boot File Name"
          :value="scope.bootFileName"
          prepend-inner-icon="mdi-map-marker"
          hint="The boot file name stored on the bootstrap TFTP server to be used by the clients. (file/Option 67)"
        ></v-text-field>
        <v-card>
          <v-card-title>Vendor Specific Information:</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="vendorInfoHeaders"
              :items="scope.vendorInfo"
              multi-sort
              item-key="name"
              :search="search"
              :items-per-page="100"
              :footer-props="{
                itemsPerPageOptions: [100, 200, 500, -1],
              }"
            >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title
                    >Vendor Specific Information:</v-toolbar-title
                  >
                  <v-spacer></v-spacer>
                  <v-btn color="primary">+</v-btn>
                </v-toolbar>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
        <v-textarea
          label="CAPWAP Access Controller Addresses"
          :value="scope.capwapAcIpAddresses"
          hint="The Control And Provisioning of Wireless Access Points (CAPWAP) Access Controller IP addresses to be used by Wireless Termination Points to discover the Access Controllers to which it is to connect. (Option 138)"
        ></v-textarea>
        <v-textarea
          label="TFTP Server Addresses"
          :value="scope.tftpServerAddresses"
          hint="The TFTP Server Address or the VoIP Configuration Server Address. (Option 150)"
        ></v-textarea>
        <v-card>
          <v-card-title>Generic DHCP Options:</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="genericOptionsHeaders"
              :items="scope.genericOptions"
              multi-sort
              item-key="name"
              :search="search"
              :items-per-page="100"
              :footer-props="{
                itemsPerPageOptions: [100, 200, 500, -1],
              }"
            >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>Generic DHCP Options:</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-btn color="primary">+</v-btn>
                </v-toolbar>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
        <p>
          This feature allows you to define DHCP options that are not yet
          directly supported. To add an option, use the DHCP option code defined
          for it and enter the value in either a colon (:) separated hex string
          or a normal hex string format, for example C0:A8:01:01 OR C0A80101.
        </p>
        <v-card>
          <v-card-title>Exclusions:</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="exclusionsHeaders"
              :items="scope.exclusions"
              multi-sort
              item-key="name"
              :search="search"
              :items-per-page="100"
              :footer-props="{
                itemsPerPageOptions: [100, 200, 500, -1],
              }"
            >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>Exclusions:</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-btn color="primary">+</v-btn>
                </v-toolbar>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
        <v-switch
          :value="scope.allowOnlyReservedLeases"
          label="Allow Only Reserved Lease Allocations"
        ></v-switch>
        <p>
          Enable this option to stop dynamic IP address allocation and allocate
          only reserved IP addresses.
        </p>
        <v-switch
          :value="scope.blockLocallyAdministeredMacAddresses"
          label="Block Locally Administered MAC Addresses"
        ></v-switch>
        <p>
          Enable this option to stop dynamic IP address allocation for clients
          with locally administered MAC addresses. MAC address with 0x02 bit set
          in the first octet indicate a
          <a href="https://en.wikipedia.org/wiki/MAC_address" target="_blank"
            >locally administered</a
          >
          MAC address which usually means that the device is not using its
          original MAC address.
        </p>
        <v-card>
          <v-card-title>Reserved Leases:</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="reservedLeasesHeaders"
              :items="scope.reservedLeases"
              multi-sort
              item-key="name"
              :search="search"
              :items-per-page="100"
              :footer-props="{
                itemsPerPageOptions: [100, 200, 500, -1],
              }"
            >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>Reserved Leases:</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-btn color="primary">+</v-btn>
                </v-toolbar>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      scope: {},
      loading: false,
      staticRouteHeaders: [
        { text: "Destination", value: "destination" },
        { text: "Subnet Mask", value: "subnetMask" },
        { text: "Router", value: "router" },
        {
          text: "",
          value: "options",
          groupable: false,
          sortable: false,
          filterable: false,
        },
      ],
      vendorInfoHeaders: [
        { text: "Identifier", value: "identifier" },
        { text: "Information", value: "information" },
        {
          text: "",
          value: "options",
          groupable: false,
          sortable: false,
          filterable: false,
        },
      ],
      genericOptionsHeaders: [
        { text: "Value", value: "value" },
        { text: "Code", value: "code" },
        {
          text: "",
          value: "options",
          groupable: false,
          sortable: false,
          filterable: false,
        },
      ],
      exclusionsHeaders: [
        { text: "Starting Address", value: "startingAddress" },
        { text: "Ending Address", value: "endingAddress" },
        {
          text: "",
          value: "options",
          groupable: false,
          sortable: false,
          filterable: false,
        },
      ],
      reservedLeasesHeaders: [
        { text: "Hostname", value: "hostName" },
        { text: "MAC", value: "hardwareAddress" },
        { text: "IP", value: "address" },
        { text: "Comments", value: "comments" },
        {
          text: "",
          value: "options",
          groupable: false,
          sortable: false,
          filterable: false,
        },
      ],
    };
  },
  mounted() {
    this.getScopeData();
  },
  methods: {
    getScopeData() {
      let that = this;
      this.loading = true;
      this.$axios
        .post(
          `/api/dhcp/scopes/get?token=${localStorage.appToken}&name=${that.$route.params.scopeName}`,
        )
        .then(function (response) {
          if (response.data.status == "ok") {
            that.scope = response.data.response;
          }
        })
        .then(function () {
          that.loading = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
