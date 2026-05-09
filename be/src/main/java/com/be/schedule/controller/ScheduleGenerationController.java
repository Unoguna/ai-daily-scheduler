package com.be.schedule.controller;

import com.be.global.response.CommonResponse;
import com.be.global.security.UserPrincipal;
import com.be.schedule.dto.ScheduleGenerationResponse;
import com.be.schedule.service.ScheduleGenerationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@Tag(name = "Schedule Generation API", description = "Schedule generation API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/schedules")
public class ScheduleGenerationController {

    private final ScheduleGenerationService scheduleGenerationService;

    @Operation(summary = "일정 생성", description = "컨디션과 목표등을 참고하여 하루 일정을 생성합니다.")
    @PostMapping("/generate")
    public CommonResponse<ScheduleGenerationResponse> generateSchedule(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        ScheduleGenerationResponse response = scheduleGenerationService.generateSchedule(
                userPrincipal.getUserId(),
                date
        );
        return CommonResponse.success(response);
    }
}
