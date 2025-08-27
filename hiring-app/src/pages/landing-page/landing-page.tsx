import { useEffect, useState } from "react";
import "./landing-page.scss";
import { candidates } from "../../data/applied-candidates";

interface OverviewItem {
  id: number;
  label: string;
  value: string | number;
  iconClass: string;
  bgColor?: string;
}

export default function LandingPage() {
  const [overviewData, setOverviewData] = useState<OverviewItem[]>([]);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = () => {
    const data = candidates;

    const totalCandidates = data.length;

    const uniqueLocations = new Set(data.map((c) => c.location));

    const uniqueRoles = new Set(
      data.flatMap((c) => c.work_experiences.map((we) => we.roleName))
    );

    const uniqueSkills = new Set(data.flatMap((c) => c.skills));

    const salaries = data
      .map((c) => c.annual_salary_expectation["full-time"])
      .filter(Boolean)
      .map((s) => parseInt(s.replace(/\D/g, "")));

    const budgetMin = Math.min(...salaries);
    const budgetMax = Math.max(...salaries);

    const topEducationCandidates = data.filter((c) =>
      c.education.degrees.some((d: any) => d.isTop50 || d.isTop25)
    ).length;

    setOverviewData([
      {
        id: 1,
        label: "Total Candidates",
        value: totalCandidates,
        iconClass: "fa-solid fa-users",
        bgColor: "#e0f2fe",
      },
      {
        id: 2,
        label: "Locations",
        value: uniqueLocations.size,
        iconClass: "fa-solid fa-location-dot",
        bgColor: "#fef3c7",
      },
      {
        id: 3,
        label: "Roles",
        value: uniqueRoles.size,
        iconClass: "fa-solid fa-briefcase",
        bgColor: "#d1fae5",
      },
      {
        id: 4,
        label: "Skills",
        value: uniqueSkills.size,
        iconClass: "fa-solid fa-lightbulb",
        bgColor: "#fcd5ce",
      },
      {
        id: 5,
        label: "Budget Range",
        value: salaries.length > 0 ? `$${budgetMin} - $${budgetMax}` : "N/A",
        iconClass: "fa-solid fa-wallet",
        bgColor: "#ede9fe",
      },
      {
        id: 6,
        label: "Top Education",
        value: topEducationCandidates,
        iconClass: "fa-solid fa-graduation-cap",
        bgColor: "#cffafe",
      },
    ]);
  };

  return (
    <div className="landing-page-container">
      <div className="overview">
        <h1 className="overview-title">Overview Dashboard</h1>

        <div className="overview-cards">
          {overviewData.map((item) => (
            <div
              className="overview-card"
              key={item.id}
              style={{ backgroundColor: item.bgColor }}
            >
              <div className="card-icon">
                <i className={item.iconClass}></i>
              </div>
              <div className="card-content">
                <h2 className="card-value">{item.value}</h2>
                <p className="card-label">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
