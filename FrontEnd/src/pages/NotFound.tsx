import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="not-found-page">
            <style>{`
                .not-found-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    position: relative;
                    overflow: hidden;
                    background: var(--color-bg-primary);
                }

                .not-found-page.dark {
                    --color-bg-primary: #0f172a;
                }

                /* Soft background gradient */
                .not-found-bg {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 50%, #faf5ff 100%);
                    z-index: 0;
                }

                .not-found-page.dark .not-found-bg {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
                }

                /* Floating clouds */
                .cloud {
                    position: absolute;
                    border-radius: 9999px;
                    background: rgba(255, 255, 255, 0.7);
                    z-index: 1;
                    pointer-events: none;
                    animation: floatCloud 6s ease-in-out infinite;
                }

                .cloud-1 {
                    width: 120px;
                    height: 40px;
                    top: 15%;
                    left: 8%;
                    animation-delay: 0s;
                }

                .cloud-1::before,
                .cloud-1::after {
                    content: '';
                    position: absolute;
                    background: inherit;
                    border-radius: 50%;
                }

                .cloud-1::before {
                    width: 60px;
                    height: 60px;
                    top: -30px;
                    left: 20px;
                }

                .cloud-1::after {
                    width: 45px;
                    height: 45px;
                    top: -20px;
                    left: 55px;
                }

                .cloud-2 {
                    width: 80px;
                    height: 28px;
                    top: 25%;
                    right: 12%;
                    animation-delay: 1.5s;
                }

                .cloud-2::before,
                .cloud-2::after {
                    content: '';
                    position: absolute;
                    background: inherit;
                    border-radius: 50%;
                }

                .cloud-2::before {
                    width: 40px;
                    height: 40px;
                    top: -20px;
                    left: 15px;
                }

                .cloud-2::after {
                    width: 30px;
                    height: 30px;
                    top: -12px;
                    left: 40px;
                }

                .cloud-3 {
                    width: 100px;
                    height: 34px;
                    bottom: 20%;
                    left: 5%;
                    animation-delay: 3s;
                }

                .cloud-3::before,
                .cloud-3::after {
                    content: '';
                    position: absolute;
                    background: inherit;
                    border-radius: 50%;
                }

                .cloud-3::before {
                    width: 50px;
                    height: 50px;
                    top: -25px;
                    left: 18px;
                }

                .cloud-3::after {
                    width: 38px;
                    height: 38px;
                    top: -16px;
                    left: 48px;
                }

                .not-found-page.dark .cloud {
                    background: rgba(71, 85, 105, 0.3);
                }

                @keyframes floatCloud {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }

                /* Stars */
                .stars {
                    position: absolute;
                    inset: 0;
                    z-index: 1;
                    pointer-events: none;
                }

                .star {
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    background: #fbbf24;
                    border-radius: 50%;
                    animation: twinkle 2s ease-in-out infinite;
                }

                .star::before {
                    content: '';
                    position: absolute;
                    inset: -4px;
                    background: radial-gradient(circle, rgba(251, 191, 36, 0.3), transparent);
                    border-radius: 50%;
                }

                .star-1 { top: 12%; right: 20%; animation-delay: 0s; }
                .star-2 { top: 30%; left: 15%; animation-delay: 0.5s; width: 6px; height: 6px; }
                .star-3 { bottom: 30%; right: 25%; animation-delay: 1s; }
                .star-4 { top: 20%; right: 35%; animation-delay: 1.5s; width: 5px; height: 5px; }
                .star-5 { bottom: 40%; left: 25%; animation-delay: 0.8s; width: 7px; height: 7px; }

                .not-found-page.dark .star {
                    background: #fcd34d;
                }

                @keyframes twinkle {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.3; transform: scale(0.7); }
                }

                /* Main content */
                .not-found-content {
                    position: relative;
                    z-index: 10;
                    max-width: 800px;
                    width: 100%;
                    text-align: center;
                }

                .not-found-404 {
                    font-family: 'Poppins', sans-serif;
                    font-size: 8rem;
                    font-weight: 900;
                    line-height: 1;
                    background: linear-gradient(135deg, #3b82f6 0%, #10b981 50%, #8b5cf6 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 0.5rem;
                    letter-spacing: -4px;
                    animation: floatText 3s ease-in-out infinite;
                }

                @keyframes floatText {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }

                /* Illustration container */
                .illustration-wrapper {
                    position: relative;
                    margin: 1.5rem auto;
                    max-width: 480px;
                    animation: floatIllustration 4s ease-in-out infinite;
                }

                @keyframes floatIllustration {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    33% { transform: translateY(-12px) rotate(0.5deg); }
                    66% { transform: translateY(-6px) rotate(-0.5deg); }
                }

                .illustration-wrapper img {
                    width: 100%;
                    height: auto;
                    border-radius: 24px;
                    box-shadow:
                        0 25px 50px -12px rgba(0, 0, 0, 0.15),
                        0 0 0 1px rgba(255, 255, 255, 0.5) inset;
                    object-fit: contain;
                }

                .not-found-page.dark .illustration-wrapper img {
                    box-shadow:
                        0 25px 50px -12px rgba(0, 0, 0, 0.5),
                        0 0 40px rgba(59, 130, 246, 0.1);
                }

                /* Glow behind image */
                .illustration-glow {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 80%;
                    height: 80%;
                    background: radial-gradient(ellipse, rgba(168, 230, 207, 0.4) 0%, transparent 70%);
                    border-radius: 50%;
                    z-index: -1;
                    filter: blur(20px);
                    pointer-events: none;
                }

                .not-found-page.dark .illustration-glow {
                    background: radial-gradient(ellipse, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
                }

                /* Text content */
                .not-found-title {
                    font-family: 'Poppins', sans-serif;
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--color-text);
                    margin-bottom: 0.5rem;
                    line-height: 1.2;
                }

                .not-found-subtitle {
                    font-family: 'Poppins', sans-serif;
                    font-size: 1.125rem;
                    font-weight: 600;
                    background: linear-gradient(135deg, #3b82f6, #10b981);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 0.75rem;
                }

                .not-found-description {
                    font-size: 1rem;
                    color: var(--color-text-secondary);
                    max-width: 420px;
                    margin: 0 auto 2rem;
                    line-height: 1.6;
                }

                /* Buttons */
                .not-found-buttons {
                    display: flex;
                    flex-direction: column;
                    sm: flex-row;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                }

                @media (min-width: 640px) {
                    .not-found-buttons {
                        flex-direction: row;
                    }
                }

                .not-found-btn-primary {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.875rem 2rem;
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    font-family: 'Poppins', sans-serif;
                    font-weight: 600;
                    font-size: 1rem;
                    border-radius: 14px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
                }

                .not-found-btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5);
                }

                .not-found-btn-primary:active {
                    transform: translateY(0);
                }

                .not-found-btn-secondary {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.875rem 2rem;
                    background: transparent;
                    color: var(--color-text-secondary);
                    font-family: 'Poppins', sans-serif;
                    font-weight: 600;
                    font-size: 1rem;
                    border-radius: 14px;
                    border: 2px solid var(--color-border);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .not-found-btn-secondary:hover {
                    border-color: #3b82f6;
                    color: #3b82f6;
                    transform: translateY(-2px);
                }

                .not-found-btn-secondary:active {
                    transform: translateY(0);
                }

                /* Floating dots decoration */
                .floating-dots {
                    position: absolute;
                    z-index: 1;
                    pointer-events: none;
                }

                .dot {
                    position: absolute;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #a8e6cf, #88d8e8);
                    animation: floatDot 5s ease-in-out infinite;
                }

                .dot-1 { width: 10px; height: 10px; top: 60%; left: 8%; animation-delay: 0s; }
                .dot-2 { width: 14px; height: 14px; top: 40%; right: 6%; animation-delay: 1s; }
                .dot-3 { width: 8px; height: 8px; bottom: 15%; right: 18%; animation-delay: 2s; }
                .dot-4 { width: 12px; height: 12px; bottom: 25%; left: 20%; animation-delay: 1.5s; }

                .not-found-page.dark .dot {
                    background: linear-gradient(135deg, rgba(168, 230, 207, 0.4), rgba(136, 216, 232, 0.4));
                }

                @keyframes floatDot {
                    0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
                    50% { transform: translateY(-15px) scale(1.2); opacity: 1; }
                }

                /* Responsive */
                @media (max-width: 640px) {
                    .not-found-404 {
                        font-size: 5rem;
                        letter-spacing: -2px;
                    }

                    .not-found-title {
                        font-size: 1.5rem;
                    }

                    .not-found-subtitle {
                        font-size: 1rem;
                    }

                    .not-found-description {
                        font-size: 0.9rem;
                        padding: 0 0.5rem;
                    }

                    .illustration-wrapper {
                        max-width: 300px;
                    }

                    .cloud-1, .cloud-3 {
                        display: none;
                    }

                    .star {
                        display: none;
                    }

                    .star-3 {
                        display: block;
                    }
                }

                @media (min-width: 641px) and (max-width: 1024px) {
                    .illustration-wrapper {
                        max-width: 400px;
                    }
                }
            `}</style>

            {/* Background */}
            <div className="not-found-bg" />

            {/* Floating clouds */}
            <div className="cloud cloud-1" />
            <div className="cloud cloud-2" />
            <div className="cloud cloud-3" />

            {/* Stars */}
            <div className="stars">
                <div className="star star-1" />
                <div className="star star-2" />
                <div className="star star-3" />
                <div className="star star-4" />
                <div className="star star-5" />
            </div>

            {/* Floating dots */}
            <div className="floating-dots">
                <div className="dot dot-1" />
                <div className="dot dot-2" />
                <div className="dot dot-3" />
                <div className="dot dot-4" />
            </div>

            {/* Main content */}
            <div className="not-found-content">
                <h1 className="not-found-404">404</h1>

                <div className="illustration-wrapper">
                    <div className="illustration-glow" />
                    <img
                        src="/images/404-illustration.png"
                        alt="404 - Trang không tìm thấy"
                        loading="eager"
                    />
                </div>

                <h2 className="not-found-title">Opps! Trang này đang lạc lối</h2>
                <p className="not-found-subtitle">Có vẻ như bạn đã đi lạc vào vùng ngôn ngữ chưa được khám phá.</p>
                <p className="not-found-description">
                    Đừng lo lắng! Hãy quay về trang chủ để tiếp tục hành trình chinh phục tiếng Anh của bạn.
                </p>

                <div className="not-found-buttons">
                    <button
                        onClick={() => navigate(-1)}
                        className="not-found-btn-secondary"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Quay lại
                    </button>
                    <Link
                        to="/"
                        className="not-found-btn-primary"
                    >
                        <Home className="w-5 h-5" />
                        Quay về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
