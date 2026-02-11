import Home from "@/views/Home.vue";
const Works = () => import("@/views/Works.vue");
const Info = () => import("@/views/Info.vue");
const Blog = () => import("@/views/Blog.vue");
const NotFound = () => import("@/views/NotFound.vue");
const PrivacyPolicy = () => import("@/views/PrivacyPolicy.vue");

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
