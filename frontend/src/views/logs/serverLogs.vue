<template>
  <v-container>
    <v-row no-gutters>
      <v-col>
        <v-select
          v-model="selectedItem"
          :items="returnItems()"
          label="Select Log"
          solo
        ></v-select>
        <v-btn
          v-can="{ section: 'Logs', action: 'delete' }"
          class="button"
          @click="clearLog"
          dark
          color="danger"
          >Clear Logs</v-btn
        >
        <v-btn
          v-can="{ section: 'Logs', action: 'modify' }"
          class="button"
          @click="clearStats"
          dark
          color="warning"
          >Clear Stats</v-btn
        >
      </v-col>
    </v-row>
    <v-row>
      <v-col v-if="selectedItem" class="mx-auto">
        <v-card :loading="loadingLog">
          <v-card-text>
            <h4>Log: {{ selectedItem }}</h4>
            <highlight-code class="code logs-item" lang="accesslog">{{
              logData
            }}</highlight-code></v-card-text
          >
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      files: [],
      selectedItem: "",
      loadingFiles: true,
      loadingLog: true,
      logData: undefined,
    };
  },
  mounted() {
    this.getFiles();
  },
  methods: {
    getFiles() {
      let that = this;
      this.loadingFiles = true;
      this.$axios
        .post(`/api/logs/list?token=${localStorage.appToken}`)
        .then(function (response) {
          if (response.data.status == "ok") {
            that.files = response.data.response.logFiles;
            that.selectedItem = that.files[0].fileName;
          }
        })
        .finally(function () {
          that.loadingFiles = false;
        });
    },
    getLog() {
      let that = this;
      this.loadingLog = true;
      this.$axios
        .get(
          `/api/logs/download?token=${localStorage.appToken}&fileName=${this.selectedItem}&limit=2`,
        )
        .then(function (response) {
          that.logData = response.data;
        })
        .then(function () {
          that.loadingLog = false;
        });
    },
    returnItems() {
      let list = [];
      this.files.forEach((element) => {
        list.push({
          text: `${element.fileName} ${element.size}`,
          value: element.fileName,
        });
      });
      return list;
    },
    clearLog() {
      let that = this;
      this.$swal
        .fire({
          title: "Clear Logs?",
          text: "This action is not reversable!",
          icon: "error",
          confirmButtonColor: "#E48683",
          confirmButtonText: "Clear",
          cancelButtonText: "Cancel",
          showCancelButton: true,
          showCloseButton: true,
        })
        .then(function (result) {
          if (result.isConfirmed) {
            that.$axios.post(`/api/logs/delete?token=${localStorage.appToken}`);
          }
        });
    },
  },
  watch: {
    selectedItem: function () {
      this.getLog();
    },
  },
};
</script>

<style lang="scss" scoped>
.logs-item {
  height: calc(100vh - 350px);
  overflow: auto;
  width: 100%;
}
.button {
  margin-right: 15px;
}
</style>
