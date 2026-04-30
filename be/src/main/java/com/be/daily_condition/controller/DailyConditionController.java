package com.be.daily_condition.controller;

import com.be.daily_condition.dto.DailyConditionResponse;
import com.be.global.response.CommonResponse;
import com.be.global.response.IdResponse;
import com.be.global.security.UserPrincipal;
import com.be.daily_condition.dto.DailyConditionCreateRequest;
import com.be.daily_condition.service.DailyConditionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@Tag(name = "Daily Condition API", description = "당일 컨디션 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/daily-conditions")
public class DailyConditionController {

    private final DailyConditionService dailyConditionService;

    @Operation(summary = "일일 상태 생성", description = "로그인 사용자의 하루 상태 정보를 생성합니다.")
    @PostMapping("")
    @ResponseStatus(HttpStatus.CREATED)
    public CommonResponse<IdResponse> createDailyCondition(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody DailyConditionCreateRequest request
    ) {
        Long userId = userPrincipal.getUserId();
        Long id = dailyConditionService.createDailyCondition(userId, request);
        return CommonResponse.success(new IdResponse(id));
    }

    @Operation(summary = "당일 컨디션 조회", description = "로그인한 사용자의 오늘 컨디션을 조회합니다.")
    @GetMapping("")
    public CommonResponse<DailyConditionResponse> getDailyCondition(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        DailyConditionResponse response = dailyConditionService.getDailyCondition(userPrincipal.getUserId(), date);
        return CommonResponse.success(response);
    }
}
