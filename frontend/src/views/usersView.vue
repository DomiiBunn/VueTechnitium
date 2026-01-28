<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col>
          <v-card>
            <v-toolbar color="primary" dark>
              <v-icon left>mdi-account</v-icon>
              <v-toolbar-title>Users</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn
                v-can="{ section: 'Administration', action: 'modify' }"
                text
                color="white"
                @click="showAddUserModal = true"
                prepend-icon="mdi-plus"
              >
                Add User
              </v-btn>
            </v-toolbar>
            <v-card-text>
              <v-data-table
                :headers="headers"
                :items="users"
                :loading="loading"
              >
                <template v-slot:[`item.status`]="{ item }">
                  <v-chip :color="item.disabled ? 'warning' : 'success'">
                    {{ item.disabled ? "Disabled" : "Enabled" }}
                  </v-chip>
                </template>
                <template v-slot:[`item.recentSessionLoggedOn`]="{ item }">
                  {{ formatTimestamp(item.recentSessionLoggedOn) }}
                </template>
                <template v-slot:[`item.previousSessionLoggedOn`]="{ item }">
                  {{ formatTimestamp(item.previousSessionLoggedOn) }}
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                  <v-icon
                    v-can="{ section: 'Administration', action: 'modify' }"
                    small
                    class="mr-2"
                    @click="editUser(item)"
                    >mdi-pencil</v-icon
                  >
                  <v-icon
                    v-can="{ section: 'Administration', action: 'delete' }"
                    small
                    @click="deleteUser(item)"
                    >mdi-delete</v-icon
                  >
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="showAddUserModal" max-width="500px\">
      <v-card>
        <v-card-title>Add User</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newUser.displayName"
            label="Display Name"
          ></v-text-field>
          <v-text-field
            v-model="newUser.username"
            label="Username"
          ></v-text-field>
          <v-text-field
            v-model="newUser.password"
            label="Password"
            type="password"
          ></v-text-field>
          <v-text-field
            v-model="newUser.confirmPassword"
            label="Confirm Password"
            type="password"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showAddUserModal = false">Cancel</v-btn>
          <v-btn
            v-can="{ section: 'Administration', action: 'modify' }"
            color="primary"
            @click="addUser"
            >Add</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showEditUserModal" max-width="800px">
      <v-card>
        <v-card-title>Edit User</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editedUser.displayName"
            label="Display Name"
          ></v-text-field>
          <v-text-field
            v-model="editedUser.username"
            label="Username"
          ></v-text-field>
          <v-text-field
            v-model="editedUser.sessionTimeoutSeconds"
            label="Session Timeout (seconds)"
            type="number"
          ></v-text-field>
          <v-checkbox
            v-model="editedUser.disabled"
            label="Disabled"
          ></v-checkbox>
          <v-select
            v-model="editedUser.memberOfGroups"
            :items="groups"
            label="Groups"
            multiple
            chips
          ></v-select>
          <v-text-field
            v-model="newPassword"
            label="New Password"
            type="password"
          ></v-text-field>
          <v-text-field
            v-model="confirmNewPassword"
            label="Confirm New Password"
            type="password"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showEditUserModal = false">Cancel</v-btn>
          <v-btn
            v-can="{ section: 'Administration', action: 'modify' }"
            color="primary"
            @click="saveUser"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";

export default {
  data() {
    return {
      headers: [
        { text: "Display Name", value: "displayName" },
        { text: "Username", value: "username" },
        { text: "Status", value: "status" },
        { text: "Recent Login", value: "recentSessionLoggedOn" },
        { text: "Previous Login", value: "previousSessionLoggedOn" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      users: [],
      groups: [],
      loading: false,
      showAddUserModal: false,
      showEditUserModal: false,
      newUser: {
        displayName: "",
        username: "",
        password: "",
        confirmPassword: "",
      },
      editedUser: {},
      newPassword: "",
      confirmNewPassword: "",
    };
  },
  methods: {
    formatTimestamp(timestamp) {
      if (!timestamp) return "N/A";
      const now = moment();
      const then = moment(timestamp);
      const diffHours = now.diff(then, "hours");

      if (diffHours < 24) {
        return then.fromNow();
      } else {
        return then.local().format("YYYY-MM-DD HH:mm:ss");
      }
    },
    fetchUsers() {
      this.loading = true;
      axios
        .post(`/api/admin/users/list?token=${localStorage.appToken}`)
        .then((response) => {
          this.users = response.data.response.users;
          this.loading = false;
        })
        .catch((error) => {
          console.error(error);
          this.loading = false;
        });
    },
    fetchGroups() {
      axios
        .post(`/api/admin/groups/list?token=${localStorage.appToken}`)
        .then((response) => {
          this.groups = response.data.response.groups.map((g) => g.name);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    addUser() {
      if (this.newUser.password !== this.newUser.confirmPassword) {
        alert("Passwords do not match");
        return;
      }
      axios
        .post(
          `/api/admin/users/create?token=${localStorage.appToken}&displayName=${this.newUser.displayName}&user=${this.newUser.username}&pass=${this.newUser.password}`,
        )
        .then(() => {
          this.fetchUsers();
          this.showAddUserModal = false;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    editUser(user) {
      axios
        .post(
          `/api/admin/users/get?token=${localStorage.appToken}&user=${user.username}&includeGroups=true`,
        )
        .then((response) => {
          this.editedUser = response.data.response;
          this.showEditUserModal = true;
        });
    },
    saveUser() {
      let apiUrl = `/api/admin/users/set?token=${localStorage.appToken}&user=${
        this.editedUser.username
      }&displayName=${this.editedUser.displayName}&disabled=${
        this.editedUser.disabled
      }&sessionTimeoutSeconds=${
        this.editedUser.sessionTimeoutSeconds
      }&memberOfGroups=${this.editedUser.memberOfGroups.join("\n")}`;
      if (this.newPassword) {
        if (this.newPassword !== this.confirmNewPassword) {
          alert("Passwords do not match");
          return;
        }
        apiUrl += `&newPass=${this.newPassword}`;
      }
      axios
        .post(apiUrl)
        .then(() => {
          this.fetchUsers();
          this.showEditUserModal = false;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    deleteUser(user) {
      if (
        confirm(`Are you sure you want to delete the user ${user.username}?`)
      ) {
        axios
          .post(
            `/api/admin/users/delete?token=${localStorage.appToken}&user=${user.username}`,
          )
          .then(() => {
            this.fetchUsers();
          })
          .catch((error) => {
            console.error(error);
          });
      }
    },
  },
  mounted() {
    this.fetchUsers();
    this.fetchGroups();
  },
};
</script>

<style scoped>
.v-chip {
  margin: 4px !important;
}
</style>
