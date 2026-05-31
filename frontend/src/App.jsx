// App.jsx
// Root component – sets up routing, context providers, protected routes

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }    from './context/AuthContext';
import { ToastProvider }   from './context/ToastContext';
import ProtectedRoute      from './components/common/ProtectedRoute';
import Layout              from './components/layout/Layout';

// Pages
import Login        from './pages/auth/Login';
import Register     from './pages/auth/Register';
import Dashboard    from './pages/Dashboard';
import Tasks        from './pages/Tasks';
import StudyTracker from './pages/StudyTracker';
import Analytics    from './pages/Analytics';
import Profile      from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login"    element={<Login />}    />
            <Route path="/register" element={<Register />} />

            {/* Protected routes – wrapped in Layout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout><Dashboard /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <Layout><Tasks /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/study-tracker"
              element={
                <ProtectedRoute>
                  <Layout><StudyTracker /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Layout><Analytics /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout><Profile /></Layout>
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/"   element={<Navigate to="/dashboard" replace />} />
            <Route path="*"   element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
