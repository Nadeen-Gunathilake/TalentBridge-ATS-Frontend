import { apiClient } from './client';
import type {
  ApplicationNote,
  ApplicationSearchParams,
  ApplicationStatus,
  CandidateApplication,
  RecruiterApplicationView,
} from '../types/application';
import type { Page } from '../types/job';

export function applyToJob(jobId: number, coverNote: string, resumeFile: File | null) {
  const formData = new FormData();
  if (coverNote) formData.append('coverNote', coverNote);
  if (resumeFile) formData.append('resume', resumeFile);

  return apiClient
    .post<CandidateApplication>(`/api/applications/jobs/${jobId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
}

export function getMyApplications() {
  return apiClient.get<CandidateApplication[]>('/api/applications').then((r) => r.data);
}

export function getMyApplication(id: number) {
  return apiClient.get<CandidateApplication>(`/api/applications/${id}`).then((r) => r.data);
}

export function withdrawApplication(id: number) {
  return apiClient.put<CandidateApplication>(`/api/applications/${id}/withdraw`).then((r) => r.data);
}


export function getApplicantsForJob(jobId: number, params: ApplicationSearchParams) {
  return apiClient
    .get<Page<RecruiterApplicationView>>(`/api/applications/jobs/${jobId}`, {
      params: { status: params.status || undefined, sort: params.sort, page: params.page, size: params.size },
    })
    .then((r) => r.data);
}

export function getApplicant(id: number) {
  return apiClient.get<RecruiterApplicationView>(`/api/applications/recruiter/${id}`).then((r) => r.data);
}

export function changeApplicationStatus(id: number, status: ApplicationStatus) {
  return apiClient.put<RecruiterApplicationView>(`/api/applications/${id}/status`, { status }).then((r) => r.data);
}

export function rateApplicant(id: number, rating: number) {
  return apiClient.put<RecruiterApplicationView>(`/api/applications/${id}/rating`, { rating }).then((r) => r.data);
}

export function getNotes(applicationId: number) {
  return apiClient.get<ApplicationNote[]>(`/api/applications/${applicationId}/notes`).then((r) => r.data);
}

export function addNote(applicationId: number, content: string) {
  return apiClient.post<ApplicationNote>(`/api/applications/${applicationId}/notes`, { content }).then((r) => r.data);
}

export async function downloadResume(applicationId: number, suggestedFilename = 'resume.pdf') {
  const response = await apiClient.get(`/api/applications/${applicationId}/resume`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(response.data as Blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = suggestedFilename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
