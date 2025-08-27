import { useEffect, useState } from "react";
import "./landing-page.scss";
import { candidates } from "../../data/applied-candidates";

export default function LandingPage() {
  const [overviewData, setOverviewData] = useState<any>([]);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  // Updating overview data from dummy data
  const fetchOverviewData = async () => {
    const data = candidates;

    let overviewData = [];
    overviewData.push({
      id: 1,
      label: "Total Candidates",
      value: data.length,
      icon: "assets/icons/total-candidates-icon.svg",
    });

    const uniqueLocations = new Set(
      data.map((candidate) => candidate.location)
    );
    overviewData.push({
      id: 2,
      label: "Locations",
      value: uniqueLocations.size,
      icon: "assets/icons/shortlisted-candidates-icon.svg",
    });

    setOverviewData(overviewData);
  };
  return (
    <div className="landing-page-container">
      <div className="overview">
        <h1>Overview Page</h1>
        <div className="overview-cards">
          {/* {overviewData.map((item: any) => (
            <OverviewStats key={item.id} item={item} />
          ))} */}
        </div>
      </div>
    </div>
  );
}
