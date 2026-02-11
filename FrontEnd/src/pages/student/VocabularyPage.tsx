import { useEffect, useState, useCallback } from 'react'
import {
    Layers,
    List,
    ChevronLeft,
    ChevronRight,
    Search,
    Loader2,
    Volume2,
    BookmarkPlus,
    AlertCircle,
    Shuffle,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { vocabularyApi, VocabularyResponse } from '../../services/api/vocabularyApi'
import { mistakeApi } from '../../services/api/mistakeApi'
import FlashCard from '../../components/ui/FlashCard'
import DataTable from '../../components/ui/DataTable'

type ViewMode = 'flashcard' | 'list'

export default function VocabularyPage() {
    const user = useAuthStore((s) => s.user)

    const [mode, setMode] = useState<ViewMode>('flashcard')

    // Flashcard state
    const [flashcards, setFlashcards] = useState<VocabularyResponse[]>([])
    const [flashcardIndex, setFlashcardIndex] = useState(0)
    const [flashcardLoading, setFlashcardLoading] = useState(true)
    const [flashcardError, setFlashcardError] = useState<string | null>(null)
    const [addingMistake, setAddingMistake] = useState(false)
    const [mistakeAdded, setMistakeAdded] = useState<Set<number>>(new Set())

    // List state
    const [listVocab, setListVocab] = useState<VocabularyResponse[]>([])
    const [listLoading, setListLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)

    // Fetch random flashcards
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

    // Fetch vocabulary list (search)
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

    // Debounced search
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

    const handleAddMistake = async (vocabId: number) => {
        if (!user?.id || addingMistake || mistakeAdded.has(vocabId)) return
        setAddingMistake(true)
        try {
            await mistakeApi.addMistake({ vocabularyId: vocabId })
            setMistakeAdded((prev) => new Set(prev).add(vocabId))
        } catch (err) {
            console.error('Failed to add mistake:', err)
        } finally {
            setAddingMistake(false)
        }
    }

    const currentCard = flashcards[flashcardIndex]

    const tableColumns = [
        {
            key: 'word',
            label: 'Từ vựng',
            render: (item: Record<string, unknown>) => {
                const vocab = item as unknown as VocabularyResponse
                return (
                    <div className="flex items-center gap-2">
                        <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                            {vocab.word}
                        </span>
                        {vocab.audioUrl && (
                            <button
                                onClick={() => playAudio(vocab.audioUrl!)}
                                className="p-1 rounded hover:bg-blue-500/15 text-blue-500 transition-colors"
                                title="Phát âm"
                            >
                                <Volume2 className="w-3.5 h-3.5" />
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
                return (
                    <span style={{ color: 'var(--color-text)' }}>{vocab.meaning}</span>
                )
            },
        },
        {
            key: 'pronunciation',
            label: 'Phiên âm',
            render: (item: Record<string, unknown>) => {
                const vocab = item as unknown as VocabularyResponse
                return (
                    <span
                        className="italic text-sm"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        {vocab.pronunciation ? `/${vocab.pronunciation}/` : '—'}
                    </span>
                )
            },
        },
    ]

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                        Từ vựng
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        Ôn tập và học từ vựng mới
                    </p>
                </div>

                {/* Mode Toggle */}
                <div
                    className="flex gap-1 p-1 rounded-xl w-fit"
                    style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                >
                    <button
                        onClick={() => setMode('flashcard')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            mode === 'flashcard'
                                ? 'bg-blue-500 text-white shadow-sm'
                                : ''
                        }`}
                        style={
                            mode !== 'flashcard'
                                ? { color: 'var(--color-text-secondary)' }
                                : undefined
                        }
                    >
                        <Layers className="w-4 h-4" />
                        Flashcard
                    </button>
                    <button
                        onClick={() => setMode('list')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            mode === 'list'
                                ? 'bg-blue-500 text-white shadow-sm'
                                : ''
                        }`}
                        style={
                            mode !== 'list'
                                ? { color: 'var(--color-text-secondary)' }
                                : undefined
                        }
                    >
                        <List className="w-4 h-4" />
                        Danh sách
                    </button>
                </div>
            </div>

            {/* Flashcard Mode */}
            {mode === 'flashcard' && (
                <div>
                    {flashcardLoading ? (
                        <div className="flex items-center justify-center py-24">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                        </div>
                    ) : flashcardError ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                            <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                                {flashcardError}
                            </p>
                            <button
                                onClick={fetchFlashcards}
                                className="btn-primary mt-4 text-sm"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : flashcards.length === 0 ? (
                        <div className="card p-6">
                            <p
                                className="text-sm text-center py-12"
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                Chưa có từ vựng nào. Hãy học bài để có từ vựng!
                            </p>
                        </div>
                    ) : (
                        <div className="max-w-lg mx-auto space-y-6">
                            {/* Progress indicator */}
                            <div className="flex items-center justify-between">
                                <p
                                    className="text-sm font-medium"
                                    style={{ color: 'var(--color-text-secondary)' }}
                                >
                                    <span style={{ color: 'var(--color-text)' }}>
                                        {flashcardIndex + 1}
                                    </span>
                                    /{flashcards.length}
                                </p>
                                <button
                                    onClick={fetchFlashcards}
                                    className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
                                    style={{
                                        backgroundColor: 'var(--color-bg-tertiary)',
                                        color: 'var(--color-text-secondary)',
                                    }}
                                >
                                    <Shuffle className="w-3.5 h-3.5" />
                                    Trộn lại
                                </button>
                            </div>

                            {/* Progress bar */}
                            <div
                                className="w-full h-1.5 rounded-full overflow-hidden"
                                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                            >
                                <div
                                    className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
                                    style={{
                                        width: `${((flashcardIndex + 1) / flashcards.length) * 100}%`,
                                    }}
                                />
                            </div>

                            {/* Card */}
                            {currentCard && (
                                <FlashCard
                                    key={currentCard.id}
                                    front={
                                        <div>
                                            <p className="text-3xl font-bold mb-2">
                                                {currentCard.word}
                                            </p>
                                            {currentCard.audioUrl && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        playAudio(currentCard.audioUrl!)
                                                    }}
                                                    className="mx-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-blue-500/15 text-blue-500 hover:bg-blue-500/25 transition-colors"
                                                >
                                                    <Volume2 className="w-3.5 h-3.5" />
                                                    Phát âm
                                                </button>
                                            )}
                                        </div>
                                    }
                                    back={
                                        <div className="space-y-2">
                                            <p className="text-xl font-semibold">
                                                {currentCard.meaning}
                                            </p>
                                            {currentCard.pronunciation && (
                                                <p
                                                    className="text-sm italic"
                                                    style={{
                                                        color: 'var(--color-text-secondary)',
                                                    }}
                                                >
                                                    /{currentCard.pronunciation}/
                                                </p>
                                            )}
                                            {currentCard.exampleSentence && (
                                                <p
                                                    className="text-sm mt-3"
                                                    style={{
                                                        color: 'var(--color-text-secondary)',
                                                    }}
                                                >
                                                    "{currentCard.exampleSentence}"
                                                </p>
                                            )}
                                        </div>
                                    }
                                />
                            )}

                            {/* Navigation + Add to mistakes */}
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() =>
                                        setFlashcardIndex((i) => Math.max(0, i - 1))
                                    }
                                    disabled={flashcardIndex === 0}
                                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    style={{
                                        backgroundColor: 'var(--color-bg-tertiary)',
                                        color: 'var(--color-text)',
                                    }}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Trước
                                </button>

                                {currentCard && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleAddMistake(currentCard.id)
                                        }}
                                        disabled={
                                            addingMistake || mistakeAdded.has(currentCard.id)
                                        }
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                            mistakeAdded.has(currentCard.id)
                                                ? 'bg-green-500/15 text-green-400'
                                                : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                                        } disabled:cursor-not-allowed`}
                                    >
                                        <BookmarkPlus className="w-3.5 h-3.5" />
                                        {mistakeAdded.has(currentCard.id)
                                            ? 'Đã thêm'
                                            : 'Thêm vào sổ lỗi'}
                                    </button>
                                )}

                                <button
                                    onClick={() =>
                                        setFlashcardIndex((i) =>
                                            Math.min(flashcards.length - 1, i + 1)
                                        )
                                    }
                                    disabled={flashcardIndex >= flashcards.length - 1}
                                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    style={{
                                        backgroundColor: 'var(--color-bg-tertiary)',
                                        color: 'var(--color-text)',
                                    }}
                                >
                                    Sau
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* List Mode */}
            {mode === 'list' && (
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative w-full sm:w-80">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                            style={{ color: 'var(--color-text-secondary)' }}
                        />
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
                                ? `Không tìm thấy từ vựng cho "${searchTerm}"`
                                : 'Chưa có từ vựng nào.'
                        }
                    />
                </div>
            )}
        </div>
    )
}
