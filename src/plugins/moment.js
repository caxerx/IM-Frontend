"use strict";
import Vue from "vue";
import Moment from "moment-timezone";
let _moment = Moment;

let plg = {
  install: function(Vue) {
    Vue.moment = _moment;
    window.moment = _moment;
    Object.defineProperties(Vue.prototype, {
      moment: {
        get() {
          return _moment;
        }
      },
      $moment: {
        get() {
          return _moment;
        }
      }
    });
  }
};

Vue.use(plg);

export default plg;
