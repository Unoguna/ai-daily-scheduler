package com.be.auth.google;

import com.be.auth.config.GoogleProperties;
import com.be.auth.google.dto.GoogleUserInfo;
import com.be.auth.google.dto.GoogleUserResponse;
import com.be.auth.google.dto.GoogleTokenResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class GoogleApiClient {

    private final WebClient webClient;
    private final GoogleProperties googleProperties;

    public GoogleTokenResponse getToken(String code) {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("code", code);
        formData.add("client_id", googleProperties.clientId());
        formData.add("client_secret", googleProperties.clientSecret());
        formData.add("redirect_uri", googleProperties.redirectUri());
        formData.add("grant_type", "authorization_code");

        return webClient.post()
                .uri(googleProperties.tokenUri())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .bodyValue(formData)
                .retrieve()
                .bodyToMono(GoogleTokenResponse.class)
                .block();
    }

    public GoogleUserInfo getUserInfo(String googleAccessToken) {
        GoogleUserResponse response = webClient.get()
                .uri(googleProperties.userInfoUri())
                .headers(headers -> headers.setBearerAuth(googleAccessToken))
                .retrieve()
                .bodyToMono(GoogleUserResponse.class)
                .block();

        if (response == null) {
            throw new IllegalArgumentException("구글 사용자 정보 조회에 실패했습니다.");
        }

        GoogleUserInfo userInfo = response.toUserInfo();

        if (userInfo.id() == null) {
            throw new IllegalArgumentException("구글 사용자 식별값이 없습니다.");
        }

        return userInfo;

    }
}