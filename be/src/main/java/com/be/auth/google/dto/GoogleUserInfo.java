package com.be.auth.google.dto;

public record GoogleUserInfo(
        String id,
        String email,
        String name,
        String profileImageUrl
) {
}