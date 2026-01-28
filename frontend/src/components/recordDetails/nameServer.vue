<template>
  <div class="inset">
    <div class="flex">
      <div>
        <v-chip
          v-bind="attrs"
          v-on="on"
          class="ma-2 chip inset-chip"
          small
          color="primary"
          dark
        >
          <span>Type:</span><span class="chip-inset">NS</span>
        </v-chip>
      </div>
      <div v-if="localDetails.disabled">
        <v-chip class="ma-2 chip" small color="danger" dark>
          <span>Disabled</span>
        </v-chip>
      </div>
      <div v-else>
        <v-chip class="ma-2 chip" small color="success" dark>
          <span>Enabled</span>
        </v-chip>
      </div>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-chip
            v-bind="attrs"
            v-on="on"
            class="ma-2 chip inset-chip"
            small
            color="success"
            dark
          >
            <span>Last Used:</span
            ><span class="chip-inset">{{ returnFromNowDate() }}</span>
          </v-chip>
        </template>
        <span>{{ returnHumanDate() }}</span>
      </v-tooltip>
    </div>
    <v-text-field
      label="Name"
      prepend-inner-icon="mdi-text-box"
      hint="Record Name"
      v-model="localDetails.name"
    ></v-text-field>
    <v-text-field
      label="TTL"
      prepend-inner-icon="mdi-clock"
      hint="Time To Leave in Seconds"
      v-model="localDetails.ttl"
    ></v-text-field>
    <v-text-field
      label="Name Server"
      prepend-inner-icon="mdi-home"
      hint="Name Server Address"
      v-model="localDetails.rData.nameServer"
    ></v-text-field>
    <v-textarea
      name="input-7-1"
      label="Glue Addresses"
      prepend-inner-icon="mdi-ip"
      v-model="localDetails.glueRecords"
      hint="Glue Addresses"
    ></v-textarea>
    <v-textarea
      name="input-7-1"
      prepend-inner-icon="mdi-comment"
      label="Comments"
      v-model="localDetails.comments"
      hint="Comments"
    ></v-textarea>
    <v-btn @click="saveZone" color="primary">Save</v-btn>
  </div>
</template>

<script>
import moment from "moment";

export default {
  props: {
    recordDetails: Object,
  },
  data() {
    return {
      localDetails: {},
    };
  },
  mounted() {
    this.localDetails = this.recordDetails;
  },
  updated() {
    this.localDetails = this.recordDetails;
  },
  methods: {
    returnFromNowDate() {
      if (this.recordDetails.lastUsedOn == "0001-01-01T00:00:00") {
        return "Never";
      }
      return moment(this.recordDetails.lastUsedOn).fromNow();
    },
    returnHumanDate() {
      if (this.recordDetails.lastUsedOn == "0001-01-01T00:00:00") {
        return "Never";
      }
      return moment(this.recordDetails.lastUsedOn).format(
        "MMMM Do YYYY, h:mm:ss a"
      );
    },
    saveZone() {
      let a = this.localDetails;
      this.$axios
        .post(
          `/api/zone/updateRecord?token=${localStorage.appToken}&nameServer=${this.recordDetails.rData.nameServer}&newNameServer=${a.rData.nameServer}&zone=${this.$route.params.zoneId}&type=${a.type}&domain=${this.recordDetails.name}&newDomain=${a.name}&ttl=${a.ttl}&comments=${a.comments}&glue=${a.glueRecords}`
        )
        .then(() => {
          // Handle success if needed
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.inset {
  padding: 20px;
}

.flex {
  display: flex;
}
.inset-chip {
  padding-right: 3px;
}

.chip-inset {
  background-color: white;
  color: black;
  border-radius: 0 15px 15px 0;
  padding-right: 10px;
  padding-left: 3px;
}
</style>
