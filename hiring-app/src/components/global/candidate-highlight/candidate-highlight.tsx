import React from "react";
import type { CandidateInfoType } from "../../../types/candidate";
import "./candidate-highlight.scss";
interface CandidateHighlightProps {
  candidate: CandidateInfoType;
  onClick: () => void;
}

const CandidateHighlight: React.FC<CandidateHighlightProps> = ({
  candidate,
  onClick,
}) => {
  const {
    name,
    location,
    work_experiences,
    education,
    skills,
    annual_salary_expectation,
  } = candidate;

  // Get highest degree
  const highestDegree = education?.degrees?.[0];
  // Show first 3 skills
  const visibleSkills = skills.slice(0, 3);
  const remainingSkills = skills.length - visibleSkills.length;

  return (
    <div className="candidate-highlight" onClick={onClick}>
      <div className="ch-header">
        <h3>{name}</h3>
        <span className="ch-location">📍 {location}</span>
      </div>

      <p className="ch-degree">
        🎓 {highestDegree?.degree} in {highestDegree?.subject}
      </p>

      <p className="ch-roles">💼 {work_experiences.length} roles</p>

      <div className="ch-skills">
        {visibleSkills.map((skill, idx) => (
          <span key={idx} className="ch-skill">
            {skill}
          </span>
        ))}
        {remainingSkills > 0 && (
          <span className="ch-skill">+{remainingSkills} more</span>
        )}
      </div>

      <p className="ch-salary">
        💲 {annual_salary_expectation["full-time"] || "N/A"}
      </p>
    </div>
  );
};

export default CandidateHighlight;
