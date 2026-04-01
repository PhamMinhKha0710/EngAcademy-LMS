import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Layers,
    Volume2,
    AlertCircle,
    Sparkles,
    RotateCcw,
    CheckCircle,
    Headphones,
    ArrowLeft,
    FolderOpen,
    Trophy,
    PlayCircle,
    Clock,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../store/toastStore'
import { vocabularyApi, VocabularyResponse, TopicProgress } from '../../services/api/vocabularyApi'
import { triggerQuestRefresh } from '../../utils/questRefresh'
import { mistakeApi } from '../../services/api/mistakeApi'
import FlashCard from '../../components/ui/FlashCard'
import PageHero from '../../components/ui/PageHero'
import Skeleton from '../../components/ui/Skeleton'
import ProgressBar from '../../components/ui/ProgressBar'

const PLACEHOLDER_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9gIun82348tU1ik-4NMDKlf3MdXoxP8IsFZo9yHWGcEwFqoK6lkOZFs3ZfjiKB-gL8hWICKYrcBVOhKaFKW2UQIKOnS-6w3xR2W84sJFtwXxxVr13TDBqDGrfCaGvTR_2TpE0bMq-XpYVfl7MJpIZ6g8gUsVk9nacEl__atrxNW8QObKPB3QfSN1FfTMDZb8Po9-nFqvhIF1qPvKGcZ41VpNm7sEnfpr3zYWEuAnC7fIwwiABEPViC__ZJeNfruaQTOBh3xJ2OZ9P'

const CONTINUE_LEARNING_IMAGE =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuALCoX9kpHAXVTawTzYGjbLCOoXiJ5VtIDa_NUAyZsaopP3FSofE1OwwHkKqo_WHwSlMvrKI0Voq4udFZ0yRDE1TUesQbm8mWKH6LXMT4LeoWChjDbCLb6yfxY_s1arB4a3L_jLUY2YxhRpOOkwyqfy3K57e-q7Vc03dz6gVvyHN40dgmEwupUmLnNp26VS2Qn4d8-gVem_PDPnbpQq1y_T7MkHTdZO6RwjtzUb2y4P-M7ahfmftTJEdhjgDsSiGM9_xy_1QnDcxuWS'

type ViewMode = 'topics' | 'flashcard' | 'learned'

