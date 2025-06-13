package Drivon.backend.repository;

import Drivon.backend.model.EmailVerificationToken;
import Drivon.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    EmailVerificationToken findByToken(String token);

    EmailVerificationToken findByUser(User user);
}