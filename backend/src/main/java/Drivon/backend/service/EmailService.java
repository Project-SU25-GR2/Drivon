package Drivon.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

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

    public void sendContractPDF(String to, String pdfPath) {
        // TODO: Implement PDF sending functionality
        // This would require using MimeMessage and attachments
    }
}