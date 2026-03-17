import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PlayCircle, CheckCircle, Swords, Medal, Users, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../services/api/axios'
import { useTranslation } from 'react-i18next'

const features = [
    {
        icon: Swords,
        titleKey: 'home.featureDailyQuestTitle',
        descriptionKey: 'home.featureDailyQuestDesc',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDMYqtATszxfQEnl3EaAYG5Wcswei8sUjuhQwQJ8afNVI_eT-_8FRNUHFqhXuTIL_lZ7Dy1MdQSBA47DVFWQPwMQGfgIsg42g71QAHJBmAxVBCCwbMDtKI-86Qez-a9WGQN_O-0zHrpYIDG8kusB-j02FmmxjVOZWgs40WdN9pYf7hKso9qmZ-wmTZ2gGQPnryUg8Z48ntI33beRh04l_GKIfJfeE5hPR_z-LXeQiuWSzdTkOiQo1Aw5uRQOnFwSUJ6m4GugTFVGth',
    },
    {
        icon: Medal,
        titleKey: 'home.featureRewardsTitle',
        descriptionKey: 'home.featureRewardsDesc',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBP25PjO3bnvulx4HKg4wPIDOuXYrY2jr0_CPzXhyF1nekYrNLYujvDKe53DA2mTNrAwIAset-ehqoG14Sj_4COWojQcku0JAmoXkEOf-hT-I4UbxxySjPipscGubBrd_kDVKDS6wC-cx9n8gOSYk2qR2MJQowCzSoRdzCOJ-UMn1QWJlWcHHa5EGvALRPAS0022Eij-k0HzjTl8a5O2yMDoGxG7fuZgr24BrpAgH-jKXkR-oLSBErL4KfE_sppxWpSx1fDAWQrU9rp',
    },
    {
        icon: Users,
        titleKey: 'home.featureFriendsTitle',
        descriptionKey: 'home.featureFriendsDesc',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2M_RourhlvV6L1ILZ-u-_gudAyuUdyrjxxMOhjqaYxhHk6B8y9zhskzbkATrjLtjAkzUVz6C1IsjJu_Awf3R_r4JiToPNrN2KofvoePhXB9iqyw1miCPwVpPoWdCJk39gfjMNjIbcLcW8693bVAuL_9NATJ4pYiL0HKHvgetGdXNN_NswgpkINdXdDqpeNv9GCtjcsVpjkg_GdwGiyHd2uXJDO8eKfBuBMkQEIOpzB3-RewhYrVW0O8vj0J8_ZczLkj3Opt191EKi',
    },
]

interface PublicStats {
    studentCount: number
    lessonCount: number
    vocabularyCount?: number
}

const statsFallback = [
    { value: '10k+', labelKey: 'home.statsHappyStudents' },
    { value: '5k+', labelKey: 'home.statsInteractiveLessons' },
    { value: '4.9/5', labelKey: 'home.statsParentRating' },
]

const MASCOT_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtd7mt0ekSY10QordPHDYNEfpQitEw3A8HZy-PRtH0z2AniqT8xAVPG-usG-jT94dkv664nmc2P3taW1pGfKJuT-uxOhb5JvXixQnzY4bheaW7nyvdoWxO7hF0ljMtHSpsYwGYPsZ8lANpI-fOl34tlpfya4UEJGumXnUdQXCLlS8wgui7uUIlwVSpj-tOVTgvWig3VcwlFahRhRblKIeaLPnKGtvK1Oq3SSCaJfaIzuOQ5E52ll4jRDFqdgdTlcGJowefbh_JlRbK'

