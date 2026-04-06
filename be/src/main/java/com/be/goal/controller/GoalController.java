package com.be.goal.controller;

import com.be.global.response.CommonResponse;
import com.be.global.security.UserPrincipal;
import com.be.goal.service.GoalService;
import com.be.goal.dto.GoalCreateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Goal API", description = "목표 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/goals")
public class GoalController {
    private final GoalService goalService;

    @Operation(summary = "목표 생성", description = "로그인 사용자의 목표를 생성합니다.")
    @PostMapping("")
    @ResponseStatus(HttpStatus.CREATED)
    public CommonResponse<Long> createGoal(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody GoalCreateRequest request
    ) {
        Long userId = userPrincipal.getUserId();
        Long data_id = goalService.createGoal(userId, request);
        return CommonResponse.success(data_id);
    }
}
