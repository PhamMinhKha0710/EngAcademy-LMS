package com.englishlearn.application.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Gửi email OTP để reset mật khẩu - HTML template chuyên nghiệp
     */
    @Async
    public void sendOtpEmail(String toEmail, String fullName, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "English Learning Platform");
            helper.setTo(toEmail);
            helper.setSubject("🔐 Mã OTP Khôi Phục Mật Khẩu");
            helper.setText(buildOtpHtml(fullName, otp), true);

            mailSender.send(message);
            log.info("OTP email sent to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Không thể gửi email. Vui lòng thử lại sau.");
        } catch (Exception e) {
            log.error("Unexpected error sending OTP email: {}", e.getMessage());
            throw new RuntimeException("Không thể gửi email. Vui lòng thử lại sau.");
        }
    }

    private String buildOtpHtml(String fullName, String otp) {
        String displayName = (fullName != null && !fullName.isBlank()) ? fullName : "bạn";
        String[] otpChars = otp.split("");
        StringBuilder otpBoxes = new StringBuilder();
        for (String ch : otpChars) {
            otpBoxes.append(
                    "<td style=\"padding:0 6px;\">" +
                            "<div style=\"" +
                            "width:48px;height:56px;" +
                            "background:#F0F4FF;" +
                            "border:2px solid #4F7BEF;" +
                            "border-radius:10px;" +
                            "display:flex;align-items:center;justify-content:center;" +
                            "font-size:28px;font-weight:800;color:#1A2B6B;" +
                            "font-family:'Segoe UI',Arial,sans-serif;" +
                            "line-height:56px;text-align:center;" +
                            "\">" + ch + "</div>" +
                            "</td>");
        }

        return "<!DOCTYPE html>" +
                "<html lang=\"vi\">" +
                "<head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\"></head>"
                +
                "<body style=\"margin:0;padding:0;background:#F3F6FD;font-family:'Segoe UI',Roboto,Arial,sans-serif;\">"
                +
                "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#F3F6FD;padding:40px 0;\">"
                +
                "<tr><td align=\"center\">" +
                "<table width=\"560\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(79,123,239,0.12);\">"
                +

                // Header
                "<tr><td style=\"background:linear-gradient(135deg,#4F7BEF 0%,#764EEF 100%);padding:40px 40px 30px;text-align:center;\">"
                +
                "<div style=\"font-size:40px;margin-bottom:10px;\">🎓</div>" +
                "<h1 style=\"margin:0;color:#FFFFFF;font-size:22px;font-weight:700;letter-spacing:0.5px;\">English Learning Platform</h1>"
                +
                "<p style=\"margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;\">Nền tảng học tiếng Anh thông minh</p>"
                +
                "</td></tr>" +

                // Body
                "<tr><td style=\"padding:40px 40px 32px;\">" +
                "<p style=\"margin:0 0 6px;font-size:16px;color:#555;\">Xin chào, <strong style=\"color:#1A2B6B;\">"
                + displayName + "</strong>!</p>" +
                "<p style=\"margin:0 0 28px;font-size:15px;color:#666;line-height:1.6;\">" +
                "Chúng tôi nhận được yêu cầu <strong>khôi phục mật khẩu</strong> cho tài khoản của bạn. " +
                "Sử dụng mã OTP bên dưới để đặt lại mật khẩu:" +
                "</p>" +

                // OTP Box
                "<div style=\"background:#F8FAFF;border:1.5px dashed #B0C4F8;border-radius:14px;padding:28px 20px;text-align:center;margin-bottom:28px;\">"
                +
                "<p style=\"margin:0 0 16px;font-size:13px;color:#8898C0;font-weight:600;text-transform:uppercase;letter-spacing:1px;\">Mã xác nhận OTP</p>"
                +
                "<table cellpadding=\"0\" cellspacing=\"0\" style=\"display:inline-table;\">" +
                "<tr>" + otpBoxes + "</tr>" +
                "</table>" +
                "<p style=\"margin:18px 0 0;font-size:13px;color:#EF4F4F;font-weight:600;\">⏰ Mã hết hạn sau <strong>10 phút</strong></p>"
                +
                "</div>" +

                // Warning
                "<div style=\"background:#FFF8E1;border-left:4px solid #FFB300;border-radius:8px;padding:14px 18px;margin-bottom:28px;\">"
                +
                "<p style=\"margin:0;font-size:13px;color:#7A5800;\">" +
                "<strong>⚠️ Lưu ý bảo mật:</strong> Không chia sẻ mã OTP này với bất kỳ ai. " +
                "Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này." +
                "</p>" +
                "</div>" +

                "<p style=\"margin:0;font-size:14px;color:#888;line-height:1.6;\">Trân trọng,<br><strong style=\"color:#4F7BEF;\">Đội ngũ English Learning Platform</strong></p>"
                +
                "</td></tr>" +

                // Footer
                "<tr><td style=\"background:#F8FAFF;padding:20px 40px;text-align:center;border-top:1px solid #EEF1FA;\">"
                +
                "<p style=\"margin:0;font-size:12px;color:#AAB4CC;\">© 2025 English Learning Platform. Tất cả quyền được bảo lưu.</p>"
                +
                "<p style=\"margin:6px 0 0;font-size:12px;color:#AAB4CC;\">Đây là email tự động, vui lòng không trả lời.</p>"
                +
                "</td></tr>" +

                "</table>" +
                "</td></tr>" +
                "</table>" +
                "</body></html>";
    }
}
