package com.be.user.controller;

import com.be.global.response.CommonResponse;
import com.be.global.security.UserPrincipal;
import com.be.user.dto.UpdateUserNameRequest;
import com.be.user.dto.UpdateUserNameResponse;
import com.be.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "User API", description = "유저 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    @Operation(summary = "내 이름 수정", description = "로그인한 사용자의 이름을 수정합니다.")
    @PatchMapping("/me/name")
    public CommonResponse<UpdateUserNameResponse> updateMyName(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateUserNameRequest request
    ) {
        Long userId = userPrincipal.getUserId();
        UpdateUserNameResponse response = userService.updateMyName(userId, request);
        return CommonResponse.success(response);
    }
}
