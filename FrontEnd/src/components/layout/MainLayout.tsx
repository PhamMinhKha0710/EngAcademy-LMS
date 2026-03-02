import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import { useAuthStore } from '../../store/authStore'

const MainLayout = () => {
    const location = useLocation()
    const { isAuthenticated, fetchCurrentUser } = useAuthStore()

    const path = location.pathname

    // Show sidebar for authenticated pages (not public pages)
    const publicPaths = ['/', '/login', '/register', '/forgot-password']
    const isPublicPage = publicPaths.includes(path)
    const showSidebar = isAuthenticated && !isPublicPage

    // Reuse one global Header/Footer component across public pages
    const showFooter = isPublicPage

    useEffect(() => {
        if (!isAuthenticated) return
        void fetchCurrentUser()
    }, [isAuthenticated, fetchCurrentUser])

    return (
        <div className="min-h-screen flex flex-col transition-colors duration-300">
            <Header />

            <div className="flex flex-1">
                {showSidebar && <Sidebar />}

                <main className={`flex-1 transition-all duration-300 ${showSidebar ? 'ml-64' : ''}`}>
                    <Outlet />
                </main>
            </div>

            {showFooter && <Footer />}
        </div>
    )
}

export default MainLayout
