import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GraduationCap, Menu } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useRole } from '../../hooks/useRole'
import NotificationComponent from '../notifications/Notification'
import ThemeToggle from '../ui/ThemeToggle'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import Badge from '../ui/Badge'

interface HeaderProps {
    showMenuButton?: boolean;
    onMenuClick?: () => void;
}

const Header = ({ showMenuButton, onMenuClick }: HeaderProps) => {
    const { t } = useTranslation()
    const { user, isAuthenticated, logout } = useAuthStore()
    const { roleLabel } = useRole()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <header className={`sticky top-0 z-40 flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md h-[73px] ${showMenuButton ? 'px-4 sm:px-6 lg:px-8' : 'px-4 sm:px-6 md:px-10 lg:px-16 xl:px-40'}`}>
            <div className="flex items-center gap-3">
                {showMenuButton && (
                    <button 
                        onClick={onMenuClick}
                        className="p-2 -ml-2 mr-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white md:hidden"
                    >
                        <Menu className="w-6 h-6" strokeWidth={2} />
                    </button>
                )}
                <Link to="/" className="flex items-center gap-3 text-slate-900 dark:text-white">
                    <div className="size-8 text-primary-500 flex items-center justify-center">
                        <GraduationCap className="w-8 h-8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </div>
                    <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight hidden sm:block">EngAcademy-LMS</h2>
                </Link>
            </div>

            <div className="flex flex-1 justify-end gap-6 md:gap-8 items-center">
                {!isAuthenticated && (
                    <nav className="hidden md:flex items-center gap-9">
                        <Link
                            to="/"
                            className="text-slate-700 hover:text-primary-500 dark:text-slate-300 dark:hover:text-primary-500 text-sm font-medium leading-normal transition-colors"
                        >
                            {t('nav.home')}
                        </Link>
                        <a
                            href="#features"
                            className="text-slate-700 hover:text-primary-500 dark:text-slate-300 dark:hover:text-primary-500 text-sm font-medium leading-normal transition-colors"
                        >
                            {t('nav.features')}
                        </a>
                    </nav>
                )}

                <div className="flex items-center gap-3">
                    <LanguageSwitcher />
                    <ThemeToggle />
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            {user?.id && <NotificationComponent userId={user.id} />}
                            <Badge variant="info">{roleLabel}</Badge>
                            <Link
                                to="/settings"
                                className="text-sm font-medium hover:text-primary-500 transition-colors"
                                style={{ color: 'var(--color-text)' }}
                            >
                                {user?.fullName}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-full h-10 px-5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors"
                            >
                                {t('nav.logout')}
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <Link
                                to="/login"
                                className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-full h-10 px-5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors"
                            >
                                {t('nav.login')}
                            </Link>
                            <Link
                                to="/register"
                                className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-full h-10 px-5 bg-primary-500 hover:bg-orange-500 text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors shadow-lg shadow-orange-500/30"
                            >
                                {t('nav.register')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header
