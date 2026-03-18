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
        <div className="min-h-screen flex flex-col transition-colors duration-300">
            <Header onMenuClick={() => setIsMobileMenuOpen(true)} showMenuButton={showSidebar} />

            <div className="flex flex-1 relative">
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

                <main className={`flex-1 transition-all duration-300 w-full ${showSidebar ? 'md:ml-64' : ''}`}>
                    <Outlet />
                </main>
            </div>

            {showFooter && <Footer />}
        </div>
    )
}

export default MainLayout
