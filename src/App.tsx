import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { Users } from './pages/admin/Users';
import { HomeEditor } from './pages/admin/HomeEditor';
import { Projects } from './pages/admin/Projects';
import { EditorPage } from './pages/EditorPage';
import { Toast } from './components/common/Toast';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes - semua bisa akses tanpa login */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes - perlu login sebagai admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout>
                  <Users />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/home-editor"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout>
                  <HomeEditor />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/projects"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout>
                  <Projects />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Editor Route - perlu login sebagai admin atau customer */}
          <Route
            path="/editor"
            element={
              <ProtectedRoute allowedRoles={['admin', 'customer']}>
                <EditorPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toast />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
