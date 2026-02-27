import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useRole } from '../../hooks/useRole'
import NotificationComponent from '../notifications/Notification'
import ThemeToggle from '../ui/ThemeToggle'
import Badge from '../ui/Badge'

const Header = () => {
    const { user, isAuthenticated, logout } = useAuthStore()
    const { roleLabel } = useRole()
    const navigate = useNavigate()
    const { toggleSidebar } = useUIStore()
    const location = useLocation()

    // Determine if it is a public page
    const publicPaths = ['/', '/login', '/register']
    const isPublicPage = publicPaths.includes(location.pathname)

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-colors" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left section: Hamburger (Mobile) + Logo */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated && !isPublicPage && (
                            <button 
                                onClick={toggleSidebar} 
                                className="md:hidden p-2 -ml-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            >
                                <Menu className="w-5 h-5 text-gray-500" />
                            </button>
                        )}
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">E</span>
                            </div>
                            <span className="text-xl font-bold gradient-text">EnglishLearn</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    {!isAuthenticated && (
                        <nav className="hidden md:flex items-center space-x-8">
                            <Link to="/" className="hover:opacity-80 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                                Trang chủ
                            </Link>
                            <a href="#features" className="hover:opacity-80 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                                Tính năng
                            </a>
                        </nav>
                    )}

                    {/* Right section */}
                    <div className="flex items-center space-x-3">
                        <ThemeToggle />

                        {isAuthenticated ? (
                            <div className="flex items-center space-x-3">
                                {user?.id && <NotificationComponent userId={user.id} />}
                                <Badge variant="info">{roleLabel}</Badge>
                                <Link to="/profile" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: 'var(--color-text)' }}>
                                    {user?.fullName}
                                </Link>
                                <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login" className="hover:opacity-80 transition-colors text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    Đăng nhập
                                </Link>
                                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
