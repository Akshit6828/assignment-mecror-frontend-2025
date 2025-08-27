import { createBrowserRouter } from "react-router-dom";
import {
  LazyAnalyticsPage,
  LazyCandidatePage,
  LazyLandingLayout,
  LazyLandingPage,
} from "./lazy-routes";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LazyLandingLayout,
    children: [
      {
        path: "/",
        index: true,
        Component: LazyLandingPage,
      },
      {
        path: "/candidate",
        Component: LazyCandidatePage,
      },
      {
        path: "/analytics",
        Component: LazyAnalyticsPage,
      },
    ],
  },
]);
