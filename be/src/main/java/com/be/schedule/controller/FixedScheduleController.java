package com.be.schedule.controller;

import com.be.global.response.CommonResponse;
import com.be.global.response.IdResponse;
import com.be.global.security.UserPrincipal;
import com.be.schedule.dto.FixedScheduleCreateRequest;
import com.be.schedule.dto.FixedScheduleResponse;
import com.be.schedule.dto.FixedScheduleUpdateRequest;
import com.be.schedule.service.ScheduleCommandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;

@Tag(name = "Fixed Schedule API", description = "고정 일정 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/fixed-schedules")
public class FixedScheduleController {

    private final ScheduleCommandService scheduleCommandService;

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

    @Operation(summary = "고정 일정 다건 조회", description = "로그인 사용자의 고정 일정을 다건 조회합니다.")
    @GetMapping("/fixed-schedules")
    public CommonResponse<List<FixedScheduleResponse>> getFixedSchedules(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) DayOfWeek dayOfWeek
    ) {
        List<FixedScheduleResponse> response = scheduleCommandService.getFixedSchedules(
                userPrincipal.getUserId(),
                dayOfWeek
        );
        return CommonResponse.success(response);
    }

    @Operation(summary = "고정 일정 단건 조회", description = "로그인 사용자의 고정 일정을 단건 조회합니다.")
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

    @Operation(summary = "고정 일정 수정", description = "로그인 사용자의 고정 일정을 수정합니다.")
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

    @Operation(summary = "고정 일정 삭제", description = "로그인 사용자의 고정 일정을 삭제합니다.")
    @DeleteMapping("/{scheduleId}")
    public CommonResponse<Void> deleteFixedSchedule(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long scheduleId
    ) {
        scheduleCommandService.deleteFixedSchedule(userPrincipal.getUserId(), scheduleId);
        return CommonResponse.success(null);
    }
}
