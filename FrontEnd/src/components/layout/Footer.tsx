import { GraduationCap, Trophy, Settings, Github } from 'lucide-react'

const Footer = () => {
    return (
        <footer className="bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-40 py-12">
            <div className="max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="size-8 text-primary-500 flex items-center justify-center">
                            <GraduationCap className="w-7 h-7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </div>
                        <span className="text-slate-900 dark:text-white font-bold text-xl">EnglishLearn</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8">
                        <a
                            href="#"
                            className="text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-500 font-medium transition-colors"
                        >
                            Chính sách bảo mật
                        </a>
                        <a
                            href="#"
                            className="text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-500 font-medium transition-colors"
                        >
                            Điều khoản dịch vụ
                        </a>
                        <a
                            href="#"
                            className="text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-500 font-medium transition-colors"
                        >
                            Liên hệ hỗ trợ
                        </a>
                    </div>

                    <div className="flex gap-4">
                        <a
                            href="/leaderboard"
                            className="size-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary-500 hover:scale-110 transition-all shadow-sm"
                        >
                            <Trophy className="w-5 h-5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </a>
                        <a
                            href="/settings"
                            className="size-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary-500 hover:scale-110 transition-all shadow-sm"
                        >
                            <Settings className="w-5 h-5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </a>
                        <a
                            href="https://github.com/PhamMinhKha0710/weblearnenglish"
                            className="size-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary-500 hover:scale-110 transition-all shadow-sm"
                        >
                            <Github className="w-5 h-5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </a>
                    </div>
                </div>

                <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 text-sm">© 2026 EnglishLearn. Mọi quyền được bảo lưu.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
