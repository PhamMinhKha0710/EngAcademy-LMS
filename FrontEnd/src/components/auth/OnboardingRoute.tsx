import { Navigate } from 'react-router-dom'
import { useLearningProfileStore } from '../../store/learningProfileStore'

export default function OnboardingRoute() {
  const { onboardingCompleted, isLoading } = useLearningProfileStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (!onboardingCompleted) {
    // Lazy-load to avoid circular dependency at module init
    const { default: OnboardingWizard } = require('../../pages/student/OnboardingWizard')
    return <OnboardingWizard />
  }

  return <Navigate to="/dashboard" replace />
}
