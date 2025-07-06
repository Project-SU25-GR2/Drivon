package Drivon.backend.controller;

import Drivon.backend.model.User;
import Drivon.backend.model.UserImage;
import Drivon.backend.model.UserImage.DocumentType;
import Drivon.backend.repository.UserRepository;
import Drivon.backend.service.UserImageService;
import Drivon.backend.dto.UserImageUploadRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user/image")
@CrossOrigin(origins = "http://localhost:3000")
public class UserImageController {
    @Autowired
    private UserImageService userImageService;
    @Autowired
    private UserRepository userRepository;

    // Upload giấy tờ (nhận JSON)
    @PostMapping
    public ResponseEntity<?> uploadUserImage(@RequestBody UserImageUploadRequest req) {
        Optional<User> userOpt = userRepository.findById(req.getUserId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        UserImage userImage = new UserImage();
        userImage.setUser(userOpt.get());
        userImage.setImageUrl(req.getImageUrl());
        // Chuyển đổi documentType từ String sang enum
        try {
            userImage.setDocumentType(UserImage.DocumentType.valueOf(req.getDocumentType()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid documentType");
        }
        userImage.setDescription(req.getDescription());
        userImageService.saveUserImage(userImage);
        return ResponseEntity.ok("Upload thành công");
    }

    // Lấy danh sách giấy tờ của user
    @GetMapping
    public ResponseEntity<?> getUserImages(@RequestParam Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        List<UserImage> images = userImageService.getUserImages(userOpt.get());
        return ResponseEntity.ok(images);
    }

    // Xoá giấy tờ theo imageId
    @DeleteMapping("/{imageId}")
    public ResponseEntity<?> deleteUserImage(@PathVariable Long imageId) {
        try {
            userImageService.deleteUserImage(imageId);
            return ResponseEntity.ok("Xoá giấy tờ thành công");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Xoá giấy tờ thất bại");
        }
    }
}
