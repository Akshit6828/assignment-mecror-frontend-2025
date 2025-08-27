import { useEffect, useState } from "react";
import AppHeader from "../../components/app-header/app-header";
import AppTabs from "../../components/global/app-tabs/app-tabs";
import { Tabs } from "../../data/tab-data";
import "./landing-page-layout.scss";

import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function LandingPageLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState(1);

  useEffect(() => {
    if (location.pathname === "/") setSelectedTab(1);
    else if (location.pathname.startsWith("/candidate")) setSelectedTab(2);
    else if (location.pathname.startsWith("/analytics")) setSelectedTab(3);
  }, [location]);

  const onTabItemClicked = (id: number) => {
    setSelectedTab(id);
    if (id === 1) navigate("/");
    if (id === 2) navigate("/candidate");
    if (id === 3) navigate("/analytics");
  };
  return (
    <>
      <AppHeader />
      <div className="outlet-wrapper">
        <AppTabs
          onTabItemClicked={onTabItemClicked}
          selectedTab={selectedTab}
          tabItems={Tabs}
        />
        <Outlet />
      </div>
    </>
  );
}
