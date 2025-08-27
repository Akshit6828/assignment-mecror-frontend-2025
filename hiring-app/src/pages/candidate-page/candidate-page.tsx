import { useState } from "react";
import { candidates } from "../../data/applied-candidates";
import CandidateHighlight from "../../components/global/candidate-highlight/candidate-highlight";
import "./candidate-page.scss";
import Search from "../../components/global/search/search";
import Dropdown from "../../components/global/dropdown/dropdown";
import Sidebar from "../../components/global/sidebar/sidebar";
import Modal from "../../components/global/modal/modal";
import CandidateInfo from "../../components/global/candidate-info/candidate-info";
export default function CandidatePage() {
  const [selectedWorkAvailability, setSelectedWorkAvailability] = useState({
    label: "",
    value: "",
  });
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);

  const [filteredCandidates, setFilteredCandidates] = useState(candidates);

  const [searchTerm, setSearchTerm] = useState("");
  const [openSidebar, setOpenSidebar] = useState(false);

  // Search helpers

  const onSearchChange = (value: string) => {
    setSearchTerm(value);
    updateFilteredCandidatesBySearch(value);
  };

  const updateFilteredCandidatesBySearch = (value: string) => {
    if (value === "") {
      setFilteredCandidates(candidates);
    } else {
      // Parsing each query seperately by comma
      const queries = value.split(",").map((q) => q.trim().toLowerCase());
      const filtered = candidates.filter((candidate) => {
        const candidateData = `${candidate.name} ${candidate.email} ${
          candidate.location
        } ${candidate.skills.join(" ")}`.toLowerCase();
        return queries.every((query) => candidateData.includes(query));
      });
      setFilteredCandidates(filtered);
    }
  };

  // Adavance filter helpers

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
    updateFilteredCandidates(option);
  };

  const updateFilteredCandidates = (option: any) => {
    if (option.value === "") {
      setFilteredCandidates(candidates);
    } else {
      const filtered = candidates.filter((candidate) =>
        candidate.work_availability.includes(option.value)
      );

      setFilteredCandidates(filtered);
    }
  };

  // Candidate modal helpers
  const onCandidateClicked = (candidate: any) => {
    setSelectedCandidate(candidate);
    setShowCandidateModal(true);
  };

  return (
    <div className="candidate-page">
      <div className="candidate-page-header">
        <div className="header-lhs">
          <Search
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Search name / email / location / skills..."
          />

          <span className="candidate-count">
            {filteredCandidates.length} candidates
          </span>
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
        {filteredCandidates.map((candidate) => (
          <CandidateHighlight
            key={candidate.email}
            candidate={candidate}
            onClick={() => onCandidateClicked(candidate)}
          />
        ))}
      </div>
      {showCandidateModal && selectedCandidate && (
        <Modal
          onClose={() => setShowCandidateModal(false)}
          isOpen={showCandidateModal}
          showCloseIcon={true}
        >
          <CandidateInfo candidateInfo={selectedCandidate} />
        </Modal>
      )}
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
