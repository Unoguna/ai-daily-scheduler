package com.be.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateUserNameRequest(

        @NotBlank(message = "이름은 비어 있을 수 없습니다.")
        @Size(max = 20, message = "이름은 20자 이하여야 합니다.")
        String name
) {
}