// -----------------------------
// Type Definitions
// -----------------------------
interface WorkExperience {
  company: string;
  roleName: string;
}

interface Degree {
  degree: string;
  subject: string;
  school: string;
  gpa: string;
  startDate?: string;
  endDate?: string;
  originalSchool?: string;
  isTop50?: boolean;
}

interface Education {
  highest_level: string;
  degrees: Degree[];
}

interface CandidateInfoType {
  name: string;
  email: string;
  phone: string | null;
  location: string;
  submitted_at: string;
  work_availability: string[];
  annual_salary_expectation: { [key: string]: string };
  work_experiences: WorkExperience[];
  education: Education;
  skills: string[];
}

interface Props {
  candidateInfo: CandidateInfoType;
}

export type { CandidateInfoType, Props };
