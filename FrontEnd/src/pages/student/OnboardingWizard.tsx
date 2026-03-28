import { useCallback, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Loader2,
  Target,
  Trophy,
} from 'lucide-react'
import { useLearningProfileStore } from '../../store/learningProfileStore'
import { learningApi, CompleteOnboardingRequest, CefrLevel, LearningGoal, PlacementQuestionResponse, PlacementAnswerAccepted } from '../../services/api/learningApi'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const CEFR_COLORS: Record<CefrLevel, string> = {
  A1: 'bg-green-100 text-green-800',
  A2: 'bg-emerald-100 text-emerald-800',
  B1: 'bg-blue-100 text-blue-800',
  B2: 'bg-indigo-100 text-indigo-800',
  C1: 'bg-purple-100 text-purple-800',
  C2: 'bg-rose-100 text-rose-800',
}

const GOAL_OPTIONS = [
  { value: 'COMMUNICATION', label: 'Giao tiếp hàng ngày', icon: BookOpen },
  { value: 'EXAM_PREP', label: 'Luyện thi (IELTS, TOEIC...)', icon: Trophy },
  { value: 'BUSINESS', label: 'Tiếng Anh thương mại', icon: Brain },
]

const TIME_OPTIONS = [10, 15, 20, 30, 45, 60]

const TOPIC_OPTIONS = [
  'Daily Life', 'Travel', 'Food & Restaurant', 'Work & Career',
  'Health & Body', 'Technology', 'Science', 'Arts & Culture',
  'News & Media', 'Environment', 'Sports', 'Music & Entertainment',
]

