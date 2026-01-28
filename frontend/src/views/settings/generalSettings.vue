<template>
  <v-container v-if="settings" fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-toolbar color="primary" dark>
            <v-icon left>mdi-server</v-icon>
            <v-toolbar-title>Server Options</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-text-field
              label="Server Domain"
              prepend-inner-icon="mdi-server"
              hint="The primary fully qualified domain name used by this DNS Server to
              identify itself."
              v-model="settings.dnsServerDomain"
            ></v-text-field>
            <v-textarea
              label="Server Local End Points"
              prepend-inner-icon="mdi-network"
              v-model="settings.dnsServerLocalEndPoints"
              hint="Local end points are the network interface IP addresses and ports you want the DNS Server to listen for requests. The default values work for Windows but on Linux when you have multiple network adapters, you must explicitly specify the network adapter IP addresses here as the local end points."
            >
            </v-textarea>
            <v-textarea
              label="DNS Server IPv4 Source Addresses"
              prepend-inner-icon="mdi-ip-network"
              v-model="settings.dnsServerIPv4SourceAddresses"
              hint="The IPv4 source addresses that the DNS server must use for making all outbound DNS requests when the server is connected to two or more networks. Network addresses are also accepted. By default, the IPv4 address of the network with a default route will be used as the source address."
            >
            </v-textarea>
            <v-textarea
              label="DNS Server IPv6 Source Addresses"
              prepend-inner-icon="mdi-network-outline"
              v-model="settings.dnsServerIPv6SourceAddresses"
              hint="The IPv6 source addresses that the DNS server must use for making all outbound DNS requests when the server is connected to two or more networks. Network addresses are also accepted. By default, the IPv6 address of the network with a default route will be used as the source address. Note that this option will be used only when Prefer IPv6 option is enabled."
            >
            </v-textarea>
            <v-alert border="right" colored-border type="info" elevation="4">
              Note! The DNS Server local end point changes will be automatically
              applied and so you do not need to manually restart the main
              service.
            </v-alert>
            <v-alert border="right" colored-border type="info" elevation="4">
              Note! The source addresses configured above must be the IP
              addresses that are configured on the local system's network
              interface. When using source addresses option, its also necessary
              to ensure that the system has a default route or a specific route
              for the source address to be able to reach the destination
              network. When source addresses are not configured, the IP address
              of the interface with a default route will be used as the source
              address.
            </v-alert>
          </v-card-text>
        </v-card></v-col
      >
    </v-row>

    <v-row>
      <v-col>
        <v-card>
          <v-toolbar color="primary" dark>
            <v-icon left>mdi-timer-outline</v-icon>
            <v-toolbar-title>TTL Options</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-text-field
              label="Default Record TTL"
              prepend-inner-icon="mdi-timer"
              v-model="settings.defaultRecordTtl"
              hint="The default TTL value to use if not specified when adding or updating records in a Zone. Specyfied in seconds. Default 3600"
              suffix="seconds (default 3600/1h)"
            ></v-text-field>
            <v-text-field
              label="Default Responsible Person"
              prepend-inner-icon="mdi-email"
              hint="The default SOA Responsible Person email address to use when adding a Primary Zone."
              v-model="settings.defaultResponsiblePerson"
              placeholder="email address"
            ></v-text-field>
            <v-divider class="my-3"></v-divider>
            <div class="text-subtitle-1 mb-2">Zone Defaults</div>
            <v-switch
              label="Use SOA Serial Date Scheme"
              v-model="settings.useSoaSerialDateScheme"
              hint="The default SOA Serial option to use if not specified when adding a Primary Zone."
            ></v-switch>
            <v-text-field
              label="Minimum SOA Refresh"
              prepend-inner-icon="mdi-clock-outline"
              hint="The minimum Refresh interval to be used by Secondary, Stub, Secondary Forwarder, and Secondary Catalog zones. This minimum value will be used if a zone's SOA Refresh value is less than it."
              v-model="settings.minSoaRefresh"
              suffix="seconds (default 300/5m)"
            ></v-text-field>
            <v-text-field
              label="Minimum SOA Retry"
              prepend-inner-icon="mdi-clock-outline"
              hint="The minimum Retry interval to be used by Secondary, Stub, Secondary Forwarder, and Secondary Catalog zones zones. This minimum value will be used if a zone's SOA Retry value is less than it."
              v-model="settings.minSoaRetry"
              suffix="seconds (default 300/5m)"
            ></v-text-field>
            <v-textarea
              label="Zone Transfer Allowed Networks"
              prepend-inner-icon="mdi-shield-check"
              v-model="settings.zoneTransferAllowedNetworks"
              hint="Enter IP addresses or network addresses one below another that are allowed to perform zone transfer for all zones without any TSIG authentication."
            >
            </v-textarea>
            <v-textarea
              label="Notify Allowed Networks"
              prepend-inner-icon="mdi-bell"
              v-model="settings.notifyAllowedNetworks"
              hint="Enter IP addresses or network addresses one below another that are allowed to Notify all secondary zones."
            >
            </v-textarea>
          </v-card-text> </v-card
      ></v-col>
    </v-row>

    <div class="my-4">
      <v-card>
        <v-toolbar color="primary" dark>
          <v-icon left>mdi-apps</v-icon>
          <v-toolbar-title>DNS Apps</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-switch
            v-model="settings.dnsAppsEnableAutomaticUpdate"
            prepend-icon="mdi-update"
            label="Enable Automatic Update"
            hint="DNS server will check for DNS Apps update every day and will automatically download and install the updates."
          ></v-switch>
        </v-card-text>
      </v-card>
    </div>

    <div class="my-4">
      <v-card>
        <v-toolbar color="primary" dark>
          <v-icon left>mdi-network-outline</v-icon>
          <v-toolbar-title>IPv6 Options</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-switch
            v-model="settings.preferIPv6"
            prepend-icon="mdi-ipv6"
            label="Prefer IPv6"
          ></v-switch>
          <p>
            DNS Server will use IPv6 for querying whenever possible with this
            option enabled.
          </p>
          <v-alert border="right" colored-border type="error" elevation="4">
            Use this option only if this DNS server has native IPv6 Internet
            access otherwise it will affect performance.
          </v-alert>
        </v-card-text>
      </v-card>
    </div>

    <div class="my-4">
      <v-card>
        <v-toolbar color="primary" dark>
          <v-icon left>mdi-dns</v-icon>
          <v-toolbar-title>EDNS Options</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            label="UDP Payload Size"
            prepend-inner-icon="mdi-package"
            hint="The maximum UDP payload size that can be used to avoid IP fragmentation. In bytes. Valid range 512-4096. Default 1232"
            v-model="settings.udpPayloadSize"
          ></v-text-field>
          <v-switch
            v-model="settings.eDnsClientSubnet"
            prepend-icon="mdi-network-outline"
            label="Enable EDNS Client Subnet"
          ></v-switch>
          <p>
            DNS Server will use the public IP address of the request with a
            prefix length, or the existing Client Subnet option from the
            request.
          </p>
          <v-text-field
            label="ECS IPv4 Prefix Length"
            prepend-inner-icon="mdi-ip"
            hint="The IPv4 prefix length to define the client subnet."
            v-model="settings.eDnsClientSubnetIPv4PrefixLength"
          ></v-text-field>
          <v-text-field
            label="ECS IPv6 Prefix Length"
            prepend-inner-icon="mdi-ipv6"
            hint="The IPv6 prefix length to define the client subnet."
            v-model="settings.eDnsClientSubnetIPv6PrefixLength"
          ></v-text-field>
          <v-text-field
            label="ECS IPv4 Override"
            prepend-inner-icon="mdi-ip-network-outline"
            hint="The IPv4 network address that must be used as ECS for all outbound requests overriding client's actual subnet."
            v-model="settings.eDnsClientSubnetIpv4Override"
          ></v-text-field>
          <v-text-field
            label="ECS IPv6 Override"
            prepend-inner-icon="mdi-ipv6"
            hint="The IPv6 network address that must be used as ECS for all outbound requests overriding client's actual subnet."
            v-model="settings.eDnsClientSubnetIpv6Override"
          ></v-text-field>
          <v-alert border="right" colored-border type="error" elevation="4">
            EDNS Client Subnet (ECS) option when enabled will compromises user's
            privacy since the DNS server will send the user's public IP network
            subnet to name servers or forwarders when resolving requests. When
            not using encrypted DNS protocols, this information can also be read
            passively by anyone on the network.
          </v-alert>
          <v-alert border="right" colored-border type="info" elevation="4">
            EDNS Client Subnet (ECS) option allows passing the user's client
            subnet information to name servers or forwarders so that the
            response may contain IP addresses of servers closer to the user's
            geographic region. EDNS Client Subnet (ECS) option thus is only
            useful when the DNS server is hosted in a geographically different
            region compared to the users that are configured to use it.
          </v-alert>
          <v-alert border="right" colored-border type="info" elevation="4">
            Enabling EDNS Client Subnet (ECS) option will significantly increase
            the DNS server's memory usage since the server will have to cache
            data for each client subnet separately. It will also increase cache
            misses since DNS server will have to resolve requests and cache them
            for each client subnet separately.
          </v-alert>
        </v-card-text>
      </v-card>
    </div>

    <div class="my-4">
      <v-card>
        <v-toolbar color="primary" dark>
          <v-icon left>mdi-shield-lock</v-icon>
          <v-toolbar-title>DNSSEC Options</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-switch
            v-model="settings.dnssecValidation"
            prepend-icon="mdi-shield-key"
            label="Enable DNSSEC Validation"
          ></v-switch>
          <p>
            DNS Server will validate all responses from name servers or
            forwarders when this option is enabled.
          </p>
          <v-alert border="right" colored-border type="error" elevation="4">
            Devices that do not have a real-time clock and rely on NTP when
            booting (e.g. Raspberry Pi), enabling DNSSEC validation will cause
            failure to resolve the NTP server domain name thus causing the DNS
            server to fail to validate all other domain names too due to invalid
            system date/time. To fix this issue, just create a Conditional
            Forwarder zone for the NTP server domain name (e.g. ntp.org) with
            forwarder set to <strong>this-server</strong> and Enable DNSSEC
            Validation option unchecked. This conditional forwarder zone will
            disable DNSSEC validation for the NTP server domain name and allow
            the device to update its system data/time on boot.
          </v-alert>
          <v-alert border="right" colored-border type="error" elevation="4">
            When forwarders are configured, DNSSEC validation will work only if
            the forwarders are security aware i.e. can respond to DNSSEC
            requests correctly.
          </v-alert>
          <v-alert border="right" colored-border type="info" elevation="4">
            Enabling DNSSEC may increase delays in resolving domain names when
            the cache is initially empty. As the cache fills up, the performance
            will be normal as expected.
          </v-alert>
        </v-card-text>
      </v-card>
    </div>

    <div class="my-4">
      <v-card>
        <v-toolbar color="primary" dark>
          <v-icon left>mdi-chart-timeline</v-icon>
          <v-toolbar-title>QPM(Queries Per Minute) Options</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            label="Queries Per Minute (QPM) Limit (Requests)"
            prepend-inner-icon="mdi-chart-timeline-variant"
            hint="The maximum queries a client subnet can make per minute on average based on the sample size. Set to 0 to disable."
            v-model="settings.qpmLimitRequests"
          ></v-text-field>
          <v-text-field
            label="Queries Per Minute (QPM) Limit (Errors)"
            prepend-inner-icon="mdi-alert-circle-outline"
            hint="The maximum queries that generate an error response a client subnet can make per minute on average based on the sample size. Responses with RCODE as FormatError, ServerFailure, or Refused are considered as error responses. Set to 0 to disable. "
            v-model="settings.qpmLimitErrors"
          ></v-text-field>
          <v-text-field
            label="QPM Sample Size"
            prepend-inner-icon="mdi-timer-sand"
            hint="The sample size in minutes to be used for limiting queries per client. In Minutes. Valid Range 1 - 60. Default 5"
            v-model="settings.qpmLimitSampleMinutes"
          ></v-text-field>
          <v-text-field
            label="QPM Limit IPv4 Prefix Length"
            prepend-inner-icon="mdi-ip"
            hint="The IPv4 prefix length to define the client subnet. Valid Range 0 - 32. Default 24"
            v-model="settings.qpmLimitIPv4PrefixLength"
          ></v-text-field>
          <v-text-field
            label="QPM Limit IPv6 Prefix Length"
            prepend-inner-icon="mdi-ipv6"
            hint="The IPv6 prefix length to define the client subnet.  Valid Range 0 - 64. Default 56"
            v-model="settings.qpmLimitIPv6PrefixLength"
          ></v-text-field>
          <v-textarea
            label="QPM Limit Bypass List"
            prepend-inner-icon="mdi-shield-check"
            hint="Enter IP addresses or network addresses one below another that are allowed to bypass the QPM limit."
            v-model="settings.qpmLimitBypassList"
          >
          </v-textarea>
          <v-alert border="right" colored-border type="info" elevation="4">
            Queries Per Minute (QPM) feature will limit requests from a client
            subnet based on its IP address and the specified subnet prefix
            lengths. The QPM limit configured will be compared with the average
            count from the sample size which means a client may exceed the QPM
            limit for a given minute but won't exceed for the given sample size
            in minutes.
          </v-alert>
          <v-alert border="right" colored-border type="info" elevation="4">
            Note! Queries Per Minute (QPM) feature will limit requests from a
            client subnet based on its IP address and the specified subnet
            prefix lengths except for loopback IP addresses. The QPM limit
            configured will be compared with the average count from the sample
            size which means a client may exceed the QPM limit for a given
            minute but won't exceed for the given sample size in minutes. Rate
            limited clients will be listed in orange color on the dashboard top
            clients table.
          </v-alert>
        </v-card-text>
      </v-card>
    </div>

    <div class="my-4">
      <v-card>
        <v-toolbar color="primary" dark>
          <v-icon left>mdi-clock-outline</v-icon>
          <v-toolbar-title>Timeout Options</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            label="Client Timeout"
            prepend-inner-icon="mdi-timer"
            hint="The amount of time the DNS server must wait before responding with a ServerFailure response to a client request when no answer is available. Valid range 1000-10000. Default 4000"
            v-model="settings.clientTimeout"
          ></v-text-field>
          <v-text-field
            label="TCP Send Timeout"
            prepend-inner-icon="mdi-clock-start"
            hint="The amount of time a TCP socket must wait for an ACK before closing the connection. This option will apply for DNS requests being received by the DNS Server over TCP, TLS, or HTTPS transports. Valid range 1000-90000. Default 10000"
            v-model="settings.tcpSendTimeout"
          ></v-text-field>
          <v-text-field
            label="TCP Receive Timeout"
            prepend-inner-icon="mdi-clock-end"
            hint="The amount of time a TCP socket must wait for data before closing the connection. This option will apply for DNS requests being received by the DNS Server over TCP, TLS, or HTTPS transports. Valid range 1000-90000. Default 10000"
            v-model="settings.tcpReceiveTimeout"
          ></v-text-field>
          <v-text-field
            label="QUIC Idle Timeout"
            prepend-inner-icon="mdi-sleep"
            hint="The time interval after which an idle QUIC connection will be closed. This option applies only to QUIC transport protocol. Default 60000"
            v-model="settings.quicIdleTimeout"
          ></v-text-field>
          <v-text-field
            label="QUIC Max Inbound Streams"
            prepend-inner-icon="mdi-transit-connection-variant"
            hint="The max number of inbound bidirectional streams that can be accepted per QUIC connection. This option applies only to QUIC transport protocol. Default 100"
            v-model="settings.quicMaxInboundStreams"
          ></v-text-field>
          <v-text-field
            label="Listen Backlog"
            prepend-inner-icon="mdi-playlist-play"
            hint="The maximum number of pending connections. This option applies to TCP, TLS, and QUIC transport protocols. Default 100"
            v-model="settings.listenBacklog"
          ></v-text-field>
          <v-text-field
            label="Max Concurrent Resolutions"
            prepend-inner-icon="mdi-server-network"
            hint="The maximum number of concurrent async outbound resolutions that should be done per CPU core. Default 100"
            v-model="settings.maxConcurrentResolutionsPerCore"
            suffix="per CPU core (default 100)"
          ></v-text-field>
        </v-card-text>
      </v-card>
    </div>

    <div class="my-4">
      <v-card>
        <v-card-text class="d-flex flex-wrap justify-space-around">
          <v-btn
            v-can="{ section: 'Settings', action: 'modify' }"
            color="primary"
            class="ma-2"
            @click="saveSettings()"
            >Save Settings</v-btn
          >
          <v-btn
            v-can="{ section: 'Settings', action: 'modify' }"
            color="error"
            class="ma-2"
            >Flush Cache</v-btn
          >
          <v-btn
            v-can="{ section: 'Settings', action: 'modify' }"
            color="success"
            class="ma-2"
            >Backup Settings</v-btn
          >
          <v-btn
            v-can="{ section: 'Settings', action: 'modify' }"
            color="warning"
            class="ma-2"
            >Restore Settings</v-btn
          >
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script>
const axios = require("axios");
export default {
  name: "generalSettings",
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
          // Flatten and convert array fields to string for textarea/textfield
          const s = response.data.response;
          Object.keys(s).forEach((key) => {
            if (Array.isArray(s[key])) {
              s[key] = s[key].join("\n");
            }
          });
          delete s.version;
          delete s.uptimestamp;
          this.settings = s;
        });
    },
    saveSettings() {
      // Convert textarea/textfield string fields back to arrays where needed
      const arrFields = [
        "dnsServerLocalEndPoints",
        "dnsServerIPv4SourceAddresses",
        "dnsServerIPv6SourceAddresses",
        "zoneTransferAllowedNetworks",
        "notifyAllowedNetworks",
        "qpmLimitBypassList",
      ];
      const payload = { ...this.settings };
      arrFields.forEach((key) => {
        if (typeof payload[key] === "string") {
          payload[key] = payload[key]
            .split("\n")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
        }
      });
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
          if (res.data.status != "ok") {
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
.listing-item {
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>
