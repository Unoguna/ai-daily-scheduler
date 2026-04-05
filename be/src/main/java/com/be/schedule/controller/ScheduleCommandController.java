package com.be.schedule.controller;

import com.be.global.security.UserPrincipal;
import com.be.schedule.dto.DailyConditionCreateRequest;
import com.be.schedule.dto.FixedScheduleCreateRequest;
import com.be.schedule.dto.GoalCreateRequest;
import com.be.schedule.dto.SchedulingProfileCreateRequest;
import com.be.schedule.service.ScheduleCommandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Schedule Command API", description = "스케줄 관련 생성 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
public class ScheduleCommandController {

    private final ScheduleCommandService scheduleCommandService;

    @Operation(summary = "스케줄링 프로필 생성", description = "로그인 사용자의 스케줄링 프로필을 생성합니다.")
    @PostMapping("/scheduling-profile")
    @ResponseStatus(HttpStatus.CREATED)
    public void createSchedulingProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody SchedulingProfileCreateRequest request
    ) {
        Long userId = userPrincipal.getUserId();
        scheduleCommandService.createSchedulingProfile(userId, request);
    }

    @Operation(summary = "목표 생성", description = "로그인 사용자의 목표를 생성합니다.")
    @PostMapping("/goals")
    @ResponseStatus(HttpStatus.CREATED)
    public void createGoal(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody GoalCreateRequest request
    ) {
        Long userId = userPrincipal.getUserId();
        scheduleCommandService.createGoal(userId, request);
    }

    @Operation(summary = "고정 일정 생성", description = "로그인 사용자의 고정 일정을 생성합니다.")
    @PostMapping("/fixed-schedules")
    @ResponseStatus(HttpStatus.CREATED)
    public void createFixedSchedule(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody FixedScheduleCreateRequest request
    ) {
        Long userId = userPrincipal.getUserId();
        scheduleCommandService.createFixedSchedule(userId, request);
    }

    @Operation(summary = "일일 상태 생성", description = "로그인 사용자의 하루 상태 정보를 생성합니다.")
    @PostMapping("/daily-conditions")
    @ResponseStatus(HttpStatus.CREATED)
    public void createDailyCondition(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody DailyConditionCreateRequest request
    ) {
        Long userId = userPrincipal.getUserId();
        scheduleCommandService.createDailyCondition(userId, request);
    }
}