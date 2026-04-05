package com.be.auth.dto.response;

public record LoginResponse(
        Long userId,
        String name,
        String email,
        String accessToken,
        String refreshToken,
        boolean isNewUser
) {}