export default function Home() {
    const { t } = useTranslation()
    const [stats, setStats] = useState<{ value: string; labelKey: string }[] | null>(null)

    useEffect(() => {
        api.get<{ data: PublicStats } | { data: { data: PublicStats } }>('/public/stats')
            .then((res) => {
                const raw = res.data as { data?: PublicStats }
                const d = raw?.data ?? raw
                if (d && 'studentCount' in d && 'lessonCount' in d) {
                    const studentLabel = d.studentCount >= 1000 ? `${(d.studentCount / 1000).toFixed(0)}k+` : d.studentCount.toString()
                    const lessonLabel = d.lessonCount >= 1000 ? `${(d.lessonCount / 1000).toFixed(0)}k+` : d.lessonCount.toString()
                    setStats([
                        { value: studentLabel, labelKey: 'home.statsHappyStudents' },
                        { value: lessonLabel, labelKey: 'home.statsInteractiveLessons' },
                        { value: '4.9/5', labelKey: 'home.statsParentRating' },
                    ])
                } else {
                    setStats(statsFallback)
                }
            })
            .catch(() => setStats(statsFallback))
    }, [])

    const statsToShow = stats ?? statsFallback

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden">
            {/* Hero Section */}
            <section className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-40 py-12 md:py-20 lg:py-24">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex flex-col-reverse lg:flex-row gap-12 items-center">
                        {/* Left content */}
                        <div className="flex flex-col gap-6 flex-1 text-center lg:text-left">
                            <div className="space-y-4">
                                <span className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-primary-500 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {t('home.forStudents')}
                                </span>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white">
                                    {t('home.heroTitle')}
                                </h1>
                                <span className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-orange-600">
                                    {t('home.heroSubtitle')}
                                </span>
                                <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                    {t('home.heroDescription')}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                                <Link
                                    to="/register"
                                    className="flex items-center justify-center h-14 px-8 rounded-full bg-primary-500 hover:bg-orange-600 text-white text-base font-bold transition-all transform hover:scale-105 shadow-xl shadow-orange-500/20"
                                >
                                    {t('home.startLearning')}
                                </Link>
                                <Link
                                    to="/login"
                                    className="flex items-center justify-center h-14 px-8 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-base font-bold hover:border-primary-500 hover:text-primary-500 dark:hover:border-primary-500 dark:hover:text-primary-500 transition-all"
                                >
                                    <PlayCircle className="w-5 h-5 mr-2" strokeWidth={2} />
                                    {t('home.viewDemo')}
                                </Link>
                            </div>
                            {/* Stats within Hero - Desktop */}
                            <div className="hidden lg:flex gap-12 pt-8 border-t border-slate-200 dark:border-slate-800 mt-4">
                                {statsToShow.map((s, i) => (
                                    <div key={i}>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white">{s.value}</p>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">{t(s.labelKey)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right - Mascot image */}
                        <div className="flex-1 w-full flex justify-center lg:justify-end relative group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-200 to-yellow-100 dark:from-orange-900/40 dark:to-yellow-900/20 rounded-full blur-3xl opacity-60 transform scale-90 group-hover:scale-100 transition-transform duration-700" />
                            <div
                                className="relative w-full aspect-square max-w-[500px] rounded-3xl overflow-hidden shadow-2xl bg-orange-50 dark:bg-slate-800 border-4 border-white dark:border-slate-700"
                                style={{
                                    backgroundImage: `url('${MASCOT_IMAGE}')`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                            {/* Floating badge - Daily Goal */}
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute -bottom-6 -left-6 md:bottom-10 md:-left-10 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-3"
                            >
                                <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full text-green-600 dark:text-green-400">
                                    <CheckCircle className="w-5 h-5" strokeWidth={2} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Mục tiêu hàng ngày</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Hoàn thành!</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mobile Stats Bar */}
            <section className="lg:hidden px-6 py-8 bg-white dark:bg-slate-800 border-y border-slate-100 dark:border-slate-700">
                <div className="flex flex-wrap justify-around gap-6 text-center">
                    {statsToShow.map((s, i) => (
                        <div key={i} className="flex flex-col gap-1">
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t(s.labelKey)}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-40 py-16 md:py-24 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
                                {t('home.whyKidsLove')}
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400">
                                {t('home.weMakeGrammarFun')}
                            </p>
                        </div>
                        <Link
                            to="/register"
                            className="hidden md:flex items-center gap-2 text-primary-500 font-bold hover:gap-3 transition-all"
                        >
                            {t('home.viewAllFeatures')} <ArrowRight className="w-5 h-5" strokeWidth={2} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((f, i) => {
                            const Icon = f.icon
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.1 }}
                                    className="bg-background-light dark:bg-background-dark rounded-3xl p-2 pb-6 hover:-translate-y-2 transition-transform duration-300 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl"
                                >
                                    <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800 mb-6 overflow-hidden relative group">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                            style={{ backgroundImage: `url('${f.imageUrl}')` }}
                                        />
                                        <div className="absolute top-4 left-4 bg-white dark:bg-slate-900 p-2 rounded-xl shadow-md">
                                            <Icon className="w-6 h-6 text-primary-500" strokeWidth={2} />
                                        </div>
                                    </div>
                                    <div className="px-4">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                            {t(f.titleKey)}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {t(f.descriptionKey)}
                                        </p>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                    <div className="mt-8 text-center md:hidden">
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 text-primary-500 font-bold hover:gap-3 transition-all"
                        >
                            {t('home.viewAllFeatures')} <ArrowRight className="w-5 h-5" strokeWidth={2} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-40 py-20 bg-background-light dark:bg-background-dark">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="rounded-3xl p-12 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50"
                    >
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
                            {t('home.readyToStart')}
                        </h2>
                        <p className="mb-8 max-w-lg mx-auto text-slate-600 dark:text-slate-400">
                            {t('home.registerFree')}
                        </p>
                        <Link
                            to="/register"
                            className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-primary-500 hover:bg-orange-600 text-white text-base font-bold transition-all transform hover:scale-105 shadow-xl shadow-orange-500/20"
                        >
                            {t('home.registerCta')}
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
