package Drivon.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.File;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender emailSender;

    public void sendVerificationCode(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Mã xác thực hợp đồng");
        message.setText("Mã xác thực của bạn là: " + code + "\nMã này sẽ hết hạn sau 2 phút.");
        emailSender.send(message);
    }

    public void sendContractPDF(String to, String contractId) throws MessagingException {
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(to);
        helper.setSubject("Hợp đồng cho thuê xe");
        helper.setText("Đính kèm là bản hợp đồng cho thuê xe của bạn");

        // Đọc file PDF từ thư mục lưu trữ
        File pdfFile = new File("contracts/" + contractId + ".pdf");
        helper.addAttachment("hopdong.pdf", pdfFile);

        emailSender.send(message);
    }

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String to, String verificationCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Xác thực email - Drivon");
        message.setText("Xin chào,\n\n"
                + "Cảm ơn bạn đã đăng ký tài khoản tại Drivon. Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã xác thực sau:\n\n"
                + verificationCode + "\n\n"
                + "Mã xác thực này sẽ hết hạn sau 5 phút.\n\n"
                + "Nếu bạn không yêu cầu đăng ký tài khoản này, vui lòng bỏ qua email này.\n\n"
                + "Trân trọng,\n"
                + "Đội ngũ Drivon");
        mailSender.send(message);
    }

    public void sendPasswordResetCode(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Đặt lại mật khẩu - Drivon");
        message.setText("Xin chào,\n\n"
                + "Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã xác thực sau:\n\n"
                + code + "\n\n"
                + "Mã xác thực này sẽ hết hạn sau 5 phút.\n\n"
                + "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\n"
                + "Trân trọng,\n"
                + "Đội ngũ Drivon");
        mailSender.send(message);
    }
}