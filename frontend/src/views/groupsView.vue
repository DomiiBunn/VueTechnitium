<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col>
          <v-card>
            <v-toolbar color="primary" dark>
              <v-icon left>mdi-account-group</v-icon>
              <v-toolbar-title>Groups</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn
                v-can="{ section: 'Administration', action: 'modify' }"
                text
                color="white"
                @click="showAddGroupModal = true"
                prepend-icon="mdi-plus"
              >
                Add Group
              </v-btn>
            </v-toolbar>
            <v-card-text>
              <v-data-table
                :headers="headers"
                :items="groups"
                :loading="loading"
              >
                <template v-slot:[`item.actions`]="{ item }">
                  <v-icon
                    v-can="{ section: 'Administration', action: 'modify' }"
                    small
                    class="mr-2"
                    @click="editGroup(item)"
                    >mdi-pencil</v-icon
                  >
                  <v-icon
                    v-can="{ section: 'Administration', action: 'delete' }"
                    small
                    @click="deleteGroup(item)"
                    >mdi-delete</v-icon
                  >
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="showAddGroupModal" max-width="500px\">
      <v-card>
        <v-card-title>Add Group</v-card-title>
        <v-card-text>
          <v-text-field v-model="newGroup.name" label="Name"></v-text-field>
          <v-textarea
            v-model="newGroup.description"
            label="Description"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showAddGroupModal = false">Cancel</v-btn>
          <v-btn
            v-can="{ section: 'Administration', action: 'modify' }"
            color="primary"
            @click="addGroup"
            >Add</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showEditGroupModal" max-width="500px">
      <v-card>
        <v-card-title>Edit Group</v-card-title>
        <v-card-text>
          <v-text-field v-model="editedGroup.name" label="Name"></v-text-field>
          <v-textarea
            v-model="editedGroup.description"
            label="Description"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showEditGroupModal = false">Cancel</v-btn>
          <v-btn
            v-can="{ section: 'Administration', action: 'modify' }"
            color="primary"
            @click="saveGroup"
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
        { text: "Name", value: "name" },
        { text: "Description", value: "description" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      groups: [],
      loading: false,
      showAddGroupModal: false,
      showEditGroupModal: false,
      newGroup: {
        name: "",
        description: "",
      },
      editedGroup: {},
    };
  },
  methods: {
    fetchGroups() {
      this.loading = true;
      axios
        .post(`/api/admin/groups/list?token=${localStorage.appToken}`)
        .then((response) => {
          this.groups = response.data.response.groups;
          this.loading = false;
        })
        .catch((error) => {
          console.error(error);
          this.loading = false;
        });
    },
    addGroup() {
      axios
        .post(
          `/api/admin/groups/create?token=${localStorage.appToken}&group=${this.newGroup.name}&description=${this.newGroup.description}`,
        )
        .then(() => {
          this.fetchGroups();
          this.showAddGroupModal = false;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    editGroup(group) {
      this.editedGroup = { ...group };
      this.showEditGroupModal = true;
    },
    saveGroup() {
      axios
        .post(
          `/api/admin/groups/set?token=${localStorage.appToken}&group=${this.editedGroup.name}&description=${this.editedGroup.description}`,
        )
        .then(() => {
          this.fetchGroups();
          this.showEditGroupModal = false;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    deleteGroup(group) {
      if (confirm(`Are you sure you want to delete the group ${group.name}?`)) {
        axios
          .post(
            `/api/admin/groups/delete?token=${localStorage.appToken}&group=${group.name}`,
          )
          .then(() => {
            this.fetchGroups();
          })
          .catch((error) => {
            console.error(error);
          });
      }
    },
  },
  mounted() {
    this.fetchGroups();
  },
};
</script>
