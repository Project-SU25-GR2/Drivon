package Drivon.backend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "http://localhost:3000")
public class TestController {

    @GetMapping("/auth")
    public ResponseEntity<?> testAuth(Principal principal) {
        System.out.println("=== TEST AUTH ENDPOINT ===");
        System.out.println("Principal: " + (principal != null ? principal.getName() : "null"));
        System.out.println("Principal class: " + (principal != null ? principal.getClass().getName() : "null"));
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Authentication: " + (authentication != null ? authentication.getName() : "null"));
        System.out.println("Authentication class: " + (authentication != null ? authentication.getClass().getName() : "null"));
        
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            System.out.println("UserDetails username: " + userDetails.getUsername());
            System.out.println("UserDetails authorities: " + userDetails.getAuthorities());
        }
        
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "User not authenticated",
                "message", "Principal is null",
                "authentication", authentication != null ? authentication.getName() : "null"
            ));
        }

        return ResponseEntity.ok(Map.of(
            "message", "Authentication successful",
            "email", principal.getName(),
            "authentication", authentication != null ? authentication.getName() : "null"
        ));
    }

    @GetMapping("/public")
    public ResponseEntity<?> publicEndpoint() {
        return ResponseEntity.ok(Map.of(
            "message", "Public endpoint - no authentication required",
            "timestamp", System.currentTimeMillis()
        ));
    }
}