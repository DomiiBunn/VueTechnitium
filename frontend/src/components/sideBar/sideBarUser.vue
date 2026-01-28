<template>
  <div class="pa-2">
    <v-card>
      <v-toolbar color="primary" dark>
        <v-avatar color="lighten-2" size="48">
          <v-icon dark>mdi-account-circle</v-icon>
        </v-avatar>
        <v-list-item-content class="ml-3">
          <v-list-item-title class="text-white">
            {{ sessionData.displayName }}
          </v-list-item-title>
        </v-list-item-content>
      </v-toolbar>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    sessionData: Object,
  },
};
</script>

<style lang="scss" scoped></style>
