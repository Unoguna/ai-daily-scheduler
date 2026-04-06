package com.be.user.dto;

public record UpdateProfileImageResponse(
        Long userId,
        String profileImageUrl
) {
    public static UpdateProfileImageResponse of(Long userId, String profileImageUrl) {
        return new UpdateProfileImageResponse(userId, profileImageUrl);
    }
}
