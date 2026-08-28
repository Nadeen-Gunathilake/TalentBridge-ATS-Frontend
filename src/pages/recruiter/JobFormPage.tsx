import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createJob, getJob, updateJob } from '../../api/jobs';
import { extractErrorMessage } from '../../api/client';
import { TextField, TextAreaField, SelectField } from '../../components/ui/FormField';
import { LoadingState, ErrorState } from '../../components/ui/StateViews';
import type { JobFormValues, JobStatus } from '../../types/job';

const EMPTY_FORM: JobFormValues = {
  title: '',
  description: '',
  location: '',
  work_mode: 'remote',
  employment_type: 'full-time',
  salary_range: '',
  required_skills: '',
  closing_date: '',
  status: 'DRAFT',
};

export function JobFormPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const isEditing = Boolean(jobId);
  const navigate = useNavigate();

  const [form, setForm] = useState<JobFormValues>(EMPTY_FORM);
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditing || !jobId) return;
    getJob(Number(jobId))
      .then((job) =>
        setForm({
          title: job.title,
          description: job.description,
          location: job.location,
          work_mode: job.work_mode,
          employment_type: job.employment_type,
          salary_range: job.salary_range,
          required_skills: job.required_skills,
          closing_date: job.closing_date,
          status: job.status,
        }),
      )
      .catch((err) => setLoadError(extractErrorMessage(err, 'Could not load this job.')))
      .finally(() => setLoading(false));
  }, [isEditing, jobId]);

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = 'Title is required.';
    if (!form.description.trim()) errors.description = 'Description is required.';
    if (!form.location.trim()) errors.location = 'Location is required.';
    if (!form.salary_range.trim()) errors.salary_range = 'Salary range is required.';
    if (!form.required_skills.trim()) errors.required_skills = 'Required skills are required.';
    if (!form.closing_date) errors.closing_date = 'Closing date is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEditing && jobId) {
        await updateJob(Number(jobId), form);
      } else {
        await createJob(form);
      }
      navigate('/recruiter');
    } catch (err) {
      setSubmitError(extractErrorMessage(err, 'Could not save this job.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState label="Loading job…" />;
  if (loadError) return <ErrorState message={loadError} />;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold text-slate-900">{isEditing ? 'Edit job' : 'Post a job'}</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <TextField id="title" label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={fieldErrors.title} required />
        <TextAreaField
          id="description"
          label="Description"
          rows={6}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          error={fieldErrors.description}
          required
        />
        <TextField id="location" label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} error={fieldErrors.location} required />

        <div className="grid grid-cols-2 gap-4">
          <SelectField id="work_mode" label="Work mode" value={form.work_mode} onChange={(e) => setForm({ ...form, work_mode: e.target.value })}>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </SelectField>
          <SelectField id="employment_type" label="Employment type" value={form.employment_type} onChange={(e) => setForm({ ...form, employment_type: e.target.value })}>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </SelectField>
        </div>

        <TextField
          id="salary_range"
          label="Salary range"
          placeholder="e.g. LKR 150,000 – 200,000"
          value={form.salary_range}
          onChange={(e) => setForm({ ...form, salary_range: e.target.value })}
          error={fieldErrors.salary_range}
          required
        />
        <TextAreaField
          id="required_skills"
          label="Required skills"
          placeholder="Comma-separated, e.g. React, TypeScript, Spring Boot"
          rows={2}
          value={form.required_skills}
          onChange={(e) => setForm({ ...form, required_skills: e.target.value })}
          error={fieldErrors.required_skills}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            id="closing_date"
            label="Closing date"
            type="date"
            value={form.closing_date}
            onChange={(e) => setForm({ ...form, closing_date: e.target.value })}
            error={fieldErrors.closing_date}
            required
          />
          <SelectField id="status" label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as JobStatus })}>
            <option value="DRAFT">Draft (not visible to candidates)</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
          </SelectField>
        </div>

        {submitError && (
          <p role="alert" className="text-sm text-red-600">
            {submitError}
          </p>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
            {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Post job'}
          </button>
          <button type="button" onClick={() => navigate('/recruiter')} className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}