import { useAuthStore } from '../store/authStore'

const Dashboard = () => {
    const { user } = useAuthStore()

    return (
        <div className="p-8">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">
                    Xin chào, {user?.fullName || 'Học sinh'} 👋
                </h1>
                <p className="text-slate-400">Hãy tiếp tục hành trình học tập của bạn!</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { icon: '🔥', label: 'Chuỗi ngày học', value: '7 ngày', color: 'from-orange-500 to-red-500' },
                    { icon: '📚', label: 'Từ vựng đã học', value: '156', color: 'from-blue-500 to-cyan-500' },
                    { icon: '✅', label: 'Bài tập hoàn thành', value: '23', color: 'from-green-500 to-emerald-500' },
                    { icon: '💎', label: 'Xu tích lũy', value: '1,250', color: 'from-purple-500 to-pink-500' },
                ].map((stat, index) => (
                    <div key={index} className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl">{stat.icon}</span>
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${stat.color} opacity-20`}></div>
                        </div>
                        <p className="text-slate-400 text-sm">{stat.label}</p>
                        <p className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Daily Quest */}
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span>📅</span> Nhiệm vụ hôm nay
                    </h2>
                    <div className="space-y-4">
                        {[
                            { task: 'Học 5 từ vựng mới', done: true },
                            { task: 'Hoàn thành 1 bài tập ngữ pháp', done: true },
                            { task: 'Luyện phát âm 3 câu', done: false },
                            { task: 'Làm quiz 10 phút', done: false },
                            { task: 'Ôn tập từ vựng cũ', done: false },
                        ].map((item, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${item.done
                                        ? 'bg-green-500 border-green-500'
                                        : 'border-slate-500'
                                    }`}>
                                    {item.done && <span className="text-white text-xs">✓</span>}
                                </div>
                                <span className={item.done ? 'text-slate-500 line-through' : 'text-slate-300'}>
                                    {item.task}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6">
                        <div className="flex justify-between text-sm text-slate-400 mb-2">
                            <span>Tiến độ</span>
                            <span>2/5</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all"
                                style={{ width: '40%' }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Continue Learning */}
                <div className="card p-6 lg:col-span-2">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span>📖</span> Tiếp tục học
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {[
                            {
                                title: 'Unit 5: My Hobbies',
                                type: 'Từ vựng',
                                progress: 75,
                                icon: '📚',
                                color: 'blue'
                            },
                            {
                                title: 'Present Simple Tense',
                                type: 'Ngữ pháp',
                                progress: 40,
                                icon: '📝',
                                color: 'emerald'
                            },
                            {
                                title: 'Story: The Little Prince',
                                type: 'Đọc hiểu',
                                progress: 60,
                                icon: '📖',
                                color: 'purple'
                            },
                            {
                                title: 'Conversation: At School',
                                type: 'Nghe',
                                progress: 25,
                                icon: '🎧',
                                color: 'orange'
                            },
                        ].map((lesson, index) => (
                            <div
                                key={index}
                                className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{lesson.icon}</span>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-400">{lesson.type}</p>
                                        <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                                            {lesson.title}
                                        </h3>
                                        <div className="mt-2">
                                            <div className="w-full bg-slate-700 rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full bg-${lesson.color}-500`}
                                                    style={{ width: `${lesson.progress}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">{lesson.progress}% hoàn thành</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Leaderboard Preview */}
            <div className="card p-6 mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <span>🏆</span> Bảng xếp hạng tuần
                    </h2>
                    <a href="/leaderboard" className="text-blue-400 hover:text-blue-300 text-sm">
                        Xem tất cả →
                    </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { rank: 1, name: 'Minh Anh', points: 2350, avatar: '👧' },
                        { rank: 2, name: 'Hoàng Nam', points: 2180, avatar: '👦' },
                        { rank: 3, name: 'Thu Hà', points: 2050, avatar: '👧' },
                    ].map((student) => (
                        <div
                            key={student.rank}
                            className={`p-4 rounded-lg flex items-center gap-4
                ${student.rank === 1 ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-slate-800/50'}
              `}
                        >
                            <span className="text-2xl">
                                {student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : '🥉'}
                            </span>
                            <span className="text-3xl">{student.avatar}</span>
                            <div className="flex-1">
                                <p className="text-white font-medium">{student.name}</p>
                                <p className="text-slate-400 text-sm">{student.points.toLocaleString()} điểm</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
