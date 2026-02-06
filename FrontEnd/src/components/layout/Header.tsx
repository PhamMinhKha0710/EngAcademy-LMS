import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const Header = () => {
    const { user, isAuthenticated, logout } = useAuthStore()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">E</span>
                        </div>
                        <span className="text-xl font-bold gradient-text">EnglishLearn</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-slate-300 hover:text-white transition-colors">
                            Trang chủ
                        </Link>
                        <Link to="/dashboard" className="text-slate-300 hover:text-white transition-colors">
                            Học tập
                        </Link>
                        <a href="#features" className="text-slate-300 hover:text-white transition-colors">
                            Tính năng
                        </a>
                    </nav>

                    {/* Auth Buttons */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-slate-300">Xin chào, {user?.fullName}</span>
                                <button
                                    onClick={handleLogout}
                                    className="btn-secondary text-sm py-2"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="text-slate-300 hover:text-white transition-colors">
                                    Đăng nhập
                                </Link>
                                <Link to="/register" className="btn-primary text-sm py-2">
                                    Đăng ký
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
