package com.be.auth.dto.response;

public record AuthResponse(
        Long userId,
        String name,
        String email
) {}
