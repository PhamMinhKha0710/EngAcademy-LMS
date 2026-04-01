import type { FC } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
    LayoutDashboard,
    ClipboardList,
    BookOpen,
    Languages,
    FileText,
    Trophy,
    BookMarked,
    Award,
    Settings,
    GraduationCap,
    HelpCircle,
    BarChart3,
    Flame,
    Home,
    PlayCircle,
} from 'lucide-react'

export type AppIconName =
    | 'dashboard'
    | 'dailyQuests'
    | 'lessons'
    | 'vocabulary'
    | 'exams'
    | 'leaderboard'
    | 'mistakeNotebook'
    | 'badges'
    | 'settings'
    | 'classManagement'
    | 'questions'
    | 'progress'
    | 'streak'
    | 'home'
    | 'play'

const ICON_MAP: Record<AppIconName, LucideIcon> = {
    dashboard: LayoutDashboard,
    dailyQuests: ClipboardList,
    lessons: BookOpen,
    vocabulary: Languages,
    exams: FileText,
    leaderboard: Trophy,
    mistakeNotebook: BookMarked,
    badges: Award,
    settings: Settings,
    classManagement: GraduationCap,
    questions: HelpCircle,
    progress: BarChart3,
    streak: Flame,
    home: Home,
    play: PlayCircle,
}

interface AppIconProps {
    name: AppIconName
    className?: string
}

const AppIcon: FC<AppIconProps> = ({ name, className = '' }) => {
    const Icon = ICON_MAP[name]
    return <Icon className={`w-5 h-5 ${className}`} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
}

export default AppIcon

