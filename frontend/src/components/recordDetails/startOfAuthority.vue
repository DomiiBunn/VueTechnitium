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
          <span>Type:</span><span class="chip-inset">SOA</span>
        </v-chip>
      </div>
      <div>
        <v-chip disabled class="ma-2 chip" small color="success" dark>
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
      disabled
      v-model="localDetails.name"
    ></v-text-field>
    <v-text-field
      label="TTL"
      prepend-inner-icon="mdi-clock"
      hint="Time To Leave in Seconds"
      v-model="localDetails.ttl"
    ></v-text-field
    ><v-text-field
      label="Primary Name Server"
      prepend-inner-icon="mdi-key-star"
      hint="Primary Name Server"
      v-model="localDetails.rData.primaryNameServer"
    ></v-text-field
    ><v-text-field
      label="Responsible Person"
      prepend-inner-icon="mdi-account"
      hint="Time To Leave in Seconds"
      v-model="localDetails.rData.responsiblePerson"
    ></v-text-field
    ><v-text-field
      label="Serial"
      prepend-inner-icon="mdi-serial-port"
      hint="Time To Leave in Seconds"
      v-model="localDetails.rData.serial"
    ></v-text-field
    ><v-text-field
      label="Refresh"
      prepend-inner-icon="mdi-refresh"
      hint="Time To Leave in Seconds"
      v-model="localDetails.rData.refresh"
    ></v-text-field
    ><v-text-field
      label="Retry"
      prepend-inner-icon="mdi-reload"
      hint="Time To Leave in Seconds"
      v-model="localDetails.rData.retry"
    ></v-text-field
    ><v-text-field
      label="Expire"
      prepend-inner-icon="mdi-minus"
      hint="Time To Leave in Seconds"
      v-model="localDetails.rData.expire"
    ></v-text-field
    ><v-text-field
      label="Minimum"
      prepend-inner-icon="mdi-clock"
      hint="Time To Leave in Seconds"
      v-model="localDetails.rData.minimum"
    ></v-text-field>

    <v-textarea
      name="input-7-1"
      prepend-inner-icon="mdi-comment"
      label="Comments"
      v-model="localDetails.comments"
      hint="Comments"
    ></v-textarea>
    <v-btn @click="saveZone" color="primary">Save</v-btn>
    {{ localDetails }}
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
        "MMMM Do YYYY, h:mm:ss a",
      );
    },
    saveZone() {
      let a = this.localDetails;
      this.$axios
        .post(
          `/api/zone/updateRecord?token=${localStorage.appToken}&zone=${this.$route.params.zoneId}&type=${a.type}&domain=${this.recordDetails.name}&newDomain=${a.name}&ttl=${a.ttl}&comments=${a.comments}&responsible=${a.rData.responsible}&newResponsible=${a.rData.responsible}&serial=${a.rData.serial}&newSerial=${a.rData.serial}&refresh=${a.rData.refresh}&newRefresh=${a.rData.refresh}&retry=${a.rData.retry}&newRetry=${a.rData.retry}&expire=${a.rData.expire}&newExpire=${a.rData.expire}&minimum=${a.rData.minimum}&newMinimum=${a.rData.minimum}`,
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
