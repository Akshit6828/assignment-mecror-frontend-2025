import { useState } from "react";
import { candidates } from "../../data/applied-candidates";
import CandidateHighlight from "../../components/global/candidate-highlight/candidate-highlight";
import "./candidate-page.scss";
import Search from "../../components/global/search/search";
import Dropdown from "../../components/global/dropdown/dropdown";
import Sidebar from "../../components/global/sidebar/sidebar";
export default function CandidatePage() {
  const [selectedWorkAvailability, setSelectedWorkAvailability] = useState({
    label: "",
    value: "",
  });
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [openSidebar, setOpenSidebar] = useState(false);

  const onSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const onAdvanceFilterClick = () => {
    setOpenSidebar(!openSidebar);
  };

  // Work availability helpers
  const getWorkAvailabilityForDropdown = () => {
    const allAvailabilities = candidates.flatMap(
      (candidate) => candidate.work_availability
    );

    // Deduplicate
    const uniqueAvailabilities = Array.from(new Set(allAvailabilities));

    // Map to dropdown format
    return uniqueAvailabilities.map((availability) => ({
      label: availability.replace("-", " "),
      value: availability,
    }));
  };

  const onWorkAvailabilityChange = (option: any) => {
    setSelectedWorkAvailability(option);
  };

  return (
    <div className="candidate-page">
      <div className="candidate-page-header">
        <div className="header-lhs">
          <Search
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Search skill / location / name..."
          />
        </div>
        <div className="header-rhs">
          <button
            className="btn btn-secondary advance-filter"
            onClick={onAdvanceFilterClick}
          >
            Advance filters
          </button>
          <Dropdown
            options={getWorkAvailabilityForDropdown()}
            value={selectedWorkAvailability}
            onChange={onWorkAvailabilityChange}
            placeholder="Work availability"
          />
        </div>
      </div>
      <div className="candidate-list">
        {candidates.map((candidate) => (
          <CandidateHighlight
            key={candidate.email}
            candidate={candidate}
            onClick={() => console.log("clicked")}
          />
        ))}
      </div>
      <Sidebar
        open={openSidebar}
        onClose={() => setOpenSidebar(false)}
        position="right"
        width="320px"
      >
        <p>This is your sidebar content.</p>
        <p>You can put links, filters, menus, or anything else here.</p>
      </Sidebar>
    </div>
  );
}
