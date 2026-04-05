package com.be.schedule.dto;

import com.be.schedule.domain.GoalPriority;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@Schema(description = "목표 생성 요청 DTO")
public record GoalCreateRequest(

        @Schema(description = "목표 제목", example = "캡스톤 발표 준비")
        @NotBlank
        @Size(max = 100)
        String title,

        @Schema(description = "목표 상세 설명", example = "중간 발표 자료 제작 및 데모 기능 구현")
        @Size(max = 500)
        String description,

        @Schema(description = "목표 우선순위", example = "HIGH")
        @NotNull
        GoalPriority priority,

        @Schema(description = "목표 마감일", example = "2026-05-01")
        LocalDate targetDate
) {
}