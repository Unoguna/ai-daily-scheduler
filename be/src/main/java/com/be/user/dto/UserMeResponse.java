package com.be.user.dto;

import com.be.user.domain.User;
import com.be.user.domain.AuthProvider;

public record UserMeResponse(
        Long userId,
        String name,
        String email,
        String profileImageUrl,
        AuthProvider provider
) {
    public static UserMeResponse from(User user) {
        return new UserMeResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getProfileImageUrl(),
                user.getProvider()
        );
    }
}