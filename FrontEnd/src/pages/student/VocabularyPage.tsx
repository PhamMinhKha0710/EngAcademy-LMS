import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Layers,
    List,
    Search,
    Volume2,
    AlertCircle,
    Sparkles,
    RotateCcw,
    CheckCircle,
    BookOpen,
    Headphones,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../store/toastStore'
import { vocabularyApi, VocabularyResponse } from '../../services/api/vocabularyApi'
import { mistakeApi } from '../../services/api/mistakeApi'
import FlashCard from '../../components/ui/FlashCard'
import PageHero from '../../components/ui/PageHero'
import Skeleton from '../../components/ui/Skeleton'

/** Placeholder image for vocabulary when imageUrl is empty - stitch style */
const PLACEHOLDER_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9gIun82348tU1ik-4NMDKlf3MdXoxP8IsFZo9yHWGcEwFqoK6lkOZFs3ZfjiKB-gL8hWICKYrcBVOhKaFKW2UQIKOnS-6w3xR2W84sJFtwXxxVr13TDBqDGrfCaGvTR_2TpE0bMq-XpYVfl7MJpIZ6g8gUsVk9nacEl__atrxNW8QObKPB3QfSN1FfTMDZb8Po9-nFqvhIF1qPvKGcZ41VpNm7sEnfpr3zYWEuAnC7fIwwiABEPViC__ZJeNfruaQTOBh3xJ2OZ9P'

type ViewMode = 'flashcard' | 'list'
type ListFilter = 'all' | 'audio' | 'example' | 'image'

