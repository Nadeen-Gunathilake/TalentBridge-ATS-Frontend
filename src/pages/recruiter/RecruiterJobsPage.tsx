import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listAllJobsForRecruiter, setJobStatus } from '../../api/jobs';
import { extractErrorMessage } from '../../api/client';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/StateViews';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import type { Job, Page } from '../../types/job';

export function RecruiterJobsPage() {
  const [data, setData] = useState<Page<Job> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCloseId, setPendingCloseId] = useState<number | null>(null);
  const [updating, setUpdating] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    listAllJobsForRecruiter(page)
      .then(setData)
      .catch((err) => setError(extractErrorMessage(err, 'Could not load jobs.')))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page]);
  const jobs = data?.content ?? null;

  async function confirmClose() {
    if (pendingCloseId == null) return;
    setUpdating(true);
    try {
      const updated = await setJobStatus(pendingCloseId, 'CLOSED');
      setData((prev) => (prev ? { ...prev, content: prev.content.map((j) => (j.id === updated.id ? updated : j)) } : null));
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not close this job.'));
    } finally {
      setUpdating(false);
      setPendingCloseId(null);
    }
  }

  async function reopen(jobId: number) {
    try {
      const updated = await setJobStatus(jobId, 'OPEN');
      setData((prev) => (prev ? { ...prev, content: prev.content.map((j) => (j.id === updated.id ? updated : j)) } : null));
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not reopen this job.'));
    }
  }

  if (loading) return <LoadingState label="Loading jobs…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">All jobs</h1>
        <Link to="/recruiter/jobs/new" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Post a job
        </Link>
      </div>

      {jobs && jobs.length === 0 && (
        <div className="mt-6">
          <EmptyState title="No jobs yet" description="Post the first job to start receiving applications." />
        </div>
      )}

      {jobs && jobs.length > 0 && (
        <ul className="mt-6 space-y-3">
          {jobs.map((job) => (
            <li key={job.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div>
                <p className="font-medium text-slate-900">{job.title}</p>
                <p className="mt-1 text-xs capitalize text-slate-500">
                  {job.location} · {job.work_mode} · Posted by {job.createdBy} ·{' '}
                  <span className={job.status === 'OPEN' ? 'text-green-600' : job.status === 'DRAFT' ? 'text-amber-600' : 'text-slate-500'}>
                    {job.status.toLowerCase()}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link to={`/recruiter/jobs/${job.id}/applicants`} className="text-sm font-medium text-brand-600 hover:underline">
                  Applicants
                </Link>
                <Link to={`/recruiter/jobs/${job.id}/edit`} className="text-sm font-medium text-slate-600 hover:underline">
                  Edit
                </Link>
                {job.status === 'OPEN' ? (
                  <button type="button" onClick={() => setPendingCloseId(job.id)} className="text-sm font-medium text-red-600 hover:underline">
                    Close
                  </button>
                ) : (
                  <button type="button" onClick={() => reopen(job.id)} className="text-sm font-medium text-slate-600 hover:underline">
                    {job.status === 'DRAFT' ? 'Publish' : 'Reopen'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {data && data.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40">
            Previous
          </button>
          <span className="text-sm text-slate-500">
            Page {page + 1} of {data.totalPages}
          </span>
          <button
            type="button"
            disabled={page + 1 >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <ConfirmDialog
        open={pendingCloseId != null}
        title="Close this job?"
        description="Candidates will no longer be able to apply. You can reopen it later."
        confirmLabel={updating ? 'Closing…' : 'Close job'}
        onConfirm={confirmClose}
        onCancel={() => setPendingCloseId(null)}
      />
    </div>
  );
}