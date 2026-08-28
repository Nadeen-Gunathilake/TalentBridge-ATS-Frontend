import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getApplicantsForJob } from '../../api/applications';
import { extractErrorMessage } from '../../api/client';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/StateViews';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { ApplicationStatus, RecruiterApplicationView } from '../../types/application';
import type { Page } from '../../types/job';

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: 'appliedAt,desc', label: 'Newest first' },
  { value: 'appliedAt,asc', label: 'Oldest first' },
  { value: 'rating,desc', label: 'Highest rated' },
];

const STATUS_OPTIONS: ApplicationStatus[] = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN'];

export function ApplicantsPage() {
  const { jobId } = useParams<{ jobId: string }>();

  const [status, setStatus] = useState<ApplicationStatus | ''>('');
  const [sort, setSort] = useState(SORT_OPTIONS[0].value);
  const [page, setPage] = useState(0);

  const [data, setData] = useState<Page<RecruiterApplicationView> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setPage(0), [status, sort]);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    getApplicantsForJob(Number(jobId), { status: status || undefined, sort, page, size: PAGE_SIZE })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, 'Could not load applicants.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jobId, status, sort, page]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Applicants</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select value={status} onChange={(e) => setStatus(e.target.value as ApplicationStatus | '')} aria-label="Filter by status" className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort applicants" className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm">
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {loading && <LoadingState label="Loading applicants…" />}
        {!loading && error && <ErrorState message={error} onRetry={() => setPage((p) => p)} />}
        {!loading && !error && data && data.content.length === 0 && <EmptyState title="No applicants match these filters" />}

        {!loading && !error && data && data.content.length > 0 && (
          <ul className="space-y-3">
            {data.content.map((app) => (
              <li key={app.id}>
                <Link to={`/recruiter/applications/${app.id}`} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-brand-300 hover:shadow">
                  <div>
                    <p className="font-medium text-slate-900">{app.candidateName}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {app.candidateEmail}
                      {app.hasResume && ' · Résumé attached'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {app.rating != null && <span className="text-xs font-medium text-amber-600">★ {app.rating}</span>}
                    <StatusBadge status={app.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {!loading && !error && data && data.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40">
              Previous
            </button>
            <span className="text-sm text-slate-500">
              Page {page + 1} of {data.totalPages}
            </span>
            <button type="button" disabled={page + 1 >= data.totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}