import Vue from "vue";
import Vuex from "vuex";
import Api from "@/api/api";
import CryptoJS from "crypto-js";
import moment from "moment";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    login: false,
    userId: "",
    token: "",
    userEmail: "",
    key: {},
    message: {},
    users: {},
    selectedUser: null
  },
  mutations: {
    SELECT_USER(state, payload) {
      state.selectedUser = payload;
      state.users[payload].read = true;
    },
    SET_LOGIN(state, payload) {
      state.login = true;
      state.token = payload.token;
      state.userId = payload.id;
      state.userEmail = payload.key.Description;
      window.axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${payload.token}`;
    },
    SET_KEY(state, payload) {
      let userId = payload.userId;
      Vue.set(state.key, userId, {
        encryptKey: payload.encryptKey,
        hmacKey: payload.hmacKey
      });
      if (!state.message[userId]) {
        Vue.set(state.message, userId, []);
      }
      if (!state.users[userId]) {
        Vue.set(state.users, userId, {
          email: payload.email,
          lastMessage: "",
          lastMessageTime: "",
          messageType: "n",
          read: true
        });
      }
    },
    NEW_MESSAGE(state, payload) {
      if (!state.message[payload.user]) {
        Vue.set(state.message, payload.user, []);
      }
      state.message[payload.user].push(payload);
      if (payload.type != "s") {
        state.users[payload.user].lastMessage = payload.message;
        state.users[payload.user].lastMessageTime = payload.time;
        state.users[payload.user].messageType = payload.type;
      }
      if (payload.type == "r" && state.selectedUser != payload.user) {
        state.users[payload.user].read = false;
        // notify
      }
    },
    MESSAGE_SENT(state, payload) {
      if (!state.message[payload.user]) {
        return;
      }
      let messageIndex = state.message[payload.user].findIndex(
        m => m.nonce == payload.nonce
      );

      if (messageIndex < 0) {
        return;
      }

      if (payload.success) {
        state.message[payload.user][messageIndex].time = payload.time;
        state.users[payload.user].lastMessage =
          state.message[payload.user][messageIndex].message;
        state.users[payload.user].lastMessageTime = payload.time;
        state.users[payload.user].messageType = "s";
      } else {
        state.message[payload.user].splice(messageIndex, 1);
      }
    }
  },
  actions: {
    async sendMessage({ commit, state }, payload) {
      let timestamp = Date().now;
      let { message, to } = payload;
      let ts = Date.now();
      let key = CryptoJS.enc.Hex.stringify(
        CryptoJS.enc.Base64.parse(state.key[to].encryptKey)
      );
      let hmacKey = state.key[to].hmacKey;
      let nonce = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
      let srcs = CryptoJS.enc.Utf8.parse(message);

      let enc = CryptoJS.AES.encrypt(srcs, key, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }).toString();

      let hmac = CryptoJS.HmacSHA256(
        `message=${enc}&nonce=${nonce}&timestamp=${ts}`,
        hmacKey
      ).toString();

      const venc = {
        message: enc,
        nonce: nonce,
        timestamp: ts,
        hmac: hmac
      };

      let promise = Api.sendMessage({
        to_user_id: +payload.to,
        message: JSON.stringify(venc)
      });

      commit("NEW_MESSAGE", {
        user: +payload.to,
        time: "sending",
        message: payload.message,
        type: "s",
        nonce
      });
      let success = false;
      try {
        await promise;
        success = true;
      } catch (e) {
        // ignore
      }

      commit("MESSAGE_SENT", {
        user: +payload.to,
        nonce,
        success,
        time: moment()
          .utc(timestamp)
          .format("YYYY-MM-DD HH:mm")
      });
    },
    async verifyMessage({ commit, state }, payload) {
      let { message, nonce, timestamp, from, hmac, serverTime } = payload;
      let hmacKey = state.key[from].hmacKey;

      let localCalcHmac = CryptoJS.HmacSHA256(
        `message=${message}&nonce=${nonce}&timestamp=${timestamp}`,
        hmacKey
      ).toString();

      if (hmac == localCalcHmac) {
        let key = CryptoJS.enc.Hex.stringify(
          CryptoJS.enc.Base64.parse(state.key[from].encryptKey)
        );
        let plainText = CryptoJS.AES.decrypt(message, key, {
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }).toString(CryptoJS.enc.Utf8);
        commit("NEW_MESSAGE", {
          user: from,
          time: serverTime,
          message: plainText,
          type: "r"
        });
      }
    },
    async checkNewMessage({ state, dispatch }, payload) {
      let msgs = (await Api.getMessage(payload)).data.messages;

      if (!state.key[payload]) {
        await dispatch("getKey", payload);
      }

      msgs.forEach(r => {
        try {
          dispatch("verifyMessage", {
            ...JSON.parse(r.message),
            from: r.from,
            serverTime: r.created_at
          });
        } catch (e) {
          // ignore
        }
      });
    },
    async newMessage({ dispatch, state }, payload) {
      if (payload.from != state.userId && payload.to == state.userId) {
        dispatch("checkNewMessage", payload.from);
      }
    },
    async getKey({ commit }, toId) {
      let enc = Api.getEncryptKey(toId);
      let hmac = Api.getHmacKey(toId);
      let email = Api.getEmail(toId);
      let [ed, hd, emd] = await Promise.all([enc, hmac, email]);
      commit("SET_KEY", {
        userId: toId,
        encryptKey: ed.data.plaintext_base64,
        hmacKey: hd.data.hmac_key,
        email: emd.data.email
      });
    }
  },
  modules: {}
});
