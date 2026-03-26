package com.be.auth.controller;

import com.be.auth.dto.AuthDtos;
import com.be.auth.dto.SocialAuthDtos;
import com.be.auth.service.SocialAuthService;
import com.be.global.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final SocialAuthService socialAuthService;

    @PostMapping("/kakao")
    public SocialAuthDtos.LoginResponse kakaoLogin(
            @Valid @RequestBody SocialAuthDtos.KakaoLoginRequest request
    ) {
        return socialAuthService.loginWithKakao(request.code());
    }

    @PostMapping("/refresh")
    public AuthDtos.TokenResponse refresh(@Valid @RequestBody AuthDtos.RefreshRequest request) {
        return socialAuthService.refresh(request);
    }

    @PostMapping("/logout")
    public AuthDtos.MessageResponse logout(@AuthenticationPrincipal UserPrincipal principal) {
        socialAuthService.logout(principal.getUserId());
        return new AuthDtos.MessageResponse("로그아웃 되었습니다.");
    }

    @GetMapping("/me")
    public AuthDtos.AuthResponse me(@AuthenticationPrincipal UserPrincipal principal) {
        return socialAuthService.getMe(principal.getUserId());
    }
}