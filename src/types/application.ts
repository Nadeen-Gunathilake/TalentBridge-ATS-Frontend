export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface CandidateApplication {
  id: number;
  jobId: number;
  jobTitle: string;
  status: ApplicationStatus;
  coverNote: string | null;
  appliedAt: string;
}

export interface RecruiterApplicationView {
  id: number;
  jobId: number;
  jobTitle: string;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  status: ApplicationStatus;
  coverNote: string | null;
  rating: number | null;
  appliedAt: string;
  hasResume: boolean;
}


export interface ApplicationNote {
  id: number;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface ApplicationSearchParams {
  status?: ApplicationStatus;
  sort: string;
  page: number;
  size: number;
}
