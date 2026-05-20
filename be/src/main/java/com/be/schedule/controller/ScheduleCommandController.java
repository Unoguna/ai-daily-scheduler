package com.be.schedule.controller;

import com.be.global.response.CommonResponse;
import com.be.global.response.IdResponse;
import com.be.global.security.UserPrincipal;
import com.be.schedule.dto.FixedScheduleCreateRequest;
import com.be.schedule.dto.FixedScheduleResponse;
import com.be.schedule.dto.SchedulingProfileCreateRequest;
import com.be.schedule.dto.SchedulingProfileResponse;
import com.be.schedule.service.ScheduleCommandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Schedule Command API", description = "스케줄 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/schedules")
public class ScheduleCommandController {

    private final ScheduleCommandService scheduleCommandService;

    @Operation(summary = "스케줄링 프로필 생성", description = "로그인 사용자의 스케줄링 프로필을 생성합니다.")
    @PostMapping("/scheduling-profile")
    @ResponseStatus(HttpStatus.CREATED)
    public CommonResponse<IdResponse> createSchedulingProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody SchedulingProfileCreateRequest request
    ) {
        Long userId = userPrincipal.getUserId();
        Long id = scheduleCommandService.createSchedulingProfile(userId, request);
        return CommonResponse.success(new IdResponse(id));
    }

    @Operation(summary = "스케줄링 프로필 조회", description = "로그인 사용자의 스케줄링 프로필을 조회합니다.")
    @GetMapping("/scheduling-profile")
    public CommonResponse<SchedulingProfileResponse> getSchedulingProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        SchedulingProfileResponse response = scheduleCommandService.getSchedulingProfile(userPrincipal.getUserId());
        return CommonResponse.success(response);
    }

    @Operation(summary = "스케줄링 프로필 수정", description = "로그인 사용자의 스케줄링 프로필을 수정합니다.")
    @PutMapping("/scheduling-profile")
    public CommonResponse<SchedulingProfileResponse> updateSchedulingProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody SchedulingProfileCreateRequest request
    ) {
        SchedulingProfileResponse response = scheduleCommandService.updateSchedulingProfile(
                userPrincipal.getUserId(),
                request
        );
        return CommonResponse.success(response);
    }

}
