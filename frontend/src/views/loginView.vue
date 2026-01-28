<template>
  <v-app id="inspire">
    <v-main>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4>
            <v-card class="elevation-12">
              <v-toolbar dark color="primary">
                <v-toolbar-title>Login</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-alert v-if="error" color="red" type="warning">{{
                  error
                }}</v-alert>
                <v-form>
                  <v-text-field
                    prepend-icon="mdi-account"
                    name="login"
                    label="Login"
                    type="text"
                    v-model="user"
                    @keyup.enter="login"
                  ></v-text-field>
                  <v-text-field
                    id="password"
                    prepend-icon="mdi-key"
                    name="password"
                    label="Password"
                    type="password"
                    v-model="password"
                    @keyup.enter="login"
                  ></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn :loading="loading" @click="login" color="primary"
                  >Login</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { useAuthStore } from "@/stores/auth";
export default {
  data() {
    return {
      user: "",
      password: "",
      error: "",
      loading: false,
    };
  },
  name: "LoginView",
  mounted() {
    const store = useAuthStore();

    // Check if user already has a valid session
    store.loadFromStorage();
    if (store.token) {
      this.loading = true;
      store.fetchSession().then((valid) => {
        this.loading = false;
        if (valid) {
          // Session is valid, redirect to dashboard
          this.$router.push("/");
        } else {
          // Session is invalid, show login form
          this.error = "Session expired. Please log in again.";
        }
      });
    } else {
      this.error = store.error || "";
    }
  },
  methods: {
    login() {
      const store = useAuthStore();
      this.loading = true;
      store
        .login(this.user, this.password)
        .then((ok) => {
          this.loading = false;
          if (ok) {
            // Redirect to dashboard after successful login
            this.$router.push("/");
          } else {
            this.error = store.error || "Login failed";
          }
        })
        .catch(() => {
          this.loading = false;
          this.error = "Login failed";
        });
    },
  },
};
</script>
