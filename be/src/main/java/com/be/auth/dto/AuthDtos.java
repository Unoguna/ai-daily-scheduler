package com.be.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthDtos {

    public record RefreshRequest(
            @NotBlank String refreshToken
    ) {}

    public record TokenResponse(
            String accessToken,
            String refreshToken
    ) {}

    public record AuthResponse(
            Long userId,
            String name,
            String email
    ) {}

    public record MessageResponse(
            String message
    ) {}
}