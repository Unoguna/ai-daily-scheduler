package com.be.goal.controller;

import com.be.global.response.CommonResponse;
import com.be.global.response.IdResponse;
import com.be.global.security.UserPrincipal;
import com.be.goal.dto.GoalResponse;
import com.be.goal.dto.GoalUpdateRequest;
import com.be.goal.service.GoalService;
import com.be.goal.dto.GoalCreateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Goal API", description = "목표 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/goals")
public class GoalController {
    private final GoalService goalService;

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

    @Operation(summary = "목표 다건조회", description = "로그인 사용자의 목표를 다건 조회합니다.")
    @GetMapping("")
    public CommonResponse<List<GoalResponse>> getGoals(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        List<GoalResponse> response = goalService.getGoals(userPrincipal.getUserId());
        return CommonResponse.success(response);
    }

    @Operation(summary = "목표 단건 조회", description = "로그인 사용자의 목표를 단건 조회합니다.")
    @GetMapping("/{goalId}")
    public CommonResponse<GoalResponse> getGoal(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long goalId
    ) {
        GoalResponse response = goalService.getGoal(userPrincipal.getUserId(), goalId);
        return CommonResponse.success(response);
    }


    @Operation(summary = "목표 수정", description = "로그인 사용자의 목표를 수정합니다.")
    @PutMapping("/{goalId}")
    public CommonResponse<GoalResponse> updateGoal(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long goalId,
            @Valid @RequestBody GoalUpdateRequest request
    ) {
        GoalResponse response = goalService.updateGoal(userPrincipal.getUserId(), goalId, request);
        return CommonResponse.success(response);
    }

    @Operation(summary = "목표 삭제", description = "로그인 사용자의 목표를 삭제합니다.")
    @DeleteMapping("/{goalId}")
    public CommonResponse<Void> deleteGoal(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long goalId
    ) {
        goalService.deleteGoal(userPrincipal.getUserId(), goalId);
        return CommonResponse.success(null);
    }
}
