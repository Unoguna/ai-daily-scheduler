package com.be.schedule.controller;

import com.be.global.response.CommonResponse;
import com.be.global.security.UserPrincipal;
import com.be.schedule.dto.FixedScheduleResponse;
import com.be.schedule.dto.FixedScheduleUpdateRequest;
import com.be.schedule.service.ScheduleCommandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Fixed Schedule API", description = "Fixed schedule API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/fixed-schedules")
public class FixedScheduleController {

    private final ScheduleCommandService scheduleCommandService;

    @Operation(summary = "Fixed schedule detail", description = "Get a fixed schedule for the logged-in user.")
    @GetMapping("/{scheduleId}")
    public CommonResponse<FixedScheduleResponse> getFixedSchedule(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long scheduleId
    ) {
        FixedScheduleResponse response = scheduleCommandService.getFixedSchedule(
                userPrincipal.getUserId(),
                scheduleId
        );
        return CommonResponse.success(response);
    }

    @Operation(summary = "Fixed schedule update", description = "Update a fixed schedule for the logged-in user.")
    @PutMapping("/{scheduleId}")
    public CommonResponse<FixedScheduleResponse> updateFixedSchedule(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long scheduleId,
            @Valid @RequestBody FixedScheduleUpdateRequest request
    ) {
        FixedScheduleResponse response = scheduleCommandService.updateFixedSchedule(
                userPrincipal.getUserId(),
                scheduleId,
                request
        );
        return CommonResponse.success(response);
    }
}
