package com.be.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class AuthDtos {

    @Getter
    @NoArgsConstructor
    public static class SignupRequest {
        @NotBlank
        private String username;

        @NotBlank
        private String password;

        @NotBlank
        private String name;
    }

    @Getter
    @NoArgsConstructor
    public static class LoginRequest {
        @NotBlank
        private String username;

        @NotBlank
        private String password;
    }

    @Getter
    @NoArgsConstructor
    public static class RefreshRequest {
        @NotBlank
        private String refreshToken;
    }

    @Getter
    @AllArgsConstructor
    public static class TokenResponse {
        private String accessToken;
        private String refreshToken;
    }

    @Getter
    @AllArgsConstructor
    public static class AuthResponse {
        private Long userId;
        private String username;
        private String name;
    }

    @Getter
    @AllArgsConstructor
    public static class LoginResponse {
        private Long userId;
        private String username;
        private String name;
        private String accessToken;
        private String refreshToken;
    }

    @Getter
    @AllArgsConstructor
    public static class MessageResponse {
        private String message;
    }
}