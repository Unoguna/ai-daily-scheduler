package com.be.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class SocialAuthDtos {

    public record KakaoLoginRequest(
            @NotBlank String code
    ) {}

    public record LoginResponse(
            Long userId,
            String name,
            String email,
            String accessToken,
            String refreshToken,
            boolean isNewUser
    ) {}
}