package com.be.auth.service;

import com.be.auth.dto.KakaoProperties;
import com.be.auth.dto.KakaoTokenResponse;
import com.be.auth.dto.KakaoUserInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class KakaoApiClient {

    private final WebClient webClient;
    private final KakaoProperties kakaoProperties;

    public KakaoTokenResponse getToken(String code) {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "authorization_code");
        formData.add("client_id", kakaoProperties.getClientId());
        formData.add("redirect_uri", kakaoProperties.getRedirectUri());
        formData.add("code", code);

        KakaoTokenResponse response = webClient.post()
                .uri(kakaoProperties.getTokenUri())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .bodyValue(formData)
                .retrieve()
                .bodyToMono(KakaoTokenResponse.class)
                .block();

        if (response == null || response.getAccessToken() == null) {
            throw new IllegalArgumentException("카카오 액세스 토큰 발급에 실패했습니다.");
        }

        return response;
    }

    public KakaoUserInfo getUserInfo(String kakaoAccessToken) {
        KakaoUserInfo.KakaoUserResponse response = webClient.get()
                .uri(kakaoProperties.getUserInfoUri())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + kakaoAccessToken)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE + ";charset=utf-8")
                .retrieve()
                .bodyToMono(KakaoUserInfo.KakaoUserResponse.class)
                .block();

        if (response == null) {
            throw new IllegalArgumentException("카카오 사용자 정보 조회에 실패했습니다.");
        }

        KakaoUserInfo userInfo = response.toUserInfo();

        if (userInfo.getId() == null) {
            throw new IllegalArgumentException("카카오 사용자 식별값이 없습니다.");
        }

        return userInfo;
    }
}