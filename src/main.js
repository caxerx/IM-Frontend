import Vue from "vue";
import "./plugins/axios";
import "./plugins/pusher";
import "./plugins/moment";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import CryptoJS from "crypto-js";
window.cjs = CryptoJS;
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
