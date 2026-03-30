package com.be.auth.kakao.dto;

public record KakaoUserInfo(
        String id,
        String email,
        String nickname,
        String profileImageUrl
) {
}