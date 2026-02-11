import Home from "@/views/Home.vue";
import Works from "@/views/Works.vue";

export const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/works",
    name: "works",
    component: Works,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];
