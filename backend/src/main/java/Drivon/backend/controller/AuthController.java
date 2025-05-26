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

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Invalid email or password");
        }

        return ResponseEntity.ok(user);
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

            userRepository.save(user);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create user: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
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
            
            newUser = userService.save(newUser);
            String token = jwtTokenProvider.createToken(newUser.getEmail());
            return ResponseEntity.ok(new AuthResponse(token, newUser));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error during Google authentication: " + e.getMessage());
        }
    }
}