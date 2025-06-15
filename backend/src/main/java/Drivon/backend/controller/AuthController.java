package Drivon.backend.controller;

import Drivon.backend.dto.LoginRequest;
import Drivon.backend.dto.SignupRequest;
import Drivon.backend.model.User;
import Drivon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import Drivon.backend.dto.GoogleAuthRequest;
import Drivon.backend.dto.AuthResponse;
import Drivon.backend.service.UserService;
import Drivon.backend.service.JwtTokenProvider;
import Drivon.backend.model.UserRole;
import Drivon.backend.model.UserStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import java.util.Date;
import org.springframework.util.StringUtils;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import Drivon.backend.dto.ForgotPasswordRequest;
import Drivon.backend.model.PasswordResetToken;
import Drivon.backend.repository.PasswordResetTokenRepository;
import Drivon.backend.service.EmailService;
import Drivon.backend.dto.ChangePasswordRequest;
import Drivon.backend.model.EmailVerificationToken;
import Drivon.backend.repository.EmailVerificationTokenRepository;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Invalid email or password");
        }
        // Tạo token
        String token = jwtTokenProvider.createToken(user.getEmail());
        // Trả về giống Google login
        return ResponseEntity.ok(new AuthResponse(token, user));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest signupRequest, BindingResult bindingResult) {
        // Check for validation errors
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = bindingResult.getFieldErrors().stream()
                    .collect(Collectors.toMap(
                            FieldError::getField,
                            error -> error.getDefaultMessage() != null ? error.getDefaultMessage() : "Invalid value"));
            return ResponseEntity.badRequest().body(errors);
        }

        // Check if email already exists
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            Map<String, String> error = new HashMap<>();
            error.put("email", "Email already exists");
            return ResponseEntity.badRequest().body(error);
        }

        // Check if phone already exists
        if (userRepository.existsByPhone(signupRequest.getPhone())) {
            Map<String, String> error = new HashMap<>();
            error.put("phone", "Phone number already exists");
            return ResponseEntity.badRequest().body(error);
        }

        try {
            User user = new User();
            user.setEmail(signupRequest.getEmail());
            user.setPhone(signupRequest.getPhone());
            user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
            user.setFullName(signupRequest.getFullName());
            user.setAddress(signupRequest.getAddress());
            user.setEmailVerified(false);
            user.setStatus(UserStatus.inactive);

            user = userRepository.save(user);

            // Generate verification code
            String verificationCode = String.format("%06d", (int) (Math.random() * 1000000));

            // Delete existing token if any for this user (optional, but good for cleanup)
            EmailVerificationToken existingToken = emailVerificationTokenRepository.findByUser(user);
            if (existingToken != null) {
                emailVerificationTokenRepository.delete(existingToken);
            }

            // Save verification token
            EmailVerificationToken verificationToken = new EmailVerificationToken(verificationCode, user);
            emailVerificationTokenRepository.save(verificationToken);

            // Send verification email
            emailService.sendVerificationEmail(user.getEmail(), verificationCode);

            return ResponseEntity.ok("Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.");
        } catch (Exception e) {
            logger.error("Error during user registration or email sending: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            // Provide a more generic error message to the user for security/simplicity
            error.put("general", "Đăng ký thất bại. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.");
            // For debugging, you might return e.getMessage() during development, but not in
            // production
            // error.put("general", "Failed to create user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error); // Use 500 for unexpected errors
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // In a token-based system, actual logout happens on the client by removing the
        // token.
        // This endpoint is mainly for confirmation or potential future server-side
        // invalidation.
        return ResponseEntity.ok("Logout successful");
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@RequestBody GoogleAuthRequest request) {
        try {
            if (request.getEmail() == null || request.getGoogleId() == null) {
                return ResponseEntity.badRequest().body("Email and Google ID are required");
            }

            // First check if user exists with this Google ID
            Optional<User> existingGoogleUser = userService.findByGoogleId(request.getGoogleId());
            if (existingGoogleUser.isPresent()) {
                User user = existingGoogleUser.get();
                String token = jwtTokenProvider.createToken(user.getEmail());
                return ResponseEntity.ok(new AuthResponse(token, user));
            }

            // Then check if user exists with this email
            Optional<User> existingUser = userService.findByEmail(request.getEmail());
            if (existingUser.isPresent()) {
                // If user exists with this email, update their Google ID
                User user = existingUser.get();
                user.setGoogleId(request.getGoogleId());
                user.setEmailVerified(true);
                // Update fullName if missing
                if (user.getFullName() == null || user.getFullName().isEmpty()) {
                    user.setFullName(request.getName());
                }
                user = userService.save(user);
                String token = jwtTokenProvider.createToken(user.getEmail());
                return ResponseEntity.ok(new AuthResponse(token, user));
            }

            // If no user exists with this email or Google ID, create new user
            User newUser = new User();
            newUser.setEmail(request.getEmail());
            newUser.setGoogleId(request.getGoogleId());
            newUser.setFullName(request.getName());
            newUser.setEmailVerified(true);
            newUser.setRole(UserRole.renter);
            newUser.setStatus(UserStatus.active);

            try {
                newUser = userService.save(newUser);
                String token = jwtTokenProvider.createToken(newUser.getEmail());
                return ResponseEntity.ok(new AuthResponse(token, newUser));
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error saving new user: " + e.getMessage());
            }

        } catch (Exception e) {
            e.printStackTrace(); // Add this for server-side logging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error during Google authentication: " + e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            logger.info("Processing forgot password request for email: {}", request.getEmail());

            if (!StringUtils.hasText(request.getEmail())) {
                return ResponseEntity.badRequest().body("Email is required");
            }

            User user = userRepository.findByEmail(request.getEmail()).orElse(null);
            if (user == null) {
                // For security reasons, don't reveal that the email doesn't exist
                logger.info("User not found for email: {}", request.getEmail());
                return ResponseEntity.ok()
                        .body("If an account exists with this email, a password reset link will be sent");
            }

            // Delete any existing token for this user
            PasswordResetToken existingToken = tokenRepository.findByUser(user);
            if (existingToken != null) {
                logger.info("Deleting existing token for user: {}", user.getEmail());
                tokenRepository.delete(existingToken);
            }

            // Generate new token
            String token = UUID.randomUUID().toString();
            PasswordResetToken passwordResetToken = new PasswordResetToken(token, user);
            logger.info("Generated new token for user: {}", user.getEmail());

            try {
                tokenRepository.save(passwordResetToken);
                logger.info("Saved token to database for user: {}", user.getEmail());
            } catch (Exception e) {
                logger.error("Error saving token to database: {}", e.getMessage());
                return ResponseEntity.internalServerError().body("Failed to process password reset request");
            }

            try {
                emailService.sendPasswordResetCode(user.getEmail(), token);
                logger.info("Password reset code sent successfully to: {}", user.getEmail());
            } catch (Exception e) {
                logger.error("Error sending reset code: {}", e.getMessage());
                return ResponseEntity.internalServerError().body("Failed to send password reset code");
            }

            return ResponseEntity.ok().body("Password reset instructions have been sent to your email");

        } catch (Exception e) {
            logger.error("Unexpected error in forgot password: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to process password reset request");
        }
    }

    @PostMapping("/send-reset-code")
    public ResponseEntity<?> sendResetCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        try {
            if (!StringUtils.hasText(email)) {
                return ResponseEntity.badRequest().body("Email là bắt buộc");
            }

            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                // For security reasons, don't reveal that the email doesn't exist
                return ResponseEntity.ok().body("Nếu email tồn tại, mã xác thực sẽ được gửi");
            }

            // Generate 6-digit code
            String code = String.format("%06d", (int) (Math.random() * 1000000));

            // Save code to database with expiry time
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUser(user);
            resetToken.setToken(code);
            resetToken.setExpiryDate(new Date(System.currentTimeMillis() + 5 * 60 * 1000)); // 5 minutes

            // Delete any existing tokens
            PasswordResetToken existingToken = tokenRepository.findByUser(user);
            if (existingToken != null) {
                tokenRepository.delete(existingToken);
            }

            tokenRepository.save(resetToken);

            // Send code via email
            emailService.sendPasswordResetCode(email, code);

            return ResponseEntity.ok().body("Mã xác thực đã được gửi");
        } catch (Exception e) {
            logger.error("Error in sending reset code: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Không thể gửi mã xác thực");
        }
    }

    @PostMapping("/verify-reset-code")
    public ResponseEntity<?> verifyResetCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");

        try {
            if (!StringUtils.hasText(email) || !StringUtils.hasText(code)) {
                return ResponseEntity.badRequest().body("Email và mã xác thực là bắt buộc");
            }

            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body("Email không hợp lệ");
            }

            PasswordResetToken resetToken = tokenRepository.findByUser(user);
            if (resetToken == null || !resetToken.getToken().equals(code)) {
                return ResponseEntity.badRequest().body("Mã xác thực không hợp lệ");
            }

            if (resetToken.isExpired()) {
                tokenRepository.delete(resetToken);
                return ResponseEntity.badRequest().body("Mã xác thực đã hết hạn");
            }

            return ResponseEntity.ok().body("Mã xác thực hợp lệ");
        } catch (Exception e) {
            logger.error("Error in verifying reset code: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Không thể xác thực mã");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        String newPassword = request.get("newPassword");

        try {
            if (!StringUtils.hasText(email) || !StringUtils.hasText(code) || !StringUtils.hasText(newPassword)) {
                return ResponseEntity.badRequest().body("Email, mã xác thực và mật khẩu mới là bắt buộc");
            }

            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body("Email không hợp lệ");
            }

            PasswordResetToken resetToken = tokenRepository.findByUser(user);
            if (resetToken == null || !resetToken.getToken().equals(code)) {
                return ResponseEntity.badRequest().body("Mã xác thực không hợp lệ");
            }

            if (resetToken.isExpired()) {
                tokenRepository.delete(resetToken);
                return ResponseEntity.badRequest().body("Mã xác thực đã hết hạn");
            }

            // Validate password format
            if (newPassword.length() < 6 ||
                    !newPassword.matches(".*[A-Z].*") ||
                    !newPassword.matches(".*[0-9].*")) {
                return ResponseEntity.badRequest().body("Mật khẩu mới phải có ít nhất 6 ký tự, 1 chữ hoa và 1 số");
            }

            // Update password
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            // Delete used token
            tokenRepository.delete(resetToken);

            return ResponseEntity.ok().body("Đặt lại mật khẩu thành công");
        } catch (Exception e) {
            logger.error("Error in resetting password: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Không thể đặt lại mật khẩu");
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            if (!StringUtils.hasText(request.getEmail()) ||
                    !StringUtils.hasText(request.getOldPassword()) ||
                    !StringUtils.hasText(request.getNewPassword())) {
                return ResponseEntity.badRequest().body("Email, mật khẩu cũ và mật khẩu mới là bắt buộc");
            }

            User user = userRepository.findByEmail(request.getEmail()).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body("Không tìm thấy tài khoản");
            }

            // Verify old password
            if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
                return ResponseEntity.badRequest().body("Mật khẩu cũ không chính xác");
            }

            // Check if new password is same as old password
            if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
                return ResponseEntity.badRequest().body("Mật khẩu mới không được trùng với mật khẩu cũ");
            }

            // Update password
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);

            return ResponseEntity.ok().body("Thay đổi mật khẩu thành công");
        } catch (Exception e) {
            logger.error("Error in change password: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Không thể thay đổi mật khẩu");
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");

        try {
            if (!StringUtils.hasText(email) || !StringUtils.hasText(code)) {
                return ResponseEntity.badRequest().body("Email và mã xác thực là bắt buộc");
            }

            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body("Email không hợp lệ");
            }

            EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByUser(user);
            if (verificationToken == null || !verificationToken.getToken().equals(code)) {
                return ResponseEntity.badRequest().body("Mã xác thực không hợp lệ");
            }

            if (verificationToken.isExpired()) {
                emailVerificationTokenRepository.delete(verificationToken);
                return ResponseEntity.badRequest().body("Mã xác thực đã hết hạn");
            }

            // Update user status
            user.setEmailVerified(true);
            user.setStatus(UserStatus.active);
            userRepository.save(user);

            // Delete used token
            emailVerificationTokenRepository.delete(verificationToken);

            // Generate JWT token
            String token = jwtTokenProvider.createToken(user.getEmail());

            return ResponseEntity.ok(new AuthResponse(token, user));
        } catch (Exception e) {
            logger.error("Error in verifying email: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Không thể xác thực email");
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        try {
            if (!StringUtils.hasText(email)) {
                return ResponseEntity.badRequest().body("Email là bắt buộc");
            }

            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body("Email không hợp lệ");
            }

            if (user.isEmailVerified()) {
                return ResponseEntity.badRequest().body("Email đã được xác thực");
            }

            // Delete existing token if any
            EmailVerificationToken existingToken = emailVerificationTokenRepository.findByUser(user);
            if (existingToken != null) {
                emailVerificationTokenRepository.delete(existingToken);
            }

            // Generate new verification code
            String verificationCode = String.format("%06d", (int) (Math.random() * 1000000));

            // Save new verification token
            EmailVerificationToken verificationToken = new EmailVerificationToken(verificationCode, user);
            emailVerificationTokenRepository.save(verificationToken);

            // Send verification email
            emailService.sendVerificationEmail(user.getEmail(), verificationCode);

            return ResponseEntity.ok("Đã gửi lại mã xác thực");
        } catch (Exception e) {
            logger.error("Error in resending verification code: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Không thể gửi lại mã xác thực");
        }
    }
}