import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { CandidateLayout } from './components/layout/CandidateLayout';
import { RecruiterLayout } from './components/layout/RecruiterLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { JobListPage } from './pages/careers/JobListPage';
import { JobDetailPage } from './pages/careers/JobDetailPage';
import { MyApplicationsPage } from './pages/careers/MyApplicationsPage';
import { RecruiterJobsPage } from './pages/recruiter/RecruiterJobsPage';
import { JobFormPage } from './pages/recruiter/JobFormPage';
import { ApplicantsPage } from './pages/recruiter/ApplicantsPage';
import { ApplicantDetailPage } from './pages/recruiter/ApplicantDetailPage';

function App() {
  return (
    <AuthProvider>
      <Routes>

        <Route element={<CandidateLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<JobListPage />} />
          <Route path="/jobs/:jobId" element={<JobDetailPage />} />
          <Route element={<ProtectedRoute allowedRoles={['CANDIDATE']} />}>
            <Route path="/my-applications" element={<MyApplicationsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['RECRUITER']} />}>
          <Route element={<RecruiterLayout />}>
            <Route path="/recruiter" element={<RecruiterJobsPage />} />
            <Route path="/recruiter/jobs/new" element={<JobFormPage />} />
            <Route path="/recruiter/jobs/:jobId/edit" element={<JobFormPage />} />
            <Route path="/recruiter/jobs/:jobId/applicants" element={<ApplicantsPage />} />
            <Route path="/recruiter/applications/:applicationId" element={<ApplicantDetailPage />} />
          </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
