import type { ApplicationStatus } from '../types/application';

export const PIPELINE_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  APPLIED: ['UNDER_REVIEW', 'REJECTED'],
  UNDER_REVIEW: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['INTERVIEW', 'REJECTED'],
  INTERVIEW: ['OFFER', 'REJECTED'],
  OFFER: ['HIRED', 'REJECTED'],
  HIRED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

export function legalNextStages(current: ApplicationStatus): ApplicationStatus[] {
  return PIPELINE_TRANSITIONS[current] ?? [];
}

const WITHDRAWABLE_FROM: ApplicationStatus[] = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFER'];

export function canWithdraw(status: ApplicationStatus): boolean {
  return WITHDRAWABLE_FROM.includes(status);
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: 'Applied',
  UNDER_REVIEW: 'Under Review',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};