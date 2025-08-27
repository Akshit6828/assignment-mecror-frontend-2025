import "./overview-stats.scss";
export default function OverviewStats({ item }: any) {
  return (
    <div className="stat-card" key={item.id}>
      <div className="icon-wrapper" style={{ background: item.bgColor }}>
        {item.icon}
      </div>
      <div>
        <p className="label">{item.label}</p>
        <p className="value">{item.value}</p>
      </div>
    </div>
  );
}
