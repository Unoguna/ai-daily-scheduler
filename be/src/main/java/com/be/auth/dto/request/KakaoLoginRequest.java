package com.be.auth.dto.request;

import jakarta.validation.constraints.NotBlank;

public record KakaoLoginRequest(
        @NotBlank String code
) {}
