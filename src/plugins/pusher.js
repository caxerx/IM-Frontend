import Pusher from "pusher-js";
import Store from "@/store/index";

const _pusher = new Pusher(process.env.VUE_APP_PUSHER_APP_KEY, {
  disableStats: true,
  forceTLS: true,
  cluster: process.env.VUE_APP_PUSHER_APP_CLUSTER
});

const _channel = _pusher.subscribe("my-channel");
_channel.bind("my-event", data => {
  Store.dispatch("newMessage", data);
});

export default Plugin;
