package com.be.schedule.controller;

import com.be.global.response.CommonResponse;
import com.be.global.security.UserPrincipal;
import com.be.schedule.dto.*;
import com.be.schedule.service.ScheduleChangeService;
import com.be.schedule.service.ScheduleChangeStore;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/schedules/{scheduleId}/changes")
public class ScheduleChangeController {
    private final ScheduleChangeService changes;
    private final ScheduleChangeStore store;

    @Operation(summary = "대화형 일정 수정 미리보기")
    @PostMapping("/preview")
    public CommonResponse<ScheduleChangePreview> preview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long scheduleId,
            @Valid @RequestBody ScheduleChangeRequest request) {
        return CommonResponse.success(changes.preview(principal.getUserId(), scheduleId, request.message()));
    }

    @Operation(summary = "검증된 일정 변경안 적용")
    @PostMapping("/{proposalId}/apply")
    public CommonResponse<ConfirmedScheduleResponse> apply(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long scheduleId,
            @PathVariable String proposalId) {
        return CommonResponse.success(store.apply(principal.getUserId(), scheduleId, proposalId));
    }
}
