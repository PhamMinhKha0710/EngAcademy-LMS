import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    BookOpen, Trophy, Loader2, Clock,
    CheckCircle, Search, Bell, Gem, History, Medal, PlayCircle, RefreshCw,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { progressApi, ProgressResponse } from '../../services/api/progressApi'
import { leaderboardApi, LeaderboardEntry } from '../../services/api/leaderboardApi'

interface ProgressStats {
    completedLessons: number
    averageProgress: number
}

const NEXT_LESSON_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuALCoX9kpHAXVTawTzYGjbLCOoXiJ5VtIDa_NUAyZsaopP3FSofE1OwwHkKqo_WHwSlMvrKI0Voq4udFZ0yRDE1TUesQbm8mWKH6LXMT4LeoWChjDbCLb6yfxY_s1arB4a3L_jLUY2YxhRpOOkwyqfy3K57e-q7Vc03dz6gVvyHN40dgmEwupUmLnNp26VS2Qn4d8-gVem_PDPnbpQq1y_T7MkHTdZO6RwjtzUb2y4P-M7ahfmftTJEdhjgDsSiGM9_xy_1QnDcxuWS'
const rankMedals = ['🥇', '🥈', '🥉']

export default function StudentDashboard() {
    const user = useAuthStore((s) => s.user)
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<ProgressStats | null>(null)
    const [inProgress, setInProgress] = useState<ProgressResponse[]>([])
    const [completed, setCompleted] = useState<ProgressResponse[]>([])
    const [top5, setTop5] = useState<LeaderboardEntry[]>([])

    useEffect(() => {
        if (!user?.id) return

        const fetchData = async () => {
            setLoading(true)
            try {
                const [statsData, inProgressData, completedData, leaderboardData] =
                    await Promise.allSettled([
                        progressApi.getStats(user.id),
                        progressApi.getInProgress(user.id),
                        progressApi.getCompleted(user.id),
                        leaderboardApi.getTop(5),
                    ])

                if (statsData.status === 'fulfilled' && statsData.value) {
                    const raw = statsData.value as Record<string, unknown>
                    setStats({
                        completedLessons: (raw.completedLessons as number) ?? 0,
                        averageProgress: (raw.averageProgress as number) ?? 0,
                    })
                }
                if (inProgressData.status === 'fulfilled') setInProgress((inProgressData.value as ProgressResponse[]).slice(0, 4))
                if (completedData.status === 'fulfilled') setCompleted((completedData.value as ProgressResponse[]).slice(0, 5))
                if (leaderboardData.status === 'fulfilled') setTop5(leaderboardData.value)
            } catch (err) {
                console.error('Failed to load dashboard data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user?.id])

    const handleContinueLearning = () => {
        if (inProgress.length > 0) {
            navigate(`/lessons/${inProgress[0].lessonId}`)
        } else {
            navigate('/lessons')
        }
    }

    const nextLesson = inProgress[0]
    const totalCoins = user?.coins ?? 0
    const userLevel = totalCoins >= 0 ? Math.floor(totalCoins / 500) + 1 : 1
    const xpInLevel = totalCoins % 500
    const xpNeeded = 500
    const levelProgress = (xpInLevel / xpNeeded) * 100

    const wordsMastered = (stats?.completedLessons ?? 0) * 15
    const timeSpentMinutes = (stats?.completedLessons ?? 0) * 15
    const timeSpentDisplay = timeSpentMinutes >= 60
        ? `${Math.floor(timeSpentMinutes / 60)}h ${timeSpentMinutes % 60}m`
        : `${timeSpentMinutes}m`

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary-500" strokeWidth={2} />
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-full bg-background-light dark:bg-background-dark">
            {/* Dashboard Header - Search + Notifications + Gems */}
            <header className="flex h-20 items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-4 md:px-8 z-10 sticky top-16">
                <div className="flex flex-1 max-w-xl">
                    <div className="relative w-full group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" strokeWidth={2} />
                        <input
                            type="text"
                            placeholder="Tìm bài học, từ vựng..."
                            className="block w-full rounded-xl border-none bg-slate-100 dark:bg-slate-800 py-3 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                            onKeyDown={(e) => e.key === 'Enter' && navigate('/lessons')}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        to="/lessons"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                        <Bell className="w-5 h-5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20">
                        <Gem className="w-5 h-5 text-primary-500" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        <span className="font-bold text-primary-500 text-sm">
                            {(user?.coins ?? 0).toLocaleString()} Xu
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="mx-auto max-w-7xl flex flex-col gap-8">
                    {/* Hero Card */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-500 to-blue-400 p-8 md:p-12 shadow-xl shadow-primary-500/20">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 size-64 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 size-64 rounded-full bg-white/10 blur-3xl" />
                        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-8">
                            <div className="text-white max-w-lg">
                                <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
                                    Sẵn sàng phiêu lưu, {user?.fullName?.split(' ')[0] || 'bạn'}?
                                </h2>
                                <p className="text-blue-50 text-lg md:text-xl font-medium mb-8">
                                    Còn {xpNeeded - xpInLevel} Xu để mở khóa Level {userLevel + 1}! Tiếp tục học nào!
                                </p>
                                <button
                                    onClick={handleContinueLearning}
                                    className="bg-white text-primary-500 hover:bg-blue-50 font-bold py-3 px-8 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
                                >
                                    <PlayCircle className="w-5 h-5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    Tiếp tục học
                                </button>
                            </div>
                            <div
                                className="hidden md:block w-64 h-48 bg-contain bg-center bg-no-repeat rounded-2xl opacity-90"
                                style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuA-CF9n42WReGm2fUHFTaQdMmx2_jkq7UHkQ_tMGgRXYDLG0Yac7CM-FJttLNvpiZRzeCClBGUxECIdp7ru71tHZWmq-73ilSdlaFte4HVs28YOsxSDQjeSYrIffkyKdbyKRb3qdARRp7GP25ColuG1LXAQ2q9kUuN6FpjIc703GkScFP6rQDSCdlOwfYVK_e2wSB7dDwNn0xfMs3R0HeFSqbv6VerEpWyEKM9PUq_TDg9j_K4xTO_RY1LlFl0JP7P_UiZh2QH1nhD0')` }}
                            />
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
                                <Medal className="w-6 h-6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Tổng Xu</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{totalCoins.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Từ đã học</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{wordsMastered}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center">
                                <Clock className="w-6 h-6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Thời gian học</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{timeSpentDisplay}</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Left Column */}
                        <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
                            {/* Next Lesson Card */}
                            {nextLesson ? (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col md:flex-row">
                                    <div
                                        className="md:w-1/3 h-48 md:h-auto bg-cover bg-center relative min-h-[180px]"
                                        style={{ backgroundImage: `url('${NEXT_LESSON_IMAGE}')` }}
                                    >
                                        <div className="absolute inset-0 bg-black/20" />
                                        <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-slate-900 dark:text-white">
                                            Bài học tiếp theo
                                        </div>
                                    </div>
                                    <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                                        <span className="text-xs font-bold text-primary-500 uppercase tracking-wide mb-2">Bài học</span>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                            {nextLesson.lessonTitle || `Bài học #${nextLesson.lessonId}`}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">
                                            Hoàn thành bài học để nhận thưởng và mở khóa huy hiệu!
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 flex-1 max-w-[100px] rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-primary-500"
                                                        style={{ width: `${nextLesson.completionPercentage ?? 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-slate-500">{nextLesson.completionPercentage ?? 0}%</span>
                                            </div>
                                            <Link
                                                to={`/lessons/${nextLesson.lessonId}`}
                                                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold py-2.5 px-6 rounded-xl transition-colors text-sm"
                                            >
                                                Bắt đầu học
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    to="/lessons"
                                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-8 flex flex-col items-center justify-center gap-4 hover:border-primary-500/30 transition-colors"
                                >
                                    <BookOpen className="w-16 h-16 text-slate-300" strokeWidth={1.5} />
                                    <p className="text-slate-600 dark:text-slate-400 text-center">Bạn chưa bắt đầu bài học nào. Khám phá ngay!</p>
                                    <span className="text-primary-500 font-bold hover:underline">Xem bài học →</span>
                                </Link>
                            )}

                            {/* Recent Adventures */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <History className="w-5 h-5 text-primary-500" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    Hoạt động gần đây
                                    <button
                                        type="button"
                                        onClick={() => window.location.reload()}
                                        className="ml-auto p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                                        title="Làm mới"
                                    >
                                        <RefreshCw className="w-4 h-4" strokeWidth={2} />
                                    </button>
                                </h3>
                                <div className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-700 space-y-8">
                                    {(completed.length > 0 || inProgress.length > 0) ? (
                                        <>
                                            {completed.slice(0, 3).map((item) => (
                                                <div key={`c-${item.id}`} className="relative">
                                                    <div className="absolute -left-[21px] top-1 size-3 rounded-full bg-primary-500 ring-4 ring-white dark:ring-slate-800" />
                                                    <p className="text-xs text-slate-400 font-medium mb-1">
                                                        {item.lastAccessed
                                                            ? new Date(item.lastAccessed).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                                                            : 'Gần đây'}
                                                    </p>
                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                        Hoàn thành "{item.lessonTitle || `Bài #${item.lessonId}`}"
                                                    </h4>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        Đạt {(item.completionPercentage ?? 100)}% và nhận ~50 Xu!
                                                    </p>
                                                </div>
                                            ))}
                                            {inProgress.slice(0, 2).map((item) => (
                                                <div key={`p-${item.id}`} className="relative">
                                                    <div className="absolute -left-[21px] top-1 size-3 rounded-full bg-amber-500 ring-4 ring-white dark:ring-slate-800" />
                                                    <p className="text-xs text-slate-400 font-medium mb-1">
                                                        {item.lastAccessed
                                                            ? new Date(item.lastAccessed).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                                                            : 'Đang học'}
                                                    </p>
                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                        Đang học "{item.lessonTitle || `Bài #${item.lessonId}`}"
                                                    </h4>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.completionPercentage ?? 0}% hoàn thành</p>
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <div className="relative py-4">
                                            <div className="absolute -left-[21px] top-6 size-3 rounded-full bg-slate-300 ring-4 ring-white dark:ring-slate-800" />
                                            <p className="text-slate-500 dark:text-slate-400 text-sm">Chưa có hoạt động. Bắt đầu học ngay!</p>
                                            <Link to="/lessons" className="text-primary-500 font-medium text-sm mt-2 inline-block hover:underline">Khám phá bài học →</Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Level + Leaderboard */}
                        <div className="col-span-1 md:col-span-4 flex flex-col gap-6">
                            {/* Level Ring */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 flex flex-col items-center text-center relative overflow-hidden">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-50" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Cấp độ hiện tại</h3>
                                <div className="relative size-48 mb-6">
                                    <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                                        <circle className="text-slate-100 dark:text-slate-700 stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8" />
                                        <circle
                                            className="text-primary-500 stroke-current"
                                            cx="50"
                                            cy="50"
                                            fill="transparent"
                                            r="40"
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray="251.2"
                                            strokeDashoffset={251.2 - (251.2 * levelProgress) / 100}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-5xl font-black text-slate-900 dark:text-white">{userLevel}</span>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Explorer</span>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{xpInLevel} / {xpNeeded} Xu</p>
                                <p className="text-xs text-slate-400 mb-6">{xpNeeded - xpInLevel} Xu đến Level {userLevel + 1}</p>
                                <Link
                                    to="/badges"
                                    className="w-full py-2 rounded-lg bg-primary-500/10 text-primary-500 text-sm font-bold hover:bg-primary-500/20 transition-colors text-center"
                                >
                                    Xem huy hiệu
                                </Link>
                            </div>

                            {/* Leaderboard */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 flex flex-col flex-1">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-amber-500" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                        Bảng xếp hạng
                                    </h3>
                                    <Link to="/leaderboard" className="text-xs font-bold text-primary-500 hover:text-primary-500/80">
                                        Xem tất cả
                                    </Link>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {top5.length > 0 ? (
                                        top5.slice(0, 5).map((entry, index) => {
                                            const isCurrentUser = entry.userId === user?.id
                                            return (
                                                <div
                                                    key={entry.userId}
                                                    className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
                                                        isCurrentUser ? 'bg-primary-500/10 border border-primary-500/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                                    }`}
                                                >
                                                    <span className={`font-black w-6 text-center ${index < 3 ? 'text-amber-500' : 'text-slate-400'}`}>
                                                        {index < 3 ? rankMedals[index] : index + 1}
                                                    </span>
                                                    <div className="size-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
                                                        {entry.avatarUrl ? (
                                                            <img src={entry.avatarUrl} alt="" className="size-full object-cover" />
                                                        ) : (
                                                            (entry.fullName || entry.username)?.[0]?.toUpperCase() || '?'
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                            {isCurrentUser ? 'Bạn' : entry.fullName || entry.username}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {(entry.totalCoins ?? 0).toLocaleString()} xu
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <p className="text-sm py-6 text-center text-slate-500 dark:text-slate-400">Chưa có dữ liệu xếp hạng.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Arcade Recommendations */}
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Đề xuất luyện tập</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <Link
                                to="/vocabulary"
                                className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer border border-slate-100 dark:border-slate-700 hover:border-primary-500/50 transition-all"
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                    style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDogHvbFZzCP_DnEj3Wn4Qs_B7PJp68HIo7K8DLSXyiGkmK_JvtiZKXMS6-tzgr-7cHjGsR9DlL4Wa7hM47RxZRyKav2BeW9DKUWb1cOGLFDYybVSKGOrvxy1Rw150d3a2nqktVQo9MryHCr--YELVI6k3VAitCf2aSCjnRuFCbkNsey2XZGImWDl2REckCK0gojQTC1joYlHK0z_GJuqR2ycLMPaZlXMQ_eFW5lqkG7kFp_CDn5l-tU6f74vgkv1MmZ5zY5MMeORm5')` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-0 p-4 w-full">
                                    <h4 className="text-white font-bold text-lg mb-1">Flashcard từ vựng</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-primary-500/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded">Trí não</span>
                                        <span className="text-white/80 text-xs">Dễ</span>
                                    </div>
                                </div>
                            </Link>
                            <Link
                                to="/lessons"
                                className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer border border-slate-100 dark:border-slate-700 hover:border-amber-500/50 transition-all"
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                    style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBVsx05QkUWnYsqg5XO7oJwNaTAk5pVlRq9Iudc_hc605Lxtg7rZHlWj92fscL-DstwQ7lS0G7k4K7eK6Nz2Yo-40U7DulkhL49AugXJHFRrIME8kG0y_P3JoZsdkOQKQnGwfCKFXbIUQh-PlxLc_YEG1CimIaJM8h58VHKMix4qWWH1sVL1ytpeQ_-n355EPIAMs48NtjNUJP0wqDM5zm0c-YAqdC2xvY3lJH7hcv8pVksLgTE8aaaR1u0eL4-oSemRMFbHGJxJzse')` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-0 p-4 w-full">
                                    <h4 className="text-white font-bold text-lg mb-1">Bài học</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-amber-500/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded">Tốc độ</span>
                                        <span className="text-white/80 text-xs">Trung bình</span>
                                    </div>
                                </div>
                            </Link>
                            <Link
                                to="/exams"
                                className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer border border-slate-100 dark:border-slate-700 hover:border-purple-500/50 transition-all"
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                    style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAnOL0MRJvXifgRGk8lk7KoagFLRdHDsJphtwJGyFtDTSgtg4-UNIyutpKwlWbmj2OkwusJAZSNSAxu7ovKOLh-79bFhuJ6kSMFXwxMf_TPmqbhAeSCZyAtAn-gVrOBkpvUU3hflT3tA1whgqsqkU3cWshWWT63FIA2PpTUomnxoxulLu_6WCrj9c-yaqnAG3uiiZ2ri2L-gl_niWr5tI8Yn8GuSAEMmx7O8lqG4y94Z3vtnaO_Tf9XrHw0borvV7YbwPUO4Vh35cPz')` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-0 p-4 w-full">
                                    <h4 className="text-white font-bold text-lg mb-1">Bài thi</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-purple-500/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded">Thử thách</span>
                                        <span className="text-white/80 text-xs">Khó</span>
                                    </div>
                                </div>
                            </Link>
                            <Link
                                to="/leaderboard"
                                className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer border border-slate-100 dark:border-slate-700 hover:border-green-500/50 transition-all"
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                    style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBDaiWQ5PN0ZJMNC-JqR-xwozo1LI2r-VyG_hDsMro__46R82CHEHGOOf7MF2jhMTsbXbvAwJ4IM1CORFhMCYg55qc1d3Dx2iIOgMQi2FFCrUvTcMH0gWFsiJO4mSsZ8aYXm3lxEznZA6GVQ1vDa-AduKWtFPpujhVnI8LhZSPpVIGVqjEWpX6-4YEeAGLtxG6Lvwk7jPckovEj7jYUXyvk9lUR0IwxQ72CyiLsA2OLhn4DOsnD5lO_LOqJIPK3_Yi5USZwrMQQIRxk')` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-0 p-4 w-full">
                                    <h4 className="text-white font-bold text-lg mb-1">Bảng xếp hạng</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-green-500/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded">Cạnh tranh</span>
                                        <span className="text-white/80 text-xs">Dễ</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