export default function VocabularyPage() {
    const { t } = useTranslation()
    const user = useAuthStore((s) => s.user)
    const { addToast } = useToastStore()
    const [mode, setMode] = useState<ViewMode>('topics')

    // Topics state
    const [topics, setTopics] = useState<TopicProgress[]>([])
    const [topicsLoading, setTopicsLoading] = useState(true)

    // Flashcard state
    const [selectedTopic, setSelectedTopic] = useState<TopicProgress | null>(null)
    const [flashcards, setFlashcards] = useState<VocabularyResponse[]>([])
    const [flashcardIndex, setFlashcardIndex] = useState(0)
    const [flashcardLoading, setFlashcardLoading] = useState(false)
    const [flashcardError, setFlashcardError] = useState<string | null>(null)
    const [addingMistake, setAddingMistake] = useState(false)
    const [topicDone, setTopicDone] = useState(false)

    // Learned state
    const [learnedWords, setLearnedWords] = useState<VocabularyResponse[]>([])
    const [learnedLoading, setLearnedLoading] = useState(false)

    const fetchTopics = useCallback(async () => {
        if (!user?.id) return
        setTopicsLoading(true)
        try {
            const data = await vocabularyApi.getTopics()
            setTopics(data)
        } catch {
            addToast({ type: 'error', message: t('common.error') })
        } finally {
            setTopicsLoading(false)
        }
    }, [user?.id, addToast, t])

    const fetchFlashcards = useCallback(async (topicId: number) => {
        if (!user?.id) return
        setFlashcardLoading(true)
        setFlashcardError(null)
        setTopicDone(false)
        try {
            const data = await vocabularyApi.getWordsToLearn(topicId)
            if (data.length === 0) {
                setTopicDone(true)
            }
            setFlashcards(data)
            setFlashcardIndex(0)
        } catch {
            setFlashcardError(t('common.error'))
        } finally {
            setFlashcardLoading(false)
        }
    }, [user?.id, t])

    const fetchLearnedWords = useCallback(async () => {
        if (!user?.id) return
        setLearnedLoading(true)
        try {
            const data = await vocabularyApi.getLearnedWords()
            setLearnedWords(data)
        } catch {
            addToast({ type: 'error', message: t('common.error') })
        } finally {
            setLearnedLoading(false)
        }
    }, [user?.id, addToast, t])

    useEffect(() => { fetchTopics() }, [fetchTopics])

    useEffect(() => {
        if (mode === 'learned') fetchLearnedWords()
    }, [mode, fetchLearnedWords])

    const handleSelectTopic = (topic: TopicProgress) => {
        setSelectedTopic(topic)
        setMode('flashcard')
        fetchFlashcards(topic.id)
    }

    const handleReviewWord = async (correct: boolean) => {
        const currentCard = flashcards[flashcardIndex]
        if (!currentCard || !user?.id) return

        if (!correct && !addingMistake) {
            setAddingMistake(true)
            try {
                await mistakeApi.addMistake({ vocabularyId: currentCard.id })
            } catch { /* silent */ }
            setAddingMistake(false)
        }

        try {
            const result = await vocabularyApi.reviewWord(currentCard.id, correct ? 'correct' : 'wrong')
            if (result.topicCompleted) {
                addToast({ type: 'success', message: t('vocabulary.topicDone') })
            }
            if (result.questTaskCompleted) {
                addToast({ type: 'success', message: t('quests.taskCompleted') })
            }
            if (correct) triggerQuestRefresh()
        } catch { /* silent */ }

        goToNext()
    }

    const goToNext = () => {
        if (flashcardIndex < flashcards.length - 1) {
            setFlashcardIndex((i) => i + 1)
        } else if (selectedTopic) {
            fetchFlashcards(selectedTopic.id)
        }
    }

    const handleBackToTopics = () => {
        setMode('topics')
        setSelectedTopic(null)
        setFlashcards([])
        setTopicDone(false)
        fetchTopics()
    }

    const playAudio = (url: string | undefined) => {
        if (!url) return
        const audio = new Audio(url)
        audio.play().catch(() => {})
    }

    const currentCard = flashcards[flashcardIndex]
    const progressPercent = flashcards.length > 0 ? ((flashcardIndex + 1) / flashcards.length) * 100 : 0

    return (
        <div className="p-6 lg:p-8 space-y-8">
            <PageHero
                title={t('vocabulary.title')}
                subtitle={t('vocabulary.subtitle')}
                icon={<Layers className="w-7 h-7" />}
                iconBg="violet"
            >
                <div
                    className="flex gap-1 p-1.5 rounded-xl w-fit"
                    style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                >
                    {([
                        { key: 'topics', icon: FolderOpen, label: t('vocabulary.topics') },
                        { key: 'flashcard', icon: Layers, label: t('vocabulary.flashcards') },
                        { key: 'learned', icon: CheckCircle, label: t('vocabulary.learnedWords') },
                    ] as const).map((tab) => (
                        <motion.button
                            key={tab.key}
                            onClick={() => {
                                setMode(tab.key)
                                if (tab.key === 'topics') handleBackToTopics()
                            }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                mode === tab.key
                                    ? 'bg-violet-500 text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                            whileTap={{ scale: 0.98 }}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </motion.button>
                    ))}
                </div>
            </PageHero>

            {/* ========== TOPICS TAB ========== */}
            {mode === 'topics' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {!topicsLoading &&
                        topics.length > 0 &&
                        topics
                            .filter((t) => t.progress > 0 && t.progress < 100)
                            .sort((a, b) => b.progress - a.progress)
                            .slice(0, 2)
                            .map((topic, index) => (
                                <motion.div
                                    key={topic.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="card overflow-hidden flex flex-col md:flex-row rounded-2xl"
                                >
                                    <div
                                        className="md:w-[40%] min-h-[220px] bg-cover bg-center"
                                        style={{ backgroundImage: `url('${CONTINUE_LEARNING_IMAGE}')` }}
                                    />
                                    <div className="p-6 md:p-8 flex-1">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold">
                                                {t('lessons.intermediate')}
                                            </span>
                                            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold inline-flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                15 {t('exams.minutes')}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-black leading-tight text-slate-900 dark:text-white">
                                            {topic.name}
                                        </h3>
                                        <p className="mt-3 text-slate-600 dark:text-slate-400">
                                            {topic.description || t('dashboard.learnWithExamples')}
                                        </p>
                                        <button
                                            onClick={() => handleSelectTopic(topic)}
                                            className="mt-6 rounded-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
                                        >
                                            <PlayCircle className="w-5 h-5" />
                                            {t('vocabulary.continueLearning')}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('vocabulary.selectTopic')}</p>
                    {topicsLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
                        </div>
                    ) : topics.length === 0 ? (
                        <div className="card p-12 text-center rounded-2xl">
                            <FolderOpen className="w-12 h-12 text-violet-500/60 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-400">{t('vocabulary.noTopics')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {topics.map((topic, index) => (
                                <motion.button
                                    key={topic.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    onClick={() => handleSelectTopic(topic)}
                                    className="group text-left p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-600 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                            {topic.name}
                                        </h3>
                                        {topic.completed && (
                                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                                                <Trophy className="w-3 h-3" />
                                                {t('vocabulary.topicCompleted')}
                                            </span>
                                        )}
                                    </div>
                                    {topic.description && (
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{topic.description}</p>
                                    )}
                                    <ProgressBar value={topic.progress} height="h-2" variant="gradient" gradientStart="from-violet-500" gradientEnd="to-fuchsia-400" />
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                            {t('vocabulary.wordsCount', { mastered: topic.masteredWords, total: topic.totalWords })}
                                        </span>
                                        <span className="text-xs font-bold text-violet-500">{topic.progress}%</span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* ========== FLASHCARD TAB ========== */}
            {mode === 'flashcard' && (
                <div>
                    {selectedTopic && (
                        <div className="flex items-center gap-3 mb-6">
                            <button onClick={handleBackToTopics} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedTopic.name}</h2>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                    {t('vocabulary.wordsCount', { mastered: selectedTopic.masteredWords, total: selectedTopic.totalWords })}
                                </p>
                            </div>
                        </div>
                    )}

                    {!selectedTopic ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-12 text-center rounded-2xl">
                            <FolderOpen className="w-12 h-12 text-violet-500/60 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-400">{t('vocabulary.selectTopic')}</p>
                            <button onClick={() => setMode('topics')} className="btn-primary mt-4">{t('vocabulary.backToTopics')}</button>
                        </motion.div>
                    ) : flashcardLoading ? (
                        <div className="max-w-[800px] mx-auto space-y-6">
                            <Skeleton className="h-3 w-full rounded-full" />
                            <Skeleton className="h-[450px] w-full rounded-2xl" />
                            <div className="flex gap-4 justify-center">
                                <Skeleton className="h-14 w-40 rounded-xl" />
                                <Skeleton className="h-14 w-40 rounded-xl" />
                            </div>
                        </div>
                    ) : flashcardError ? (
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 rounded-2xl bg-slate-100 dark:bg-slate-800">
                            <AlertCircle className="w-14 h-14 text-red-400 mb-4" />
                            <p className="font-medium text-slate-900 dark:text-white mb-4">{flashcardError}</p>
                            <button onClick={() => fetchFlashcards(selectedTopic.id)} className="btn-primary">{t('common.retry')}</button>
                        </motion.div>
                    ) : topicDone || flashcards.length === 0 ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-12 text-center rounded-2xl max-w-[600px] mx-auto">
                            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                                <Trophy className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t('vocabulary.topicDone')}</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">{t('vocabulary.noMoreWords')}</p>
                            <button onClick={handleBackToTopics} className="btn-primary">{t('vocabulary.backToTopics')}</button>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[800px] mx-auto flex flex-col gap-6">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                                        <Layers className="w-6 h-6 text-primary-500" strokeWidth={2} />
                                        <span className="text-lg font-bold">{t('vocabulary.flashcards')}</span>
                                    </div>
                                    <div className="px-3 py-1.5 rounded-full bg-primary-500/10 text-primary-500 text-sm font-bold">
                                        {flashcardIndex + 1} / {flashcards.length} {t('vocabulary.cards')}
                                    </div>
                                </div>
                                    <div className="relative w-full h-3 bg-slate-300 dark:bg-slate-600 rounded-full overflow-hidden">
                                    <motion.div
                                        className="absolute top-0 left-0 h-full bg-primary-500 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercent}%` }}
                                        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                                    />
                                </div>
                            </div>

                            <div className="flex-1 min-h-[500px] flex flex-col items-center justify-center perspective-[1000px]">
                                <AnimatePresence mode="wait">
                                    {currentCard && (
                                        <motion.div key={currentCard.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25 }} className="w-full">
                                            <FlashCard
                                                height={450}
                                                front={
                                                    <div className="h-full flex flex-col">
                                                        <div className="h-[65%] min-h-0 relative bg-slate-100 dark:bg-slate-800">
                                                            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${currentCard.imageUrl || PLACEHOLDER_IMAGE}')` }} />
                                                            {currentCard.audioUrl && (
                                                                <button type="button" onClick={(e) => { e.stopPropagation(); playAudio(currentCard.audioUrl!) }}
                                                                    className="absolute top-4 right-4 bg-white/90 dark:bg-black/70 backdrop-blur-sm p-2.5 rounded-lg shadow-sm hover:scale-110 transition-transform" title={t('vocabulary.listen')}>
                                                                    <Volume2 className="w-5 h-5 text-primary-500" strokeWidth={2} />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="h-[35%] flex flex-col items-center justify-center gap-2 p-8 bg-white dark:bg-slate-800">
                                                            <h3 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{currentCard.word}</h3>
                                                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{t('vocabulary.tapToFlip')}</p>
                                                        </div>
                                                    </div>
                                                }
                                                back={
                                                    <div className="space-y-2 text-left px-4">
                                                        <p className="text-xl font-semibold text-slate-900 dark:text-white">{currentCard.meaning}</p>
                                                        {currentCard.pronunciation && <p className="text-sm italic text-slate-600 dark:text-slate-400">/{currentCard.pronunciation}/</p>}
                                                        {currentCard.exampleSentence && <p className="text-sm mt-3 text-slate-600 dark:text-slate-400">"{currentCard.exampleSentence}"</p>}
                                                    </div>
                                                }
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex flex-col items-center gap-6 pb-8">
                                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{t('vocabulary.didYouKnow')}</p>
                                <div className="flex flex-col sm:flex-row w-full gap-4 max-w-[600px]">
                                    <motion.button onClick={() => handleReviewWord(false)} disabled={addingMistake}
                                        className="group flex-1 h-14 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <RotateCcw className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2} />
                                        {t('vocabulary.studyAgain')}
                                    </motion.button>
                                    <motion.button onClick={() => handleReviewWord(true)}
                                        className="group flex-1 h-14 bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={2} />
                                        {t('vocabulary.iKnowThis')}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {/* ========== LEARNED WORDS TAB ========== */}
            {mode === 'learned' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('vocabulary.learnedWords')}</h2>
                        <span className="px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                            {learnedWords.length} {t('vocabulary.mastered')}
                        </span>
                    </div>

                    {learnedLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
                        </div>
                    ) : learnedWords.length === 0 ? (
                        <div className="card p-12 text-center rounded-2xl">
                            <Sparkles className="w-12 h-12 text-violet-500/60 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-400">{t('vocabulary.noLearnedWords')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {learnedWords.map((vocab, index) => (
                                <motion.div
                                    key={vocab.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700"
                                >
                                    <div className="p-5 flex flex-col gap-3 flex-1">
                                        <div className="flex items-start justify-between">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{vocab.word}</h3>
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                {t('vocabulary.mastered')}
                                            </span>
                                        </div>
                                        {vocab.pronunciation && (
                                            <p className="text-xs italic text-slate-600 dark:text-slate-400">/{vocab.pronunciation}/</p>
                                        )}
                                        <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">{vocab.meaning || t('vocabulary.noMeaning')}</p>
                                        {vocab.exampleSentence && (
                                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-auto">"{vocab.exampleSentence}"</p>
                                        )}
                                        {vocab.audioUrl && (
                                            <button onClick={() => playAudio(vocab.audioUrl)}
                                                className="flex items-center justify-center gap-1 h-9 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 text-primary-500 font-semibold text-sm transition-colors mt-2">
                                                <Headphones className="w-4 h-4" />
                                                {t('vocabulary.listen')}
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    )
}
