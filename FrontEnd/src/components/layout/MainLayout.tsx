import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import { useAuthStore } from '../../store/authStore'

const MainLayout = () => {
    const location = useLocation()
    const { isAuthenticated } = useAuthStore()

    const path = location.pathname

    // Show sidebar for authenticated pages (not public pages)
    const publicPaths = ['/', '/login', '/register']
    const isPublicPage = publicPaths.includes(path)
    const showSidebar = isAuthenticated && !isPublicPage

    // Show footer only on public pages
    const showFooter = isPublicPage

    return (
        <div className="min-h-screen flex flex-col transition-colors duration-300">
            <Header />

            <div className="flex flex-1 pt-16">
                {showSidebar && <Sidebar />}

                <main className={`flex-1 transition-all duration-300 w-full ${showSidebar ? 'md:ml-64' : ''}`}>
                    <Outlet />
                </main>
            </div>

            {showFooter && <Footer />}
        </div>
    )
}

export default MainLayout
