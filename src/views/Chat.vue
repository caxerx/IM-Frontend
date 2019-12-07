<template>
  <v-content>
    <v-navigation-drawer app width="400">
      <template v-slot:prepend>
        <v-toolbar
          flat
          color="grey darken-2 font-weight-light"
          style="user-select: none;"
        >
          <v-avatar class="mr-2">
            <v-img
              :src="
                `http://tinygraphs.com/squares/${$store.state.userEmail}?theme=frogideas&numcolors=4&size=220&fmt=svg`
              "
              max-height="40"
              max-width="40"
            ></v-img>
          </v-avatar>
          Welcome, {{ $store.state.userEmail }}
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon v-on="on" @click="newConversation">
                <v-icon>
                  chat
                </v-icon>
              </v-btn>
            </template>
            <span>Start Conversation</span>
          </v-tooltip>
        </v-toolbar>
        <!-- <v-system-bar color="grey darken-1" height="32"> </v-system-bar> -->
      </template>
      <v-list>
        <template v-for="(i, index) in message">
          <v-list-item two-line :key="`k${i}`" @click="selectedUser = index">
            <v-list-item-avatar>
              <v-img
                :src="
                  `http://tinygraphs.com/squares/${$store.state.users[index].email}?theme=frogideas&numcolors=4&size=220&fmt=svg`
                "
              ></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                <div
                  style="max-width:230px; overflow: hidden; white-space: nowrap; float:left; margin:0; text-overflow: ellipsis;"
                >
                  <div
                    style="width:8px; height: 8px; background: #FF3333; display: inline-block; border-radius: 50%;"
                    v-if="!$store.state.users[index].read"
                  />
                  {{ $store.state.users[index].email }}
                </div>
                <p class="caption" style="float:right; margin:0;">
                  {{
                    getLastSendTime($store.state.users[index].lastMessageTime)
                  }}
                </p></v-list-item-title
              >
              <v-list-item-subtitle>
                {{
                  $store.state.users[index].messageType == "s" ? "You: " : ""
                }}
                {{ $store.state.users[index].lastMessage }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider :key="`d${i}`"></v-divider>
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-layout v-if="selectedUser" fill-height column>
      <v-flex shrink>
        <v-card flat>
          <v-list-item>
            <v-list-item-avatar>
              <v-img
                :src="
                  `http://tinygraphs.com/squares/${$store.state.users[selectedUser].email}?theme=frogideas&numcolors=4&size=220&fmt=svg`
                "
              ></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title style="user-select: none;">
                {{ $store.state.users[selectedUser].email }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-card>
        <v-divider></v-divider>
      </v-flex>
      <v-flex
        style="flex: 1 1 auto; flex-basis: 0px; overflow: auto;"
        class="px-10"
        ref="chatScroll"
      >
        <v-layout column justify-end id="chat-content" style="min-height:100%">
          <template v-for="(i, index) in $store.state.message[selectedUser]">
            <v-layout
              v-if="shouldShowDayChanger(index)"
              :key="`dc${index}`"
              shrink
              align-center
              justify-center
            >
              <v-chip style="user-select: none;" class="my-5">
                {{ getFormattedDate(i.time) }}
              </v-chip>
            </v-layout>
            <v-layout shrink v-if="i.type == 'r'" :key="`r${index}`">
              <v-timeline justify-start dense>
                <v-timeline-item>
                  <v-card
                    class="elevation-2"
                    style="min-width: 80px; max-width:30vw; padding-bottom: 8px;"
                  >
                    <v-card-text>
                      {{ i.message }}
                      <p
                        style="position: absolute; right:10px; user-select: none;"
                        class="caption"
                      >
                        {{ getFormattedTime(i.time) }}
                      </p>
                    </v-card-text>
                  </v-card>
                </v-timeline-item>
              </v-timeline>
            </v-layout>

            <v-layout justify-end shrink v-else :key="`s${index}`">
              <v-timeline :reverse="true" dense>
                <v-timeline-item>
                  <v-card
                    class="elevation-2"
                    color="primary darken-1"
                    style="min-width: 80px; max-width:30vw; padding-bottom: 8px;"
                  >
                    <v-card-text>
                      {{ i.message }}
                      <p
                        style="position: absolute; right:10px; user-select: none;"
                        class="caption"
                      >
                        {{
                          i.time == "sending"
                            ? "Sending..."
                            : getFormattedTime(i.time)
                        }}
                      </p>
                    </v-card-text>
                  </v-card>
                </v-timeline-item>
              </v-timeline>
            </v-layout>
          </template>
        </v-layout>
      </v-flex>
      <v-flex shrink>
        <v-bottom-navigation class="pa-2" style="height:fit-content">
          <v-text-field
            solo
            hide-details
            light
            label="Write a message..."
            append-icon="send"
            color="darkgrey"
            @click:append="sendMessage"
            @keypress.enter="sendMessage"
            v-model="messageToSend"
          ></v-text-field>
        </v-bottom-navigation>
      </v-flex>
    </v-layout>
    <v-layout fill-height justify-center align-center row v-else>
      <v-layout row justify-center align-center>
        <v-icon color="grey" size="192">chat_bubble_outline</v-icon>
        <v-flex
          xs12
          class="font-weight-light text-center"
          style="user-select: none;"
        >
          No chat selected.
        </v-flex>
      </v-layout>
    </v-layout>
    <v-dialog max-width="400" v-model="showSearchDialog">
      <v-card color="primary">
        <v-card-title class="font-weight-light">
          Start Conversation
          <v-spacer></v-spacer>
          <v-btn icon @click="showSearchDialog = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-text-field
            color="white"
            prepend-inner-icon="email"
            label="Email"
            v-model="email"
            :loading="checkingEmail"
            :disabled="gettingKey"
          >
          </v-text-field>
          <v-list v-if="userId">
            <v-list-item>
              <v-list-item-avatar>
                <v-img
                  :src="
                    `http://tinygraphs.com/squares/${foundedOnEmail}?theme=frogideas&numcolors=4&size=220&fmt=svg`
                  "
                ></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title style="user-select: none;">
                  {{ foundedOnEmail }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-spacer></v-spacer>
              <v-tooltip bottom v-if="isSelf">
                <template v-slot:activator="{ on }">
                  <div v-on="on">
                    <v-btn text disabled>Start Conversation</v-btn>
                  </div>
                </template>
                <span>You can't start a conversation with yourself.</span>
              </v-tooltip>
              <v-skeleton-loader
                :loading="gettingKey"
                type="image"
                v-else
                width="205"
                height="36"
              >
                <v-btn text @click="startConversation">
                  Start Conversation
                </v-btn>
              </v-skeleton-loader>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-content>
</template>
<script>
import { mapState } from "vuex";
import Api from "@/api/api";
import { debounce } from "lodash";
export default {
  name: "Chat",
  data: () => ({
    msgs: {},
    messageToSend: "",
    messageSending: false,
    userId: null,
    foundedOnEmail: "",
    email: "",
    showSearchDialog: false,
    debounceFunc: null,
    checkingEmail: false,
    gettingKey: false
  }),
  created() {
    this.debounceFunc = debounce(this.checkEmailExec, 1000);
  },
  methods: {
    async startConversation() {
      let userId = this.userId;
      this.gettingKey = true;
      await this.$store.dispatch("getKey", userId);
      this.gettingKey = false;
      this.showSearchDialog = false;
      this.selectedUser = userId;
    },
    newConversation() {
      this.showSearchDialog = true;
    },
    checkEmail() {
      if (this.debounceFunc) {
        this.debounceFunc();
      }
    },
    async checkEmailExec() {
      this.checkingEmail = true;
      this.userId = null;
      let email = this.email;
      let resp = await Api.getUserId(email);
      this.userId = resp.data.user_id;
      if (this.userId) {
        this.foundedOnEmail = email;
      }
      this.checkingEmail = false;
    },
    getFormattedDate(time) {
      return this.$moment
        .utc(time)
        .tz(this.$moment.tz.guess())
        .format("YYYY-MM-DD");
    },
    getFormattedTime(time) {
      return this.$moment
        .utc(time)
        .tz(this.$moment.tz.guess())
        .format("HH:mm");
    },
    getLastSendTime(intime) {
      let time = this.$moment.utc(intime).tz(this.$moment.tz.guess());
      let now = this.$moment();
      if (!time.isValid()) {
        return "";
      }
      if (now.diff(time, "hour") <= 18) {
        return time.format("HH:mm");
      }
      if (now.diff(time, "day") < 5) {
        return time.format("ddd");
      }
      return time.format("YYYY/MM/DD");
    },
    shouldShowDayChanger(index) {
      if (index == 0) {
        return true;
      }

      let thisMsg =
        this.$store.state.message[this.selectedUser][index].time == "sending"
          ? this.$moment()
          : this.$moment
              .utc(this.$store.state.message[this.selectedUser][index].time)
              .tz(this.$moment.tz.guess());
      let lastMsg =
        this.$store.state.message[this.selectedUser][index - 1].time ==
        "sending"
          ? this.$moment()
          : this.$moment
              .utc(this.$store.state.message[this.selectedUser][index - 1].time)
              .tz(this.$moment.tz.guess());

      return !thisMsg.isSame(lastMsg, "day");
    },
    async sendMessage() {
      if (this.messageToSend == "") {
        return;
      }
      this.$store.dispatch("sendMessage", {
        to: this.selectedUser,
        message: this.messageToSend
      });
      this.messageToSend = "";
      this.scrollToBottom();
    },
    scrollToBottom() {
      setTimeout(() => {
        let cse = this.$refs.chatScroll;
        cse.scrollTo(0, cse.scrollHeight);
      }, 100);
    }
  },
  watch: {
    showSearchDialog() {
      this.userId = null;
      this.foundedOnEmail = "";
    },
    email() {
      this.checkEmail();
    }
  },
  computed: {
    ...mapState(["message"]),
    isSelf() {
      return this.userId == this.$store.state.userId;
    },
    selectedUser: {
      get() {
        return this.$store.state.selectedUser;
      },
      set(val) {
        this.$store.commit("SELECT_USER", val);
        this.messageToSend = "";
        this.scrollToBottom();
      }
    }
  }
};
</script>
<style>
#chat-content .v-timeline:before {
  display: none;
}

#chat-content .v-timeline-item__divider {
  display: none;
}

#chat-content .v-timeline-item__body {
  max-width: none;
  width: auto;
}

#chat-content .v-timeline-item__body .v-card {
  width: fit-content;
}
</style>
