<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col>
          <v-card>
            <v-toolbar color="primary" dark>
              <v-icon left>mdi-lock</v-icon>
              <v-toolbar-title>Permissions</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <v-data-table
                :headers="headers"
                :items="permissions"
                :loading="loading"
              >
                <template v-slot:[`item.userPermissions`]="{ item }">
                  <v-chip
                    v-for="user in item.userPermissions"
                    :key="user.username"
                    class="ma-1"
                  >
                    {{ user.username }}
                  </v-chip>
                </template>
                <template v-slot:[`item.groupPermissions`]="{ item }">
                  <v-chip
                    v-for="group in item.groupPermissions"
                    :key="group.name"
                    class="ma-1"
                  >
                    {{ group.name }}
                  </v-chip>
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                  <v-icon
                    v-can="{ section: 'Administration', action: 'modify' }"
                    small
                    @click="editPermissions(item)"
                    >mdi-pencil</v-icon
                  >
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="showEditPermissionsModal" max-width="800px\">
      <v-card>
        <v-card-title
          >Edit Permissions - {{ editedSection.section }}</v-card-title
        >
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <v-card>
                <v-card-title>Users</v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="userPermissionsHeaders"
                    :items="editedSection.userPermissions"
                  >
                    <template v-slot:[`item.actions`]="{ item }">
                      <v-icon small @click="removeUserPermission(item)"
                        >mdi-delete</v-icon
                      >
                    </template>
                  </v-data-table>
                  <v-select
                    :items="users"
                    label="Add User"
                    @change="addUserPermission"
                  ></v-select>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6">
              <v-card>
                <v-card-title>Groups</v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="groupPermissionsHeaders"
                    :items="editedSection.groupPermissions"
                  >
                    <template v-slot:[`item.actions`]="{ item }">
                      <v-icon small @click="removeGroupPermission(item)"
                        >mdi-delete</v-icon
                      >
                    </template>
                  </v-data-table>
                  <v-select
                    :items="groups"
                    label="Add Group"
                    @change="addGroupPermission"
                  ></v-select>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showEditPermissionsModal = false">Cancel</v-btn>
          <v-btn
            v-can="{ section: 'Administration', action: 'modify' }"
            color="primary"
            @click="savePermissions"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      headers: [
        { text: "Section", value: "section" },
        { text: "User Permissions", value: "userPermissions" },
        { text: "Group Permissions", value: "groupPermissions" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      userPermissionsHeaders: [
        { text: "Username", value: "username" },
        { text: "View", value: "canView" },
        { text: "Modify", value: "canModify" },
        { text: "Delete", value: "canDelete" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      groupPermissionsHeaders: [
        { text: "Group", value: "name" },
        { text: "View", value: "canView" },
        { text: "Modify", value: "canModify" },
        { text: "Delete", value: "canDelete" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      permissions: [],
      loading: false,
      showEditPermissionsModal: false,
      editedSection: {},
      users: [],
      groups: [],
    };
  },
  methods: {
    fetchPermissions() {
      this.loading = true;
      axios
        .post(`/api/admin/permissions/list?token=${localStorage.appToken}`)
        .then((response) => {
          this.permissions = response.data.response.permissions;
          this.loading = false;
        })
        .catch((error) => {
          console.error(error);
          this.loading = false;
        });
    },
    editPermissions(section) {
      axios
        .post(
          `/api/admin/permissions/get?token=${localStorage.appToken}&section=${section.section}&includeUsersAndGroups=true`,
        )
        .then((response) => {
          this.editedSection = response.data.response;
          this.users = response.data.response.users;
          this.groups = response.data.response.groups;
          this.showEditPermissionsModal = true;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    addUserPermission(username) {
      this.editedSection.userPermissions.push({
        username: username,
        canView: false,
        canModify: false,
        canDelete: false,
      });
    },
    removeUserPermission(user) {
      this.editedSection.userPermissions =
        this.editedSection.userPermissions.filter(
          (u) => u.username !== user.username,
        );
    },
    addGroupPermission(groupName) {
      this.editedSection.groupPermissions.push({
        name: groupName,
        canView: false,
        canModify: false,
        canDelete: false,
      });
    },
    removeGroupPermission(group) {
      this.editedSection.groupPermissions =
        this.editedSection.groupPermissions.filter(
          (g) => g.name !== group.name,
        );
    },
    savePermissions() {
      const userPermissions = this.editedSection.userPermissions
        .map((p) => `${p.username},${p.canView},${p.canModify},${p.canDelete}`)
        .join("|");
      const groupPermissions = this.editedSection.groupPermissions
        .map((p) => `${p.name},${p.canView},${p.canModify},${p.canDelete}`)
        .join("|");

      axios
        .post(
          `/api/admin/permissions/set?token=${localStorage.appToken}&section=${this.editedSection.section}&userPermissions=${userPermissions}&groupPermissions=${groupPermissions}`,
        )
        .then(() => {
          this.fetchPermissions();
          this.showEditPermissionsModal = false;
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
  mounted() {
    this.fetchPermissions();
  },
};
</script>
