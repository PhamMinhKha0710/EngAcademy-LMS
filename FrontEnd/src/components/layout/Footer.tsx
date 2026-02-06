const Footer = () => {
    return (
        <footer className="bg-slate-900 border-t border-slate-700/50">
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
                        <p className="text-slate-400 max-w-md">
                            Nền tảng học tiếng Anh trực tuyến dành cho học sinh lớp 6.
                            Học mọi lúc, mọi nơi với phương pháp hiện đại.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Liên kết</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Về chúng tôi</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Tính năng</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Bảng giá</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Liên hệ</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Liên hệ</h3>
                        <ul className="space-y-2 text-slate-400">
                            <li>📧 support@englishlearn.vn</li>
                            <li>📞 1900 1234</li>
                            <li>📍 TP. Hồ Chí Minh, Việt Nam</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-700/50 mt-8 pt-8 text-center text-slate-400">
                    <p>© 2026 EnglishLearn. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
