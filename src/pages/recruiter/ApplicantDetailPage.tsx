import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { addNote, changeApplicationStatus, downloadResume, getApplicant, getNotes, rateApplicant } from '../../api/applications';
import { extractErrorMessage } from '../../api/client';
import { legalNextStages, STATUS_LABELS } from '../../pipeline/pipelineRules';
import { LoadingState, ErrorState } from '../../components/ui/StateViews';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { TextAreaField } from '../../components/ui/FormField';
import type { ApplicationNote, ApplicationStatus, RecruiterApplicationView } from '../../types/application';
import { formatDateTime } from '../../utils/formatDate';

export function ApplicantDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>();

  const [application, setApplication] = useState<RecruiterApplicationView | null>(null);
  const [notes, setNotes] = useState<ApplicationNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [savingRating, setSavingRating] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ApplicationStatus | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  function load() {
    if (!applicationId) return;
    setLoading(true);
    setError(null);
    Promise.all([getApplicant(Number(applicationId)), getNotes(Number(applicationId))])
      .then(([app, appNotes]) => {
        setApplication(app);
        setRating(app.rating);
        setNotes(appNotes);
      })
      .catch((err) => setError(extractErrorMessage(err, 'Could not load this applicant.')))
      .finally(() => setLoading(false));
  }

  useEffect(load, [applicationId]);

  async function handleAddNote() {
    if (!application || !newNote.trim()) return;
    setSavingNote(true);
    setActionError(null);
    try {
      const created = await addNote(application.id, newNote.trim());
      setNotes((prev) => [created, ...prev]);
      setNewNote('');
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Could not save your note.'));
    } finally {
      setSavingNote(false);
    }
  }

  async function saveRating(value: number) {
    if (!application) return;
    setSavingRating(true);
    setActionError(null);
    try {
      const updated = await rateApplicant(application.id, value);
      setApplication(updated);
      setRating(updated.rating);
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Could not save the rating.'));
    } finally {
      setSavingRating(false);
    }
  }

  async function confirmAdvance() {
    if (!application || !pendingStatus) return;
    setAdvancing(true);
    setActionError(null);
    try {
      const updated = await changeApplicationStatus(application.id, pendingStatus);
      setApplication(updated);
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Could not update the status.'));
    } finally {
      setAdvancing(false);
      setPendingStatus(null);
    }
  }

  async function handleDownloadResume() {
    if (!application) return;
    setDownloading(true);
    try {
      await downloadResume(application.id, `${application.candidateName.replace(/\s+/g, '_')}_resume.pdf`);
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Could not download the résumé.'));
    } finally {
      setDownloading(false);
    }
  }

  if (loading) return <LoadingState label="Loading applicant…" />;
  if (error || !application) return <ErrorState message={error ?? 'Applicant not found.'} onRetry={load} />;

  const nextStatuses = legalNextStages(application.status);
  const isDestructive = (s: ApplicationStatus) => s === 'REJECTED';

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{application.candidateName}</h1>
          <p className="mt-1 text-sm text-slate-500">{application.candidateEmail}</p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      {application.coverNote && (
        <section className="mt-6">
          <h2 className="text-sm font-medium text-slate-700">Cover note</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{application.coverNote}</p>
        </section>
      )}

      {application.hasResume && (
        <section className="mt-4">
          <button type="button" onClick={handleDownloadResume} disabled={downloading} className="text-sm font-medium text-brand-600 hover:underline disabled:opacity-60">
            {downloading ? 'Downloading…' : 'Download résumé'}
          </button>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-medium text-slate-700">Rating</h2>
        <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Rate this applicant">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              disabled={savingRating}
              onClick={() => saveRating(value)}
              className={`h-9 w-9 rounded-md text-sm font-medium ${rating != null && value <= rating ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {value}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-slate-700">Private notes (recruiters only — never shown to the candidate)</h2>
        <div className="mt-2 space-y-3">
          <TextAreaField id="newNote" label="Add a note" rows={3} value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add a note…" />
          <button type="button" onClick={handleAddNote} disabled={savingNote || !newNote.trim()} className="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-60">
            {savingNote ? 'Saving…' : 'Add note'}
          </button>
        </div>
        {notes.length > 0 && (
          <ul className="mt-4 space-y-3">
            {notes.map((note) => (
              <li key={note.id} className="rounded-md bg-slate-50 p-3 text-sm">
                <p className="text-slate-700">{note.content}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {note.authorName} · {formatDateTime(note.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-slate-700">Move to next stage</h2>
        {nextStatuses.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">This application has reached a final stage.</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {nextStatuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setPendingStatus(s)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${isDestructive(s) ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'}`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        )}
      </section>

      {actionError && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {actionError}
        </p>
      )}

      <ConfirmDialog
        open={pendingStatus != null}
        title={`Move to "${pendingStatus ? STATUS_LABELS[pendingStatus] : ''}"?`}
        description={pendingStatus === 'REJECTED' ? 'This rejects the candidate. This action cannot be undone.' : "This updates the candidate's application status."}
        confirmLabel={advancing ? 'Saving…' : 'Confirm'}
        onConfirm={confirmAdvance}
        onCancel={() => setPendingStatus(null)}
      />
    </div>
  );
}