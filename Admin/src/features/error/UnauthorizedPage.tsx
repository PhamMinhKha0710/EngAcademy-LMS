import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'

export default function UnauthorizedPage() {
    const navigate = useNavigate()

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
            <div className="bg-destructive/10 p-6 rounded-full mb-6">
                <ShieldAlert className="h-16 w-16 text-destructive" />
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">
                403 - Truy cập bị từ chối
            </h1>

            <p className="text-xl text-muted-foreground max-w-md mx-auto mb-8">
                Rất tiếc, bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là một lỗi.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate(-1)}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" /> Quay lại
                </Button>

                <Button
                    size="lg"
                    onClick={() => navigate('/')}
                    className="gap-2"
                >
                    <Home className="h-4 w-4" /> Về trang chủ
                </Button>
            </div>

            <div className="mt-12 p-4 border rounded-lg bg-muted/50 max-w-sm">
                <p className="text-sm font-medium">Bạn cần trợ giúp?</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Gửi email cho chúng tôi tại <span className="font-semibold">support@englishlearn.com</span>
                </p>
            </div>
        </div>
    )
}
