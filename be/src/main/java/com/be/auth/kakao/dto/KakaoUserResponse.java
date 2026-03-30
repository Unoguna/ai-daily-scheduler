package com.be.auth.kakao.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record KakaoUserResponse(
        Long id,

        @JsonProperty("kakao_account")
        KakaoAccount kakaoAccount
) {

    public KakaoUserInfo toUserInfo() {
        String email = null;
        String nickname = null;
        String profileImageUrl = null;

        if (kakaoAccount != null) {
            email = kakaoAccount.email();

            if (kakaoAccount.profile() != null) {
                nickname = kakaoAccount.profile().nickname();
                profileImageUrl = kakaoAccount.profile().profileImageUrl();
            }
        }

        return new KakaoUserInfo(
                id != null ? String.valueOf(id) : null,
                email,
                nickname,
                profileImageUrl
        );
    }
}