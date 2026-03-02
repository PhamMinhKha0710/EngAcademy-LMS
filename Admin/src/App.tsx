import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import { store } from '@/app/store'
import ProtectedRoute from '@/components/ProtectedRoute'
import AdminLayout from '@/components/layout/AdminLayout'
import RoleBasedRedirect from '@/components/RoleBasedRedirect'
import LoginPage from '@/features/auth/LoginPage'
import UsersPage from '@/features/users/UsersPage'
import SchoolsPage from '@/features/schools/SchoolsPage'
import ClassRoomsPage from '@/features/classrooms/ClassRoomsPage'
import NotificationsPage from '@/features/notifications/NotificationsPage'
import BadgesPage from '@/features/badges/BadgesPage'
import LeaderboardPage from '@/features/leaderboard/LeaderboardPage'
import TeachersPage from '@/features/teachers/TeachersPage'
import StudentsPage from '@/features/students/StudentsPage'
import GradesPage from '@/features/grades/GradesPage'
import UnauthorizedPage from '@/features/error/UnauthorizedPage'
import SettingsPage from '@/features/settings/SettingsPage'

function AppRoutes() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Routes for both ADMIN and SCHOOL */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_SCHOOL']} />}>
                <Route element={<AdminLayout />}>
                    <Route path="/settings" element={<SettingsPage />} />
                </Route>
            </Route>

            {/* SCHOOL role routes - only 4 pages: Students, Classes, Teachers, Grades */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_SCHOOL']} />}>
                <Route element={<AdminLayout />}>
                    <Route path="/students" element={<StudentsPage />} />
                    <Route path="/classrooms" element={<ClassRoomsPage />} />
                    <Route path="/teachers" element={<TeachersPage />} />
                    <Route path="/grades" element={<GradesPage />} />
                </Route>
            </Route>

            {/* ADMIN role routes - only 5 pages: Schools, Users, Notifications, Leaderboard, Badges */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
                <Route element={<AdminLayout />}>
                    <Route path="/schools" element={<SchoolsPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    <Route path="/badges" element={<BadgesPage />} />
                </Route>
            </Route>

            {/* Redirects - smart redirect based on role */}
            <Route path="/" element={<RoleBasedRedirect />} />
            <Route path="*" element={<RoleBasedRedirect />} />
        </Routes>
    )
}

export default function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <AppRoutes />
                <Toaster richColors position="top-right" />
            </BrowserRouter>
        </Provider>
    )
}
