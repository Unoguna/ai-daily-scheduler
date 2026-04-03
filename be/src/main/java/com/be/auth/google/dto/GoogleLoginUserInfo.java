package com.be.auth.google.dto;

public record GoogleLoginUserInfo(
        String id,
        String email,
        String name,
        String profileImageUrl
) {
}