package com.be.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileImageRequest(

        @NotBlank(message = "프로필 이미지 URL은 비어 있을 수 없습니다.")
        @Size(max = 500, message = "프로필 이미지 URL이 너무 깁니다.")
        String profileImageUrl
) {
}