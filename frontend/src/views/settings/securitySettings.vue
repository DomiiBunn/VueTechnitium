<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card :loading="loading">
          <v-card-title>Security Settings</v-card-title>
          <v-card-text>
            <!-- Password Policy Section -->
            <v-card class="mb-4" outlined>
              <v-card-title class="text-subtitle-2">
                <v-icon small class="mr-2">mdi-lock</v-icon>Password Policy
              </v-card-title>
              <v-card-text>
                <v-switch
                  v-model="securitySettings.enforcePasswordPolicy"
                  label="Enforce Password Policy"
                  @change="updateSetting('enforcePasswordPolicy')"
                ></v-switch>

                <v-divider
                  class="my-4"
                  v-if="securitySettings.enforcePasswordPolicy"
                ></v-divider>

                <div v-if="securitySettings.enforcePasswordPolicy">
                  <!-- Minimum Length -->
                  <div class="mb-4">
                    <label class="text-body-2 font-weight-medium">
                      Minimum Password Length:
                      {{ securitySettings.minPasswordLength }}
                    </label>
                    <v-slider
                      v-model="securitySettings.minPasswordLength"
                      :min="4"
                      :max="32"
                      @input="updateSetting('minPasswordLength')"
                      class="mt-2"
                    ></v-slider>
                  </div>

                  <v-divider class="my-4"></v-divider>

                  <!-- Complexity Requirements -->
                  <div class="mb-4">
                    <label class="text-body-2 font-weight-medium mb-3 d-block">
                      Complexity Requirements
                    </label>
                    <v-checkbox
                      v-model="securitySettings.requireUppercase"
                      label="Require uppercase letters (A-Z)"
                      @change="updateSetting('requireUppercase')"
                    ></v-checkbox>
                    <v-checkbox
                      v-model="securitySettings.requireLowercase"
                      label="Require lowercase letters (a-z)"
                      @change="updateSetting('requireLowercase')"
                    ></v-checkbox>
                    <v-checkbox
                      v-model="securitySettings.requireNumbers"
                      label="Require numbers (0-9)"
                      @change="updateSetting('requireNumbers')"
                    ></v-checkbox>
                    <v-checkbox
                      v-model="securitySettings.requireSpecialCharacters"
                      label="Require special characters (!@#$%^&*)"
                      @change="updateSetting('requireSpecialCharacters')"
                    ></v-checkbox>
                  </div>

                  <v-divider class="my-4"></v-divider>

                  <!-- Password Expiration -->
                  <div class="mb-4">
                    <v-switch
                      v-model="securitySettings.enablePasswordExpiration"
                      label="Enable Password Expiration"
                      @change="updateSetting('enablePasswordExpiration')"
                    ></v-switch>
                    <div
                      v-if="securitySettings.enablePasswordExpiration"
                      class="mt-3"
                    >
                      <label class="text-body-2 font-weight-medium">
                        Password Expiration Days:
                        {{ securitySettings.passwordExpirationDays }}
                      </label>
                      <v-slider
                        v-model="securitySettings.passwordExpirationDays"
                        :min="30"
                        :max="365"
                        :step="30"
                        @input="updateSetting('passwordExpirationDays')"
                        class="mt-2"
                      ></v-slider>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- Account Lockout Section -->
            <v-card class="mb-4" outlined>
              <v-card-title class="text-subtitle-2">
                <v-icon small class="mr-2">mdi-shield-alert</v-icon>Account
                Lockout Policy
              </v-card-title>
              <v-card-text>
                <v-switch
                  v-model="securitySettings.enableAccountLockout"
                  label="Enable Account Lockout"
                  @change="updateSetting('enableAccountLockout')"
                ></v-switch>

                <div v-if="securitySettings.enableAccountLockout" class="mt-4">
                  <v-divider class="mb-4"></v-divider>

                  <!-- Failed Login Attempts -->
                  <div class="mb-4">
                    <label class="text-body-2 font-weight-medium">
                      Failed Login Attempts Before Lockout:
                      {{ securitySettings.failedLoginAttempts }}
                    </label>
                    <v-slider
                      v-model="securitySettings.failedLoginAttempts"
                      :min="3"
                      :max="20"
                      @input="updateSetting('failedLoginAttempts')"
                      class="mt-2"
                    ></v-slider>
                  </div>

                  <v-divider class="my-4"></v-divider>

                  <!-- Lockout Duration -->
                  <div class="mb-4">
                    <label class="text-body-2 font-weight-medium">
                      Account Lockout Duration (minutes):
                      {{ securitySettings.accountLockoutDuration }}
                    </label>
                    <v-slider
                      v-model="securitySettings.accountLockoutDuration"
                      :min="5"
                      :max="240"
                      :step="5"
                      @input="updateSetting('accountLockoutDuration')"
                      class="mt-2"
                    ></v-slider>
                  </div>

                  <v-divider class="my-4"></v-divider>

                  <!-- Failed Login Counter Reset -->
                  <div>
                    <label class="text-body-2 font-weight-medium">
                      Reset Failed Login Counter After (minutes):
                      {{ securitySettings.failedLoginCounterReset }}
                    </label>
                    <v-slider
                      v-model="securitySettings.failedLoginCounterReset"
                      :min="5"
                      :max="120"
                      :step="5"
                      @input="updateSetting('failedLoginCounterReset')"
                      class="mt-2"
                    ></v-slider>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- Session Security Section -->
            <v-card class="mb-4" outlined>
              <v-card-title class="text-subtitle-2">
                <v-icon small class="mr-2">mdi-clock-check</v-icon>Session
                Security
              </v-card-title>
              <v-card-text>
                <div class="mb-4">
                  <label class="text-body-2 font-weight-medium">
                    Session Timeout (minutes):
                    {{ securitySettings.sessionTimeout }}
                  </label>
                  <v-slider
                    v-model="securitySettings.sessionTimeout"
                    :min="5"
                    :max="480"
                    :step="5"
                    @input="updateSetting('sessionTimeout')"
                    class="mt-2"
                  ></v-slider>
                </div>

                <v-divider class="my-4"></v-divider>

                <v-switch
                  v-model="securitySettings.enableConcurrentLoginPrevention"
                  label="Prevent Concurrent Logins (one session per user)"
                  @change="updateSetting('enableConcurrentLoginPrevention')"
                ></v-switch>

                <v-divider class="my-4"></v-divider>

                <v-switch
                  v-model="securitySettings.requireMfaForAdmin"
                  label="Require Multi-Factor Authentication for Admin Users"
                  @change="updateSetting('requireMfaForAdmin')"
                ></v-switch>
              </v-card-text>
            </v-card>

            <!-- Two-Factor Authentication Section -->
            <v-card outlined>
              <v-card-title class="text-subtitle-2">
                <v-icon small class="mr-2">mdi-two-factor-authentication</v-icon
                >Two-Factor Authentication
              </v-card-title>
              <v-card-text>
                <v-switch
                  v-model="securitySettings.enableTwoFactorAuth"
                  label="Enable Two-Factor Authentication (TOTP)"
                  @change="updateSetting('enableTwoFactorAuth')"
                ></v-switch>

                <div v-if="securitySettings.enableTwoFactorAuth" class="mt-4">
                  <v-divider class="mb-4"></v-divider>
                  <p class="text-caption text-grey">
                    2FA can be enabled on a per-user basis. When enabled, users
                    can use authenticator apps like Google Authenticator or
                    Microsoft Authenticator to generate time-based one-time
                    passwords (TOTP).
                  </p>

                  <v-divider class="my-4"></v-divider>

                  <v-switch
                    v-model="securitySettings.requireTwoFactorForAdmin"
                    label="Require 2FA for all admin users"
                    @change="updateSetting('requireTwoFactorForAdmin')"
                  ></v-switch>

                  <div
                    v-if="securitySettings.requireTwoFactorForAdmin"
                    class="mt-3"
                  >
                    <label class="text-body-2 font-weight-medium">
                      Backup Codes (number to generate):
                    </label>
                    <v-select
                      v-model="securitySettings.backupCodeCount"
                      :items="[5, 10, 15, 20]"
                      label="Number of backup codes"
                      outlined
                      dense
                      class="mt-2"
                      @change="updateSetting('backupCodeCount')"
                    ></v-select>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="resetSettings()" text>Reset</v-btn>
            <v-btn @click="saveSettings()" color="primary" :loading="saving">
              Save Settings
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      saving: false,
      securitySettings: {
        // Password Policy
        enforcePasswordPolicy: false,
        minPasswordLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialCharacters: false,
        enablePasswordExpiration: false,
        passwordExpirationDays: 90,

        // Account Lockout
        enableAccountLockout: false,
        failedLoginAttempts: 5,
        accountLockoutDuration: 30,
        failedLoginCounterReset: 30,

        // Session Security
        sessionTimeout: 60,
        enableConcurrentLoginPrevention: false,
        requireMfaForAdmin: false,

        // Two-Factor Authentication
        enableTwoFactorAuth: false,
        requireTwoFactorForAdmin: false,
        backupCodeCount: 10,
      },
    };
  },

  mounted() {
    this.loadSecuritySettings();
  },

  methods: {
    loadSecuritySettings() {
      this.loading = true;
      this.$axios
        .post(`/api/settings/get?token=${localStorage.appToken}`)
        .then((res) => {
          if (res.data.status === "ok") {
            const settings = res.data.response.settings;

            // Password Policy
            if (settings.enforcePasswordPolicy !== undefined) {
              this.securitySettings.enforcePasswordPolicy =
                settings.enforcePasswordPolicy;
            }
            if (settings.minPasswordLength !== undefined) {
              this.securitySettings.minPasswordLength =
                settings.minPasswordLength;
            }
            if (settings.requireUppercase !== undefined) {
              this.securitySettings.requireUppercase =
                settings.requireUppercase;
            }
            if (settings.requireLowercase !== undefined) {
              this.securitySettings.requireLowercase =
                settings.requireLowercase;
            }
            if (settings.requireNumbers !== undefined) {
              this.securitySettings.requireNumbers = settings.requireNumbers;
            }
            if (settings.requireSpecialCharacters !== undefined) {
              this.securitySettings.requireSpecialCharacters =
                settings.requireSpecialCharacters;
            }
            if (settings.enablePasswordExpiration !== undefined) {
              this.securitySettings.enablePasswordExpiration =
                settings.enablePasswordExpiration;
            }
            if (settings.passwordExpirationDays !== undefined) {
              this.securitySettings.passwordExpirationDays =
                settings.passwordExpirationDays;
            }

            // Account Lockout
            if (settings.enableAccountLockout !== undefined) {
              this.securitySettings.enableAccountLockout =
                settings.enableAccountLockout;
            }
            if (settings.failedLoginAttempts !== undefined) {
              this.securitySettings.failedLoginAttempts =
                settings.failedLoginAttempts;
            }
            if (settings.accountLockoutDuration !== undefined) {
              this.securitySettings.accountLockoutDuration =
                settings.accountLockoutDuration;
            }
            if (settings.failedLoginCounterReset !== undefined) {
              this.securitySettings.failedLoginCounterReset =
                settings.failedLoginCounterReset;
            }

            // Session Security
            if (settings.sessionTimeout !== undefined) {
              this.securitySettings.sessionTimeout = settings.sessionTimeout;
            }
            if (settings.enableConcurrentLoginPrevention !== undefined) {
              this.securitySettings.enableConcurrentLoginPrevention =
                settings.enableConcurrentLoginPrevention;
            }
            if (settings.requireMfaForAdmin !== undefined) {
              this.securitySettings.requireMfaForAdmin =
                settings.requireMfaForAdmin;
            }

            // 2FA
            if (settings.enableTwoFactorAuth !== undefined) {
              this.securitySettings.enableTwoFactorAuth =
                settings.enableTwoFactorAuth;
            }
            if (settings.requireTwoFactorForAdmin !== undefined) {
              this.securitySettings.requireTwoFactorForAdmin =
                settings.requireTwoFactorForAdmin;
            }
            if (settings.backupCodeCount !== undefined) {
              this.securitySettings.backupCodeCount = settings.backupCodeCount;
            }

            this.loading = false;
          }
        })
        .catch(() => {
          this.$toast.error("Failed to load security settings");
          this.loading = false;
        });
    },

    updateSetting() {
      // Optional: Can be used to save individual settings on change
      // For now, will save all settings together
    },

    saveSettings() {
      this.saving = true;

      const params = new URLSearchParams();
      params.append("token", localStorage.appToken);

      // Add all security settings
      for (const [settingKey, value] of Object.entries(this.securitySettings)) {
        params.append(settingKey, value);
      }

      this.$axios
        .post(`/api/settings/set?${params.toString()}`)
        .then((res) => {
          if (res.data.status === "ok") {
            this.$toast.success("Security settings saved successfully");
            this.saving = false;
          } else {
            this.$toast.error(
              res.data.errorMessage || "Failed to save security settings",
            );
            this.saving = false;
          }
        })
        .catch(() => {
          this.$toast.error("Failed to save security settings");
          this.saving = false;
        });
    },

    resetSettings() {
      this.loadSecuritySettings();
      this.$toast.info("Settings reset to saved values");
    },
  },
};
</script>

<style scoped lang="scss">
.v-card-title {
  padding-left: 16px;
  padding-top: 16px;
}
</style>
