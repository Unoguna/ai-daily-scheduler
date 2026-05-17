package com.be.user.controller;

import com.be.global.response.CommonResponse;
import com.be.global.security.UserPrincipal;
import com.be.user.dto.*;
import com.be.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @Operation(summary = "내 프로필 사진 수정", description = "로그인한 사용자의 프로필 사진을 업로드하고 URL을 저장합니다.")
    @PatchMapping(value = "/me/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CommonResponse<UpdateProfileImageResponse> updateMyProfileImage(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("file") MultipartFile file
    ) {
        Long userId = userPrincipal.getUserId();
        UpdateProfileImageResponse response = userService.updateMyProfileImage(userId, file);
        return CommonResponse.success(response);
    }

    @Operation(summary = "내 정보 조회", description = "로그인한 사용자의 정보를 조회합니다.")
    @GetMapping("/me")
    public CommonResponse<UserMeResponse> getMyInfo(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        UserMeResponse response = userService.getMyInfo(userPrincipal.getUserId());
        return CommonResponse.success(response);
    }
}
