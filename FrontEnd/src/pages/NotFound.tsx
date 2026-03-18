import { Link, useNavigate } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-bg-primary)' }}>
            <div className="max-w-lg w-full text-center space-y-8">
                {/* 404 Visual */}
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full mix-blend-multiply" />
                    <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-500 mb-2">
                        404
                    </h1>
                </div>

                <div className="space-y-4">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
                        <FileQuestion className="w-8 h-8 text-blue-500" />
                    </div>

                    <h2 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
                        Không tìm thấy trang
                    </h2>

                    <p className="text-lg max-w-md mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
                        Đường dẫn bạn đang tìm kiếm không tồn tại hoặc đã được gỡ bỏ.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-secondary flex items-center justify-center w-full sm:w-auto px-6 py-3"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Quay lại
                    </button>
                    <Link
                        to="/"
                        className="btn-primary flex items-center justify-center w-full sm:w-auto px-6 py-3"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        Trang chủ
                    </Link>
                </div>

                {/* Decorative Elements */}
                <div className="hidden sm:block absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="hidden sm:block absolute bottom-1/4 right-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            </div>
        </div>
    );
};

export default NotFound;
