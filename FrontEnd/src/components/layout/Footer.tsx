const Footer = () => {
    return (
        <footer className="border-t transition-colors" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">E</span>
                            </div>
                            <span className="text-xl font-bold gradient-text">EnglishLearn</span>
                        </div>
                        <p style={{ color: 'var(--color-text-secondary)' }} className="max-w-md">
                            Nền tảng học tiếng Anh trực tuyến dành cho học sinh.
                            Học mọi lúc, mọi nơi với phương pháp hiện đại.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Liên kết</h3>
                        <ul className="space-y-2">
                            {['Về chúng tôi', 'Tính năng', 'Bảng giá', 'Liên hệ'].map((text) => (
                                <li key={text}>
                                    <a href="#" className="hover:opacity-80 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>{text}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Liên hệ</h3>
                        <ul className="space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
                            <li>support@englishlearn.vn</li>
                            <li>1900 1234</li>
                            <li>TP. Hồ Chí Minh, Việt Nam</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t mt-8 pt-8 text-center" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                    <p>&copy; 2026 EnglishLearn. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
