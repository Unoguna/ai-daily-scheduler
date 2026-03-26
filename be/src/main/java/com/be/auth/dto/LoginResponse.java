package com.be.auth.dto;

public record LoginResponse(
        Long userId,
        String name,
        String email,
        String accessToken,
        String refreshToken,
        boolean isNewUser
) {}