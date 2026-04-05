package com.be.auth.controller;

import com.be.auth.dto.request.GoogleLoginRequest;
import com.be.auth.dto.request.KakaoLoginRequest;
import com.be.auth.dto.request.RefreshRequest;
import com.be.auth.dto.response.AuthResponse;
import com.be.auth.dto.response.LoginResponse;
import com.be.auth.dto.response.TokenResponse;
import com.be.auth.service.SocialAuthService;
import com.be.global.response.CommonResponse;
import com.be.global.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "AuthController", description = "인증 API")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final SocialAuthService socialAuthService;

    @Operation(summary = "카카오 로그인", description = "인가 코드로 로그인 처리")
    @PostMapping("/kakao")
    public CommonResponse<LoginResponse> kakaoLogin(
            @Valid @RequestBody KakaoLoginRequest request
    ) {
        LoginResponse response = socialAuthService.loginWithKakao(request.code());
        return CommonResponse.success(response, "카카오 로그인이 완료되었습니다.");
    }

    @Operation(summary = "구글 로그인", description = "인가 코드로 로그인 처리")
    @PostMapping("/google")
    public CommonResponse<LoginResponse> googleLogin(
            @Valid @RequestBody GoogleLoginRequest request
    ) {
        LoginResponse response = socialAuthService.loginWithGoogle(request.code());
        return CommonResponse.success(response, "구글 로그인이 완료되었습니다.");
    }

    @Operation(summary = "토큰 재발급", description = "refresh token으로 access token 재발급")
    @PostMapping("/refresh")
    public CommonResponse<TokenResponse> refresh(
            @Valid @RequestBody RefreshRequest request
    ) {
        TokenResponse response = socialAuthService.refresh(request);
        return CommonResponse.success(response, "토큰이 재발급되었습니다.");
    }

    @Operation(summary = "로그아웃", description = "현재 사용자 로그아웃")
    @PostMapping("/logout")
    public CommonResponse<Void> logout(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        socialAuthService.logout(principal.getUserId());
        return CommonResponse.success(null, "로그아웃 되었습니다.");
    }

    @Operation(summary = "내 정보 조회", description = "현재 로그인한 사용자 정보 반환")
    @GetMapping("/me")
    public CommonResponse<AuthResponse> me(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        AuthResponse response = socialAuthService.getMe(principal.getUserId());
        return CommonResponse.success(response, "내 정보 조회에 성공했습니다.");
    }
}