<template>
  <div>
    <v-row>
      <v-col>
        <nameServer :recordDetails="details" v-if="details.type == 'NS'" />
        <startOfAuthority
          :recordDetails="details"
          v-if="details.type == 'SOA'"
        />
        <serverDetail :recordDetails="details" v-if="details.type == 'SRV'" />
        <ZoneIPv4 :recordDetails="details" v-if="details.type == 'A'" />
        <ZoneIPv6 :recordDetails="details" v-if="details.type == 'AAAA'" />

        <CanonicalName
          :recordDetails="details"
          v-if="details.type == 'CNAME'"
        /><DelegationName
          :recordDetails="details"
          v-if="details.type == 'DNAME'"
        />
        <PointerRecord :recordDetails="details" v-if="details.type == 'PTR'" />
        <MailExchange :recordDetails="details" v-if="details.type == 'MX'" />
        <TextRecord :recordDetails="details" v-if="details.type == 'TXT'" />
        <CertificationAuthorityAuthorization
          :recordDetails="details"
          v-if="details.type == 'CAA'"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col class="col-right">
        <v-spacer></v-spacer>
        <v-tooltip v-if="(details.type != 'SOA') & !details.disabled" bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon color="warning" dark v-bind="attrs" v-on="on">
              mdi-server-network-off
            </v-icon>
          </template>
          <span>Disable</span>
        </v-tooltip>
        <v-tooltip
          v-if="!details.type != 'SOA' && details.disabled == true"
          bottom
        >
          <template v-slot:activator="{ on, attrs }">
            <v-icon color="success" dark v-bind="attrs" v-on="on">
              mdi-server-network
            </v-icon>
          </template>
          <span>Enable</span>
        </v-tooltip>
        <v-tooltip v-if="details.type != 'SOA' && !details.internal" bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon color="danger" dark v-bind="attrs" v-on="on">
              mdi-delete
            </v-icon>
          </template>
          <span>Delete</span>
        </v-tooltip>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import nameServer from "@/components/recordDetails/nameServer.vue";
import startOfAuthority from "@/components/recordDetails/startOfAuthority.vue";
import serverDetail from "@/components/recordDetails/serverDetail.vue";
import ZoneIPv4 from "./recordDetails/zoneIPv4.vue";
import CanonicalName from "./recordDetails/canonicalName.vue";
import PointerRecord from "./recordDetails/pointerRecord.vue";
import MailExchange from "./recordDetails/mailExchange.vue";
import TextRecord from "./recordDetails/textRecord.vue";
import ZoneIPv6 from "./recordDetails/zoneIPv6.vue";
import DelegationName from "./recordDetails/delegationName.vue";
import CertificationAuthorityAuthorization from "./recordDetails/certificationAuthorityAuthorization.vue";
export default {
  components: {
    nameServer,
    startOfAuthority,
    serverDetail,
    ZoneIPv4,
    CanonicalName,
    PointerRecord,
    MailExchange,
    TextRecord,
    ZoneIPv6,
    DelegationName,
    CertificationAuthorityAuthorization,
  },
  props: {
    details: Object,
  },
};
</script>

<style lang="scss" scoped>
.col-right {
  width: 100%;
  display: flex;
}
</style>
