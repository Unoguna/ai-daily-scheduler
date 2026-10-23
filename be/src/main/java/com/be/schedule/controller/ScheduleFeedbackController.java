package com.be.schedule.controller;

import com.be.global.response.CommonResponse;
import com.be.global.security.UserPrincipal;
import com.be.schedule.dto.ScheduleFeedbackRequest;
import com.be.schedule.dto.ScheduleFeedbackResponse;
import com.be.schedule.service.ScheduleFeedbackService;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;

@Tag(name = "Schedule Feedback API", description = "Schedule feedback API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/schedules/feedback")
public class ScheduleFeedbackController {

    private final ScheduleFeedbackService scheduleFeedbackService;

    @Operation(summary = "날짜별 피드백 조회", description = "선택한 날짜의 피드백과 분석 결과를 조회합니다. 미등록이면 null을 반환합니다.")
    @GetMapping("")
    public CommonResponse<ScheduleFeedbackResponse> getFeedback(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return CommonResponse.success(scheduleFeedbackService.getFeedback(userPrincipal.getUserId(), date));
    }

    @Operation(summary = "피드백 생성", description = "피드백을 생성합니다.")
    @PostMapping("")
    @ResponseStatus(HttpStatus.CREATED)
    public CommonResponse<ScheduleFeedbackResponse> createFeedback(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ScheduleFeedbackRequest request
    ) {
        ScheduleFeedbackResponse response = scheduleFeedbackService.createFeedback(
                userPrincipal.getUserId(),
                request
        );
        return CommonResponse.success(response);
    }
}
