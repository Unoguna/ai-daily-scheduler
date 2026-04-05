package com.be.auth.kakao.dto;

public record KakaoAccount(
        String email,
        KakaoProfile profile
) {
}