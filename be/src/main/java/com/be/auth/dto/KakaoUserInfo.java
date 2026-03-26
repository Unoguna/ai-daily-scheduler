package com.be.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class KakaoUserInfo {

    private String id;
    private String email;
    private String nickname;
    private String profileImageUrl;

    public KakaoUserInfo(String id, String email, String nickname, String profileImageUrl) {
        this.id = id;
        this.email = email;
        this.nickname = nickname;
        this.profileImageUrl = profileImageUrl;
    }

    @Getter
    @NoArgsConstructor
    public static class KakaoUserResponse {

        private Long id;

        @JsonProperty("kakao_account")
        private KakaoAccount kakaoAccount;

        public KakaoUserInfo toUserInfo() {
            String email = null;
            String nickname = null;
            String profileImageUrl = null;

            if (kakaoAccount != null) {
                email = kakaoAccount.getEmail();

                if (kakaoAccount.getProfile() != null) {
                    nickname = kakaoAccount.getProfile().getNickname();
                    profileImageUrl = kakaoAccount.getProfile().getProfileImageUrl();
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

    @Getter
    @NoArgsConstructor
    public static class KakaoAccount {

        private String email;
        private Profile profile;
    }

    @Getter
    @NoArgsConstructor
    public static class Profile {

        private String nickname;

        @JsonProperty("profile_image_url")
        private String profileImageUrl;
    }
}
