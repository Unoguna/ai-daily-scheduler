package com.be.auth.google;

import com.be.auth.config.GoogleProperties;
import com.be.auth.google.dto.GoogleLoginUserInfo;
import com.be.auth.google.dto.GoogleUserInfo;
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

    public GoogleLoginUserInfo getUserInfo(String code) {
        GoogleTokenResponse tokenResponse = getAccessToken(code);
        GoogleUserInfo userInfo = getGoogleUserInfo(tokenResponse.accessToken());

        return new GoogleLoginUserInfo(
                userInfo.id(),
                userInfo.email(),
                userInfo.name(),
                userInfo.profileImageUrl()
        );
    }

    private GoogleTokenResponse getAccessToken(String code) {
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

    private GoogleUserInfo getGoogleUserInfo(String accessToken) {
        return webClient.get()
                .uri(googleProperties.userInfoUri())
                .headers(headers -> headers.setBearerAuth(accessToken))
                .retrieve()
                .bodyToMono(GoogleUserInfo.class)
                .block();
    }
}