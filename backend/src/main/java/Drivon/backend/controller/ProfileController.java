package Drivon.backend.controller;

import Drivon.backend.model.User;
import Drivon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:3000")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/check-password-status/{email}")
    public ResponseEntity<?> checkPasswordStatus(@PathVariable String email) {
        Map<String, Object> response = new HashMap<>();
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        User user = userOpt.get();
        response.put("hasPassword", user.getPassword() != null);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/create-password")
    public ResponseEntity<?> createPassword(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        String email = request.get("email");
        String newPassword = request.get("newPassword");

        if (email == null || email.trim().isEmpty()) {
            response.put("error", "Email is required");
            return ResponseEntity.badRequest().body(response);
        }

        if (newPassword == null || newPassword.trim().isEmpty()) {
            response.put("error", "New password is required");
            return ResponseEntity.badRequest().body(response);
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        User user = userOpt.get();
        if (user.getPassword() != null) {
            response.put("error", "User already has a password");
            return ResponseEntity.badRequest().body(response);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        response.put("success", true);
        response.put("message", "Password created successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        String email = request.get("email");
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        if (email == null || email.trim().isEmpty()) {
            response.put("error", "Email is required");
            return ResponseEntity.badRequest().body(response);
        }

        if (currentPassword == null || currentPassword.trim().isEmpty()) {
            response.put("error", "Current password is required");
            return ResponseEntity.badRequest().body(response);
        }

        if (newPassword == null || newPassword.trim().isEmpty()) {
            response.put("error", "New password is required");
            return ResponseEntity.badRequest().body(response);
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        User user = userOpt.get();
        if (user.getPassword() == null) {
            response.put("error", "User does not have a password set");
            return ResponseEntity.badRequest().body(response);
        }

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            response.put("error", "Current password is incorrect");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        response.put("success", true);
        response.put("message", "Password changed successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestBody User updatedUser) {
        Map<String, String> response = new HashMap<>();
        
        // Validate required fields
        if (updatedUser.getEmail() == null || updatedUser.getEmail().trim().isEmpty()) {
            response.put("error", "Email is required");
            return ResponseEntity.badRequest().body(response);
        }

        // Find existing user
        Optional<User> existingUserOpt = userRepository.findByEmail(updatedUser.getEmail());
        if (existingUserOpt.isEmpty()) {
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        User existingUser = existingUserOpt.get();

        // Validate phone number if it's being updated
        if (updatedUser.getPhone() != null && !updatedUser.getPhone().equals(existingUser.getPhone())) {
            if (userRepository.findByPhone(updatedUser.getPhone()).isPresent()) {
                response.put("error", "Phone number already in use");
                return ResponseEntity.badRequest().body(response);
            }
        }

        // Update user information
        if (updatedUser.getFullName() != null) {
            existingUser.setFullName(updatedUser.getFullName());
        }
        if (updatedUser.getPhone() != null) {
            existingUser.setPhone(updatedUser.getPhone());
        }
        if (updatedUser.getAddress() != null) {
            existingUser.setAddress(updatedUser.getAddress());
        }
        if (updatedUser.getAvatarUrl() != null) {
            existingUser.setAvatarUrl(updatedUser.getAvatarUrl());
        }

        try {
            User savedUser = userRepository.save(existingUser);
            response.put("message", "Profile updated successfully");
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            response.put("error", "Failed to update profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/update-avatar")
    public ResponseEntity<?> updateAvatar(@RequestBody Map<String, String> request) {
        Map<String, String> response = new HashMap<>();
        
        String email = request.get("email");
        String avatarUrl = request.get("avatarUrl");
        
        if (email == null || email.trim().isEmpty()) {
            response.put("error", "Email is required");
            return ResponseEntity.badRequest().body(response);
        }

        if (avatarUrl == null || avatarUrl.trim().isEmpty()) {
            response.put("error", "Avatar URL is required");
            return ResponseEntity.badRequest().body(response);
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        User user = userOpt.get();
        user.setAvatarUrl(avatarUrl);

        try {
            User savedUser = userRepository.save(user);
            response.put("message", "Avatar updated successfully");
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            response.put("error", "Failed to update avatar: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
