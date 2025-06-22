package Drivon.backend.repository;

import Drivon.backend.model.User;
import Drivon.backend.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    Optional<User> findByGoogleId(String googleId);
    Optional<User> findByResetPasswordToken(String token);
    List<User> findByRole(UserRole role);
} 