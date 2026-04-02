package com.be.auth.kakao;

import com.be.auth.config.KakaoProperties;
import com.be.auth.kakao.dto.KakaoTokenResponse;
import com.be.auth.kakao.dto.KakaoUserInfo;
import com.be.auth.kakao.dto.KakaoUserResponse;
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
        // 카카오 api는 .contentType(MediaType.APPLICATION_FORM_URLENCODED)로 리스폰스를 보내야하는데
        // MultiValueMap이 아니라 그냥 Map으로 하면 .bodyValue(formData)에서 카카오 api에서 원하는 형태가 아니라 일반적인
        // JSON으로 변환되어 에러가 생긴다. 그래서 Map이 아닌 MultiValueMap으로 받아야 한다.
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "authorization_code");
        formData.add("client_id", kakaoProperties.getClientId());
        formData.add("client_secret", kakaoProperties.getClientSecret());
        formData.add("redirect_uri", kakaoProperties.getRedirectUri());
        formData.add("code", code);

        KakaoTokenResponse response = webClient.post()
                .uri(kakaoProperties.getTokenUri())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .bodyValue(formData)
                .retrieve()
                .onStatus(
                        status -> status.isError(),
                        clientResponse -> clientResponse.bodyToMono(String.class)
                                .map(body -> new RuntimeException("카카오 토큰 요청 실패: " + body))
                )
                .bodyToMono(KakaoTokenResponse.class)
                .block();

        if (response == null || response.accessToken() == null) {
            throw new IllegalArgumentException("카카오 액세스 토큰 발급에 실패했습니다.");
        }

        return response;
    }

    public KakaoUserInfo getUserInfo(String kakaoAccessToken) {
        KakaoUserResponse response = webClient.get()
                .uri(kakaoProperties.getUserInfoUri())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + kakaoAccessToken)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE + ";charset=utf-8")
                .retrieve()
                .bodyToMono(KakaoUserResponse.class)
                .block();

        if (response == null) {
            throw new IllegalArgumentException("카카오 사용자 정보 조회에 실패했습니다.");
        }

        KakaoUserInfo userInfo = response.toUserInfo();

        if (userInfo.id() == null) {
            throw new IllegalArgumentException("카카오 사용자 식별값이 없습니다.");
        }

        return userInfo;
    }
}