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

@Tag(name = "Schedule Feedback API", description = "Schedule feedback API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/schedules/feedback")
public class ScheduleFeedbackController {

    private final ScheduleFeedbackService scheduleFeedbackService;

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
