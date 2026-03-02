import { useEffect, useState, useCallback } from 'react'
import {
    Layers,
    List,
    Search,
    Volume2,
    AlertCircle,
    Sparkles,
    RotateCcw,
    CheckCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { vocabularyApi, VocabularyResponse } from '../../services/api/vocabularyApi'
import { mistakeApi } from '../../services/api/mistakeApi'
import FlashCard from '../../components/ui/FlashCard'
import DataTable from '../../components/ui/DataTable'
import PageHero from '../../components/ui/PageHero'
import Skeleton from '../../components/ui/Skeleton'

/** Placeholder image for vocabulary when imageUrl is empty - stitch style */
const PLACEHOLDER_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9gIun82348tU1ik-4NMDKlf3MdXoxP8IsFZo9yHWGcEwFqoK6lkOZFs3ZfjiKB-gL8hWICKYrcBVOhKaFKW2UQIKOnS-6w3xR2W84sJFtwXxxVr13TDBqDGrfCaGvTR_2TpE0bMq-XpYVfl7MJpIZ6g8gUsVk9nacEl__atrxNW8QObKPB3QfSN1FfTMDZb8Po9-nFqvhIF1qPvKGcZ41VpNm7sEnfpr3zYWEuAnC7fIwwiABEPViC__ZJeNfruaQTOBh3xJ2OZ9P'

type ViewMode = 'flashcard' | 'list'

export default function VocabularyPage() {
    const user = useAuthStore((s) => s.user)
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
            setFlashcardError('Không thể tải flashcard. Vui lòng thử lại.')
        } finally {
            setFlashcardLoading(false)
        }
    }, [])

    const fetchVocabList = useCallback(async (keyword: string) => {
        setListLoading(true)
        try {
            const data = await vocabularyApi.search(keyword)
            setListVocab(data)
        } catch (err) {
            console.error('Failed to search vocabulary:', err)
        } finally {
            setListLoading(false)
        }
    }, [])

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

    const playAudio = (url: string) => {
        const audio = new Audio(url)
        audio.play().catch(() => {})
    }

    const handleStudyAgain = async () => {
        const currentCard = flashcards[flashcardIndex]
        if (!currentCard) return
        if (user?.id && !addingMistake && !mistakeAdded.has(currentCard.id)) {
            setAddingMistake(true)
            try {
                await mistakeApi.addMistake({ vocabularyId: currentCard.id })
                setMistakeAdded((prev) => new Set(prev).add(currentCard.id))
            } catch (err) {
                console.error('Failed to add mistake:', err)
            } finally {
                setAddingMistake(false)
            }
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
            // Hết thẻ - có thể shuffle để học lại
            fetchFlashcards()
        }
    }

    const currentCard = flashcards[flashcardIndex]
    const progressPercent = flashcards.length > 0 ? ((flashcardIndex + 1) / flashcards.length) * 100 : 0

    const tableColumns = [
        {
            key: 'word',
            label: 'Từ vựng',
            render: (item: Record<string, unknown>) => {
                const vocab = item as unknown as VocabularyResponse
                return (
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--color-text)]">{vocab.word}</span>
                        {vocab.audioUrl && (
                            <button
                                onClick={() => playAudio(vocab.audioUrl!)}
                                className="p-1.5 rounded-lg hover:bg-primary-500/15 text-primary-500 transition-all duration-200 hover:scale-110"
                                title="Phát âm"
                            >
                                <Volume2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )
            },
        },
        {
            key: 'meaning',
            label: 'Nghĩa',
            render: (item: Record<string, unknown>) => {
                const vocab = item as unknown as VocabularyResponse
                return <span className="text-[var(--color-text)]">{vocab.meaning}</span>
            },
        },
        {
            key: 'pronunciation',
            label: 'Phiên âm',
            render: (item: Record<string, unknown>) => {
                const vocab = item as unknown as VocabularyResponse
                return (
                    <span className="italic text-sm text-[var(--color-text-secondary)]">
                        {vocab.pronunciation ? `/${vocab.pronunciation}/` : '—'}
                    </span>
                )
            },
        },
    ]

    return (
        <div className="p-6 lg:p-8 space-y-8">
            <PageHero
                title="Từ vựng"
                subtitle="Ôn tập flashcard và tra cứu từ vựng"
                icon={<Layers className="w-7 h-7" />}
                iconBg="violet"
            >
                <div
                    className="flex gap-1 p-1.5 rounded-xl w-fit"
                    style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                >
                    <motion.button
                        onClick={() => setMode('flashcard')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            mode === 'flashcard' ? 'bg-violet-500 text-white shadow-md' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                        }`}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Layers className="w-4 h-4" />
                        Flashcard
                    </motion.button>
                    <motion.button
                        onClick={() => setMode('list')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            mode === 'list' ? 'bg-violet-500 text-white shadow-md' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                        }`}
                        whileTap={{ scale: 0.98 }}
                    >
                        <List className="w-4 h-4" />
                        Danh sách
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
                                Thử lại
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
                                Chưa có từ vựng nào. Hãy học bài để mở khóa từ vựng!
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-[800px] mx-auto flex flex-col gap-6"
                        >
                            {/* Progress Header - stitch variant 2 */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                                        <Layers className="w-6 h-6 text-primary-500" strokeWidth={2} />
                                        <span className="text-lg font-bold">Vocabulary Flashcards</span>
                                    </div>
                                    <div className="px-3 py-1.5 rounded-full bg-primary-500/10 text-primary-500 text-sm font-bold">
                                        {flashcardIndex + 1} / {flashcards.length} Thẻ
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

                            {/* Flashcard - stitch layout: 65% image, 35% word */}
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
                                                                    title="Phát âm"
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
                                                                Chạm để lật thẻ
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
                                                                &quot;{currentCard.exampleSentence}&quot;
                                                            </p>
                                                        )}
                                                    </div>
                                                }
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Action Controls - stitch variant 2 */}
                            <div className="flex flex-col items-center gap-6 pb-8">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                    Bạn đã trả lời đúng chưa?
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
                                        Học lại
                                    </motion.button>
                                    <motion.button
                                        onClick={handleIKnowThis}
                                        className="group flex-1 h-14 bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={2} />
                                        Tôi biết từ này
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
                    className="space-y-4"
                >
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                        <input
                            type="text"
                            placeholder="Tìm từ vựng..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>
                    <DataTable
                        columns={tableColumns}
                        data={listVocab as unknown as Record<string, unknown>[]}
                        loading={listLoading}
                        emptyMessage={
                            searchTerm
                                ? `Không tìm thấy từ cho "${searchTerm}"`
                                : 'Nhập từ khóa để tìm kiếm.'
                        }
                    />
                </motion.div>
            )}
        </div>
    )
}
