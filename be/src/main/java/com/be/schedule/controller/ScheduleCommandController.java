package com.be.schedule.controller;

import com.be.global.response.CommonResponse;
import com.be.global.response.IdResponse;
import com.be.global.security.UserPrincipal;
import com.be.schedule.dto.FixedScheduleCreateRequest;
import com.be.schedule.dto.SchedulingProfileCreateRequest;
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

    @Operation(summary = "고정 일정 생성", description = "로그인 사용자의 고정 일정을 생성합니다.")
    @PostMapping("/fixed-schedules")
    @ResponseStatus(HttpStatus.CREATED)
    public CommonResponse<IdResponse> createFixedSchedule(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody FixedScheduleCreateRequest request
    ) {
        Long userId = userPrincipal.getUserId();
        Long id = scheduleCommandService.createFixedSchedule(userId, request);
        return CommonResponse.success(new IdResponse(id));
    }
}