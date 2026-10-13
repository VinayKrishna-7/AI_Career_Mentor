import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TimerProvider } from './context/TimerContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Pages
import LandingPage from './features/auth/LandingPage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import DashboardPage from './features/dashboard/DashboardPage';
import ProfilePage from './features/profile/ProfilePage';
import CareerRecommendationsPage from './features/recommendations/CareerRecommendationsPage';
import RoadmapsPage from './features/roadmaps/RoadmapsPage';
import SkillGapPage from './features/skill-gap/SkillGapPage';
import ChatPage from './features/career-chat/ChatPage';
import ResumeAnalyzerPage from './features/resume-analyzer/ResumeAnalyzerPage';
import MockInterviewPage from './features/mock-interview/MockInterviewPage';
import ProjectsPage from './features/projects/ProjectsPage';
import ResourcesPage from './features/resources/ResourcesPage';
import ApplicationsPage from './features/applications/ApplicationsPage';
import StudyPlannerPage from './features/planner/StudyPlannerPage';
import ApplicationTailorPage from './features/tailor/ApplicationTailorPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <TimerProvider>
            <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Application Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/recommendations" element={<CareerRecommendationsPage />} />
                <Route path="/roadmaps" element={<RoadmapsPage />} />
                <Route path="/skill-gap" element={<SkillGapPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/resume-analyzer" element={<ResumeAnalyzerPage />} />
                <Route path="/application-tailor" element={<ApplicationTailorPage />} />
                <Route path="/mock-interview" element={<MockInterviewPage />} />
                <Route path="/planner" element={<StudyPlannerPage />} />
                <Route path="/applications" element={<ApplicationsPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/resources" element={<ResourcesPage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        </TimerProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
