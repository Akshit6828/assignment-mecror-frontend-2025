import { useState, useMemo } from "react";
import { candidates } from "../../data/applied-candidates";
import {
  rankCandidates,
  type RankedCandidate,
} from "../../utils/candidateRanking";
import CandidateHighlight from "../../components/global/candidate-highlight/candidate-highlight";
import "./candidate-page.scss";
import Search from "../../components/global/search/search";
import Dropdown, {
  type DropdownOption,
} from "../../components/global/dropdown/dropdown";
import Sidebar from "../../components/global/sidebar/sidebar";
import Modal from "../../components/global/modal/modal";
import CandidateInfo from "../../components/global/candidate-info/candidate-info";
import NoData from "../../components/global/no-data/no-data";

type Candidate = (typeof candidates)[number];
export type CandidateWithRanking = Candidate & Partial<RankedCandidate>;

type RankingQuery = {
  skills: string[];
  targetRoles: string[];
  preferredLocations: string[];
  budgetRange: { min: number; max: number };
  requiredAvailability: string[];
  preferredSubjects: string[];
};

type RankingWeights = {
  skills: number;
  experience: number;
  education: number;
  location: number;
  salary: number;
  availability: number;
};

// --- Initial Default Values
const defaultRankingQuery: RankingQuery = {
  skills: [],
  targetRoles: [],
  preferredLocations: [],
  budgetRange: { min: 0, max: 200000 },
  requiredAvailability: [],
  preferredSubjects: [],
};
const defaultRankingWeights: RankingWeights = {
  skills: 40,
  experience: 25,
  education: 15,
  location: 10,
  salary: 5,
  availability: 5,
};
const defaultShowTopResults = 5;
const defaultUseRanking = false;

