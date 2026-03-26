package com.be.auth.dto;

public record TokenResponse(
        String accessToken,
        String refreshToken
) {}
