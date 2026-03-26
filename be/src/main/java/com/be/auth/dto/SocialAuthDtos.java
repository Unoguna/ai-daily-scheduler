package com.be.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class SocialAuthDtos {

    @Getter
    @NoArgsConstructor
    public static class KakaoLoginRequest {
        @NotBlank
        private String code;
    }

    @Getter
    @AllArgsConstructor
    public static class LoginResponse {
        private Long userId;
        private String name;
        private String email;
        private String accessToken;
        private String refreshToken;
        private boolean isNewUser;
    }
}