export default function CandidatePage() {
  // --- State ---
  const [selectedWorkAvailability, setSelectedWorkAvailability] =
    useState<DropdownOption>({ label: "", value: "" });
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateWithRanking | null>(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openSidebar, setOpenSidebar] = useState(false);

  // Sidebar & live editing state (NOT applied until "Done")
  const [rankingQuery, setRankingQuery] =
    useState<RankingQuery>(defaultRankingQuery);
  const [rankingWeights, setRankingWeights] = useState<RankingWeights>(
    defaultRankingWeights
  );
  const [skillsInput, setSkillsInput] = useState("");
  const [rolesInput, setRolesInput] = useState("");
  const [locationsInput, setLocationsInput] = useState("");
  const [useRanking, setUseRanking] = useState(defaultUseRanking);
  const [showTopResults, setShowTopResults] = useState(defaultShowTopResults);

  // The official, currently applied filter states
  const [appliedRankingQuery, setAppliedRankingQuery] =
    useState<RankingQuery>(defaultRankingQuery);
  const [appliedRankingWeights, setAppliedRankingWeights] =
    useState<RankingWeights>(defaultRankingWeights);
  const [appliedUseRanking, setAppliedUseRanking] = useState(defaultUseRanking);
  const [appliedShowTopResults, setAppliedShowTopResults] = useState(
    defaultShowTopResults
  );

  // --- Helpers ---
  const hasRankingCriteria = (query: RankingQuery) =>
    query.skills.length > 0 ||
    query.targetRoles.length > 0 ||
    query.preferredLocations.length > 0 ||
    query.requiredAvailability.length > 0 ||
    query.preferredSubjects.length > 0;

  const parseCommaSeparatedInput = (input: string) =>
    input
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);

  const updateRankingQuery = <K extends keyof RankingQuery>(
    field: K,
    value: RankingQuery[K]
  ) => setRankingQuery((prev) => ({ ...prev, [field]: value }));

  const updateRankingWeight = <K extends keyof RankingWeights>(
    field: K,
    value: number
  ) => setRankingWeights((prev) => ({ ...prev, [field]: value }));

  const handleSkillsSubmit = () =>
    updateRankingQuery("skills", parseCommaSeparatedInput(skillsInput));
  const handleRolesSubmit = () =>
    updateRankingQuery("targetRoles", parseCommaSeparatedInput(rolesInput));
  const handleLocationsSubmit = () =>
    updateRankingQuery(
      "preferredLocations",
      parseCommaSeparatedInput(locationsInput)
    );

  // --- Clear All: also resets applied state instantly (optional, for clean UX)
  const clearRankingFilters = () => {
    setRankingQuery(defaultRankingQuery);
    setRankingWeights(defaultRankingWeights);
    setSkillsInput("");
    setRolesInput("");
    setLocationsInput("");
    setUseRanking(defaultUseRanking);
    setShowTopResults(defaultShowTopResults);

    // Instantly reset the applied state so the list reverts at once
    setAppliedRankingQuery(defaultRankingQuery);
    setAppliedRankingWeights(defaultRankingWeights);
    setAppliedUseRanking(defaultUseRanking);
    setAppliedShowTopResults(defaultShowTopResults);
  };

  const getWorkAvailabilityForDropdown = (): DropdownOption[] => {
    const uniqueAvailabilities = Array.from(
      new Set(candidates.flatMap((c) => c.work_availability))
    );
    return uniqueAvailabilities.map((value) => ({
      label: value.replace("-", " "),
      value,
    }));
  };

  const totalWeight = Object.values(rankingWeights).reduce(
    (sum, w) => sum + w,
    0
  );

  // --- Main filtering/ranking logic (driven by committed, "applied" states only)
  const processedCandidates: CandidateWithRanking[] = useMemo(() => {
    let filtered: CandidateWithRanking[] = [...candidates];

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedWorkAvailability.value) {
      filtered = filtered.filter((c) =>
        (c.work_availability || []).includes(selectedWorkAvailability.value)
      );
    }

    // Apply ranking if enabled
    if (appliedUseRanking && hasRankingCriteria(appliedRankingQuery)) {
      filtered = rankCandidates(
        filtered,
        appliedRankingQuery,
        appliedRankingWeights,
        {
          maxResults: filtered.length,
          minScore: 0,
          caseSensitive: false,
        }
      ) as CandidateWithRanking[];
    }

    // ✅ Always respect "Show Top N" until Clear
    if (appliedShowTopResults > 0) {
      filtered = filtered.slice(0, appliedShowTopResults);
    }

    return filtered;
  }, [
    searchTerm,
    selectedWorkAvailability,
    appliedRankingQuery,
    appliedRankingWeights,
    appliedShowTopResults,
    appliedUseRanking,
  ]);

  // --- Only "Done" applies the current sidebar filter/ranking settings
  const onDoneClick = () => {
    setAppliedRankingQuery(rankingQuery);
    setAppliedRankingWeights(rankingWeights);
    setAppliedShowTopResults(showTopResults);
    setAppliedUseRanking(useRanking);
    setOpenSidebar(false);
  };

  // --- UI as before (no changes below)
  return (
    <div className="candidate-page">
      <div className="candidate-page-header">
        <div className="header-lhs">
          <Search
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search name / email"
          />
          <span className="candidate-count">
            {processedCandidates.length} candidates
            {appliedUseRanking && hasRankingCriteria(appliedRankingQuery) && (
              <span className="ranking-indicator"> (Ranked)</span>
            )}
          </span>
        </div>
        <div className="header-rhs">
          <button
            className="btn btn-secondary advance-filter"
            onClick={() => setOpenSidebar(!openSidebar)}
          >
            Advance filters & Ranking
          </button>
          <Dropdown
            options={getWorkAvailabilityForDropdown()}
            value={selectedWorkAvailability}
            onChange={setSelectedWorkAvailability}
            placeholder="Work availability"
          />
        </div>
      </div>

      {/* Candidate list */}
      <div className="candidate-list">
        {processedCandidates.length > 0 ? (
          processedCandidates.map((candidate, index) => (
            <div key={candidate.email} className="candidate-item-wrapper">
              <CandidateHighlight
                candidate={candidate}
                onClick={() => {
                  setSelectedCandidate(candidate);
                  setShowCandidateModal(true);
                }}
              />
              {appliedUseRanking &&
                hasRankingCriteria(appliedRankingQuery) &&
                candidate.rankingScore && (
                  <div className="ranking-info-overlay">
                    <div className="rank-position">#{index + 1}</div>
                    <div className="rank-score">
                      Score: {candidate.rankingScore}%
                    </div>
                    {candidate.matchedCriteria &&
                      candidate.matchedCriteria.length > 0 && (
                        <div className="matched-criteria">
                          {candidate.matchedCriteria
                            .slice(0, 2)
                            .map((criteria: any, idx: any) => (
                              <span key={idx} className="criteria-match">
                                ✓ {criteria}
                              </span>
                            ))}
                        </div>
                      )}
                  </div>
                )}
            </div>
          ))
        ) : (
          <NoData />
        )}
      </div>

      {/* Candidate Modal */}
      {showCandidateModal && selectedCandidate && (
        <Modal
          onClose={() => setShowCandidateModal(false)}
          isOpen={showCandidateModal}
          showCloseIcon
        >
          <CandidateInfo candidateInfo={selectedCandidate} />
        </Modal>
      )}

      {/* Sidebar */}
      <Sidebar
        open={openSidebar}
        onClose={onDoneClick}
        position="right"
        width="400px"
      >
        {/* --- Sidebar content unchanged, only state variable names may differ */}
        <div className="advanced-filters-content">
          <h3>Advanced Filters & Smart Ranking</h3>
          <div className="ranking-toggle">
            <label>
              <input
                type="checkbox"
                checked={useRanking}
                onChange={(e) => setUseRanking(e.target.checked)}
              />
              Enable Smart Ranking
            </label>
          </div>
          {useRanking && (
            <>
              <div className="input-group">
                <button
                  className="btn btn-secondary clear-filters"
                  onClick={clearRankingFilters}
                >
                  Clear All Filters
                </button>
              </div>
              <div className="ranking-criteria">
                <h4>Search Criteria</h4>
                <div className="input-group">
                  <label>Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    onBlur={handleSkillsSubmit}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSkillsSubmit()
                    }
                    placeholder="e.g., React, Docker, Python"
                  />
                </div>
                <div className="input-group">
                  <label>Target Roles (comma-separated)</label>
                  <input
                    type="text"
                    value={rolesInput}
                    onChange={(e) => setRolesInput(e.target.value)}
                    onBlur={handleRolesSubmit}
                    onKeyPress={(e) => e.key === "Enter" && handleRolesSubmit()}
                    placeholder="e.g., Developer, Engineer, Manager"
                  />
                </div>
                <div className="input-group">
                  <label>Preferred Locations (comma-separated)</label>
                  <input
                    type="text"
                    value={locationsInput}
                    onChange={(e) => setLocationsInput(e.target.value)}
                    onBlur={handleLocationsSubmit}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleLocationsSubmit()
                    }
                    placeholder="e.g., New York, Remote, California"
                  />
                </div>
                <div className="input-group">
                  <label>Budget Range</label>
                  <div className="range-inputs">
                    <input
                      type="number"
                      value={rankingQuery.budgetRange.min}
                      onChange={(e) =>
                        updateRankingQuery("budgetRange", {
                          ...rankingQuery.budgetRange,
                          min: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="Min"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      value={rankingQuery.budgetRange.max}
                      onChange={(e) =>
                        updateRankingQuery("budgetRange", {
                          ...rankingQuery.budgetRange,
                          max: parseInt(e.target.value) || 200000,
                        })
                      }
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
              <div className="ranking-weights">
                <h4>Ranking Weights (Total: {totalWeight}%)</h4>
                {Object.entries(rankingWeights).map(([key, value]) => (
                  <div key={key} className="weight-input">
                    <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) =>
                        updateRankingWeight(
                          key as keyof RankingWeights,
                          parseInt(e.target.value) || 0
                        )
                      }
                      min={0}
                      max={100}
                    />
                    <span>%</span>
                  </div>
                ))}
              </div>
              <div className="input-group">
                <label>Show Top Results</label>
                <input
                  type="number"
                  value={showTopResults}
                  onChange={(e) =>
                    setShowTopResults(
                      parseInt(e.target.value) || defaultShowTopResults
                    )
                  }
                  min={1}
                  max={100}
                />
              </div>
              {totalWeight !== 100 && (
                <div className="weight-warning">
                  ⚠️ Total weight must equal 100%. Current: {totalWeight}%
                </div>
              )}
            </>
          )}
        </div>
      </Sidebar>
    </div>
  );
}
