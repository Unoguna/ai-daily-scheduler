package com.be.auth.dto.kakao;

public record KakaoAccount(
        String email,
        KakaoProfile profile
) {
}