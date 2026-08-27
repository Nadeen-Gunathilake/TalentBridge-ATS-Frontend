import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchJobs } from '../../api/jobs';
import { extractErrorMessage } from '../../api/client';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useMyAppliedJobIds } from '../../hooks/useMyAppliedJobIds';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/StateViews';
import type { Job, Page } from '../../types/job';

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: 'id,desc', label: 'Newest first' },
  { value: 'id,asc', label: 'Oldest first' },
  { value: 'title,asc', label: 'Title A–Z' },
];

export function JobListPage() {
  const [keyword, setKeyword] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [location, setLocation] = useState('');
  const [sort, setSort] = useState(SORT_OPTIONS[0].value);
  const [page, setPage] = useState(0);

  const debouncedKeyword = useDebouncedValue(keyword);
  const debouncedLocation = useDebouncedValue(location);
  const appliedJobIds = useMyAppliedJobIds();

  const [data, setData] = useState<Page<Job> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(0);
  }, [debouncedKeyword, workMode, debouncedLocation, sort]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    searchJobs({ keyword: debouncedKeyword, workMode, location: debouncedLocation, sort, page, size: PAGE_SIZE })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, 'Could not load jobs.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedKeyword, workMode, debouncedLocation, sort, page]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Open positions</h1>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <input
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search by title…"
          aria-label="Search by title"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm sm:col-span-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location…"
          aria-label="Filter by location"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <select
          value={workMode}
          onChange={(e) => setWorkMode(e.target.value)}
          aria-label="Filter by work mode"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        >
          <option value="">Any work mode</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">Onsite</option>
        </select>
      </div>

      <div className="mt-3 flex justify-end">
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort jobs" className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm">
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {loading && <LoadingState label="Loading jobs…" />}
        {!loading && error && <ErrorState message={error} onRetry={() => setPage((p) => p)} />}

        {!loading && !error && data && data.content.length === 0 && (
          <EmptyState title="No jobs match your filters" description="Try widening your search or clearing a filter." />
        )}

        {!loading && !error && data && data.content.length > 0 && (
          <ul className="space-y-3">
            {data.content.map((job) => (
              <li key={job.id}>
                <Link to={`/jobs/${job.id}`} className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-medium text-slate-900">{job.title}</h2>
                      <p className="mt-1 text-sm capitalize text-slate-500">
                        {job.location} · {job.work_mode} · {job.employment_type}
                      </p>
                    </div>
                    {appliedJobIds.has(job.id) && (
                      <span className="whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">Applied</span>
                    )}
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
      </div>
    </div>
  );
}