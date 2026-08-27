import { STATUS_LABELS } from '../../pipeline/pipelineRules';
import type { ApplicationStatus } from '../../types/application';

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  APPLIED: 'bg-slate-100 text-slate-700',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  SHORTLISTED: 'bg-cyan-100 text-cyan-700',
  INTERVIEW: 'bg-indigo-100 text-indigo-700',
  OFFER: 'bg-amber-100 text-amber-700',
  HIRED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-slate-100 text-slate-500',
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}