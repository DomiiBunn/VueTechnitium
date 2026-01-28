<template>
  <v-data-table
    :headers="headers"
    :items="tableData"
    :search="search"
    :items-per-page="-1"
    hide-default-footer
    :loading="loading"
  >
    <template v-slot:[`item.view`]="{ item }">
      <v-checkbox v-model="item.view" dense hide-details></v-checkbox>
    </template>
    <template v-slot:[`item.modify`]="{ item }">
      <v-checkbox v-model="item.modify" dense hide-details></v-checkbox>
    </template>
    <template v-slot:[`item.canDelete`]="{ item }">
      <v-checkbox v-model="item.delete" dense hide-details></v-checkbox>
    </template>
    <template v-slot:[`item.actions`]="{ item }">
      <v-icon small class="cursor-pointer" @click="removePermission(item)"
        >mdi-delete</v-icon
      >
    </template>
  </v-data-table>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      required: true,
      validator: (value) => ["user", "group"].includes(value),
    },
    zoneName: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      search: "",
      loading: false,
      tableData: [],
      headers: [
        { text: "Name", value: "name" },
        { text: "View", value: "view" },
        { text: "Modify", value: "modify" },
        { text: "Delete", value: "canDelete" },
        { text: "", value: "actions" },
      ],
    };
  },
  mounted() {
    this.loadPermissions();
  },
  methods: {
    loadPermissions() {
      this.loading = true;

      this.$axios
        .get(
          `/api/zones/permissions/get?token=${localStorage.appToken}&zone=${this.zoneName}&includeUsersAndGroups=true`,
        )
        .then((response) => {
          if (response.data.status === "ok") {
            const permissions =
              this.type === "user"
                ? response.data.response.userPermissions
                : response.data.response.groupPermissions;

            this.tableData = permissions.map((perm) => ({
              name: this.type === "user" ? perm.username : perm.name,
              view: perm.canView,
              modify: perm.canModify,
              delete: perm.canDelete,
            }));
          }
        })
        .catch((error) => {
          console.error("Failed to load permissions:", error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    removePermission(item) {
      const index = this.tableData.indexOf(item);
      if (index > -1) {
        this.tableData.splice(index, 1);

        // Immediately save the updated permissions
        this.savePermissionsImmediately();
      }
    },
    savePermissionsImmediately() {
      // Build permissions string - empty string means no permissions for this type
      const permsString = this.tableData
        .map((p) => `${p.name}|${p.view}|${p.modify}|${p.delete}`)
        .join("|");

      const params = new URLSearchParams();
      params.append("token", localStorage.appToken);
      params.append("zone", this.zoneName);

      // Always send the appropriate permission type, even if empty
      if (this.type === "user") {
        params.append("userPermissions", permsString);
      } else if (this.type === "group") {
        params.append("groupPermissions", permsString);
      }

      console.log("Saving permissions:", params.toString());

      this.$axios
        .post(`/api/zones/permissions/set?${params.toString()}`)
        .then((response) => {
          console.log("Permission save response:", response.data);
          if (response.data.status === "ok") {
            this.$toast.success("Permission removed");
            // Reload to ensure UI is in sync with server
            this.loadPermissions();
          } else {
            this.$toast.error(
              "Failed to remove permission: " + response.data.errorMessage,
            );
          }
        })
        .catch((error) => {
          console.error("Error removing permission:", error);
          this.$toast.error("Failed to remove permission");
        });
    },
    getPermissions() {
      return this.tableData;
    },
  },
};
</script>
