import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from '@/app/store'
import ProtectedRoute from '@/components/ProtectedRoute'
import AdminLayout from '@/components/layout/AdminLayout'
import LoginPage from '@/features/auth/LoginPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import UsersPage from '@/features/users/UsersPage'
import SchoolsPage from '@/features/schools/SchoolsPage'
import LessonsPage from '@/features/lessons/LessonsPage'
import ExamsPage from '@/features/exams/ExamsPage'
import QuestionsPage from '@/features/questions/QuestionsPage'
import VocabularyPage from '@/features/vocabulary/VocabularyPage'
import ClassRoomsPage from '@/features/classrooms/ClassRoomsPage'

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected admin routes */}
      <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/schools" element={<SchoolsPage />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="/vocabulary" element={<VocabularyPage />} />
          <Route path="/classrooms" element={<ClassRoomsPage />} />
        </Route>
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  )
}
