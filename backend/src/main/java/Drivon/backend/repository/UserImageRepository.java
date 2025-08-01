package Drivon.backend.repository;

import Drivon.backend.model.UserImage;
import Drivon.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserImageRepository extends JpaRepository<UserImage, Long> {
    List<UserImage> findByUser(User user);
    List<UserImage> findByDocumentTypeAndVerified(UserImage.DocumentType documentType, boolean verified);
    List<UserImage> findByVerified(boolean verified);
    List<UserImage> findByUserUserId(Long userId);
} 