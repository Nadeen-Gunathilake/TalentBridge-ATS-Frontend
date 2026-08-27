import { useEffect, useState } from 'react';
import { getMyApplications } from '../api/applications';
import { useAuth } from '../auth/useAuth';

export function useMyAppliedJobIds() {
  const { user } = useAuth();
  const [appliedJobIds, setAppliedJobIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user || user.role !== 'CANDIDATE') {
      setAppliedJobIds(new Set());
      return;
    }
    getMyApplications()
      .then((apps) => setAppliedJobIds(new Set(apps.map((a) => a.jobId))))
      .catch(() => {});
  }, [user]);

  return appliedJobIds;
}