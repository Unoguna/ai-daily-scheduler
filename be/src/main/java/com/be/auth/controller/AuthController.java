package com.be.auth.controller;

import com.be.auth.dto.request.KakaoLoginRequest;
import com.be.auth.dto.request.RefreshRequest;
import com.be.auth.dto.response.AuthResponse;
import com.be.auth.dto.response.LoginResponse;
import com.be.auth.dto.response.MessageResponse;
import com.be.auth.dto.response.TokenResponse;
import com.be.auth.google.dto.GoogleLoginUserInfo;
import com.be.auth.service.SocialAuthService;
import com.be.global.security.UserPrincipal;
import com.be.user.domain.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "AuthController", description = "인증 API")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final SocialAuthService socialAuthService;

    @Operation(summary = "카카오 로그인", description = "인가 코드로 로그인 처리")
    @PostMapping("/kakao")
    public LoginResponse kakaoLogin(
            @Valid @RequestBody KakaoLoginRequest request
    ) {
        return socialAuthService.loginWithKakao(request.code());
    }

    @GetMapping("/api/v1/auth/google/callback")
    public LoginResponse googleCallback(@RequestParam String code) {
        return socialAuthService.loginWithGoogle(code);
    }

    @Operation(summary = "토큰 재발급", description = "refresh token으로 access token 재발급")
    @PostMapping("/refresh")
    public TokenResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return socialAuthService.refresh(request);
    }

    @Operation(summary = "로그아웃", description = "현재 사용자 로그아웃")
    @PostMapping("/logout")
    public MessageResponse logout(@AuthenticationPrincipal UserPrincipal principal) {
        socialAuthService.logout(principal.getUserId());
        return new MessageResponse("로그아웃 되었습니다.");
    }

    @Operation(summary = "내 정보 조회", description = "현재 로그인한 사용자 정보 반환")
    @GetMapping("/me")
    public AuthResponse me(@AuthenticationPrincipal UserPrincipal principal) {
        return socialAuthService.getMe(principal.getUserId());
    }
}