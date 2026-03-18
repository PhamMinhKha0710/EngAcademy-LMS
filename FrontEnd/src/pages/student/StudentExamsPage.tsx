import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
    ArrowRight,
    CalendarDays,
    ChevronDown,
    Clock,
    FileText,
    HelpCircle,
    ListFilter,
    Loader2,
    Users,
} from 'lucide-react'
import { examApi, ExamResponse } from '../../services/api/examApi'
import { classroomApi, ClassRoomResponse } from '../../services/api/classroomApi'
import { useAuthStore } from '../../store/authStore'
import EmptyState from '../../components/ui/EmptyState'

type ExamTab = 'all' | 'ongoing' | 'upcoming' | 'ended'

export default function StudentExamsPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const user = useAuthStore((s) => s.user)
    const [classes, setClasses] = useState<ClassRoomResponse[]>([])
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
    const [exams, setExams] = useState<ExamResponse[]>([])
    const [loadingClasses, setLoadingClasses] = useState(true)
    const [loadingExams, setLoadingExams] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<ExamTab>('all')

    // Fetch classes the student belongs to
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                setLoadingClasses(true)
                setError(null)
                if (!user?.id) {
                    setClasses([])
                    return
                }
                const data = await classroomApi.getByStudent(user.id)
                setClasses(data || [])
                if (data && data.length > 0) {
                    setSelectedClassId(data[0].id)
                }
            } catch (err) {
                console.error('Failed to fetch classes:', err)
                setError(t('common.error'))
            } finally {
                setLoadingClasses(false)
            }
        }
        fetchClasses()
    }, [user?.id, t])

    // Fetch active exams when class is selected
    useEffect(() => {
        if (!selectedClassId) return

        const fetchExams = async () => {
            try {
                setLoadingExams(true)
                setError(null)
                const data = await examApi.getActiveByClass(selectedClassId)
                setExams(data || [])
            } catch (err) {
                console.error('Failed to fetch exams:', err)
                setError(t('common.error'))
            } finally {
                setLoadingExams(false)
            }
        }
        fetchExams()
    }, [selectedClassId, t])

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getExamStatus = (exam: ExamResponse) => {
        const now = new Date()
        const start = exam.startTime ? new Date(exam.startTime) : null
        const end = exam.endTime ? new Date(exam.endTime) : null

        if (start && start > now) {
            return { key: 'upcoming' as const, label: t('exams.upcoming') }
        }
        if (start && end && start <= now && end >= now) {
            return { key: 'ongoing' as const, label: t('exams.ongoing') }
        }
        if (end && end < now) {
            return { key: 'ended' as const, label: t('exams.ended') }
        }
        return { key: 'ongoing' as const, label: t('exams.open') }
    }

    const canTakeExam = (exam: ExamResponse) => {
        const now = new Date()
        const start = exam.startTime ? new Date(exam.startTime) : null
        const end = exam.endTime ? new Date(exam.endTime) : null

        if (start && start > now) return false
        if (end && end < now) return false
        return true
    }

    const filteredExams = useMemo(() => {
        if (activeTab === 'all') return exams
        return exams.filter((exam) => getExamStatus(exam).key === activeTab)
    }, [activeTab, exams])

    const tabItems: { key: ExamTab; label: string }[] = [
        { key: 'all', label: t('exams.allExams') },
        { key: 'ongoing', label: t('exams.ongoing') },
        { key: 'upcoming', label: t('exams.upcoming') },
        { key: 'ended', label: t('exams.ended') },
    ]

    if (loadingClasses) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    if (classes.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                {error && (
                    <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
                        {error}
                    </div>
                )}
                <EmptyState
                    icon={<FileText className="w-8 h-8" />}
                    title={t('exams.noClassesJoined')}
                    description={t('exams.needJoinClass')}
                />
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
            <div className="card p-6 md:p-7">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div>
                        <h1
                            className="text-[28px] font-extrabold leading-tight"
                            style={{ color: 'var(--color-text)' }}
                        >
                            {t('exams.examList')}
                        </h1>
                        <p className="mt-1 text-sm md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                            {t('exams.selectClass')}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                        <button className="btn-secondary text-sm gap-2">
                            <ListFilter className="w-4 h-4" />
                            {t('exams.filterExams')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="card p-5 md:p-6">
                <label
                    className="block text-sm font-medium mb-2.5"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    {t('exams.classroom')}
                </label>
                <div className="relative w-full max-w-md">
                    <select
                        value={selectedClassId ?? ''}
                        onChange={(e) => setSelectedClassId(Number(e.target.value))}
                        className="input-field appearance-none pr-10 cursor-pointer"
                    >
                        {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                                {cls.name} {cls.academicYear ? `(${cls.academicYear})` : ''}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                        style={{ color: 'var(--color-text-secondary)' }}
                    />
                </div>

                <div className="mt-5 flex flex-wrap gap-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    {tabItems.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                                activeTab === tab.key ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent'
                            }`}
                            style={{
                                color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {loadingExams && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            )}

            {!loadingExams && exams.length === 0 && (
                <EmptyState
                    icon={<FileText className="w-8 h-8" />}
                    title={t('exams.noExams')}
                    description={t('exams.noActiveExams')}
                />
            )}

            {!loadingExams && exams.length > 0 && filteredExams.length === 0 && (
                <EmptyState
                    icon={<FileText className="w-8 h-8" />}
                    title={t('exams.noMatchingExams')}
                    description={t('exams.tryDifferentTab')}
                />
            )}

            {!loadingExams && filteredExams.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredExams.map((exam) => {
                        const status = getExamStatus(exam)
                        const available = canTakeExam(exam)
                        const statusStyles =
                            status.key === 'ongoing'
                                ? 'bg-emerald-100 text-emerald-700'
                                : status.key === 'upcoming'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-200 text-slate-700'

                        return (
                            <div
                                key={exam.id}
                                className="card overflow-hidden flex flex-col"
                            >
                                <div
                                    className="p-4 md:p-5 text-white"
                                    style={{
                                        background:
                                            'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 88%, #fff 12%), color-mix(in srgb, var(--color-primary) 62%, #1e3a8a 38%))',
                                    }}
                                >
                                    <div className="inline-flex items-center gap-2 mb-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles}`}>
                                            {status.label}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold line-clamp-2 min-h-[3.5rem]">
                                        {exam.title}
                                    </h3>
                                </div>

                                <div className="p-5 flex flex-col gap-4 flex-1">
                                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                        <Users className="w-4 h-4" />
                                        <span className="font-medium truncate">{exam.className || t('exams.classroom')}</span>
                                    </div>

                                    <div className="space-y-2.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                        <p className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span>{t('exams.duration')}: {exam.durationMinutes ?? '—'} {t('exams.minutes')}</span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <HelpCircle className="w-4 h-4" />
                                            <span>{t('exams.numberQuestions')}: {exam.questionCount ?? 0} {t('exams.questions')}</span>
                                        </p>
                                        <p className="flex items-start gap-2">
                                            <CalendarDays className="w-4 h-4 mt-0.5" />
                                            <span>
                                                {t('exams.start')}: {formatDate(exam.startTime)}
                                                <br />
                                                {t('exams.end')}: {formatDate(exam.endTime)}
                                            </span>
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/exams/${exam.id}/introduction`)}
                                        disabled={!available}
                                        className={`mt-auto w-full rounded-full px-4 py-3 text-sm font-semibold transition-all inline-flex items-center justify-center gap-2 ${
                                            available ? 'btn-primary' : 'btn-secondary opacity-70 cursor-not-allowed'
                                        }`}
                                    >
                                        {available ? t('exams.viewIntroStart') : t('exams.timeExpired')}
                                        {available && <ArrowRight className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

