import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplications, withdrawApplication } from '../../api/applications';
import { extractErrorMessage } from '../../api/client';
import { canWithdraw } from '../../pipeline/pipelineRules';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/StateViews';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import type { CandidateApplication } from '../../types/application';
import { formatDate } from '../../utils/formatDate';

export function MyApplicationsPage() {
  const [applications, setApplications] = useState<CandidateApplication[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingWithdrawId, setPendingWithdrawId] = useState<number | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    getMyApplications()
      .then(setApplications)
      .catch((err) => setError(extractErrorMessage(err, 'Could not load your applications.')))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function confirmWithdraw() {
    if (pendingWithdrawId == null) return;
    setWithdrawing(true);
    try {
      const updated = await withdrawApplication(pendingWithdrawId);
      setApplications((prev) => prev?.map((a) => (a.id === updated.id ? updated : a)) ?? null);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not withdraw this application.'));
    } finally {
      setWithdrawing(false);
      setPendingWithdrawId(null);
    }
  }

  if (loading) return <LoadingState label="Loading your applications…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">My applications</h1>

      {applications && applications.length === 0 && (
        <div className="mt-6">
          <EmptyState title="You haven't applied to anything yet" description="Browse open jobs and apply to see them tracked here." />
        </div>
      )}

      {applications && applications.length > 0 && (
        <ul className="mt-6 space-y-3">
          {applications.map((app) => (
            <li key={app.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div>
                <Link to={`/jobs/${app.jobId}`} className="font-medium text-slate-900 hover:text-brand-600">
                  {app.jobTitle}
                </Link>
                <p className="mt-1 text-xs text-slate-500">Applied {formatDate(app.appliedAt)} </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={app.status} />
                {canWithdraw(app.status) && (
                  <button type="button" onClick={() => setPendingWithdrawId(app.id)} className="text-sm font-medium text-red-600 hover:underline">
                    Withdraw
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingWithdrawId != null}
        title="Withdraw this application?"
        description="This can't be undone. The recruiter will see that you've withdrawn."
        confirmLabel={withdrawing ? 'Withdrawing…' : 'Withdraw'}
        onConfirm={confirmWithdraw}
        onCancel={() => setPendingWithdrawId(null)}
      />
    </div>
  );
}