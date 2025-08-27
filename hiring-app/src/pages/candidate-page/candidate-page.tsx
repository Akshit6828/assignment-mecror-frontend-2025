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
// 0 means "empty / not set" — input will be shown empty in UI
const defaultShowTopResults = 0;

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
  // showTopResults 0 => UI shows empty; user must type value
  const [showTopResults, setShowTopResults] = useState<number>(
    defaultShowTopResults
  );

  // The official, currently applied filter states (what takes effect after Done)
  const [appliedRankingQuery, setAppliedRankingQuery] =
    useState<RankingQuery>(defaultRankingQuery);
  const [appliedRankingWeights, setAppliedRankingWeights] =
    useState<RankingWeights>(defaultRankingWeights);
  const [appliedShowTopResults, setAppliedShowTopResults] = useState<number>(
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

  const handleSkillsSubmit = () => {
    const parsedSkills = parseCommaSeparatedInput(skillsInput);

    updateRankingQuery("skills", parsedSkills);
  };

  const handleRolesSubmit = () => {
    const parsedRoles = parseCommaSeparatedInput(rolesInput);

    updateRankingQuery("targetRoles", parsedRoles);
  };

  const handleLocationsSubmit = () => {
    const parsedLocations = parseCommaSeparatedInput(locationsInput);
    updateRankingQuery("preferredLocations", parsedLocations);
  };

  // --- Clear All: also resets applied state instantly (clean UX)
  const clearRankingFilters = () => {
    // reset live editor
    setRankingQuery(defaultRankingQuery);
    setRankingWeights(defaultRankingWeights);
    setSkillsInput("");
    setRolesInput("");
    setLocationsInput("");
    setShowTopResults(defaultShowTopResults);

    // reset applied (what's currently used to render)
    setAppliedRankingQuery(defaultRankingQuery);
    setAppliedRankingWeights(defaultRankingWeights);
    setAppliedShowTopResults(defaultShowTopResults);
  };

  const getWorkAvailabilityForDropdown = (): DropdownOption[] => {
    const uniqueAvailabilities = Array.from(
      new Set(candidates.flatMap((c) => c.work_availability || []))
    );
    return uniqueAvailabilities.map((value) => ({
      label: String(value).replace("-", " "),
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

    // Apply basic search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply work availability filter
    if (selectedWorkAvailability.value) {
      filtered = filtered.filter((c) =>
        (c.work_availability || []).includes(selectedWorkAvailability.value)
      );
    }

    // Apply ranking if user supplied ranking criteria
    if (hasRankingCriteria(appliedRankingQuery)) {
      try {
        // Always rank all candidates to get proper ordering
        const rankedResults = rankCandidates(
          filtered,
          appliedRankingQuery,
          appliedRankingWeights,
          {
            maxResults: filtered.length, // Get all ranked results first
            minScore: 0,
            caseSensitive: false,
          }
        ) as CandidateWithRanking[];

        filtered = rankedResults;

        // Then apply Top N limitation ONLY if user specified a number > 0
        if (appliedShowTopResults > 0) {
          filtered = filtered.slice(0, appliedShowTopResults);
        }
      } catch (error) {
        console.error("Error in ranking candidates:", error);
        // Fallback to original filtered list if ranking fails
      }
    } else {
      // No ranking criteria - show all results in original order
      if (appliedShowTopResults > 0) {
        filtered = filtered.slice(0, appliedShowTopResults);
      }
    }

    return filtered;
  }, [
    searchTerm,
    selectedWorkAvailability,
    appliedRankingQuery,
    appliedRankingWeights,
    appliedShowTopResults,
  ]);

  // Fixed candidate count display
  const getCandidateCountDisplay = () => {
    // Only return top N if limited, else all
    const visibleCandidates =
      appliedShowTopResults > 0
        ? processedCandidates.slice(0, appliedShowTopResults)
        : processedCandidates;

    const baseCount = `${visibleCandidates.length} candidates`;
    const isRanked = hasRankingCriteria(appliedRankingQuery);
    const isLimited = appliedShowTopResults > 0;

    if (isRanked && isLimited) {
      return `${baseCount} (Top ${appliedShowTopResults} ranked)`;
    } else if (isRanked) {
      return `${baseCount} (Ranked)`;
    } else if (isLimited) {
      return `${baseCount} (Limited to ${appliedShowTopResults})`;
    }
    return baseCount;
  };

  // --- Only "Done" applies the current sidebar filter/ranking settings
  const onDoneClick = () => {
    setAppliedRankingQuery(rankingQuery);
    setAppliedRankingWeights(rankingWeights);
    setAppliedShowTopResults(showTopResults);
    setOpenSidebar(false);
  };

  // --- UI
  return (
    <div className="candidate-page">
      <div className="candidate-page-header">
        <div className="header-lhs">
          <Search
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search name / email"
          />
          <span className="candidate-count">{getCandidateCountDisplay()}</span>
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
      <div
        className={`candidate-list ${
          processedCandidates.length === 0 ? "no-candidates" : ""
        } `}
      >
        {processedCandidates.length > 0 ? (
          processedCandidates.map((candidate, index) => (
            <div
              key={`${candidate.email}-${index}`}
              className="candidate-item-wrapper"
            >
              <CandidateHighlight
                candidate={candidate}
                onClick={() => {
                  setSelectedCandidate(candidate);
                  setShowCandidateModal(true);
                }}
              />
              {hasRankingCriteria(appliedRankingQuery) &&
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
        position="left"
        width="600px"
      >
        <div className="advanced-filters-content">
          <div className="top-siderbar">
            <h3 className="top-siderbar-title">
              Advanced Filters & Smart Ranking
            </h3>

            <div className="input-group">
              <button
                className="btn btn-secondary clear-filters"
                onClick={clearRankingFilters}
              >
                Clear All Filters
              </button>
            </div>
          </div>

          <div className="ranking-criteria">
            <h4 className="ranking-criteria-title">Search Criteria</h4>
            <div className="input-group">
              <label>Skills (comma-separated)</label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                onBlur={handleSkillsSubmit}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSkillsSubmit();
                  }
                }}
                placeholder="e.g., React, Docker, Python"
              />
              {rankingQuery.skills.length > 0 && (
                <div className="applied-values">
                  Applied: {rankingQuery.skills.join(", ")}
                </div>
              )}
            </div>
            <div className="input-group">
              <label>Target Roles (comma-separated)</label>
              <input
                type="text"
                value={rolesInput}
                onChange={(e) => setRolesInput(e.target.value)}
                onBlur={handleRolesSubmit}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleRolesSubmit();
                  }
                }}
                placeholder="e.g., Developer, Engineer, Manager"
              />
              {rankingQuery.targetRoles.length > 0 && (
                <div className="applied-values">
                  Applied: {rankingQuery.targetRoles.join(", ")}
                </div>
              )}
            </div>
            <div className="input-group">
              <label>Preferred Locations (comma-separated)</label>
              <input
                type="text"
                value={locationsInput}
                onChange={(e) => setLocationsInput(e.target.value)}
                onBlur={handleLocationsSubmit}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleLocationsSubmit();
                  }
                }}
                placeholder="e.g., New York, Remote, California"
              />
              {rankingQuery.preferredLocations.length > 0 && (
                <div className="applied-values">
                  Applied: {rankingQuery.preferredLocations.join(", ")}
                </div>
              )}
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
            <h4 className="ranking-criteria-title">
              Ranking Weights (Total: {totalWeight}%)
            </h4>
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
              value={showTopResults === 0 ? "" : showTopResults}
              onChange={(e) =>
                setShowTopResults(
                  e.target.value === "" ? 0 : parseInt(e.target.value) || 0
                )
              }
              min={1}
              max={100}
              placeholder="Enter number of top results"
              style={{ width: "250px", marginLeft: "10px" }}
            />
            {showTopResults > 0 && (
              <div className="applied-values">
                Will show top {showTopResults} results
              </div>
            )}
          </div>

          {totalWeight !== 100 && (
            <div className="weight-warning">
              ⚠️ Total weight must equal 100%. Current: {totalWeight}%
            </div>
          )}

          <div className="sidebar-actions">
            <button className="btn btn-primary" onClick={onDoneClick}>
              Done
            </button>
          </div>
        </div>
      </Sidebar>
    </div>
  );
}
