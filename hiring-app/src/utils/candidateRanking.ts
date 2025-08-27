// candidate-ranking.ts

// --- Interfaces ---

export interface Candidate {
  name: string;
  email: string;
  skills?: string[];
  work_experiences?: WorkExperience[];
  education?: Education;
  location?: string;
  annual_salary_expectation?: Record<"full-time" | string, string>;
  work_availability?: string[];
}

export interface WorkExperience {
  roleName: string;
  company: string;
  years?: number;
}

export interface Education {
  highest_level: string;
  degrees: Degree[];
}

export interface Degree {
  subject?: string;
  isTop50?: boolean;
  isTop25?: boolean;
  gpa?: string;
}

export interface CandidateQuery {
  skills?: string[];
  targetRoles?: string[];
  preferredCompanies?: string[];
  preferredLocations?: string[];
  budgetRange?: { min: number; max: number };
  requiredAvailability?: string[];
  preferredSubjects?: string[];
}

export interface CandidateWeights {
  skills?: number;
  experience?: number;
  education?: number;
  location?: number;
  salary?: number;
  availability?: number;
}

export interface CandidateOptions {
  maxResults?: number;
  minScore?: number;
  prioritizeRecent?: boolean;
  caseSensitive?: boolean;
}

export interface RankedCandidate extends Candidate {
  rankingScore: number;
  scoreBreakdown: Record<string, number>;
  matchedCriteria: string[];
}

// --- Main function ---

export function rankCandidates(
  candidates: Candidate[],
  query: CandidateQuery = {},
  weights: CandidateWeights = {},
  options: CandidateOptions = {}
): RankedCandidate[] {
  const defaultWeights: Required<CandidateWeights> = {
    skills: 40,
    experience: 25,
    education: 15,
    location: 10,
    salary: 5,
    availability: 5,
  };

  const finalWeights: Required<CandidateWeights> = {
    ...defaultWeights,
    ...weights,
  } as Required<CandidateWeights>;

  const totalWeight = Object.values(finalWeights).reduce(
    (sum, w) => sum + w,
    0
  );
  if (Math.abs(totalWeight - 100) > 0.01) {
    console.warn(`Warning: Weights sum to ${totalWeight}%, not 100%`);
  }

  const defaultOptions: Required<CandidateOptions> = {
    maxResults: candidates.length,
    minScore: 0,
    prioritizeRecent: true,
    caseSensitive: false,
  };

  const finalOptions: Required<CandidateOptions> = {
    ...defaultOptions,
    ...options,
  } as Required<CandidateOptions>;

  const scoredCandidates: RankedCandidate[] = candidates.map((candidate) => {
    let totalScore = 0;
    const scoreBreakdown: Record<string, number> = {};

    if (finalWeights.skills > 0) {
      const score = calculateSkillsScore(candidate, query, finalOptions);
      scoreBreakdown.skills = score;
      totalScore += (score * finalWeights.skills) / 100;
    }

    if (finalWeights.experience > 0) {
      const score = calculateExperienceScore(candidate, query, finalOptions);
      scoreBreakdown.experience = score;
      totalScore += (score * finalWeights.experience) / 100;
    }

    if (finalWeights.education > 0) {
      const score = calculateEducationScore(candidate, query, finalOptions);
      scoreBreakdown.education = score;
      totalScore += (score * finalWeights.education) / 100;
    }

    if (finalWeights.location > 0) {
      const score = calculateLocationScore(candidate, query, finalOptions);
      scoreBreakdown.location = score;
      totalScore += (score * finalWeights.location) / 100;
    }

    if (finalWeights.salary > 0) {
      const score = calculateSalaryScore(candidate, query, finalOptions);
      scoreBreakdown.salary = score;
      totalScore += (score * finalWeights.salary) / 100;
    }

    if (finalWeights.availability > 0) {
      const score = calculateAvailabilityScore(candidate, query, finalOptions);
      scoreBreakdown.availability = score;
      totalScore += (score * finalWeights.availability) / 100;
    }

    return {
      ...candidate,
      rankingScore: Math.round(totalScore * 100) / 100,
      scoreBreakdown,
      matchedCriteria: getMatchedCriteria(candidate, query, finalOptions),
    };
  });

  return scoredCandidates
    .filter((c) => c.rankingScore >= finalOptions.minScore)
    .sort((a, b) => b.rankingScore - a.rankingScore)
    .slice(0, finalOptions.maxResults);
}

