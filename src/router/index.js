import Vue from "vue";
import VueRouter from "vue-router";
import Store from "@/store/index";
Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "InitPage",
    component: () =>
      import(/* webpackChunkName: "initPage" */ "../views/Init.vue"),
    children: [
      {
        path: "/chat",
        name: "Chat",
        component: () =>
          import(/* webpackChunkName: "chat" */ "../views/Chat.vue")
      }
    ]
  },
  {
    path: "/login",
    name: "Login",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/Login.vue")
  }
];

const router = new VueRouter({
  routes
});

router.beforeEach((to, _, next) => {
  if (to.name != "Login") {
    if (!Store.state.login) {
      next("/login");
    } else {
      if (to.name == "InitPage") {
        router.replace("/chat");
      } else {
        next();
      }
    }
    return;
  }
  next();
});

export default router;
