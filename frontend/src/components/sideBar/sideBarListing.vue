<template>
  <v-list>
    <div v-for="item in $router.options.routes" :key="item.name" no-action>
      <div v-if="!item.meta.hidden && checkPermission(item)">
        <v-list-group v-if="item.children" :prepend-icon="item.meta.icon">
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>{{ item.name }}</v-list-item-title>
            </v-list-item-content>
          </template>
          <div v-for="child in item.children" :key="child.name">
            <v-list-item
              link
              :to="child.path"
              v-if="!child.meta.hidden"
              class="pl-8"
            >
              <v-list-item-icon>
                <v-icon>{{ child.meta.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ child.name }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </div>
        </v-list-group>
        <v-list-item
          v-else
          :to="item.path"
          :class="{ 'v-list-item--active': isActive(item) }"
        >
          <v-list-item-icon>
            <v-icon>{{ item.meta.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-title>{{ item.name }}</v-list-item-title>
        </v-list-item>
      </div>
    </div>
  </v-list>
</template>

<script>
export default {
  data: () => ({
    items: [],
  }),
  methods: {
    checkPermission(item) {
      if (!item.meta.permission) {
        return true;
      }
      return this.$can(item.meta.permission, "view");
    },
    isActive(item) {
      // Check if current route matches this item
      const currentPath = this.$route.path;
      const itemPath = item.path;

      // Exact match
      if (currentPath === itemPath) {
        return true;
      }

      // For zones, also match /zone/:id paths
      if (itemPath === "/zones" && currentPath.startsWith("/zone")) {
        return true;
      }

      // For add-zone
      if (itemPath === "/zones" && currentPath === "/add-zone") {
        return true;
      }

      return false;
    },
  },
};
</script>

<style lang="scss" scoped>
.v-list-item__title {
  white-space: normal;
  overflow: visible;
}
</style>
