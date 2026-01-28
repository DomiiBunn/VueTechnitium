<template>
  <v-card>
    <v-card-title>About</v-card-title>
    <v-card-text>
      <p>Technitium DNS Server</p>
      <p>Version {{ version }}</p>
      <p>Copyright (C) 2025 Shreyas Zare (shreyas@technitium.com)</p>
      <p>
        This program comes with ABSOLUTELY NO WARRANTY. This is free software,
        and you are welcome to redistribute it under certain conditions.
      </p>
      <p>
        Source code available under
        <a href="https://go.technitium.com/?id=24" target="_blank">
          GNU General Public License v3.0
        </a>
        on
        <a
          href="https://github.com/TechnitiumSoftware/DnsServer"
          target="_blank"
        >
          <v-icon>mdi-github</v-icon>
          GitHub
        </a>
      </p>
    </v-card-text>
  </v-card>
</template>

<script>
import { useAuthStore } from "@/stores/auth";
export default {
  computed: {
    version() {
      const store = useAuthStore();
      return store.session?.info?.version || "";
    },
  },
};
</script>
