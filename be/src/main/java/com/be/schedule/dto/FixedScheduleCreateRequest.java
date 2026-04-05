package com.be.schedule.dto;

import com.be.schedule.domain.ScheduleCategory;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Schema(description = "고정 일정 생성 요청 DTO")
public record FixedScheduleCreateRequest(

        @Schema(description = "요일", example = "MONDAY")
        @NotNull
        DayOfWeek dayOfWeek,

        @Schema(description = "일정 제목", example = "운영체제 수업")
        @NotBlank
        @Size(max = 100)
        String title,

        @Schema(description = "일정 카테고리", example = "CLASS")
        @NotNull
        ScheduleCategory category,

        @Schema(description = "시작 시간", example = "10:00:00")
        @NotNull
        LocalTime startTime,

        @Schema(description = "종료 시간", example = "12:00:00")
        @NotNull
        LocalTime endTime,

        @Schema(description = "필수 일정 여부", example = "true")
        @NotNull
        Boolean mandatory
) {
}