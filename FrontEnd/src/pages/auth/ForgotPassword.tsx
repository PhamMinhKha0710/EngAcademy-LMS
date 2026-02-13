import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, KeyRound } from 'lucide-react'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Hiện tại chỉ làm giao diện, chưa có API backend hỗ trợ
        setIsSubmitted(true)
    }

    if (isSubmitted) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="card p-8 text-center">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                                <Mail className="w-8 h-8 text-emerald-500" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                            Kiểm tra email của bạn
                        </h2>
                        <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                            Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến email: <br />
                            <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{email}</span>
                        </p>
                        <p className="mb-8 text-xs italic text-orange-400">
                            (Lưu ý: Chức năng gửi email hiện chưa có Backend hỗ trợ, đây chỉ là mô phỏng giao diện)
                        </p>
                        <Link to="/login" className="btn-primary w-full inline-flex items-center justify-center">
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="card p-8">
                    {/* Icon */}
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                            <KeyRound className="w-7 h-7 text-white" />
                        </div>
                    </div>

                    {/* Heading */}
                    <h2 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--color-text)' }}>
                        Quên mật khẩu?
                    </h2>
                    <p className="text-center mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                        Đừng lo lắng, hãy nhập email của bạn và chúng tôi sẽ hỗ trợ khôi phục.
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                Địa chỉ Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="name@domain.com"
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary w-full shadow-lg shadow-blue-500/20">
                            Gửi yêu cầu khôi phục
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <Link 
                            to="/login" 
                            className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
