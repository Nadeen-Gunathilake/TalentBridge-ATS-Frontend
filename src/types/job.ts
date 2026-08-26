export type JobStatus = 'OPEN' | 'CLOSED' | 'DRAFT';
export type WorkMode = 'remote' | 'hybrid' | 'onsite';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship';

export interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  work_mode: string;
  employment_type: string;
  salary_range: string;
  required_skills: string;
  closing_date: string;
  status: JobStatus;
  createdBy: string;
}

export interface JobFormValues {
  title: string;
  description: string;
  location: string;
  work_mode: string;
  employment_type: string;
  salary_range: string;
  required_skills: string;
  closing_date: string;
  status: JobStatus;
}

export interface JobSearchParams {
  keyword?: string;
  workMode?: string;
  employmentType?: string;
  location?: string;
  status?: JobStatus;
  sort: string;
  page: number;
  size: number;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}
