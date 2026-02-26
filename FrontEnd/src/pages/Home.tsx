import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Languages, FileText, Trophy, Flame, Award } from 'lucide-react'

const features = [
    {
        icon: BookOpen,
        title: 'Bài học phong phú',
        description: 'Hàng trăm bài học từ cơ bản đến nâng cao',
    },
    {
        icon: Languages,
        title: 'Từ vựng đa dạng',
        description: 'Flashcard và bài tập giúp ghi nhớ lâu hơn',
    },
    {
        icon: FileText,
        title: 'Bài thi trực tuyến',
        description: 'Kiểm tra kiến thức với hệ thống chống gian lận',
    },
    {
        icon: Trophy,
        title: 'Bảng xếp hạng',
        description: 'Cạnh tranh và thi đua cùng bạn bè',
    },
    {
        icon: Flame,
        title: 'Nhiệm vụ hàng ngày',
        description: 'Duy trì streak để nhận thưởng mỗi ngày',
    },
    {
        icon: Award,
        title: 'Huy hiệu thành tích',
        description: 'Đạt huy hiệu khi hoàn thành thử thách',
    },
]

export default function Home() {
    // TODO: Fetch real system statistics from a public API when available.
    // Tạm thời sử dụng placeholder data theo yêu cầu cho tới khi có API ("tạm ẩn/dùng placeholder có ghi chú").
    const [stats] = useState([
        { value: '1000+', label: 'Học sinh' },
        { value: '200+', label: 'Bài học' },
        { value: '5000+', label: 'Từ vựng' },
    ])

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-24 lg:py-36 overflow-hidden">
                {/* Background decorations */}
                <div
                    className="absolute inset-0 opacity-40"
                    style={{
                        background:
                            'radial-gradient(ellipse at 30% 20%, rgba(59,130,246,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(16,185,129,0.12) 0%, transparent 50%)',
                    }}
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl opacity-20 bg-blue-500 pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
                        <span className="gradient-text">Học Tiếng Anh</span>
                        <br />
                        <span className="gradient-text">Thông Minh</span>
                    </h1>

                    <p
                        className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        Nền tảng học tiếng Anh trực tuyến hiện đại. Học từ vựng, luyện thi,
                        theo dõi tiến độ và thi đua cùng bạn bè với phương pháp khoa học.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="btn-primary text-lg px-8 py-4">
                            Bắt đầu học
                        </Link>
                        <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                            Đăng nhập
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20" style={{ background: 'var(--color-bg-secondary)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                            Tính năng nổi bật
                        </h2>
                        <p className="max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
                            Trải nghiệm học tập toàn diện với các công cụ hiện đại
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon
                            return (
                                <div
                                    key={index}
                                    className="card p-6 group hover:scale-[1.02] transition-all duration-300"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 flex items-center justify-center mb-4 group-hover:from-blue-500/30 group-hover:to-emerald-500/30 transition-colors">
                                        <Icon className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <h3
                                        className="text-lg font-semibold mb-2 group-hover:text-blue-500 transition-colors"
                                        style={{ color: 'var(--color-text)' }}
                                    >
                                        {feature.title}
                                    </h3>
                                    <p style={{ color: 'var(--color-text-secondary)' }}>
                                        {feature.description}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {stats.map((stat, index) => (
                            <div key={index} className="card p-8 text-center">
                                <div className="text-4xl md:text-5xl font-extrabold gradient-text mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20" style={{ background: 'var(--color-bg-secondary)' }}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div
                        className="card p-12 relative overflow-hidden"
                        style={{ border: '1px solid var(--color-border)' }}
                    >
                        {/* Decorative gradient behind card content */}
                        <div
                            className="absolute inset-0 opacity-30 pointer-events-none"
                            style={{
                                background:
                                    'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(16,185,129,0.15) 100%)',
                            }}
                        />

                        <div className="relative">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                                Sẵn sàng bắt đầu?
                            </h2>
                            <p className="mb-8 max-w-lg mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
                                Đăng ký miễn phí ngay hôm nay và bắt đầu hành trình chinh phục tiếng Anh!
                            </p>
                            <Link to="/register" className="btn-primary text-lg px-8 py-4 inline-block">
                                Đăng ký ngay
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
