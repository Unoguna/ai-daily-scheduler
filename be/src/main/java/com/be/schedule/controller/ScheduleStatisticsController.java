package com.be.schedule.controller;

import com.be.global.response.CommonResponse;
import com.be.global.security.UserPrincipal;
import com.be.schedule.dto.WeeklyCompletionResponse;
import com.be.schedule.service.ScheduleStatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/schedules/statistics")
public class ScheduleStatisticsController {
    private final ScheduleStatisticsService statistics;

    @Operation(summary = "주간 일정 완료율", description = "선택 날짜가 속한 월~일의 완료율을 조회합니다. 항목이 없으면 완료율은 null입니다.")
    @GetMapping("/weekly")
    public CommonResponse<WeeklyCompletionResponse> weekly(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return CommonResponse.success(statistics.weekly(principal.getUserId(), date));
    }
}
