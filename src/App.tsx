import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { CandidateLayout } from './components/layout/CandidateLayout';
import { RecruiterLayout } from './components/layout/RecruiterLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Careers site — public, plus candidate-only "my applications" */}
        <Route element={<CandidateLayout />}>
          <Route path="/" element={<ComingSoonPage title="Job list (Step 3)" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute allowedRoles={['CANDIDATE']} />}>
            <Route path="/my-applications" element={<ComingSoonPage title="My applications (Step 4)" />} />
          </Route>
        </Route>

        {/* Recruiter dashboard — recruiter-only */}
        <Route element={<ProtectedRoute allowedRoles={['RECRUITER']} />}>
          <Route element={<RecruiterLayout />}>
            <Route path="/recruiter" element={<ComingSoonPage title="Recruiter jobs (Step 5)" />} />
          </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
