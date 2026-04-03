package com.be.auth.service;

import com.be.auth.domain.RefreshToken;
import com.be.auth.google.GoogleApiClient;
import com.be.auth.google.dto.GoogleUserInfo;
import com.be.auth.google.dto.GoogleTokenResponse;
import com.be.auth.kakao.dto.KakaoTokenResponse;
import com.be.auth.kakao.dto.KakaoUserInfo;
import com.be.auth.dto.request.RefreshRequest;
import com.be.auth.dto.response.AuthResponse;
import com.be.auth.dto.response.LoginResponse;
import com.be.auth.dto.response.TokenResponse;
import com.be.auth.jwt.JwtTokenProvider;
import com.be.auth.kakao.KakaoApiClient;
import com.be.auth.repository.RefreshTokenRepository;
import com.be.user.domain.AuthProvider;
import com.be.user.domain.User;
import com.be.user.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class SocialAuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final KakaoApiClient kakaoApiClient;
    private final GoogleApiClient googleApiClient;

    public LoginResponse loginWithKakao(String code) {
        KakaoTokenResponse tokenResponse = kakaoApiClient.getToken(code);
        KakaoUserInfo userInfo = kakaoApiClient.getUserInfo(tokenResponse.accessToken());

        String providerId = userInfo.id();  //kakao 고유 유저아이디
        String email = userInfo.email();
        String name = userInfo.nickname();
        String profileImageUrl = userInfo.profileImageUrl();


        Optional<User> optionalUser = userRepository
                .findByProviderAndProviderId(AuthProvider.KAKAO, providerId);

        User user;
        boolean isNew;

        if(optionalUser.isPresent()) {
            user = optionalUser.get();
            isNew = false;
        } else {
            isNew = true;
            user = userRepository.save(
                    User.create(AuthProvider.KAKAO, providerId, email, name, profileImageUrl)
            );
        }

        if (!isNew) {
            user.updateProfile(email, name, profileImageUrl);
        }

        String accessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getName());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        saveOrUpdateRefreshToken(user.getId(), refreshToken);

        return new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                accessToken,
                refreshToken,
                isNew
        );
    }

    public LoginResponse loginWithGoogle(String code) {
        GoogleTokenResponse tokenResponse = googleApiClient.getToken(code);
        GoogleUserInfo userInfo = googleApiClient.getUserInfo(tokenResponse.accessToken());

        String providerId = userInfo.id();
        String email = userInfo.email();
        String name = userInfo.name();
        String profileImageUrl = userInfo.profileImageUrl();

        Optional<User> optionalUser = userRepository
                .findByProviderAndProviderId(AuthProvider.GOOGLE, providerId);

        User user;
        boolean isNew;

        if (optionalUser.isPresent()) {
            user = optionalUser.get();
            isNew = false;
        } else {
            isNew = true;
            user = userRepository.save(
                    User.create(AuthProvider.GOOGLE, providerId, email, name, profileImageUrl)
            );
        }

        if (!isNew) {
            user.updateProfile(email, name, profileImageUrl);
        }

        String accessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getName());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        saveOrUpdateRefreshToken(user.getId(), refreshToken);

        return new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                accessToken,
                refreshToken,
                isNew
        );
    }

    private void saveOrUpdateRefreshToken(Long userId, String refreshToken) {
        refreshTokenRepository.findByUserId(userId)
                .ifPresentOrElse(
                        existing -> existing.updateToken(refreshToken),
                        () -> refreshTokenRepository.save(RefreshToken.create(userId, refreshToken))
                );
    }

    public TokenResponse refresh(RefreshRequest request) {
        String refreshToken = request.refreshToken();

        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 리프레시 토큰입니다.");
        }

        RefreshToken saved = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new IllegalArgumentException("토큰이 존재하지 않습니다."));

        User user = userRepository.findById(saved.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        String newAccessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getName());
        String newRefreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        saved.updateToken(newRefreshToken);

        return new TokenResponse(newAccessToken, newRefreshToken);
    }

    public void logout(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    @Transactional(readOnly = true)
    public AuthResponse getMe(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail()
        );
    }
}