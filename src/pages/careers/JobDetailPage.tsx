import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getJob } from '../../api/jobs';
import { applyToJob } from '../../api/applications';
import { extractErrorMessage } from '../../api/client';
import { useAuth } from '../../auth/useAuth';
import { useMyAppliedJobIds } from '../../hooks/useMyAppliedJobIds';
import { LoadingState, ErrorState } from '../../components/ui/StateViews';
import { TextAreaField } from '../../components/ui/FormField';
import type { Job } from '../../types/job';
import { formatDate } from '../../utils/formatDate';

export function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const appliedJobIds = useMyAppliedJobIds();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [justApplied, setJustApplied] = useState(false);

  function load() {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    getJob(Number(jobId))
      .then(setJob)
      .catch((err) => setError(extractErrorMessage(err, 'Could not load this job.')))
      .finally(() => setLoading(false));
  }

  useEffect(load, [jobId]);

  async function handleApply(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!job) return;

    setApplying(true);
    setApplyError(null);
    try {
      await applyToJob(job.id, coverNote, resumeFile);
      setJustApplied(true);
      setShowApplyForm(false);
    } catch (err) {
      setApplyError(extractErrorMessage(err, 'Could not submit your application.'));
    } finally {
      setApplying(false);
    }
  }

  if (loading) return <LoadingState label="Loading job…" />;
  if (error || !job) return <ErrorState message={error ?? 'Job not found.'} onRetry={load} />;

  const isClosed = job.status !== 'OPEN';
  const hasApplied = justApplied || appliedJobIds.has(job.id);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-900">{job.title}</h1>
      <p className="mt-1 text-sm capitalize text-slate-500">
        {job.location} · {job.work_mode} · {job.employment_type} · {job.salary_range}
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Closes {formatDate(job.closing_date)}
        {isClosed && ' · Closed'}
      </p>

      <div className="mt-6 whitespace-pre-wrap text-sm leading-6 text-slate-700">{job.description}</div>

      {job.required_skills && (
        <div className="mt-4">
          <h2 className="text-sm font-medium text-slate-700">Required skills</h2>
          <p className="mt-1 text-sm text-slate-600">{job.required_skills}</p>
        </div>
      )}

      <div className="mt-8">
        {hasApplied ? (
          <p className="text-sm font-medium text-slate-600">You've already applied to this job.</p>
        ) : isClosed ? (
          <p className="text-sm font-medium text-slate-600">This job is closed.</p>
        ) : !showApplyForm ? (
          <button
            type="button"
            onClick={() => (user ? setShowApplyForm(true) : navigate('/login'))}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Apply now
          </button>
        ) : (
          <form onSubmit={handleApply} className="max-w-md space-y-4 rounded-lg border border-slate-200 bg-white p-4">
            <TextAreaField id="coverNote" label="Cover note (optional)" rows={4} value={coverNote} onChange={(e) => setCoverNote(e.target.value)} />
            <div>
              <label htmlFor="resume" className="block text-sm font-medium text-slate-700">
                Resume (optional, PDF)
              </label>
              <input
                id="resume"
                type="file"
                accept="application/pdf"
                onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                className="mt-1 block w-full text-sm text-slate-600"
              />
            </div>
            {applyError && (
              <p role="alert" className="text-sm text-red-600">
                {applyError}
              </p>
            )}
            <div className="flex gap-3">
              <button type="submit" disabled={applying} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
                {applying ? 'Submitting…' : 'Submit application'}
              </button>
              <button type="button" onClick={() => setShowApplyForm(false)} className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}