package com.be.goal.controller;

import com.be.global.response.CommonResponse;
import com.be.global.response.IdResponse;
import com.be.global.security.UserPrincipal;
import com.be.goal.dto.GoalCreateRequest;
import com.be.goal.dto.GoalResponse;
import com.be.goal.service.GoalService;
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



    @Operation(summary = "목표 다건 조회", description = "로그인 사용자의 목표 목록을 조회합니다.")
    @GetMapping("")
    public CommonResponse<java.util.List<GoalResponse>> getGoals(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Long userId = userPrincipal.getUserId();
        return CommonResponse.success(goalService.getGoals(userId));
    }

    @Operation(summary = "목표 생성", description = "로그인 사용자의 목표를 생성합니다.")
    @PostMapping("")
    @ResponseStatus(HttpStatus.CREATED)
    public CommonResponse<IdResponse> createGoal(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody GoalCreateRequest request
    ) {
        Long userId = userPrincipal.getUserId();
        Long id = goalService.createGoal(userId, request);
        return CommonResponse.success(new IdResponse(id));
    }
}
