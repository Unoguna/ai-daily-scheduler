package com.be.auth.dto.kakao;

public record KakaoUserInfo(
        String id,
        String email,
        String nickname,
        String profileImageUrl
) {
}