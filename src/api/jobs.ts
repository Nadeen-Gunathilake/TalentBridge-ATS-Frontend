import { apiClient } from './client';
import type { Job, JobFormValues, JobSearchParams, Page } from '../types/job';

export function searchJobs(params: JobSearchParams) {
  return apiClient
    .get<Page<Job>>('/api/jobs', {
      params: {
        keyword: params.keyword || undefined,
        workMode: params.workMode || undefined,
        employmentType: params.employmentType || undefined,
        location: params.location || undefined,
        status: params.status || undefined,
        sort: params.sort,
        page: params.page,
        size: params.size,
      },
    })
    .then((r) => r.data);
}

export function getJob(id: number) {
  return apiClient.get<Job>(`/api/jobs/${id}`).then((r) => r.data);
}

export function listAllJobsForRecruiter(page: number, size = 10) {
  return apiClient
    .get<Page<Job>>('/api/jobs', { params: { sort: 'id,desc', page, size } })
    .then((r) => r.data);
}

export function createJob(body: JobFormValues) {
  return apiClient.post<Job>('/api/jobs', body).then((r) => r.data);
}

export function updateJob(id: number, body: JobFormValues) {
  return apiClient.put<Job>(`/api/jobs/${id}`, body).then((r) => r.data);
}

export function deleteJob(id: number) {
  return apiClient.delete(`/api/jobs/${id}`);
}

export function setJobStatus(id: number, status: 'OPEN' | 'CLOSED' | 'DRAFT') {
  return apiClient.put<Job>(`/api/jobs/status/${id}`, { status }).then((r) => r.data);
}
