import VueRouter from "vue-router";
import Home from "../routes/Home.vue";
import Game from "../routes/Game.vue";
import Auth from "../routes/Auth.vue";
import Result from "../routes/Result.vue";
import Rankings from "../routes/Rankings.vue";
import SongSelect from "../routes/SongSelect.vue";
import MyStudio from "../routes/MyStudio.vue";
import SheetEditor from "../routes/SheetEditor.vue";
import GameOverScreen from "../routes/GameOverScreen.vue";
import { sendPageview } from "./analytics";

const router = new VueRouter({
  mode: "history",
  routes: [
    {
      name: "home",
      path: "/",
      component: Home,
      meta: { requireBg: true, requireSignin: true },
    },
    {
      name: "menu",
      path: "/menu",
      component: SongSelect,
      meta: { requireBg: true, requireSignin: true, title: "Song Select" },
    },
    {
      name: "studio",
      path: "/studio",
      component: MyStudio,
      meta: { requireBg: true, requireSignin: true, title: "My Studio" },
    },
    {
      name: "rankings",
      path: "/rankings",
      component: Rankings,
      meta: { requireBg: true, title: "Rankings" },
    },
    {
      path: "/game",
      component: Game,
      children: [
        {
          name: "game",
          path: ":sheet",
          component: Game,
          meta: { requireSignin: true, title: "Game" },
        },
      ],
    },
    {
      name: "tutorial",
      path: "/tutorial",
      component: Game,
      meta: { requireSignin: true, title: "Tutorial" },
    },
    {
      path: "/result",
      component: Result,
      props: true,
      children: [
        {
          name: "result",
          path: ":resultId",
          component: Result,
          meta: { title: "Result" },
        },
      ],
    },
    {
      path: "/game-over",
      component: GameOverScreen,
      props: true,
      children: [
        {
          name: "game-over",
          path: ":sheetId",
          component: GameOverScreen,
          meta: { title: "Game Over" },
        },
      ],
    },
    {
      path: "/editor",
      component: SheetEditor,
      children: [
        {
          name: "editor",
          path: ":sheet",
          component: SheetEditor,
          meta: { requireSignin: true, title: "Editor" },
        },
      ],
    },
    {
      name: "account",
      path: "/account",
      component: Auth,
      meta: {
        requireBg: true,
        requireSignin: true,
        title: "Account and Settings",
      },
    },
    { path: "*", redirect: { path: "/?notfound=true" } },
  ],
});

router.afterEach(async (to) => {
  sendPageview(to.path);
});

export default router;
