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
import java.util.Map;
import java.util.HashMap;

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

    // Kiểm tra xem user đã upload CCCD chưa
    @GetMapping("/check-cccd/{userId}")
    public ResponseEntity<?> checkUserCCCD(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            List<UserImage> userImages = userImageService.getUserImages(userOpt.get());
            boolean hasCCCD = userImages.stream()
                .anyMatch(image -> "cccd".equals(image.getDocumentType().name()));
            
            Map<String, Object> response = new HashMap<>();
            response.put("hasCCCD", hasCCCD);
            response.put("message", hasCCCD ? "User has uploaded CCCD" : "User has not uploaded CCCD");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error checking CCCD: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // Kiểm tra xem user đã upload giấy phép lái xe chưa
    @GetMapping("/check-license/{userId}")
    public ResponseEntity<?> checkUserLicense(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            List<UserImage> userImages = userImageService.getUserImages(userOpt.get());
            boolean hasLicense = userImages.stream()
                .anyMatch(image -> image.getDocumentType() != null && "license".equals(image.getDocumentType().name()));
            Map<String, Object> response = new HashMap<>();
            response.put("hasLicense", hasLicense);
            response.put("message", hasLicense ? "User has uploaded license" : "User has not uploaded license");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error checking license: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
 