export default function VocabularyPage() {
    const { t } = useTranslation()
    const user = useAuthStore((s) => s.user)
    const { addToast } = useToastStore()
    const [mode, setMode] = useState<ViewMode>('flashcard')

    const [flashcards, setFlashcards] = useState<VocabularyResponse[]>([])
    const [flashcardIndex, setFlashcardIndex] = useState(0)
    const [flashcardLoading, setFlashcardLoading] = useState(true)
    const [flashcardError, setFlashcardError] = useState<string | null>(null)
    const [addingMistake, setAddingMistake] = useState(false)
    const [mistakeAdded, setMistakeAdded] = useState<Set<number>>(new Set())

    const [listVocab, setListVocab] = useState<VocabularyResponse[]>([])
    const [listLoading, setListLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)
    const [listFilter, setListFilter] = useState<ListFilter>('all')

    const fetchFlashcards = useCallback(async () => {
        setFlashcardLoading(true)
        setFlashcardError(null)
        try {
            const data = await vocabularyApi.getRandomFlashcards(20)
            setFlashcards(data)
            setFlashcardIndex(0)
            setMistakeAdded(new Set())
        } catch (err) {
            console.error('Failed to fetch flashcards:', err)
            setFlashcardError(t('common.error'))
        } finally {
            setFlashcardLoading(false)
        }
    }, [t])

    const fetchVocabList = useCallback(async (keyword: string) => {
        setListLoading(true)
        try {
            const data = await vocabularyApi.search(keyword)
            setListVocab(data)
        } catch (err) {
            console.error('Failed to search vocabulary:', err)
            addToast({ type: 'error', message: 'Không thể tìm kiếm từ vựng lúc này.' })
        } finally {
            setListLoading(false)
        }
    }, [addToast])

    useEffect(() => {
        fetchFlashcards()
    }, [fetchFlashcards])

    useEffect(() => {
        if (mode === 'list') {
            fetchVocabList(searchTerm)
        }
    }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearchChange = (value: string) => {
        setSearchTerm(value)
        if (searchTimeout) clearTimeout(searchTimeout)
        const timeout = setTimeout(() => {
            fetchVocabList(value)
        }, 400)
        setSearchTimeout(timeout)
    }

    const playAudio = (url: string | undefined) => {
        if (!url) {
            addToast({ type: 'warning', message: 'Chưa có file phát âm cho từ này.' })
            return
        }
        const audio = new Audio(url)
        audio.play().catch(() => { })
    }

    const handleStudyAgain = async () => {
        const currentCard = flashcards[flashcardIndex]
        if (!currentCard) return
        if (user?.id && !addingMistake && !mistakeAdded.has(currentCard.id)) {
            setAddingMistake(true)
            try {
                await mistakeApi.addMistake({ vocabularyId: currentCard.id })
                setMistakeAdded((prev) => new Set(prev).add(currentCard.id))
                addToast({ type: 'success', message: 'Đã thêm từ vựng vào Sổ lỗi!' })
            } catch (err) {
                console.error('Failed to add mistake:', err)
                addToast({ type: 'error', message: 'Đã xảy ra lỗi khi thêm vào Sổ lỗi.' })
            } finally {
                setAddingMistake(false)
            }
        } else if (mistakeAdded.has(currentCard.id)) {
            addToast({ type: 'info', message: 'Từ này đã có trong Sổ lỗi của bạn rồi.' })
        }
        goToNext()
    }

    const handleIKnowThis = () => {
        goToNext()
    }

    const goToNext = () => {
        if (flashcardIndex < flashcards.length - 1) {
            setFlashcardIndex((i) => i + 1)
        } else {
            fetchFlashcards()
        }
    }

    const currentCard = flashcards[flashcardIndex]
    const progressPercent = flashcards.length > 0 ? ((flashcardIndex + 1) / flashcards.length) * 100 : 0

    const filteredListVocab = listVocab.filter((v) => {
        if (listFilter === 'audio') return Boolean(v.audioUrl)
        if (listFilter === 'example') return Boolean(v.exampleSentence)
        if (listFilter === 'image') return Boolean(v.imageUrl)
        return true
    })

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
                    <motion.button
                        onClick={() => setMode('flashcard')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${mode === 'flashcard' ? 'bg-violet-500 text-white shadow-md' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                            }`}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Layers className="w-4 h-4" />
                        {t('vocabulary.flashcards')}
                    </motion.button>
                    <motion.button
                        onClick={() => setMode('list')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${mode === 'list' ? 'bg-violet-500 text-white shadow-md' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                            }`}
                        whileTap={{ scale: 0.98 }}
                    >
                        <List className="w-4 h-4" />
                        {t('vocabulary.wordList')}
                    </motion.button>
                </div>
            </PageHero>

            {mode === 'flashcard' && (
                <div>
                    {flashcardLoading ? (
                        <div className="max-w-[800px] mx-auto space-y-6">
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-6 w-48 rounded" />
                                <Skeleton className="h-7 w-24 rounded-full" />
                            </div>
                            <Skeleton className="h-3 w-full rounded-full" />
                            <Skeleton className="h-[450px] w-full rounded-2xl" />
                            <div className="flex gap-4 justify-center">
                                <Skeleton className="h-14 w-40 rounded-xl" />
                                <Skeleton className="h-14 w-40 rounded-xl" />
                            </div>
                        </div>
                    ) : flashcardError ? (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-16 rounded-2xl bg-[var(--color-bg-secondary)]"
                        >
                            <AlertCircle className="w-14 h-14 text-red-400 mb-4" />
                            <p className="font-medium text-[var(--color-text)] mb-4">{flashcardError}</p>
                            <button onClick={fetchFlashcards} className="btn-primary">
                                {t('common.retry')}
                            </button>
                        </motion.div>
                    ) : flashcards.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="card p-12 text-center rounded-2xl"
                        >
                            <Sparkles className="w-12 h-12 text-violet-500/60 mx-auto mb-4" />
                            <p className="text-[var(--color-text-secondary)]">
                                {t('vocabulary.noVocabYet')}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-[800px] mx-auto flex flex-col gap-6"
                        >
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
                                <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
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
                                        <motion.div
                                            key={currentCard.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.25 }}
                                            className="w-full"
                                        >
                                            <FlashCard
                                                height={450}
                                                front={
                                                    <div className="h-full flex flex-col">
                                                        <div className="h-[65%] min-h-0 relative bg-slate-100 dark:bg-slate-800">
                                                            <div
                                                                className="absolute inset-0 bg-cover bg-center"
                                                                style={{
                                                                    backgroundImage: `url('${currentCard.imageUrl || PLACEHOLDER_IMAGE}')`,
                                                                }}
                                                            />
                                                            {currentCard.audioUrl && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        playAudio(currentCard.audioUrl!)
                                                                    }}
                                                                    className="absolute top-4 right-4 bg-white/90 dark:bg-black/70 backdrop-blur-sm p-2.5 rounded-lg shadow-sm hover:scale-110 transition-transform"
                                                                    title={t('vocabulary.listen')}
                                                                >
                                                                    <Volume2 className="w-5 h-5 text-primary-500" strokeWidth={2} />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="h-[35%] flex flex-col items-center justify-center gap-2 p-8 bg-white dark:bg-slate-900">
                                                            <h3 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                                                                {currentCard.word}
                                                            </h3>
                                                            <p className="text-slate-400 dark:text-slate-500 font-medium text-sm">
                                                                {t('vocabulary.tapToFlip')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                }
                                                back={
                                                    <div className="space-y-2 text-left px-4">
                                                        <p className="text-xl font-semibold text-[var(--color-text)]">
                                                            {currentCard.meaning}
                                                        </p>
                                                        {currentCard.pronunciation && (
                                                            <p className="text-sm italic text-[var(--color-text-secondary)]">
                                                                /{currentCard.pronunciation}/
                                                            </p>
                                                        )}
                                                        {currentCard.exampleSentence && (
                                                            <p className="text-sm mt-3 text-[var(--color-text-secondary)]">
                                                                "{currentCard.exampleSentence}"
                                                            </p>
                                                        )}
                                                    </div>
                                                }
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex flex-col items-center gap-6 pb-8">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                    {t('vocabulary.didYouKnow')}
                                </p>
                                <div className="flex flex-col sm:flex-row w-full gap-4 max-w-[600px]">
                                    <motion.button
                                        onClick={handleStudyAgain}
                                        disabled={addingMistake}
                                        className="group flex-1 h-14 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <RotateCcw className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2} />
                                        {t('vocabulary.studyAgain')}
                                    </motion.button>
                                    <motion.button
                                        onClick={handleIKnowThis}
                                        className="group flex-1 h-14 bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={2} />
                                        {t('vocabulary.iKnowThis')}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {mode === 'list' && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text)]">{t('vocabulary.vocabularyLibrary')}</h2>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                {t('vocabulary.discoverNew')}
                            </p>
                        </div>
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                            <input
                                type="text"
                                placeholder={t('vocabulary.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="input-field !pl-10"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {[
                            { key: 'all', label: t('vocabulary.all') },
                            { key: 'audio', label: t('vocabulary.hasAudio') },
                            { key: 'example', label: t('vocabulary.hasExample') },
                            { key: 'image', label: t('vocabulary.hasImage') },
                        ].map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setListFilter(f.key as ListFilter)}
                                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${listFilter === f.key
                                    ? 'bg-primary-500 text-white border-primary-500'
                                    : 'bg-white dark:bg-slate-900 text-[var(--color-text-secondary)] border-[var(--color-border)]'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {listLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton key={i} className="h-[320px] rounded-2xl" />
                            ))}
                        </div>
                    ) : filteredListVocab.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filteredListVocab.map((vocab, index) => (
                                <motion.div
                                    key={vocab.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="group flex flex-col bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-[var(--color-border)]"
                                >
                                    <div className="relative h-40 overflow-hidden bg-slate-100 dark:bg-slate-800">
                                        <img
                                            src={vocab.imageUrl || PLACEHOLDER_IMAGE}
                                            alt={vocab.word}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                        <div className="absolute bottom-3 left-3">
                                            <h3 className="text-white text-lg font-bold">{vocab.word}</h3>
                                        </div>
                                    </div>
                                    <div className="p-4 flex flex-col gap-3 flex-1">
                                        <p className="text-sm font-medium text-[var(--color-text)] line-clamp-2 min-h-[2.5rem]">
                                            {vocab.meaning || t('vocabulary.noMeaning')}
                                        </p>
                                        <p className="text-xs italic text-[var(--color-text-secondary)] min-h-[1rem]">
                                            {vocab.pronunciation ? `/${vocab.pronunciation}/` : '—'}
                                        </p>
                                        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 min-h-[2rem]">
                                            {vocab.exampleSentence || t('vocabulary.noExample')}
                                        </p>

                                        <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
                                            <button
                                                onClick={() => vocab.audioUrl && playAudio(vocab.audioUrl)}
                                                disabled={!vocab.audioUrl}
                                                className="flex items-center justify-center gap-1 h-10 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 text-primary-500 font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <Headphones className="w-4 h-4" />
                                                {t('vocabulary.listen')}
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await mistakeApi.addMistake({ vocabularyId: vocab.id })
                                                        addToast({ type: 'success', message: `Đã thêm "${vocab.word}" vào Sổ lỗi!` })
                                                    } catch (err) {
                                                        console.error('Failed to add mistake from library:', err)
                                                        addToast({ type: 'error', message: `Không thể đưa "${vocab.word}" vào Sổ lỗi lúc này.` })
                                                    }
                                                }}
                                                className="flex items-center justify-center gap-1 h-10 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm transition-colors"
                                            >
                                                <BookOpen className="w-4 h-4" />
                                                {t('vocabulary.reviewAgain')}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="card p-12 text-center rounded-2xl">
                            <p className="text-[var(--color-text-secondary)]">
                                {searchTerm
                                    ? t('vocabulary.noMatchFor', { search: searchTerm })
                                    : t('vocabulary.noVocabToDisplay')}
                            </p>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    )
}

