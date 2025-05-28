package Drivon.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import Drivon.backend.model.PasswordResetToken;
import Drivon.backend.model.User;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    PasswordResetToken findByToken(String token);
    PasswordResetToken findByUser(User user);
    void deleteByUser(User user);
} 