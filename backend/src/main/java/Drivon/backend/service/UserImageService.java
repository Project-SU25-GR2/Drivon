package Drivon.backend.service;

import Drivon.backend.model.UserImage;
import Drivon.backend.model.User;
import Drivon.backend.repository.UserImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserImageService {
    @Autowired
    private UserImageRepository userImageRepository;

    public UserImage saveUserImage(UserImage userImage) {
        return userImageRepository.save(userImage);
    }

    public List<UserImage> getUserImages(User user) {
        return userImageRepository.findByUser(user);
    }

    public void deleteUserImage(Long imageId) {
        userImageRepository.deleteById(imageId);
    }

    public List<UserImage> getAllUserImages() {
        return userImageRepository.findAll();
    }

    public UserImage getUserImageById(Long imageId) {
        return userImageRepository.findById(imageId).orElse(null);
    }

    public UserImage verifyUserImage(Long imageId, boolean verified, String description) {
        UserImage userImage = userImageRepository.findById(imageId).orElse(null);
        if (userImage != null) {
            userImage.setVerified(verified);
            if (description != null) {
                userImage.setDescription(description);
            }
            return userImageRepository.save(userImage);
        }
        return null;
    }
} 