// --- Scoring functions ---

function calculateSkillsScore(
  candidate: Candidate,
  query: CandidateQuery,
  options: Required<CandidateOptions>
): number {
  if (!query.skills?.length) return 50;

  const candidateSkills = candidate.skills || [];
  if (!candidateSkills.length) return 0;

  const querySkills = query.skills.map((s) =>
    options.caseSensitive ? s : s.toLowerCase()
  );
  const normalizedCandidateSkills = candidateSkills.map((s) =>
    options.caseSensitive ? s : s.toLowerCase()
  );

  const exactMatches = querySkills.filter((s) =>
    normalizedCandidateSkills.includes(s)
  ).length;
  const partialMatches = querySkills.filter(
    (s) =>
      !normalizedCandidateSkills.includes(s) &&
      normalizedCandidateSkills.some((cs) => cs.includes(s) || s.includes(cs))
  ).length;

  const exactMatchScore = (exactMatches / querySkills.length) * 80;
  const partialMatchScore = (partialMatches / querySkills.length) * 20;
  const diversityBonus = Math.min((candidateSkills.length / 10) * 10, 20);

  return Math.min(exactMatchScore + partialMatchScore + diversityBonus, 100);
}

function calculateExperienceScore(
  candidate: Candidate,
  query: CandidateQuery,
  options: Required<CandidateOptions>
): number {
  const experiences = candidate.work_experiences || [];
  if (!experiences.length) return 0;

  const countScore = Math.min((experiences.length / 5) * 40, 40);

  let roleRelevanceScore = 30;
  if (query.targetRoles?.length) {
    const normalizedTargetRoles = query.targetRoles.map((r) =>
      options.caseSensitive ? r : r.toLowerCase()
    );
    const matches = experiences.filter((exp) =>
      normalizedTargetRoles.some((target) => {
        const roleName = options.caseSensitive
          ? exp.roleName
          : exp.roleName.toLowerCase();
        return roleName.includes(target) || target.includes(roleName);
      })
    );
    roleRelevanceScore = (matches.length / experiences.length) * 40;
  }

  let companyRelevanceScore = 10;
  if (query.preferredCompanies?.length) {
    const normalizedCompanies = query.preferredCompanies.map((c) =>
      options.caseSensitive ? c : c.toLowerCase()
    );
    const matches = experiences.filter((exp) => {
      const company = options.caseSensitive
        ? exp.company
        : exp.company.toLowerCase();
      return normalizedCompanies.some(
        (c) => company.includes(c) || c.includes(company)
      );
    });
    companyRelevanceScore = (matches.length / experiences.length) * 20;
  }

  return Math.min(countScore + roleRelevanceScore + companyRelevanceScore, 100);
}

function calculateEducationScore(
  candidate: Candidate,
  query: CandidateQuery,
  options: Required<CandidateOptions>
): number {
  const education = candidate.education;
  if (!education?.degrees?.length) return 20;

  const levelScore = getEducationLevelScore(education.highest_level);

  let subjectScore = 30;
  if (query.preferredSubjects?.length) {
    const normalizedSubjects = query.preferredSubjects.map((s) =>
      options.caseSensitive ? s : s.toLowerCase()
    );
    const matches = education.degrees.filter(
      (d) =>
        d.subject &&
        normalizedSubjects.some(
          (s) =>
            (options?.caseSensitive
              ? d.subject
              : d.subject?.toLowerCase()
            )?.includes(s) || (d.subject && s.includes(d.subject))
        )
    );
    subjectScore = (matches.length / education.degrees.length) * 40;
  }

  const prestigeScore = education.degrees.some((d) => d.isTop50)
    ? 20
    : education.degrees.some((d) => d.isTop25)
    ? 30
    : 0;
  const gpaScore = getGPAScore(education.degrees);

  return Math.min(levelScore + subjectScore + prestigeScore + gpaScore, 100);
}

