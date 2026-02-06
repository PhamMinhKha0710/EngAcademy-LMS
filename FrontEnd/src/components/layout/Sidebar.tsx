import { Link, useLocation } from 'react-router-dom'

interface MenuItem {
    icon: string
    label: string
    path: string
}

const menuItems: MenuItem[] = [
    { icon: '📊', label: 'Dashboard', path: '/dashboard' },
    { icon: '📚', label: 'Bài học', path: '/lessons' },
    { icon: '📝', label: 'Bài tập', path: '/exercises' },
    { icon: '🎤', label: 'Luyện nói', path: '/speaking' },
    { icon: '🏆', label: 'Xếp hạng', path: '/leaderboard' },
    { icon: '📓', label: 'Từ vựng', path: '/vocabulary' },
    { icon: '⚙️', label: 'Cài đặt', path: '/settings' },
]

const Sidebar = () => {
    const location = useLocation()

    return (
        <aside className="fixed left-0 top-16 bottom-0 w-64 bg-slate-900/95 border-r border-slate-700/50 overflow-y-auto">
            <nav className="p-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive
                                    ? 'bg-blue-500/20 text-blue-400 border-l-4 border-blue-500'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Daily Quest Widget */}
            <div className="absolute bottom-4 left-4 right-4">
                <div className="card p-4">
                    <div className="flex items-center space-x-2 mb-2">
                        <span>🔥</span>
                        <span className="text-sm font-medium text-white">Nhiệm vụ hôm nay</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <p className="text-xs text-slate-400">3/5 nhiệm vụ hoàn thành</p>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
