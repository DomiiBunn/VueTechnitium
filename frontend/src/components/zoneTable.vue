<template>
  <v-card>
    <v-card-title>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        hide-details
      ></v-text-field>
      <v-tooltip v-if="!internal" bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="mx-2"
            v-bind="attrs"
            v-on="on"
            fab
            dark
            color="primary"
            @click="addRecord"
          >
            <v-icon dark> mdi-plus </v-icon>
          </v-btn>
        </template>
        <span>Add New Record</span>
      </v-tooltip>
    </v-card-title>

    <v-toolbar v-if="selectedRecords.length > 0" flat>
      <v-toolbar-title>{{ selectedRecords.length }} selected</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        v-can="{ section: 'Zones', action: 'delete' }"
        color="error"
        @click="bulkDeleteRecords"
      >
        <v-icon left>mdi-delete</v-icon>
        Delete Selected
      </v-btn>
      <v-btn text @click="clearSelection">Clear Selection</v-btn>
    </v-toolbar>

    <v-data-table
      v-model="selectedRecords"
      :headers="headers"
      :items="tableData"
      :search="search"
      :items-per-page="-1"
      :expanded.sync="expanded"
      hide-default-footer
      show-expand
      show-select
      item-key="id"
      single-expand
    >
      <template v-slot:[`item.rData`]="{ item }">
        <span class="text-truncate" style="max-width: 200px">
          {{ item.rDataText || Object.values(item.rData).join(", ") }}
        </span>
      </template>
      <template v-slot:[`item.comments`]="{ item }">
        <v-chip v-if="item.comments" color="primary">
          <span v-if="item.comments.length < 15">{{ item.comments }}</span>
          <span v-else>{{ item.comments.substring(0, 15) }}...</span>
        </v-chip>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small class="mr-2" @click="editRecord(item)">mdi-pencil</v-icon>
        <v-icon small @click="deleteRecord(item)">mdi-delete</v-icon>
      </template>
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          <recordDetails :details="item" />
          <v-row>
            <v-col> </v-col>
          </v-row>
        </td>
      </template>
    </v-data-table>

    <addEditRecordDialog
      :dialog.sync="showAddEditRecordDialog"
      :zoneName="$route.params.zoneId"
      :isEditMode="isEditMode"
      :editedRecord="editedRecord"
      @record-saved="handleRecordSaved"
    />
  </v-card>
</template>

<script>
import recordData from "@/assets/json/recordDataNames.json";
import recordDetails from "@/components/recordDetails.vue";
import addEditRecordDialog from "@/components/addEditRecordDialog.vue";
import axios from "axios";

export default {
  components: {
    recordDetails,
    addEditRecordDialog,
  },
  methods: {
    returnName(index) {
      if (recordData[index]) {
        return recordData[index];
      }
      return index;
    },
    addRecord() {
      this.isEditMode = false;
      this.editedRecord = {};
      this.showAddEditRecordDialog = true;
    },
    editRecord(item) {
      this.isEditMode = true;
      this.editedRecord = { ...item };
      this.showAddEditRecordDialog = true;
    },
    deleteRecord(item) {
      if (
        confirm(
          `Are you sure you want to delete the record ${item.name} (${item.type})?`,
        )
      ) {
        axios
          .post(
            `/api/zones/records/delete?token=${localStorage.appToken}&zone=${this.$route.params.zoneId}&domain=${item.name}&type=${item.type}`,
          )
          .then(() => {
            this.$emit("record-saved");
          })
          .catch((error) => {
            console.error(error);
          });
      }
    },
    bulkDeleteRecords() {
      if (
        !confirm(
          `Are you sure you want to delete ${this.selectedRecords.length} records?`,
        )
      ) {
        return;
      }

      const deletePromises = this.selectedRecords.map((record) => {
        return axios.post(
          `/api/zones/records/delete?token=${localStorage.appToken}&zone=${this.$route.params.zoneId}&domain=${record.name}&type=${record.type}`,
        );
      });

      Promise.all(deletePromises)
        .then(() => {
          this.$toast.success(
            `Successfully deleted ${this.selectedRecords.length} records`,
          );
          this.selectedRecords = [];
          this.$emit("record-saved");
        })
        .catch((error) => {
          console.error(error);
          this.$toast.error("Failed to delete some records");
          this.$emit("record-saved"); // Refresh even on partial success
        });
    },
    clearSelection() {
      this.selectedRecords = [];
    },
    handleRecordSaved() {
      this.$emit("record-saved");
    },
  },
  props: {
    records: Array,
    internal: Boolean,
  },
  computed: {
    tableData() {
      let dataArray = [];
      let count = 0;
      this.records.forEach((element) => {
        let object = element;
        object.id = count;
        count++;
        dataArray.push(element);
      });
      return dataArray;
    },
  },
  data() {
    return {
      search: "",
      headers: [
        { text: "Name", value: "name" },
        { text: "Type", value: "type" },
        { text: "TTL", value: "ttl" },
        { text: "Data", value: "rData" },
        { text: "Comments", value: "comments" },
        { text: "Actions", value: "actions", sortable: false },
        { text: "", value: "data-table-expand" },
      ],
      expanded: [],
      selectedRecords: [],
      showAddEditRecordDialog: false,
      isEditMode: false,
      editedRecord: {},
    };
  },
};
</script>

<style scoped>
::v-deep .v-data-table {
  font-size: 0.875rem;
}

::v-deep .v-data-table thead th {
  padding: 8px 4px !important;
  height: auto !important;
}

::v-deep .v-data-table tbody td {
  padding: 4px !important;
  height: auto !important;
}

::v-deep .v-data-table .text-truncate {
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
