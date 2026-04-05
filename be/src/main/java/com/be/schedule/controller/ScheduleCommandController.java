package com.be.schedule.controller;

import com.be.global.security.UserPrincipal;
import com.be.schedule.dto.DailyConditionCreateRequest;
import com.be.schedule.dto.FixedScheduleCreateRequest;
import com.be.schedule.dto.GoalCreateRequest;
import com.be.schedule.dto.SchedulingProfileCreateRequest;
import com.be.schedule.service.ScheduleCommandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
public class ScheduleCommandController {

    private final ScheduleCommandService scheduleCommandService;

    @PostMapping("/scheduling-profile")
    @ResponseStatus(HttpStatus.CREATED)
    public void createSchedulingProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody SchedulingProfileCreateRequest request
    ) {
        Long userId = userPrincipal.getUserId();

        Long id = scheduleCommandService.createSchedulingProfile(userId, request);
    }

    @PostMapping("/goals")
    @ResponseStatus(HttpStatus.CREATED)
    public void createGoal(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody GoalCreateRequest request
    ) {
        Long userId = userPrincipal.getUserId();

        Long id = scheduleCommandService.createGoal(userId, request);
    }

    @PostMapping("/fixed-schedules")
    @ResponseStatus(HttpStatus.CREATED)
    public void createFixedSchedule(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody FixedScheduleCreateRequest request
    ) {
        Long userId = userPrincipal.getUserId();

        Long id = scheduleCommandService.createFixedSchedule(userId, request);
    }

    @PostMapping("/daily-conditions")
    @ResponseStatus(HttpStatus.CREATED)
    public void createDailyCondition(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody DailyConditionCreateRequest request
    ) {
        Long userId = userPrincipal.getUserId();

        Long id = scheduleCommandService.createDailyCondition(userId, request);
    }
}