package Drivon.backend.controller;

import Drivon.backend.model.User;
import Drivon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map; // Import Map for role update request body
import Drivon.backend.model.UserRole; // Import UserRole enum
import Drivon.backend.model.UserStatus;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
// @PreAuthorize("hasRole('ADMIN')") // Ensure only users with ADMIN role can
// access this controller
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    // Endpoint to update user role
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long userId, @RequestBody Map<String, String> roleUpdate) {
        return userRepository.findById(userId).map(user -> {
            String newRole = roleUpdate.get("role");
            if (newRole == null || newRole.isEmpty()) {
                return ResponseEntity.badRequest().body("New role must be provided.");
            }
            // Simple validation, you might want more robust validation
            if (!newRole.equals("USER") && !newRole.equals("ADMIN")) {
                return ResponseEntity.badRequest().body("Invalid role.");
            }

            try {
                UserRole roleEnum = UserRole.valueOf(newRole.toUpperCase()); // Convert string to enum, case-insensitive
                user.setRole(roleEnum);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid role provided.");
            }
            userRepository.save(user);
            return ResponseEntity.ok().body("User role updated successfully.");
        }).orElse(ResponseEntity.notFound().build());
    }

    // Endpoint to update user information
    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUserInfo(@PathVariable Long userId, @RequestBody User updatedUser) {
        return userRepository.findById(userId).map(user -> {
            // Update user properties from updatedUser object
            user.setEmail(updatedUser.getEmail());
            user.setPhone(updatedUser.getPhone()); // Assuming phone can be updated
            user.setFullName(updatedUser.getFullName());
            user.setAddress(updatedUser.getAddress()); // Assuming address can be updated
            user.setRole(updatedUser.getRole()); // Allow updating role via this endpoint as well
            // Add other fields you want to allow updating

            userRepository.save(user);
            return ResponseEntity.ok().body("User information updated successfully.");
        }).orElse(ResponseEntity.notFound().build());
    }

    // Endpoint to delete a user
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        return userRepository.findById(userId).map(user -> {
            userRepository.delete(user);
            return ResponseEntity.ok().body("User deleted successfully.");
        }).orElse(ResponseEntity.notFound().build());
    }

    // Endpoint to update user status
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long userId,
            @RequestBody Map<String, String> statusUpdate) {
        return userRepository.findById(userId).map(user -> {
            String newStatus = statusUpdate.get("status");
            if (newStatus == null || newStatus.isEmpty()) {
                return ResponseEntity.badRequest().body("New status must be provided.");
            }

            try {
                UserStatus statusEnum = UserStatus.valueOf(newStatus.toUpperCase());
                user.setStatus(statusEnum);
                userRepository.save(user);
                return ResponseEntity.ok().body("User status updated successfully.");
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid status. Must be either ACTIVE or BANNED.");
            }
        }).orElse(ResponseEntity.notFound().build());
    }

}