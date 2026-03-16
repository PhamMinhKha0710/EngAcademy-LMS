import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import { useAuthStore } from '../../store/authStore'

const MainLayout = () => {
    const location = useLocation()
    const { isAuthenticated, fetchCurrentUser } = useAuthStore()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
        <div className="min-h-screen flex transition-colors duration-300">
            {showSidebar && (
                <>
                    {/* Mobile Overlay */}
                    {isMobileMenuOpen && (
                        <div 
                            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                    )}
                    <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
                </>
            )}

            <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${showSidebar ? 'md:pl-64' : ''}`}>
                <Header onMenuClick={() => setIsMobileMenuOpen(true)} showMenuButton={showSidebar} />
                
                <main className="flex-1 w-full relative">
                    <Outlet />
                </main>

                {showFooter && <Footer />}
            </div>
        </div>
    )
}

export default MainLayout
