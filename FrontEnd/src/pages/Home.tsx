import { Link } from 'react-router-dom'

const Home = () => {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-slate-900 to-emerald-900/30"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            <span className="gradient-text">Học Tiếng Anh</span>
                            <br />
                            <span className="text-white">Thông Minh & Hiệu Quả</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8">
                            Nền tảng học tiếng Anh trực tuyến dành cho học sinh lớp 6.
                            Học từ vựng, ngữ pháp, luyện nghe nói với phương pháp hiện đại.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register" className="btn-primary text-lg px-8 py-4">
                                Bắt đầu miễn phí 🚀
                            </Link>
                            <a href="#features" className="btn-secondary text-lg px-8 py-4">
                                Tìm hiểu thêm
                            </a>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
                        {[
                            { value: '10K+', label: 'Học sinh' },
                            { value: '500+', label: 'Bài học' },
                            { value: '5000+', label: 'Từ vựng' },
                            { value: '98%', label: 'Hài lòng' },
                        ].map((stat, index) => (
                            <div key={index} className="card p-6 text-center">
                                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                                <div className="text-slate-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Tính năng nổi bật
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Trải nghiệm học tập toàn diện với các công cụ hiện đại
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: '📚',
                                title: 'Flashcard Tương Tác',
                                description: 'Học từ vựng với thẻ flash hiện đại, ghi nhớ hiệu quả với Spaced Repetition.',
                            },
                            {
                                icon: '🎤',
                                title: 'Luyện Phát Âm AI',
                                description: 'Đánh giá phát âm bằng AI, nhận phản hồi tức thì để cải thiện.',
                            },
                            {
                                icon: '📝',
                                title: 'Bài Thi Thông Minh',
                                description: 'Đề thi tự động trộn câu hỏi, chống gian lận, chấm điểm tự động.',
                            },
                            {
                                icon: '📊',
                                title: 'Theo Dõi Tiến Độ',
                                description: 'Biểu đồ tiến độ chi tiết, xác định điểm yếu để cải thiện.',
                            },
                            {
                                icon: '🏆',
                                title: 'Xếp Hạng & Phần Thưởng',
                                description: 'Thi đua với bạn bè, thu thập huy hiệu và phần thưởng.',
                            },
                            {
                                icon: '📱',
                                title: 'Học Mọi Nơi',
                                description: 'Hỗ trợ offline, đồng bộ dữ liệu khi có mạng trở lại.',
                            },
                        ].map((feature, index) => (
                            <div key={index} className="card p-6 hover:border-blue-500/50 transition-all duration-300 group">
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="card p-12 bg-gradient-to-r from-blue-900/50 to-emerald-900/50">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Sẵn sàng bắt đầu?
                        </h2>
                        <p className="text-slate-300 mb-8">
                            Đăng ký miễn phí ngay hôm nay và bắt đầu hành trình chinh phục tiếng Anh!
                        </p>
                        <Link to="/register" className="btn-primary text-lg px-8 py-4 inline-block">
                            Đăng ký ngay →
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home
