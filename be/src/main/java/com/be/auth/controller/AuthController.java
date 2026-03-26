package com.be.auth.controller;

import com.be.auth.dto.*;
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
    public LoginResponse kakaoLogin(
            @Valid @RequestBody KakaoLoginRequest request
    ) {
        return socialAuthService.loginWithKakao(request.code());
    }

    @PostMapping("/refresh")
    public TokenResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return socialAuthService.refresh(request);
    }

    @PostMapping("/logout")
    public MessageResponse logout(@AuthenticationPrincipal UserPrincipal principal) {
        socialAuthService.logout(principal.getUserId());
        return new MessageResponse("로그아웃 되었습니다.");
    }

    @GetMapping("/me")
    public AuthResponse me(@AuthenticationPrincipal UserPrincipal principal) {
        return socialAuthService.getMe(principal.getUserId());
    }
}