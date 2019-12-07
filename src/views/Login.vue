<template>
  <v-layout fill-height align-center justify-center>
    <v-form @submit.prevent="login" ref="loginForm">
      <v-card width="400" color="primary" class="pb-3">
        <v-toolbar flat color="primary">
          <v-toolbar-title
            class="text-center font-weight-light"
            style="width:100%"
            >Login</v-toolbar-title
          >
        </v-toolbar>
        <v-card-text>
          <v-layout column class="mx-2 mb-3">
            <v-flex xs12 mb-2>
              <v-skeleton-loader
                height="56px"
                type="image"
                :loading="loadingLogin"
              >
                <v-text-field
                  label="Username"
                  outlined
                  autofocus
                  hide-details
                  prepend-inner-icon="person"
                  color="white"
                  :error="loginError"
                  v-model="username"
                  autocomplete="username"
                ></v-text-field>
              </v-skeleton-loader>
            </v-flex>
            <v-flex xs12>
              <v-skeleton-loader
                height="56px"
                type="image"
                :loading="loadingLogin"
              >
                <v-text-field
                  label="Password"
                  outlined
                  hide-details
                  prepend-inner-icon="lock"
                  color="white"
                  type="password"
                  :error="loginError"
                  v-model="password"
                  autocomplete="password"
                ></v-text-field>
              </v-skeleton-loader>
            </v-flex>
          </v-layout>
        </v-card-text>
        <v-card-actions>
          <v-layout align-center justify-center>
            <v-skeleton-loader
              type="image"
              :loading="loadingLogin"
              width="128"
              height="36"
            >
              <v-btn outlined width="128" type="submit">Login</v-btn>
            </v-skeleton-loader>
          </v-layout>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-layout>
</template>

<script>
import Api from "@/api/api.js";
export default {
  name: "Login",
  data: () => ({
    loadingLogin: false,
    loginError: false,
    username: "",
    password: ""
  }),
  methods: {
    async login() {
      this.loadingLogin = true;
      try {
        let loginData = (await Api.login(this.username, this.password)).data
          .success;
        if (loginData) {
          this.$store.commit("SET_LOGIN", loginData);
          this.$router.push("/");
        } else {
          this.loginError = true;
        }
      } catch {
        this.loginError = true;
      }
      this.loadingLogin = false;
    }
  }
};
</script>
