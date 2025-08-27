import React from "react";
import "./candidate-info.scss";
import type { Props } from "../../../types/candidate";

const CandidateInfo: React.FC<Props> = ({ candidateInfo }) => {
  if (!candidateInfo) return null;

  const {
    name,
    email,
    phone,
    location,
    submitted_at,
    work_availability,
    annual_salary_expectation,
    work_experiences,
    education,
    skills,
  } = candidateInfo;

  return (
    <div className="candidate-card">
      {/* Header */}
      <div className="candidate-header">
        <div className="candidate-avatar">{name[0]}</div>
        <div>
          <h2 className="candidate-name">{name}</h2>
          <p className="candidate-location">📍 {location}</p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="candidate-section">
        <h3>📧 Contact</h3>
        <p>Email: {email}</p>
        <p>📞 {phone}</p>
        <p>🗓 Submitted: {new Date(submitted_at).toLocaleDateString()}</p>
      </div>

      {/* Work Availability & Salary */}
      <div className="candidate-section">
        <h3>💼 Work Availability</h3>
        <p>{work_availability.join(", ")}</p>
        {annual_salary_expectation["full-time"] && (
          <p>💲 Full-time: {annual_salary_expectation["full-time"]}</p>
        )}
      </div>

      {/* Work Experience */}
      <div className="candidate-section">
        <h3>🏢 Work Experience</h3>
        <ul>
          {work_experiences.map((exp, index) => (
            <li key={index}>
              <b>{exp.roleName}</b> @ {exp.company}
            </li>
          ))}
        </ul>
      </div>

      {/* Education */}
      <div className="candidate-section">
        <h3>🎓 Education</h3>
        <p>Highest Level: {education.highest_level}</p>
        <ul>
          {education.degrees.map((deg, index) => (
            <li key={index}>
              {deg.degree} in {deg.subject} @ {deg.originalSchool} (
              {deg.startDate} - {deg.endDate})
            </li>
          ))}
        </ul>
      </div>

      {/* Skills */}
      <div className="candidate-section">
        <h3>🛠 Skills</h3>
        <div className="skills">
          {skills.map((skill, index) => (
            <span key={index} className="skill-chip">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CandidateInfo;
