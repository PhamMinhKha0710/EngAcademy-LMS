/**
 * Event to signal that daily quest progress may have changed.
 * Dispatch when user completes vocab review, lesson, or exam.
 * Sidebar listens and refetches quest data.
 */
export const QUEST_PROGRESS_CHANGED = 'quest-progress-changed'

export function triggerQuestRefresh() {
    window.dispatchEvent(new CustomEvent(QUEST_PROGRESS_CHANGED))
}