function calculateLocationScore(
  candidate: Candidate,
  query: CandidateQuery,
  options: Required<CandidateOptions>
): number {
  if (!query.preferredLocations?.length) return 50;

  const candidateLocation = candidate.location || "";
  const normalizedCandidateLocation = options.caseSensitive
    ? candidateLocation
    : candidateLocation.toLowerCase();
  const normalizedPreferredLocations = query.preferredLocations.map((l) =>
    options.caseSensitive ? l : l.toLowerCase()
  );

  if (normalizedPreferredLocations.includes(normalizedCandidateLocation))
    return 100;

  const partialMatch = normalizedPreferredLocations.some(
    (p) =>
      normalizedCandidateLocation.includes(p) ||
      p.includes(normalizedCandidateLocation)
  );
  return partialMatch ? 70 : 0;
}

function calculateSalaryScore(
  candidate: Candidate,
  query: CandidateQuery,
  options: Required<CandidateOptions>
): number {
  if (!query.budgetRange || !candidate.annual_salary_expectation) return 50;

  const candidateSalary = parseInt(
    candidate.annual_salary_expectation["full-time"]?.replace(/[$,]/g, "") ||
      "0"
  );
  const { min = 0, max = Infinity } = query.budgetRange;

  if (candidateSalary >= min && candidateSalary <= max) return 100;
  if (candidateSalary < min)
    return Math.max(80 - ((min - candidateSalary) / min) * 50, 60);
  if (candidateSalary > max)
    return Math.max(50 - ((candidateSalary - max) / max) * 50, 0);
  return 50;
}

function calculateAvailabilityScore(
  candidate: Candidate,
  query: CandidateQuery,
  options: Required<CandidateOptions>
): number {
  if (!query.requiredAvailability?.length) return 50;
  const candidateAvailability = candidate.work_availability || [];
  const matched = query.requiredAvailability.filter((r) =>
    candidateAvailability.includes(r)
  );
  return (matched.length / query.requiredAvailability.length) * 100;
}

// --- Helpers ---

function getEducationLevelScore(level: string): number {
  const scores: Record<string, number> = {
    "High School Diploma": 20,
    "Associate Degree": 30,
    "Bachelor's Degree": 50,
    "Master's Degree": 70,
    "Juris Doctor (J.D)": 75,
    Doctorate: 80,
    PhD: 85,
  };
  return scores[level] || 25;
}

function getGPAScore(degrees: Degree[]): number {
  const scores: Record<string, number> = {
    "GPA 4.0": 20,
    "GPA 3.5-3.9": 15,
    "GPA 3.0-3.4": 10,
    "GPA 2.5-2.9": 5,
  };
  return Math.max(...degrees.map((d) => scores[d.gpa!] || 0));
}

function getMatchedCriteria(
  candidate: Candidate,
  query: CandidateQuery,
  options: Required<CandidateOptions>
): string[] {
  const matched: string[] = [];
  if (query.skills?.length) {
    const candidateSkills = (candidate.skills || []).map((s) =>
      options.caseSensitive ? s : s.toLowerCase()
    );
    const matchedSkills = query.skills.filter((s) =>
      candidateSkills.includes(options.caseSensitive ? s : s.toLowerCase())
    );
    if (matchedSkills.length)
      matched.push(`Skills: ${matchedSkills.join(", ")}`);
  }
  return matched;
}

// --- Example Usage ---
export function exampleUsage() {
  const searchQuery: CandidateQuery = {
    skills: ["Docker", "React", "JavaScript"],
    targetRoles: ["Full Stack Developer", "Software Engineer"],
    preferredLocations: ["New York", "Remote"],
    budgetRange: { min: 80000, max: 150000 },
    requiredAvailability: ["full-time"],
    preferredSubjects: ["Computer Science", "Engineering"],
  };

  const customWeights: CandidateWeights = {
    skills: 45,
    experience: 30,
    education: 10,
    location: 8,
    salary: 4,
    availability: 3,
  };

  const rankingOptions: CandidateOptions = {
    maxResults: 10,
    minScore: 20,
    caseSensitive: false,
    prioritizeRecent: true,
  };

  return { searchQuery, customWeights, rankingOptions };
}
