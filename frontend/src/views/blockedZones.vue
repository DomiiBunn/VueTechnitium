<template>
  <v-container>
    <v-row>
      <v-col>
        <v-btn
          color="warning"
          @click="showDisableDialog = true"
          v-can="{ section: 'Blocked', action: 'modify' }"
          prepend-icon="mdi-pause"
        >
          Disable Blocking Temporarily
        </v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col v-if="blockingDisabledTill" class="text-right">
        <v-chip color="warning" text-color="white">
          <v-icon left>mdi-pause</v-icon>
          Blocking disabled until {{ formatTime(blockingDisabledTill) }}
        </v-chip>
      </v-col>
    </v-row>

    <!-- Disable Blocking Dialog -->
    <v-dialog v-model="showDisableDialog" max-width="400">
      <v-card>
        <v-card-title>Disable Blocking</v-card-title>
        <v-card-text>
          <v-select
            v-model="disableDuration"
            :items="disableDurations"
            item-text="label"
            item-value="minutes"
            label="Duration"
          ></v-select>
          <v-text-field
            v-if="disableDuration === 'custom'"
            v-model.number="customMinutes"
            type="number"
            label="Minutes"
            min="1"
            max="1440"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" text @click="showDisableDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="warning" @click="disableBlocking">Disable</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-row>
      <v-col>
        <zoneListing listingType="blocked" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import zoneListing from "@/components/zoneListing.vue";
import axios from "axios";

export default {
  components: {
    zoneListing,
  },
  data() {
    return {
      showDisableDialog: false,
      disableDuration: 60,
      customMinutes: 60,
      blockingDisabledTill: null,
      disableDurations: [
        { label: "1 hour", minutes: 60 },
        { label: "6 hours", minutes: 360 },
        { label: "24 hours", minutes: 1440 },
        { label: "Custom", minutes: "custom" },
      ],
    };
  },
  mounted() {
    this.checkBlockingStatus();
    // Check status every minute
    this.statusInterval = setInterval(this.checkBlockingStatus, 60000);
  },
  beforeDestroy() {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
  },
  methods: {
    disableBlocking() {
      const duration =
        this.disableDuration === "custom"
          ? this.customMinutes
          : this.disableDuration;

      if (!duration || duration < 1) {
        this.$toast.error("Please enter a valid duration");
        return;
      }

      axios
        .post(
          `/api/settings/temporaryDisableBlocking?token=${localStorage.appToken}&minutes=${duration}`,
        )
        .then(() => {
          this.$toast.success(`Blocking disabled for ${duration} minutes`);
          this.showDisableDialog = false;
          this.checkBlockingStatus();
        })
        .catch(() => {
          this.$toast.error("Failed to disable blocking");
        });
    },
    checkBlockingStatus() {
      axios
        .post(`/api/settings/get?token=${localStorage.appToken}`)
        .then((response) => {
          if (
            response.data.status === "ok" &&
            response.data.response.temporaryDisableBlockingTill
          ) {
            const disabledTill = new Date(
              response.data.response.temporaryDisableBlockingTill,
            );
            if (disabledTill > new Date()) {
              this.blockingDisabledTill = disabledTill;
            } else {
              this.blockingDisabledTill = null;
            }
          } else {
            this.blockingDisabledTill = null;
          }
        });
    },
    formatTime(dateString) {
      return new Date(dateString).toLocaleString();
    },
  },
};
</script>

<style lang="scss" scoped></style>
