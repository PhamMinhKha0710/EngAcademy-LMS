import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

interface QuizOption {
    id: number
    optionText: string
    isCorrect: boolean
}

interface Question {
    questionText: string
    questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_IN_BLANK'
    options: QuizOption[]
}

interface QuizQuestionProps {
    question: Question
    selectedOptionIds: number[]
    onSelect: (optionIds: number[], textAnswer?: string) => void
    showResult?: boolean
    disabled?: boolean
}

export default function QuizQuestion({
    question,
    selectedOptionIds,
    onSelect,
    showResult = false,
    disabled = false,
}: QuizQuestionProps) {
    const [textAnswer, setTextAnswer] = useState('')

    const handleOptionSelect = (optionId: number) => {
        if (disabled) return
        onSelect([optionId])
    }

    const handleTextChange = (value: string) => {
        if (disabled) return
        setTextAnswer(value)
        onSelect([], value)
    }

    const getOptionClasses = (option: QuizOption) => {
        const isSelected = selectedOptionIds.includes(option.id)
        const base =
            'w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3'

        if (showResult) {
            if (option.isCorrect) {
                return `${base} border-green-500 bg-green-500/10 text-green-400`
            }
            if (isSelected && !option.isCorrect) {
                return `${base} border-red-500 bg-red-500/10 text-red-400`
            }
            return `${base} border-slate-700 opacity-50`
        }

        if (isSelected) {
            return `${base} border-blue-500 bg-blue-500/10`
        }

        return `${base} border-slate-700 hover:border-slate-500 hover:bg-slate-800/50`
    }

    const renderOptionIcon = (option: QuizOption) => {
        const isSelected = selectedOptionIds.includes(option.id)

        if (showResult) {
            if (option.isCorrect) {
                return <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
            }
            if (isSelected && !option.isCorrect) {
                return <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            }
        }

        return (
            <div
                className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-600'
                }`}
            >
                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
        )
    }

    return (
        <div className="w-full">
            {/* Question text */}
            <h3
                className="text-lg font-semibold mb-6"
                style={{ color: 'var(--color-text)' }}
            >
                {question.questionText}
            </h3>

            {/* MULTIPLE_CHOICE */}
            {question.questionType === 'MULTIPLE_CHOICE' && (
                <div className="space-y-3">
                    {question.options.map((option) => (
                        <button
                            key={option.id}
                            className={getOptionClasses(option)}
                            onClick={() => handleOptionSelect(option.id)}
                            disabled={disabled}
                            style={{ color: showResult ? undefined : 'var(--color-text)' }}
                        >
                            {renderOptionIcon(option)}
                            <span>{option.optionText}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* TRUE_FALSE */}
            {question.questionType === 'TRUE_FALSE' && (
                <div className="grid grid-cols-2 gap-4">
                    {question.options.map((option) => (
                        <button
                            key={option.id}
                            className={getOptionClasses(option)}
                            onClick={() => handleOptionSelect(option.id)}
                            disabled={disabled}
                            style={{ color: showResult ? undefined : 'var(--color-text)' }}
                        >
                            <div className="flex items-center justify-center gap-2 w-full">
                                {showResult && option.isCorrect && (
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                )}
                                {showResult &&
                                    selectedOptionIds.includes(option.id) &&
                                    !option.isCorrect && (
                                        <XCircle className="w-5 h-5 text-red-400" />
                                    )}
                                <span className="font-medium text-lg">{option.optionText}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* FILL_IN_BLANK */}
            {question.questionType === 'FILL_IN_BLANK' && (
                <div>
                    <input
                        type="text"
                        value={textAnswer}
                        onChange={(e) => handleTextChange(e.target.value)}
                        placeholder="Nhập câu trả lời..."
                        disabled={disabled}
                        className={`input-field ${
                            showResult
                                ? question.options.some(
                                      (o) =>
                                          o.isCorrect &&
                                          o.optionText.toLowerCase() ===
                                              textAnswer.toLowerCase()
                                  )
                                    ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                                    : 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                : ''
                        }`}
                    />
                    {showResult && (
                        <p className="mt-2 text-sm text-green-400">
                            Đáp án đúng:{' '}
                            {question.options
                                .filter((o) => o.isCorrect)
                                .map((o) => o.optionText)
                                .join(', ')}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
