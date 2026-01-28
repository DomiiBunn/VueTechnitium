<template>
  <v-dialog
    :value="dialog"
    @input="$emit('update:dialog', $event)"
    max-width="800px"
  >
    <v-card>
      <v-card-title>{{
        isEditMode ? "Edit Record" : "Add Record"
      }}</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field
            v-model="record.name"
            label="Name"
            :placeholder="zoneName === '.' ? '@' : ''"
            :rules="[rules.required]"
            :disabled="isEditMode && record.type === 'SOA'"
          ></v-text-field>
          <v-select
            v-model="record.type"
            :items="recordTypes"
            label="Type"
            :rules="[rules.required]"
            @change="onTypeChange"
            :disabled="isEditMode"
          ></v-select>
          <v-text-field
            v-model.number="record.ttl"
            label="TTL"
            type="number"
            :rules="[rules.required, rules.number]"
            :disabled="isEditMode && record.type === 'FWD'"
          ></v-text-field>

          <!-- Dynamic fields based on record.type -->
          <div v-if="record.type === 'A' || record.type === 'AAAA'">
            <v-text-field
              v-model="record.ipAddress"
              :label="record.type === 'A' ? 'IPv4 Address' : 'IPv6 Address'"
              :rules="[
                rules.required,
                record.type === 'A' ? rules.ipv4 : rules.ipv6,
              ]"
            ></v-text-field>
            <v-checkbox
              v-model="record.ptr"
              label="Add reverse (PTR) record"
            ></v-checkbox>
            <v-checkbox
              v-model="record.createPtrZone"
              label="Create reverse zone for PTR record"
              :disabled="!record.ptr"
            ></v-checkbox>
          </div>

          <div v-if="record.type === 'NS'">
            <v-text-field
              v-model="record.nameServer"
              label="Name Server"
              :rules="[rules.required]"
            ></v-text-field>
            <v-textarea
              v-model="record.glue"
              label="Glue Addresses (one per line)"
            ></v-textarea>
          </div>

          <div v-if="record.type === 'SOA'">
            <v-text-field
              v-model="record.primaryNameServer"
              label="Primary Name Server"
              :rules="[rules.required]"
            ></v-text-field>
            <v-text-field
              v-model="record.responsiblePerson"
              label="Responsible Person"
              :rules="[rules.required]"
            ></v-text-field>
            <v-text-field
              v-model.number="record.serial"
              label="Serial"
              type="number"
              :rules="[rules.required, rules.number]"
              :disabled="record.useSerialDateScheme"
            ></v-text-field>
            <v-checkbox
              v-model="record.useSerialDateScheme"
              label="Use Serial Date Scheme (Automatic)"
            ></v-checkbox>
            <v-text-field
              v-model.number="record.refresh"
              label="Refresh (seconds)"
              type="number"
              :rules="[rules.required, rules.number]"
            ></v-text-field>
            <v-text-field
              v-model.number="record.retry"
              label="Retry (seconds)"
              type="number"
              :rules="[rules.required, rules.number]"
            ></v-text-field>
            <v-text-field
              v-model.number="record.expire"
              label="Expire (seconds)"
              type="number"
              :rules="[rules.required, rules.number]"
            ></v-text-field>
            <v-text-field
              v-model.number="record.minimum"
              label="Minimum (seconds)"
              type="number"
              :rules="[rules.required, rules.number]"
            ></v-text-field>
          </div>

          <div
            v-if="
              record.type === 'CNAME' ||
              record.type === 'PTR' ||
              record.type === 'DNAME' ||
              record.type === 'ANAME'
            "
          >
            <v-text-field
              v-model="record.domainName"
              label="Domain Name"
              :rules="[rules.required]"
            ></v-text-field>
          </div>

          <div v-if="record.type === 'MX'">
            <v-text-field
              v-model.number="record.preference"
              label="Preference"
              type="number"
              :rules="[rules.required, rules.number]"
            ></v-text-field>
            <v-text-field
              v-model="record.exchange"
              label="Exchange"
              :rules="[rules.required]"
            ></v-text-field>
          </div>

          <div v-if="record.type === 'TXT'">
            <v-textarea
              v-model="record.textData"
              label="Text Data"
              :rules="[rules.required]"
            ></v-textarea>
            <v-checkbox
              v-model="record.splitText"
              label="Use New Line To Split Text Into Multiple Character-Strings"
            ></v-checkbox>
          </div>

          <div v-if="record.type === 'RP'">
            <v-text-field
              v-model="record.mailbox"
              label="Mailbox"
              :rules="[rules.required]"
            ></v-text-field>
            <v-text-field
              v-model="record.txtDomain"
              label="TXT Domain"
              :rules="[rules.required]"
            ></v-text-field>
          </div>

          <div v-if="record.type === 'SRV'">
            <v-text-field
              v-model.number="record.priority"
              label="Priority"
              type="number"
              :rules="[rules.required, rules.number]"
            ></v-text-field>
            <v-text-field
              v-model.number="record.weight"
              label="Weight"
              type="number"
              :rules="[rules.required, rules.number]"
            ></v-text-field>
            <v-text-field
              v-model.number="record.port"
              label="Port"
              type="number"
              :rules="[rules.required, rules.number]"
            ></v-text-field>
            <v-text-field
              v-model="record.target"
              label="Target"
              :rules="[rules.required]"
            ></v-text-field>
          </div>

          <div v-if="record.type === 'NAPTR'">
            <v-text-field
              v-model.number="record.order"
              label="Order"
              type="number"
              :rules="[rules.required, rules.number]"
            ></v-text-field>
            <v-text-field
              v-model.number="record.naptrPreference"
              label="Preference"
              type="number"
              :rules="[rules.required, rules.number]"
            ></v-text-field>
            <v-text-field v-model="record.flags" label="Flags"></v-text-field>
            <v-text-field
              v-model="record.services"
              label="Services"
            ></v-text-field>
            <v-text-field
              v-model="record.regexp"
              label="Regular Expression"
            ></v-text-field>
            <v-text-field
              v-model="record.replacement"
              label="Replacement"
            ></v-text-field>
          </div>

          <div v-if="record.type === 'DS'">
            <v-text-field
              v-model.number="record.keyTag"
              label="Key Tag"
              type="number"
              :rules="[rules.required, rules.number]"
            ></v-text-field>
            <v-select
              v-model="record.algorithm"
              :items="dnssecAlgorithms"
              label="Algorithm"
              :rules="[rules.required]"
            ></v-select>
            <v-select
              v-model="record.digestType"
              :items="dnssecDigestTypes"
              label="Digest Type"
              :rules="[rules.required]"
            ></v-select>
            <v-text-field
              v-model="record.digest"
              label="Digest"
              :rules="[rules.required]"
            ></v-text-field>
          </div>

          <div v-if="record.type === 'SSHFP'">
            <v-select
              v-model="record.sshfpAlgorithm"
              :items="sshfpAlgorithms"
              label="Algorithm"
              :rules="[rules.required]"
            ></v-select>
            <v-select
              v-model="record.fingerprintType"
              :items="sshfpFingerprintTypes"
              label="Fingerprint Type"
              :rules="[rules.required]"
            ></v-select>
            <v-text-field
              v-model="record.fingerprint"
              label="Fingerprint"
              :rules="[rules.required]"
            ></v-text-field>
          </div>

          <div v-if="record.type === 'TLSA'">
            <v-select
              v-model="record.certificateUsage"
              :items="tlsaCertificateUsages"
              label="Certificate Usage"
              :rules="[rules.required]"
            ></v-select>
            <v-select
              v-model="record.selector"
              :items="tlsaSelectors"
              label="Selector"
              :rules="[rules.required]"
            ></v-select>
            <v-select
              v-model="record.matchingType"
              :items="tlsaMatchingTypes"
              label="Matching Type"
              :rules="[rules.required]"
            ></v-select>
            <v-textarea
              v-model="record.certificateAssociationData"
              label="Certificate Association Data"
              :rules="[rules.required]"
            ></v-textarea>
          </div>

          <div v-if="record.type === 'SVCB' || record.type === 'HTTPS'">
            <v-text-field
              v-model.number="record.svcPriority"
              label="Priority"
              type="number"
              :rules="[rules.required, rules.number]"
            ></v-text-field>
            <v-text-field
              v-model="record.svcTargetName"
              label="Target Name"
              :rules="[rules.required]"
            ></v-text-field>
            <v-checkbox
              v-model="record.autoIpv4Hint"
              label="Use Automatic IPv4 Hint"
            ></v-checkbox>
            <v-checkbox
              v-model="record.autoIpv6Hint"
              label="Use Automatic IPv6 Hint"
            ></v-checkbox>
            <!-- SVCB Params will be a complex table, simplified for now -->
          </div>

          <div v-if="record.type === 'URI'">
            <v-text-field
              v-model.number="record.uriPriority"
              label="Priority"
              type="number"
              :rules="[rules.required, rules.number]"
            ></v-text-field>
            <v-text-field
              v-model.number="record.uriWeight"
              label="Weight"
              type="number"
              :rules="[rules.required, rules.number]"
            ></v-text-field>
            <v-text-field
              v-model="record.uri"
              label="URI"
              :rules="[rules.required]"
            ></v-text-field>
          </div>

          <div v-if="record.type === 'CAA'">
            <v-text-field
              v-model.number="record.caaFlags"
              label="Flags"
              type="number"
            ></v-text-field>
            <v-text-field
              v-model="record.tag"
              label="Tag"
              :rules="[rules.required]"
            ></v-text-field>
            <v-text-field
              v-model="record.value"
              label="Authority"
              :rules="[rules.required]"
            ></v-text-field>
          </div>

          <div v-if="record.type === 'FWD'">
            <v-select
              v-model="record.protocol"
              :items="forwarderProtocols"
              label="Protocol"
              :rules="[rules.required]"
            ></v-select>
            <v-checkbox
              v-model="record.useThisServer"
              label="Use 'This Server'"
              @change="toggleForwarderThisServer"
            ></v-checkbox>
            <v-text-field
              v-model="record.forwarder"
              label="Forwarder"
              :rules="[rules.required]"
              :disabled="record.useThisServer"
            ></v-text-field>
            <v-text-field
              v-model.number="record.forwarderPriority"
              label="Priority"
              type="number"
            ></v-text-field>
            <v-checkbox
              v-model="record.dnssecValidation"
              label="Enable DNSSEC Validation"
            ></v-checkbox>
            <v-select
              v-model="record.proxyType"
              :items="proxyTypes"
              label="Proxy Type"
              :disabled="record.useThisServer"
            ></v-select>
            <div
              v-if="
                record.proxyType === 'Http' || record.proxyType === 'Socks5'
              "
            >
              <v-text-field
                v-model="record.proxyAddress"
                label="Proxy Server Address"
                :rules="[rules.required]"
              ></v-text-field>
              <v-text-field
                v-model.number="record.proxyPort"
                label="Proxy Server Port"
                type="number"
                :rules="[rules.required, rules.number]"
              ></v-text-field>
              <v-text-field
                v-model="record.proxyUsername"
                label="Proxy Server Username"
              ></v-text-field>
              <v-text-field
                v-model="record.proxyPassword"
                label="Proxy Server Password"
                type="password"
              ></v-text-field>
            </div>
          </div>

          <div v-if="record.type === 'APP'">
            <v-select
              v-model="record.appName"
              :items="appNames"
              label="App Name"
              :rules="[rules.required]"
              @change="onAppNameChange"
            ></v-select>
            <v-select
              v-model="record.classPath"
              :items="classPaths"
              label="Class Path"
              :rules="[rules.required]"
            ></v-select>
            <v-textarea
              v-model="record.recordData"
              label="Record Data (if any)"
            ></v-textarea>
          </div>

          <div v-if="record.type === 'Unknown'">
            <v-text-field
              v-model="record.unknownType"
              label="RR Type"
              :rules="[rules.required]"
              :disabled="isEditMode"
            ></v-text-field>
            <v-text-field
              v-model="record.rdata"
              label="RDATA (hex string)"
              :rules="[rules.required]"
            ></v-text-field>
          </div>

          <v-checkbox
            v-if="!isEditMode"
            v-model="record.overwrite"
            label="Overwrite existing records"
          ></v-checkbox>
          <v-text-field
            v-model="record.comments"
            label="Comments"
          ></v-text-field>
          <v-text-field
            v-model.number="record.expiryTtl"
            label="Expiry TTL (seconds)"
            type="number"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="close">Cancel</v-btn>
        <v-btn color="primary" @click="saveRecord">{{
          isEditMode ? "Save" : "Add"
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";

export default {
  props: {
    dialog: Boolean,
    zoneName: String,
    isEditMode: Boolean,
    editedRecord: Object,
  },
  data() {
    return {
      valid: true,
      record: {
        name: "",
        type: "A",
        ttl: 3600,
        // Common fields
        comments: "",
        expiryTtl: 0,
        overwrite: false,

        // A/AAAA
        ipAddress: "",
        ptr: false,
        createPtrZone: false,

        // NS
        nameServer: "",
        glue: "",

        // SOA
        primaryNameServer: "",
        responsiblePerson: "",
        serial: 1,
        refresh: 900,
        retry: 300,
        expire: 604800,
        minimum: 900,
        useSerialDateScheme: true,

        // CNAME, PTR, DNAME, ANAME
        domainName: "",

        // MX
        preference: 1,
        exchange: "",

        // TXT
        textData: "",
        splitText: false,

        // RP
        mailbox: "",
        txtDomain: "",

        // SRV
        priority: 0,
        weight: 0,
        port: 0,
        target: "",

        // NAPTR
        order: 0,
        naptrPreference: 0,
        flags: "",
        services: "",
        regexp: "",
        replacement: "",

        // DS
        keyTag: 0,
        algorithm: "",
        digestType: "",
        digest: "",

        // SSHFP
        sshfpAlgorithm: "",
        fingerprintType: "",
        fingerprint: "",

        // TLSA
        certificateUsage: "",
        selector: "",
        matchingType: "",
        certificateAssociationData: "",

        // SVCB/HTTPS
        svcPriority: 0,
        svcTargetName: "",
        autoIpv4Hint: false,
        autoIpv6Hint: false,

        // URI
        uriPriority: 0,
        uriWeight: 0,
        uri: "",

        // CAA
        caaFlags: 0,
        tag: "issue",
        value: "",

        // FWD
        protocol: "UDP",
        useThisServer: false,
        forwarder: "",
        forwarderPriority: 0,
        dnssecValidation: false,
        proxyType: "NoProxy",
        proxyAddress: "",
        proxyPort: 0,
        proxyUsername: "",
        proxyPassword: "",

        // APP
        appName: "",
        classPath: "",
        recordData: "",

        // Unknown
        unknownType: "",
        rdata: "",
      },
      recordTypes: [
        "A",
        "AAAA",
        "NS",
        "CNAME",
        "SOA",
        "PTR",
        "MX",
        "TXT",
        "RP",
        "SRV",
        "NAPTR",
        "DNAME",
        "DS",
        "SSHFP",
        "TLSA",
        "SVCB",
        "HTTPS",
        "URI",
        "CAA",
        "ANAME",
        "FWD",
        "APP",
        "Unknown",
      ],
      dnssecAlgorithms: [
        "RSAMD5",
        "RSASHA1",
        "RSASHA256",
        "RSASHA512",
        "ECDSAP256SHA256",
        "ECDSAP384SHA384",
        "ED25519",
        "ED448",
      ],
      dnssecDigestTypes: ["SHA1", "SHA256", "SHA384"],
      sshfpAlgorithms: ["RSA", "DSA", "ECDSA", "Ed25519", "Ed448"],
      sshfpFingerprintTypes: ["SHA1", "SHA256"],
      tlsaCertificateUsages: ["PKIX-TA", "PKIX-EE", "DANE-TA", "DANE-EE"],
      tlsaSelectors: ["Cert", "SPKI"],
      tlsaMatchingTypes: ["Full", "SHA2-256", "SHA2-512"],
      forwarderProtocols: ["UDP", "TCP", "TLS", "HTTPS", "QUIC"],
      proxyTypes: ["NoProxy", "DefaultProxy", "Http", "Socks5"],
      appNames: [],
      classPaths: [],
      rules: {
        required: (value) => !!value || "Required.",
        number: (value) =>
          (!isNaN(parseFloat(value)) && isFinite(value)) || "Must be a number.",
        ipv4: (value) =>
          /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
            value,
          ) || "Invalid IPv4 address.",
        ipv6: (value) =>
          /^(([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:))|(([0-9a-fA-F]{1,4}:){6}(:[0-9a-fA-F]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-fA-F]{1,4}:){5}(((:[0-9a-fA-F]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-fA-F]{1,4}:){4}(((:[0-9a-fA-F]{1,4}){1,3})|((:[0-9a-fA-F]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-fA-F]{1,4}:){3}(((:[0-9a-fA-F]{1,4}){1,4})|((:[0-9a-fA-F]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-fA-F]{1,4}:){2}(((:[0-9a-fA-F]{1,4}){1,5})|((:[0-9a-fA-F]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-fA-F]{1,4}:){1}(((:[0-9a-fA-F]{1,4}){1,6})|((:[0-9a-fA-F]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-fA-F]{1,4}){1,7})|((:[0-9a-fA-F]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))$/.test(
            value,
          ) || "Invalid IPv6 address.",
      },
    };
  },
  watch: {
    dialog(val) {
      if (val) {
        if (this.isEditMode) {
          this.record = { ...this.editedRecord };
          if (this.record.type === "FWD") {
            this.record.useThisServer = this.record.forwarder === "this-server";
          }
          if (this.record.type === "APP") {
            this.getApps();
          }
        } else {
          this.record = {
            name: "",
            type: "A",
            ttl: 3600,
            comments: "",
            expiryTtl: 0,
            overwrite: false,
            ipAddress: "",
            ptr: false,
            createPtrZone: false,
            nameServer: "",
            glue: "",
            primaryNameServer: "",
            responsiblePerson: "",
            serial: 1,
            refresh: 900,
            retry: 300,
            expire: 604800,
            minimum: 900,
            useSerialDateScheme: true,
            domainName: "",
            preference: 1,
            exchange: "",
            textData: "",
            splitText: false,
            mailbox: "",
            txtDomain: "",
            priority: 0,
            weight: 0,
            port: 0,
            target: "",
            order: 0,
            naptrPreference: 0,
            flags: "",
            services: "",
            regexp: "",
            replacement: "",
            keyTag: 0,
            algorithm: "",
            digestType: "",
            digest: "",
            sshfpAlgorithm: "",
            fingerprintType: "",
            fingerprint: "",
            certificateUsage: "",
            selector: "",
            matchingType: "",
            certificateAssociationData: "",
            svcPriority: 0,
            svcTargetName: "",
            autoIpv4Hint: false,
            autoIpv6Hint: false,
            uriPriority: 0,
            uriWeight: 0,
            uri: "",
            caaFlags: 0,
            tag: "issue",
            value: "",
            protocol: "UDP",
            useThisServer: false,
            forwarder: "",
            forwarderPriority: 0,
            dnssecValidation: false,
            proxyType: "NoProxy",
            proxyAddress: "",
            proxyPort: 0,
            proxyUsername: "",
            proxyPassword: "",
            appName: "",
            classPath: "",
            recordData: "",
            unknownType: "",
            rdata: "",
          };
        }
        if (!this.isEditMode || this.record.type === "APP") {
          this.getApps();
        }
      } else {
        this.$refs.form.resetValidation();
      }
    },
  },
  methods: {
    onTypeChange() {
      // Reset specific fields when type changes, if necessary
      // For example, if switching from A to MX, clear IP address and fill MX specific defaults
    },
    toggleForwarderThisServer() {
      if (this.record.useThisServer) {
        this.record.forwarder = "this-server";
        this.record.proxyType = "NoProxy";
      } else {
        this.record.forwarder = "";
      }
    },
    getApps() {
      axios
        .post(`/api/apps/list?token=${localStorage.appToken}`)
        .then((response) => {
          this.appNames = response.data.response.apps.map((app) => app.name);
          // Filter class paths based on selected appName if in edit mode
          if (this.isEditMode && this.record.appName) {
            const selectedApp = response.data.response.apps.find(
              (app) => app.name === this.record.appName,
            );
            if (selectedApp) {
              this.classPaths = selectedApp.dnsApps
                .filter((dnsApp) => dnsApp.isAppRecordRequestHandler)
                .map((dnsApp) => dnsApp.classPath);
            }
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    onAppNameChange() {
      // Fetch class paths for the selected app
      axios
        .post(`/api/apps/list?token=${localStorage.appToken}`)
        .then((response) => {
          const selectedApp = response.data.response.apps.find(
            (app) => app.name === this.record.appName,
          );
          if (selectedApp) {
            this.classPaths = selectedApp.dnsApps
              .filter((dnsApp) => dnsApp.isAppRecordRequestHandler)
              .map((dnsApp) => dnsApp.classPath);
            this.record.classPath =
              this.classPaths.length > 0 ? this.classPaths[0] : "";
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    close() {
      this.$emit("update:dialog", false);
      this.$refs.form.reset();
    },
    saveRecord() {
      if (this.$refs.form.validate()) {
        const payload = { ...this.record };

        // Automatically append zone name to record.name if not '@' or empty
        if (payload.name !== "@" && payload.name !== "") {
          payload.name = `${payload.name}.${this.zoneName}`;
        } else if (payload.name === "") {
          payload.name = "@";
        }

        // Adjust payload for API based on record type
        let apiUrl = "";
        if (this.isEditMode) {
          apiUrl = `/api/zones/records/update?token=${localStorage.appToken}&zone=${this.zoneName}&type=${payload.type}&domain=${payload.name}&newDomain=${payload.name}&ttl=${payload.ttl}&comments=${payload.comments}&expiryTtl=${payload.expiryTtl}`;
        } else {
          apiUrl = `/api/zones/records/add?token=${localStorage.appToken}&zone=${this.zoneName}&domain=${payload.name}&type=${payload.type}&ttl=${payload.ttl}&overwrite=${payload.overwrite}&comments=${payload.comments}&expiryTtl=${payload.expiryTtl}`;
        }

        // Append type-specific parameters
        switch (payload.type) {
          case "A":
          case "AAAA":
            apiUrl += `&ipAddress=${payload.ipAddress}&ptr=${payload.ptr}&createPtrZone=${payload.createPtrZone}`;
            break;
          case "NS":
            apiUrl += `&nameServer=${
              payload.nameServer
            }&glue=${payload.glue.replace(/\n/g, ",")}`;
            break;
          case "SOA":
            if (this.isEditMode) {
              apiUrl += `&primaryNameServer=${payload.primaryNameServer}&responsiblePerson=${payload.responsiblePerson}&serial=${payload.serial}&refresh=${payload.refresh}&retry=${payload.retry}&expire=${payload.expire}&minimum=${payload.minimum}&useSerialDateScheme=${payload.useSerialDateScheme}`;
            } else {
              // SOA records are typically auto-created; adding SOA manually is rare
              this.$toast.warning(
                "SOA records are typically auto-created with zones",
              );
              return;
            }
            break;
          case "CNAME":
          case "PTR":
          case "DNAME":
          case "ANAME":
            apiUrl += `&domainName=${payload.domainName}`;
            break;
          case "MX":
            apiUrl += `&preference=${payload.preference}&exchange=${payload.exchange}`;
            break;
          case "TXT":
            apiUrl += `&text=${payload.textData}&splitText=${payload.splitText}`;
            break;
          case "RP":
            apiUrl += `&mailbox=${payload.mailbox}&txtDomain=${payload.txtDomain}`;
            break;
          case "SRV":
            apiUrl += `&priority=${payload.priority}&weight=${payload.weight}&port=${payload.port}&target=${payload.target}`;
            break;
          case "NAPTR":
            apiUrl += `&naptrOrder=${payload.order}&naptrPreference=${payload.naptrPreference}&naptrFlags=${payload.flags}&naptrServices=${payload.services}&naptrRegexp=${payload.regexp}&naptrReplacement=${payload.replacement}`;
            break;
          case "DS":
            apiUrl += `&keyTag=${payload.keyTag}&algorithm=${payload.algorithm}&digestType=${payload.digestType}&digest=${payload.digest}`;
            break;
          case "SSHFP":
            apiUrl += `&sshfpAlgorithm=${payload.sshfpAlgorithm}&sshfpFingerprintType=${payload.fingerprintType}&sshfpFingerprint=${payload.fingerprint}`;
            break;
          case "TLSA":
            apiUrl += `&tlsaCertificateUsage=${payload.certificateUsage}&tlsaSelector=${payload.selector}&tlsaMatchingType=${payload.matchingType}&tlsaCertificateAssociationData=${payload.certificateAssociationData}`;
            break;
          case "SVCB":
          case "HTTPS":
            apiUrl += `&svcPriority=${payload.svcPriority}&svcTargetName=${payload.svcTargetName}&autoIpv4Hint=${payload.autoIpv4Hint}&autoIpv6Hint=${payload.autoIpv6Hint}`;
            // SVCB Params are complex, need to serialize them correctly
            break;
          case "URI":
            apiUrl += `&uriPriority=${payload.uriPriority}&uriWeight=${payload.uriWeight}&uri=${payload.uri}`;
            break;
          case "CAA":
            apiUrl += `&flags=${payload.caaFlags}&tag=${payload.tag}&value=${payload.value}`;
            break;
          case "FWD":
            apiUrl += `&protocol=${payload.protocol}&forwarder=${payload.forwarder}&forwarderPriority=${payload.forwarderPriority}&dnssecValidation=${payload.dnssecValidation}&proxyType=${payload.proxyType}`;
            if (
              payload.proxyType === "Http" ||
              payload.proxyType === "Socks5"
            ) {
              apiUrl += `&proxyAddress=${payload.proxyAddress}&proxyPort=${payload.proxyPort}&proxyUsername=${payload.proxyUsername}&proxyPassword=${payload.proxyPassword}`;
            }
            break;
          case "APP":
            apiUrl += `&appName=${payload.appName}&classPath=${payload.classPath}&recordData=${payload.recordData}`;
            break;
          case "Unknown":
            apiUrl += `&unknownType=${payload.unknownType}&rdata=${payload.rdata}`;
            break;
        }

        axios
          .post(apiUrl)
          .then(() => {
            this.$emit("record-saved");
            this.close();
          })
          .catch((error) => {
            console.error(error);
          });
      }
    },
  },
  mounted() {
    if (!this.isEditMode) {
      this.getApps();
    }
  },
};
</script>
