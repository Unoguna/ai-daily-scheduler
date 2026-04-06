package com.be.daily_condition.controller;

import com.be.global.response.CommonResponse;
import com.be.global.response.IdResponse;
import com.be.global.security.UserPrincipal;
import com.be.daily_condition.dto.DailyConditionCreateRequest;
import com.be.daily_condition.service.DailyConditionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Daily Condition API", description = "당일 컨디션 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/daily-condition")
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
}
