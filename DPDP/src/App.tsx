
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { FrappeProvider } from 'frappe-react-sdk';
import MainLayout from './layouts/MainLayout';
import AssessmentPage from './pages/AssessmentPage';
import AssessmentList from './pages/AssessmentList';
import NewAssessment from './pages/NewAssessment';
import OrganizationsPage from './pages/OrganizationsPage';
import NewOrganization from './pages/NewOrganization';
import OrganizationDetails from './pages/OrganizationDetails';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SetPasswordPage from './pages/SetPasswordPage';
import LandingPage from './pages/LandingPage';
import ResultsPage from './pages/ResultsPage';
import './App.css';

function App() {
  return (
    <FrappeProvider
      socketPort={import.meta.env.VITE_SOCKET_PORT}
      siteName={import.meta.env.VITE_SITE_NAME}
    >
      <MainLayout>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/set-password" element={<SetPasswordPage />} />
          
          {/* Assessment Flow */}
          <Route path="/assessments" element={<AssessmentList />} />
          <Route path="/assessments/new" element={<NewAssessment />} />
          <Route path="/assessments/:id" element={<AssessmentPage />} />
          <Route path="/assessments/:id/results" element={<ResultsPage />} />
          
          {/* Organization Flow */}
          <Route path="/organizations" element={<OrganizationsPage />} />
          <Route path="/organizations/new" element={<NewOrganization />} />
          <Route path="/organizations/:id" element={<OrganizationDetails />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </FrappeProvider>
  );
}

export default App;
