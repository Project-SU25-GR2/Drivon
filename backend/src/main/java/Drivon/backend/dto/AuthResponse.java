package Drivon.backend.dto;

import Drivon.backend.model.User;
import lombok.Data;

@Data
public class AuthResponse {
    private String token;
    private User user;

    public AuthResponse(String token, User user) {
        this.token = token;
        this.user = user;
    }
} 