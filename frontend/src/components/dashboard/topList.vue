<template>
  <v-card class="mx-auto" style="width: 100%">
    <v-card-text>
      <div>
        <v-icon>{{ listData.icon }}</v-icon
        >{{ listData.title }}
      </div>
      <v-data-table
        dense
        :headers="listData.headers"
        :items="listData.items"
        item-key="name"
        :search="search"
        :items-per-page="25"
        :footer-props="{
          itemsPerPageOptions: [25, 50, 100, -1],
        }"
      >
        <template v-slot:top>
          <v-text-field
            v-model="search"
            label="Search"
            class="mx-4"
          ></v-text-field> </template
      ></v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "datalistData",
  props: {
    listData: Object,
  },
  data() {
    return {
      search: "",
    };
  },
};
</script>
