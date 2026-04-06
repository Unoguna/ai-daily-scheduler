package com.be.user.dto;

public record UpdateUserNameResponse(
        Long userId,
        String name
) {
    public static UpdateUserNameResponse of(Long userId, String name) {
        return new UpdateUserNameResponse(userId, name);
    }
}