import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import { useAuthStore } from '../../store/authStore'

const MainLayout = () => {
    const location = useLocation()
    const { isAuthenticated } = useAuthStore()

    // Show sidebar only for authenticated users on dashboard pages
    const showSidebar = isAuthenticated && location.pathname.startsWith('/dashboard')

    // Hide footer on dashboard pages
    const showFooter = !location.pathname.startsWith('/dashboard')

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <div className="flex flex-1 pt-16">
                {showSidebar && <Sidebar />}

                <main className={`flex-1 ${showSidebar ? 'ml-64' : ''}`}>
                    <Outlet />
                </main>
            </div>

            {showFooter && <Footer />}
        </div>
    )
}

export default MainLayout