export default function OnboardingWizard() {
  const navigate = useNavigate()
  const { setPlacementResult, fetchOnboardingStatus } = useLearningProfileStore()

  const [step, setStep] = useState<'goals' | 'placement' | 'result' | 'done'>('goals')
  const [goal, setGoal] = useState<LearningGoal | ''>('')
  const [time, setTime] = useState<number>(15)
  const [topics, setTopics] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Placement state
  const [sessionId, setSessionId] = useState('')
  const [question, setQuestion] = useState<PlacementQuestionResponse | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [answeredCount, setAnsweredCount] = useState(0)

  // Track when the question was displayed for accurate time measurement
  const questionStartTimeRef = useRef<number | null>(null)

  const toggleTopic = useCallback((topic: string) => {
    setTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    )
  }, [])

  const startPlacement = useCallback(async () => {
    if (!goal) {
      setError('Vui lòng chọn mục tiêu học tập')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { sessionId: sid } = await learningApi.createSession()
      setSessionId(sid)
      setAnsweredCount(0)
      const q = await learningApi.getNextQuestion(sid)
      if (!q) {
        setError('Không có câu hỏi nào. Vui lòng thử lại sau.')
        setLoading(false)
        return
      }
      setQuestion(q)
      questionStartTimeRef.current = Date.now()
      setStep('placement')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể bắt đầu bài test')
    } finally {
      setLoading(false)
    }
  }, [goal])

  const handleAnswer = useCallback(async () => {
    if (!question || !selectedAnswer || sessionId === '') return
    const timeSpentSeconds = questionStartTimeRef.current
      ? Math.round((Date.now() - questionStartTimeRef.current) / 1000)
      : 15
    setLoading(true)
    setError('')
    try {
      const accepted: PlacementAnswerAccepted = await learningApi.submitAnswer(
        sessionId,
        question.questionId,
        selectedAnswer,
        timeSpentSeconds,
      )
      setAnsweredCount((c) => c + 1)
      if (!accepted.nextQuestionAvailable && accepted.result) {
        setPlacementResult(accepted.result)
        setStep('result')
      } else {
        const nextQ = await learningApi.getNextQuestion(sessionId)
        if (nextQ) {
          setQuestion(nextQ)
          setSelectedAnswer('')
          questionStartTimeRef.current = Date.now()
        } else {
          setStep('result')
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Lỗi khi nộp đáp án')
    } finally {
      setLoading(false)
    }
  }, [question, selectedAnswer, sessionId, setPlacementResult])

  const completeOnboarding = useCallback(async () => {
    if (!goal) {
      setError('Vui lòng chọn mục tiêu học tập')
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload: CompleteOnboardingRequest = {
        primaryGoal: goal,
        dailyTargetMinutes: time,
        preferredTopics: topics,
      }
      await learningApi.completeOnboarding(payload)
      setStep('done')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể lưu profile')
    } finally {
      setLoading(false)
    }
  }, [goal, time, topics])

  const goToDashboard = useCallback(async () => {
    // Placement + POST onboarding đã lưu trên server nhưng store vẫn onboardingCompleted=false
    // nên StudentDashboard vẫn bọc OnboardingWizard — navigate('/dashboard') không đổi gì.
    try {
      await fetchOnboardingStatus()
    } catch {
      /* ignore */
    }
    if (!useLearningProfileStore.getState().onboardingCompleted) {
      useLearningProfileStore.setState({ onboardingCompleted: true })
    }
    navigate('/dashboard', { replace: true })
  }, [fetchOnboardingStatus, navigate])

  // ---- Step: Goals ----
  if (step === 'goals') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Chào mừng đến với EnglishLearn!</h1>
            <p className="text-gray-500 mt-2">Trả lời vài câu hỏi để chúng tôi cá nhân hóa lộ trình cho bạn</p>
          </div>

          {/* Step 1: Goal */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Mục tiêu học tập của bạn là gì?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {GOAL_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setGoal(value as LearningGoal)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    goal === value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Time */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Bạn có thể dành bao nhiêu phút mỗi ngày?
            </label>
            <div className="flex flex-wrap gap-2">
              {TIME_OPTIONS.map((mins) => (
                <button
                  key={mins}
                  onClick={() => setTime(mins)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    time === mins
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  {mins} phút
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Topics */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Bạn quan tâm đến những chủ đề nào? (chọn nhiều)
            </label>
            <div className="flex flex-wrap gap-2">
              {TOPIC_OPTIONS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    topics.includes(topic)
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            onClick={startPlacement}
            disabled={loading || !goal}
            className="w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</>
            ) : (
              <>Bắt đầu kiểm tra trình độ <ArrowRight className="w-4 h-4" /></>
            )}
          </Button>
        </Card>
      </div>
    )
  }

  // ---- Step: Placement Test ----
  if (step === 'placement' && question) {
    const skillColors: Record<string, string> = {
      GRAMMAR: 'bg-amber-100 text-amber-800',
      VOCABULARY: 'bg-green-100 text-green-800',
      READING: 'bg-blue-100 text-blue-800',
      LISTENING: 'bg-purple-100 text-purple-800',
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Câu {answeredCount + 1} / {question.totalQuestions}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${skillColors[question.skill] ?? 'bg-gray-100'}`}>
                {question.skill}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${((answeredCount + 1) / question.totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{question.questionText}</h2>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedAnswer(option)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedAnswer === option
                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <span className="font-medium text-gray-700 mr-3">
                  {String.fromCharCode(65 + idx)}.
                </span>
                {option}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            onClick={handleAnswer}
            disabled={loading || !selectedAnswer}
            className="w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</>
            ) : (
              <>Tiếp tục <ArrowRight className="w-4 h-4" /></>
            )}
          </Button>
        </Card>
      </div>
    )
  }

  // ---- Step: Result ----
  if (step === 'result') {
    const result = useLearningProfileStore.getState().placementResult
    if (!result) return null

    const skillBadges = [
      { label: 'Ngữ pháp', level: result.grammarLevel, color: CEFR_COLORS[result.grammarLevel] },
      { label: 'Từ vựng', level: result.vocabularyLevel, color: CEFR_COLORS[result.vocabularyLevel] },
      { label: 'Đọc hiểu', level: result.readingLevel, color: CEFR_COLORS[result.readingLevel] },
      { label: 'Nghe', level: result.listeningLevel, color: CEFR_COLORS[result.listeningLevel] },
    ]

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Kết quả kiểm tra trình độ</h1>
            <p className="text-gray-500 mt-2">Đây là điểm khởi đầu tối ưu cho bạn</p>
          </div>

          {/* Skill levels */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {skillBadges.map(({ label, level, color }) => (
              <div key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${color}`}>
                  {level}
                </span>
              </div>
            ))}
          </div>

          {/* Overall */}
          <div className="bg-indigo-50 rounded-xl p-4 mb-6 text-center">
            <div className="text-sm text-indigo-600 font-medium">Trình độ tổng quan</div>
            <div className={`inline-block px-6 py-2 rounded-full text-xl font-bold mt-1 ${CEFR_COLORS[result.overallLevel]}`}>
              {result.overallLevel}
            </div>
            <div className="text-sm text-indigo-500 mt-2">
              Lộ trình bắt đầu từ <strong>{result.effectiveStartLevel}</strong>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            onClick={completeOnboarding}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</>
            ) : (
              <>Bắt đầu học ngay <ArrowRight className="w-4 h-4" /></>
            )}
          </Button>
        </Card>
      </div>
    )
  }

  // ---- Done ----
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Hoàn tất!</h1>
        <p className="text-gray-500 mb-6">Lộ trình học cá nhân của bạn đã sẵn sàng.</p>
        <Button onClick={goToDashboard} className="w-full">
          Đi đến Dashboard
        </Button>
      </Card>
    </div>
  )
}
