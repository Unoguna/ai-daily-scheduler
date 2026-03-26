package com.be.auth.dto;

public record AuthResponse(
        Long userId,
        String name,
        String email
) {}
