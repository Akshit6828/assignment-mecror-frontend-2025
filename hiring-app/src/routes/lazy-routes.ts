import React from "react";

const LazyLandingLayout = React.lazy(
  () => import("../layouts/landing-page-layout/landing-page-layout")
);
const LazyLandingPage = React.lazy(
  () => import("../pages/landing-page/landing-page")
);

const LazyCandidatePage = React.lazy(
  () => import("../pages/candidate-page/candidate-page")
);
const LazyAnalyticsPage = React.lazy(
  () => import("../pages/analytics-page/analytics-page")
);

export {
  LazyLandingLayout,
  LazyLandingPage,
  LazyCandidatePage,
  LazyAnalyticsPage,
};
