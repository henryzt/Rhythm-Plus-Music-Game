import VueRouter from "vue-router";
import Home from "../routes/Home.vue";
import Game from "../routes/Game.vue";
import Auth from "../routes/Auth.vue";
import Result from "../routes/Result.vue";
import Rankings from "../routes/Rankings.vue";
import SongSelect from "../routes/SongSelect.vue";
import MyStudio from "../routes/MyStudio.vue";
import SheetEditor from "../routes/SheetEditor.vue";
import { sendPageview } from "./analytics";

const router = new VueRouter({
  mode: "history",
  routes: [
    {
      path: "/",
      component: Home,
      meta: { requireBg: true, requireSignin: true },
    },
    {
      path: "/menu",
      component: SongSelect,
      meta: { requireBg: true, title: "Song Select" },
    },
    {
      path: "/studio",
      component: MyStudio,
      meta: { requireBg: true, requireSignin: true, title: "My Studio" },
    },
    {
      path: "/rankings",
      component: Rankings,
      meta: { requireBg: true, title: "Rankings" },
    },
    {
      path: "/game",
      component: Game,
      children: [
        {
          path: ":sheet",
          component: Game,
          meta: { requireSignin: true, title: "Game" },
        },
      ],
    },
    {
      path: "/tutorial",
      component: Game,
      meta: { requireSignin: true, title: "Tutorial" },
    },
    {
      path: "/result",
      component: Result,
      props: true,
      children: [
        { path: ":resultId", component: Result, meta: { title: "Result" } },
      ],
    },
    {
      path: "/editor",
      component: SheetEditor,
      children: [
        {
          path: ":sheet",
          component: SheetEditor,
          meta: { requireSignin: true, title: "Editor" },
        },
      ],
    },
    {
      path: "/account",
      component: Auth,
      meta: {
        requireBg: true,
        requireSignin: true,
        title: "Account and Settings",
      },
    },
    { path: "*", redirect: { path: "/" } },
  ],
});

router.afterEach(async (to) => {
  sendPageview(to.path);
});

export default router;
