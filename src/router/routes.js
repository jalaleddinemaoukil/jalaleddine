import Home from "@/views/Home.vue";
import Works from "@/views/Works.vue";
import Info from "@/views/Info.vue";
import Blog from "@/views/Blog.vue";
import NotFound from "@/views/NotFound.vue";
import PrivacyPolicy from "@/views/PrivacyPolicy.vue";

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
    path: "/info",
    name: "info",
    component: Info,
  },
  {
    path: "/blog",
    name: "blog",
    component: Blog,
  },
  {
    path: "/privacy-policy",
    name: "privacy-policy",
    component: PrivacyPolicy,
  },
  {
    path: "/404",
    name: "not-found",
    component: NotFound,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found-catchall",
    component: NotFound,
  },
];
