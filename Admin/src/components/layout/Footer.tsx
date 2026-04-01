import { Github, Globe, Mail, Heart, Shield, Zap } from 'lucide-react'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="w-full border-t bg-card/80 backdrop-blur-md py-4 px-8 shadow-inner z-10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col gap-1 items-center md:items-start text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary fill-current" />
                        <p className="font-semibold text-foreground">
                            &copy; {currentYear} <span className="text-primary">EnglishLearn</span>
                        </p>
                    </div>
                    <p className="text-[10px] opacity-70 ml-6 uppercase tracking-widest font-bold">
                        Hệ thống đào tạo ngôn ngữ • v1.2.0
                    </p>
                </div>

                <div className="flex items-center gap-8">
                    <a href="#" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
                        <Mail className="h-3.5 w-3.5" />
                        <span>Hỗ trợ</span>
                    </a>
                    <a href="#" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
                        <Globe className="h-3.5 w-3.5" />
                        <span>Tài liệu</span>
                    </a>
                    <a href="#" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
                        <Shield className="h-3.5 w-3.5" />
                        <span>Bảo mật</span>
                    </a>
                    <Separator className="h-4 w-[1px] bg-border hidden md:block" />
                    <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-all hover:scale-110">
                        <Github className="h-4 w-4" />
                    </a>
                </div>

                <div className="hidden lg:flex items-center gap-2 text-[10px] text-muted-foreground font-semibold">
                    <span>Powering English Excellence</span>
                    <Heart className="h-3 w-3 text-red-500 fill-current animate-pulse" />
                </div>
            </div>
        </footer>
    )
}

function Separator({ className }: { className?: string }) {
    return <div className={className} />
}
