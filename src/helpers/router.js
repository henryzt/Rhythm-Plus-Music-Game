import VueRouter from "vue-router";
import Home from "../routes/Home.vue";
import Game from "../routes/Game.vue";
import Auth from "../routes/Auth.vue";
import Result from "../routes/Result.vue";
import Rankings from "../routes/Rankings.vue";
import SongSelect from "../routes/SongSelect.vue";
import SheetEditor from "../routes/SheetEditor.vue";
import { store } from "./store";

const router = new VueRouter({
  mode: "history",
  routes: [
    { path: "/", component: Home },
    { path: "/menu", component: SongSelect },
    { path: "/rankings", component: Rankings },
    {
      path: "/game",
      component: Game,
      children: [{ path: ":sheet", component: Game }],
    },
    {
      path: "/result",
      component: Result,
      props: true,
      children: [{ path: ":resultId", component: Result }],
    },
    {
      path: "/editor",
      component: SheetEditor,
      children: [{ path: ":sheet", component: SheetEditor }],
      beforeEnter: (to, from, next) => {
        if (store.state.authed && store.state.verified) {
          next();
        } else {
          next({ path: "/account", query: { warn: true } });
        }
      },
    },
    { path: "/account", component: Auth },
    { path: "*", redirect: { path: "/" } },
  ],
});
export default router;
