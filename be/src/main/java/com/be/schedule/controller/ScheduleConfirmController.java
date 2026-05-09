package com.be.schedule.controller;

import com.be.global.response.CommonResponse;
import com.be.global.response.IdResponse;
import com.be.global.security.UserPrincipal;
import com.be.schedule.dto.ScheduleConfirmRequest;
import com.be.schedule.service.ScheduleConfirmService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Schedule Confirm API", description = "Schedule confirm API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/schedules")
public class ScheduleConfirmController {

    private final ScheduleConfirmService scheduleConfirmService;

    @Operation(summary = "일정 확정", description = "당일 일정을 확정짓는다.")
    @PostMapping("/confirm")
    @ResponseStatus(HttpStatus.CREATED)
    public CommonResponse<IdResponse> confirmSchedule(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ScheduleConfirmRequest request
    ) {
        IdResponse response = scheduleConfirmService.confirmSchedule(userPrincipal.getUserId(), request);
        return CommonResponse.success(response);
    }
}
