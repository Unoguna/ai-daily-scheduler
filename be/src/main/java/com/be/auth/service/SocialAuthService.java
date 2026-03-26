package com.be.auth.service;

import com.be.auth.domain.RefreshToken;
import com.be.auth.dto.AuthDtos;
import com.be.auth.dto.KakaoTokenResponse;
import com.be.auth.dto.KakaoUserInfo;
import com.be.auth.dto.SocialAuthDtos;
import com.be.auth.jwt.JwtTokenProvider;
import com.be.auth.repository.RefreshTokenRepository;
import com.be.user.domain.AuthProvider;
import com.be.user.domain.User;
import com.be.user.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class SocialAuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final KakaoApiClient kakaoApiClient;

    public SocialAuthDtos.LoginResponse loginWithKakao(String code) {

        KakaoTokenResponse tokenResponse = kakaoApiClient.getToken(code);
        KakaoUserInfo userInfo = kakaoApiClient.getUserInfo(tokenResponse.getAccessToken());

        String providerId = userInfo.getId();
        String email = userInfo.getEmail();
        String name = userInfo.getNickname();
        String profileImageUrl = userInfo.getProfileImageUrl();

        boolean[] isNew = {false};

        User user = userRepository
                .findByProviderAndProviderId(AuthProvider.KAKAO, providerId)
                .orElseGet(() -> {
                    isNew[0] = true;
                    return userRepository.save(
                            User.create(AuthProvider.KAKAO, providerId, email, name, profileImageUrl)
                    );
                });

        if (!isNew[0]) {
            user.updateProfile(email, name, profileImageUrl);
        }

        String accessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getName());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        saveOrUpdateRefreshToken(user.getId(), refreshToken);

        return new SocialAuthDtos.LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                accessToken,
                refreshToken,
                isNew[0]
        );
    }

    private void saveOrUpdateRefreshToken(Long userId, String refreshToken) {
        refreshTokenRepository.findByUserId(userId)
                .ifPresentOrElse(
                        existing -> existing.updateToken(refreshToken),
                        () -> refreshTokenRepository.save(RefreshToken.create(userId, refreshToken))
                );
    }

    public AuthDtos.TokenResponse refresh(AuthDtos.RefreshRequest request) {
        String refreshToken = request.getRefreshToken();

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

        return new AuthDtos.TokenResponse(newAccessToken, newRefreshToken);
    }

    public void logout(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    @Transactional(readOnly = true)
    public AuthDtos.AuthResponse getMe(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return new AuthDtos.AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail()
        );
    }
}