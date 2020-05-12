import VueRouter from "vue-router";
import Home from "../routes/Home.vue";
import Game from "../routes/Game.vue";
import Auth from "../routes/Auth.vue";
const router = new VueRouter({
  mode: "history",
  routes: [
    { path: "/", component: Home },
    { path: "/game", component: Game },
    { path: "/account", component: Auth },
  ],
});
export default router;
