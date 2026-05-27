package com.be.schedule.controller;

import com.be.global.response.CommonResponse;
import com.be.global.response.IdResponse;
import com.be.global.security.UserPrincipal;
import com.be.schedule.dto.ConfirmedScheduleResponse;
import com.be.schedule.dto.ScheduleConfirmItemRequest;
import com.be.schedule.dto.ScheduleConfirmRequest;
import com.be.schedule.service.ScheduleConfirmService;
import com.be.schedule.service.ScheduleQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@Tag(name = "Schedule Confirm API", description = "Schedule confirm API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/schedules")
public class ScheduleConfirmController {

    private final ScheduleConfirmService scheduleConfirmService;
    private final ScheduleQueryService scheduleQueryService;

    @Operation(summary = "당일 일정 조회", description = "로그인 사용자의 확정된 당일 일정을 조회합니다.")
    @GetMapping("")
    public CommonResponse<ConfirmedScheduleResponse> getDailySchedule(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        ConfirmedScheduleResponse response = scheduleQueryService.getDailySchedule(
                userPrincipal.getUserId(),
                date
        );
        return CommonResponse.success(response);
    }

    @Operation(summary = "일정 확정", description = "당일 일정을 확정짓는다.")
    @PostMapping("/confirm")
    @ResponseStatus(HttpStatus.CREATED)
    public CommonResponse<IdResponse> confirmSchedule(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ScheduleConfirmRequest request
    ) {
        IdResponse response = scheduleConfirmService.confirmSchedule(userPrincipal.getUserId(), request);
        return CommonResponse.success(response);
    }

    @Operation(summary = "?뺤젙 ?쇱젙 ?섏젙", description = "?뺤젙???쇱젙???뱀젙 ?항ぉ???섏젙?⑸땲??")
    @PutMapping("/{scheduleId}/items/{itemId}")
    public CommonResponse<ConfirmedScheduleResponse> updateConfirmedScheduleItem(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long scheduleId,
            @PathVariable Long itemId,
            @Valid @RequestBody ScheduleConfirmItemRequest request
    ) {
        ConfirmedScheduleResponse response = scheduleConfirmService.updateConfirmedScheduleItem(
                userPrincipal.getUserId(),
                scheduleId,
                itemId,
                request
        );
        return CommonResponse.success(response);
    }

    @Operation(summary = "?뺤젙 ?쇱젙 ??젣", description = "?뺤젙???쇱젙???뱀젙 ?항ぉ???쒓굅?⑸땲??")
    @DeleteMapping("/{scheduleId}/items/{itemId}")
    public CommonResponse<ConfirmedScheduleResponse> deleteConfirmedScheduleItem(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long scheduleId,
            @PathVariable Long itemId
    ) {
        ConfirmedScheduleResponse response = scheduleConfirmService.deleteConfirmedScheduleItem(
                userPrincipal.getUserId(),
                scheduleId,
                itemId
        );
        return CommonResponse.success(response);
    }
}
