import "./app-tabs.scss";

interface TabItem {
  id: number;
  name: string;
  label: string;
  iconPath?: string; // optional SVG path
}

interface TabProps {
  tabItems: TabItem[];
  onTabItemClicked: (id: number) => void;
  selectedTab: number;
}

function AppTabs({ tabItems, onTabItemClicked, selectedTab }: TabProps) {
  return (
    <div className="tab-container">
      {tabItems.map((tab: TabItem) => (
        <div
          key={tab.id}
          onClick={() => onTabItemClicked(tab.id)}
          className={`tab-item ${selectedTab === tab.id ? "selected" : ""}`}
        >
          {tab.iconPath && (
            <img
              width={"24px"}
              height={"24px"}
              src={tab.iconPath}
              alt={tab.label}
              className={`tab-icon ${selectedTab === tab.id ? "selected" : ""}`}
            />
          )}
          <span className="tab-label">{tab.label}</span>
        </div>
      ))}
    </div>
  );
}

export default AppTabs;
